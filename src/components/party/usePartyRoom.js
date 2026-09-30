// Reactions / watch party (movies PRD #11) on the web: the room, the WebRTC mesh (camera / mic tiles), chat, emoji
// and the host's play / pause / seek. All of it talks to the reactions service (movies/back-end/reactions): its
// /reactions API and its own socket.io room server. Protocol: docs/notes.txt "PRD #11 WATCH PARTY". Media goes peer
// to peer - the room server only carries the offers / answers / ICE, which the NEWCOMER starts with every member.
import { useCallback, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { serviceUrl } from "../access";

const REACTIONS = (process.env.REACT_APP_ENVIRONMENT === "development"
    ? process.env.REACT_APP_REACTIONS_API
    : process.env.REACT_APP_REACTIONS_API_LIVE) || "";
const RELAY = REACTIONS;

// The reactions service can't read the user service's httpOnly session cookie, so the browser swaps it for a
// 15-minute token (user service POST /reactions/token) and sends that as a Bearer token.
let reactionsToken = null;
const tokenFor = async (fresh = false) => {
    if (!fresh && reactionsToken && reactionsToken.until > Date.now()) return reactionsToken.value;
    const res = await fetch(serviceUrl("/reactions/token"), { method: "POST", credentials: "include" });
    const data = await res.json().catch(() => null);
    reactionsToken = data && data.status ? { value: data.token, until: Date.now() + 12 * 60 * 1000 } : null;
    return reactionsToken ? reactionsToken.value : null;
};

// small tiles: ten people on one phone's upload
const CAMERA = { width: { ideal: 320 }, height: { ideal: 240 }, frameRate: { ideal: 15, max: 20 } };
const DRIFT_S = 1.5;          // a follower re-seeks when further than this from the host
const HOST_BEAT_MS = 10000;   // the host re-sends its state this often, so late drift is corrected
const ICE_BATCH_MS = 250;     // ICE candidates go out in batches - the relay rate-limits single events

export const partyPost = async (path, body, retried = false) => {
    const token = await tokenFor().catch(() => null);
    if (!token) return { status: false, message: "Please sign in to use reactions" };
    if (!REACTIONS) return { status: false, message: "Reactions are not configured (REACT_APP_REACTIONS_API)" };
    const res = await fetch(REACTIONS + "/reactions" + path, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body || {}),
    });
    // an expired swap token: fetch a fresh one once
    if (res.status === 401 && !retried) {
        reactionsToken = null;
        return partyPost(path, body, true);
    }
    const data = await res.json().catch(() => null);
    return data || { status: false, message: "Something went wrong" };
};

export const PARTY_REACTIONS = ["😂", "😮", "😍", "😢", "😡", "👏", "🔥", "❤️"];

/**
 * player: the video.js player instance (null until it is ready). code: the party to sit in (null = not in one).
 */
export function usePartyRoom({ code, player }) {
    const [status, setStatus] = useState("idle");     // idle | connecting | live | ended | error
    const [error, setError] = useState(null);
    const [party, setParty] = useState(null);
    const [role, setRole] = useState(null);
    const [me, setMe] = useState(null);                // my socket id
    const [peers, setPeers] = useState({});            // sid -> {name, role, device, media, camera, mic, stream}
    const [messages, setMessages] = useState([]);
    const [reactions, setReactions] = useState([]);
    const [localStream, setLocalStream] = useState(null);
    const [camera, setCamera] = useState(true);
    const [mic, setMic] = useState(false);             // PRD: muted by default

    const socketRef = useRef(null);
    const pcs = useRef(new Map());                     // sid -> RTCPeerConnection
    const iceOut = useRef(new Map());                  // sid -> {list, timer}
    const iceIn = useRef(new Map());                   // sid -> candidates that arrived before the remote description
    const iceServers = useRef([]);
    const streamRef = useRef(null);
    const roleRef = useRef(null);
    const hostState = useRef(null);   // guests: the host's last {position, playing, at}
    const playerRef = useRef(null);
    playerRef.current = player;                        // socket handlers read the latest player through this

    const patchPeer = useCallback((sid, patch) => {
        setPeers((all) => (all[sid] || patch.name ? { ...all, [sid]: { ...(all[sid] || {}), ...patch } } : all));
    }, []);

    const dropPeer = useCallback((sid) => {
        const pc = pcs.current.get(sid);
        if (pc) pc.close();
        pcs.current.delete(sid);
        iceIn.current.delete(sid);
        const batch = iceOut.current.get(sid);
        if (batch) clearTimeout(batch.timer);
        iceOut.current.delete(sid);
        setPeers((all) => {
            const next = { ...all };
            delete next[sid];
            return next;
        });
    }, []);

    const signal = useCallback((to, data) => {
        if (socketRef.current) socketRef.current.emit("party-signal", { to, data });
    }, []);

    const queueIce = useCallback((to, candidate) => {
        const batch = iceOut.current.get(to) || { list: [], timer: null };
        batch.list.push(candidate);
        if (!batch.timer) {
            batch.timer = setTimeout(() => {
                const list = batch.list.splice(0);
                batch.timer = null;
                if (list.length) signal(to, { ice: list });
            }, ICE_BATCH_MS);
        }
        iceOut.current.set(to, batch);
    }, [signal]);

    const peerConnection = useCallback((sid) => {
        let pc = pcs.current.get(sid);
        if (pc) return pc;
        pc = new RTCPeerConnection({ iceServers: iceServers.current });
        const stream = streamRef.current;
        if (stream) {
            for (const track of stream.getTracks()) pc.addTrack(track, stream);
        } else {
            // no camera / mic here (refused, or none): still receive everyone else's
            pc.addTransceiver("video", { direction: "recvonly" });
            pc.addTransceiver("audio", { direction: "recvonly" });
        }
        pc.onicecandidate = (e) => { if (e.candidate) queueIce(sid, e.candidate.toJSON()); };
        pc.ontrack = (e) => {
            const [remote] = e.streams;
            if (remote) patchPeer(sid, { stream: remote });
        };
        pc.onconnectionstatechange = () => {
            if (pc.connectionState === "failed") patchPeer(sid, { stream: null, failed: true });
        };
        pcs.current.set(sid, pc);
        return pc;
    }, [patchPeer, queueIce]);

    const offerTo = useCallback(async (sid) => {
        const pc = peerConnection(sid);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        signal(sid, { sdp: pc.localDescription });
    }, [peerConnection, signal]);

    const onSignal = useCallback(async ({ from, data }) => {
        try {
            const pc = peerConnection(from);
            if (data.sdp) {
                await pc.setRemoteDescription(data.sdp);
                for (const c of iceIn.current.get(from) || []) await pc.addIceCandidate(c).catch(() => {});
                iceIn.current.delete(from);
                if (data.sdp.type === "offer") {
                    const answer = await pc.createAnswer();
                    await pc.setLocalDescription(answer);
                    signal(from, { sdp: pc.localDescription });
                }
            }
            if (Array.isArray(data.ice)) {
                if (!pc.remoteDescription) {
                    iceIn.current.set(from, [...(iceIn.current.get(from) || []), ...data.ice]);
                } else {
                    for (const c of data.ice) await pc.addIceCandidate(c).catch(() => {});
                }
            }
        } catch (err) {
            console.log("party signal", err.message);
        }
    }, [peerConnection, signal]);

    // ---- playback: the host's player drives, everyone else follows
    const sendState = useCallback((action) => {
        const p = playerRef.current;
        if (!p || typeof p.currentTime !== "function" || roleRef.current !== "host" || !socketRef.current) return;
        socketRef.current.emit("party-sync", { action, position: p.currentTime() || 0, playing: !p.paused() });
    }, []);

    const applySync = useCallback(({ action, position, playing }) => {
        const p = playerRef.current;
        if (!p || typeof p.currentTime !== "function" || roleRef.current === "host") return;
        const target = Number(position) || 0;
        hostState.current = { position: target, playing: !!playing, at: Date.now() };
        if (Math.abs((p.currentTime() || 0) - target) > DRIFT_S || action === "seek") p.currentTime(target);
        if (playing && p.paused()) p.play().catch(() => {});
        if (!playing && !p.paused()) p.pause();
    }, []);

    useEffect(() => {
        const p = player;
        if (!p || typeof p.on !== "function" || role !== "host" || status !== "live") return undefined;
        const onPlay = () => sendState("play");
        const onPause = () => sendState("pause");
        const onSeeked = () => sendState("seek");
        p.on("play", onPlay);
        p.on("pause", onPause);
        p.on("seeked", onSeeked);
        const beat = setInterval(() => sendState("state"), HOST_BEAT_MS);
        return () => {
            p.off("play", onPlay);
            p.off("pause", onPause);
            p.off("seeked", onSeeked);
            clearInterval(beat);
        };
    }, [player, role, status, sendState]);

    // Only the host plays, pauses, seeks or stops. A guest's player loses its play / seek controls, and any play,
    // pause or seek the guest still manages (click on the video, keyboard) is put straight back to the host's state.
    useEffect(() => {
        const p = player;
        if (!p || typeof p.on !== "function" || !role || role === "host" || status !== "live") return undefined;
        const bar = p.controlBar;
        const locked = bar ? [bar.playToggle, bar.progressControl, bar.remainingTimeDisplay].filter(Boolean) : [];
        locked.forEach((c) => c.hide());
        if (bar && bar.progressControl && bar.progressControl.disable) bar.progressControl.disable();
        const host = () => {
            const s = hostState.current;
            if (!s) return null;
            return { playing: s.playing, position: s.playing ? s.position + (Date.now() - s.at) / 1000 : s.position };
        };
        const revert = () => {
            const s = host();
            if (!s) return;
            if (s.playing && p.paused()) p.play().catch(() => {});
            if (!s.playing && !p.paused()) p.pause();
        };
        const onSeeked = () => {
            const s = host();
            if (s && Math.abs((p.currentTime() || 0) - s.position) > DRIFT_S) p.currentTime(s.position);
        };
        p.on("play", revert);
        p.on("pause", revert);
        p.on("seeked", onSeeked);
        return () => {
            p.off("play", revert);
            p.off("pause", revert);
            p.off("seeked", onSeeked);
            // party over or left: the viewer drives their own player again
            locked.forEach((c) => c.show());
            if (bar && bar.progressControl && bar.progressControl.enable) bar.progressControl.enable();
        };
    }, [player, role, status]);

    // ---- join / leave
    useEffect(() => {
        const peerConns = pcs.current, iceBatches = iceOut.current; //same Maps for the hook's life; cleanup reads these copies
        if (!code) return undefined;
        let cancelled = false;
        const socket = io(RELAY, { transports: ["websocket"], autoConnect: false });
        socketRef.current = socket;
        setStatus("connecting");

        const takeSeat = async () => {
            const seat = await partyPost("/token", { code });
            if (cancelled) return;
            if (!seat.status) {
                setStatus("error");
                setError(seat.message || "could not join the party");
                return;
            }
            iceServers.current = seat.ice || [];
            roleRef.current = seat.role;
            setRole(seat.role);
            setParty(seat.party);
            if (!streamRef.current) {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ video: CAMERA, audio: { echoCancellation: true, noiseSuppression: true } });
                    stream.getAudioTracks().forEach((t) => { t.enabled = false; });   // muted by default
                    if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
                    streamRef.current = stream;
                    setLocalStream(stream);
                } catch (err) {
                    streamRef.current = null;                                          // chat + watching still work
                }
            }
            socket.emit("party-join", seat.ticket, { device: "web", media: Boolean(streamRef.current) });
        };

        socket.on("connect", takeSeat);                         // also after every reconnect
        socket.on("party-denied", ({ reason }) => { setStatus("error"); setError(reason); });
        socket.on("party-joined", ({ you, role: r, peers: list }) => {
            setMe(you);
            setStatus("live");
            roleRef.current = r;
            setRole(r);
            for (const pc of pcs.current.values()) pc.close();   // a reconnect starts the calls over
            pcs.current.clear();
            setPeers(Object.fromEntries(list.map((p) => [p.sid, { ...p, camera: p.media, mic: false }])));
            for (const p of list) offerTo(p.sid).catch((err) => console.log("party offer", err.message));
            if (r !== "host") socket.emit("party-sync-request");
            if (streamRef.current) socket.emit("party-media", { camera: true, mic: false });
        });
        socket.on("party-peer", (p) => patchPeer(p.sid, { ...p, camera: p.media, mic: false }));
        socket.on("party-peer-left", ({ sid }) => dropPeer(sid));
        socket.on("party-signal", onSignal);
        socket.on("party-chat", (m) => setMessages((all) => [...all.slice(-99), m]));
        socket.on("party-react", (r) => {
            const item = { ...r, key: `${r.from}-${r.at}-${Math.random()}` };
            setReactions((all) => [...all.slice(-19), item]);
            setTimeout(() => setReactions((all) => all.filter((x) => x.key !== item.key)), 3500);
        });
        socket.on("party-media", ({ from, camera: c, mic: m }) => patchPeer(from, { camera: c, mic: m }));
        socket.on("party-sync", applySync);
        socket.on("party-sync-request", () => sendState("state"));
        socket.on("party-ended", () => { setStatus("ended"); for (const sid of pcs.current.keys()) dropPeer(sid); });
        socket.connect();

        return () => {
            cancelled = true;
            socket.emit("party-leave");
            socket.removeAllListeners();
            socket.disconnect();
            for (const pc of peerConns.values()) pc.close();
            peerConns.clear();
            for (const b of iceBatches.values()) clearTimeout(b.timer);
            iceBatches.clear();
            if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
            setLocalStream(null);
            setPeers({});
            socketRef.current = null;
        };
        // sendState/applySync read the player through refs; re-joining on their change would drop the calls
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [code]);

    const toggleMic = useCallback(() => {
        const stream = streamRef.current;
        if (!stream) return;
        const next = !mic;
        stream.getAudioTracks().forEach((t) => { t.enabled = next; });
        setMic(next);
        if (socketRef.current) socketRef.current.emit("party-media", { camera, mic: next });
    }, [mic, camera]);

    const toggleCamera = useCallback(() => {
        const stream = streamRef.current;
        if (!stream) return;
        const next = !camera;
        stream.getVideoTracks().forEach((t) => { t.enabled = next; });
        setCamera(next);
        if (socketRef.current) socketRef.current.emit("party-media", { camera: next, mic });
    }, [camera, mic]);

    const sendChat = useCallback((text) => {
        const clean = String(text || "").trim().slice(0, 300);
        if (clean && socketRef.current) socketRef.current.emit("party-chat", clean);
    }, []);

    const react = useCallback((emoji) => {
        if (socketRef.current) socketRef.current.emit("party-react", emoji);
    }, []);

    const endParty = useCallback(async () => {
        if (roleRef.current !== "host") return;
        await partyPost("/end", { code });
        if (socketRef.current) socketRef.current.emit("party-end");
        setStatus("ended");
    }, [code]);

    return {
        status, error, party, role, me, peers, messages, reactions, localStream, camera, mic,
        toggleMic, toggleCamera, sendChat, react, endParty,
    };
}

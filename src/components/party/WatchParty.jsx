// Watch party panel under the web player (movies PRD #11): start a party for this title (optionally charging
// guests a party fee), then camera / mic tiles, chat and emoji for up to 10 viewers. The host's play / pause /
// seek moves everyone's player (usePartyRoom). Guests arrive through /party?code=... (party/join.jsx).
import { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophone, faMicrophoneSlash, faVideo, faVideoSlash, faUserGroup, faLink, faTv, faCrown } from "@fortawesome/free-solid-svg-icons";
import { usePartyRoom, partyPost, PARTY_REACTIONS } from "./usePartyRoom";

const MAX_FEE = 1000;

const Tile = ({ stream, name, muted, camera = true, mic, device, you, host }) => {
    const video = useRef(null);
    useEffect(() => {
        if (video.current && video.current.srcObject !== stream) video.current.srcObject = stream || null;
    }, [stream]);
    const showVideo = stream && camera !== false && device !== "tv";
    return (
        <div className="relative shrink-0 w-[132px] h-[99px] rounded-md overflow-hidden bg-[#2E2E3A] border border-white/10">
            {/* remote tiles also carry that person's voice, so they are not muted */}
            <video ref={video} autoPlay playsInline muted={muted} className={`w-full h-full object-cover ${showVideo ? "" : "hidden"}`} />
            {!showVideo && (
                <div className="absolute inset-0 flex items-center justify-center text-[28px] text-white/70">
                    {device === "tv" ? <FontAwesomeIcon icon={faTv} /> : (name || "?").slice(0, 1).toUpperCase()}
                </div>
            )}
            <div className="absolute bottom-0 inset-x-0 px-[6px] py-[2px] bg-black/60 flex items-center gap-[4px] text-[11px] text-white">
                {host && <FontAwesomeIcon icon={faCrown} className="text-[#ffd800]" />}
                <span className="truncate">{you ? "You" : name}</span>
                {device !== "tv" && <FontAwesomeIcon icon={mic ? faMicrophone : faMicrophoneSlash} className={`ml-auto ${mic ? "text-green-400" : "text-white/60"}`} />}
            </div>
        </div>
    );
};

const Room = ({ code, player, onLeave }) => {
    const room = usePartyRoom({ code, player });
    const [text, setText] = useState("");
    const chatEnd = useRef(null);
    useEffect(() => { if (chatEnd.current) chatEnd.current.scrollIntoView({ block: "nearest" }); }, [room.messages]);

    const invite = `${window.location.origin}/party?code=${code}`;
    const copyInvite = async () => {
        try {
            await navigator.clipboard.writeText(invite);
            Swal.fire({ toast: true, position: "top", timer: 1800, showConfirmButton: false, icon: "success", title: "Invite link copied" });
        } catch (error) {
            Swal.fire("Invite link", invite, "info");
        }
    };

    if (room.status === "error") {
        return (
            <div className="w-full p-[12px] text-white text-[14px]">
                <p>Could not join the watch party: {room.error}</p>
                <button className="mt-[8px] underline text-[#ffd800]" onClick={onLeave}>Close</button>
            </div>
        );
    }
    if (room.status === "ended") {
        return (
            <div className="w-full p-[12px] text-white text-[14px]">
                <p>This watch party has ended.</p>
                <button className="mt-[8px] underline text-[#ffd800]" onClick={onLeave}>Close</button>
            </div>
        );
    }

    const peers = Object.entries(room.peers);
    return (
        <div className="relative w-full text-white">
            <div className="flex flex-wrap items-center gap-[8px] text-[13px]">
                <FontAwesomeIcon icon={faUserGroup} className="text-[#ffd800]" />
                <span className="font-bold">Reaction</span>
                <span className="px-[6px] py-[1px] rounded bg-white/10 tracking-[2px]">{code}</span>
                <span className="text-white/60">{peers.length + 1} watching{room.party && room.party.fee ? ` · ${room.party.fee} credits to join` : " · free"}</span>
                <button onClick={copyInvite} className="ml-auto px-[8px] py-[3px] border border-white/30 rounded hover:bg-white/10">
                    <FontAwesomeIcon icon={faLink} /> Invite
                </button>
                {room.role === "host"
                    ? <button onClick={async () => {
                        const ok = await Swal.fire({ title: "End the party?", text: "Everyone leaves the room; each of you can keep watching on your own.", showCancelButton: true, confirmButtonText: "End party" });
                        if (ok.isConfirmed) room.endParty();
                    }} className="px-[8px] py-[3px] border border-red-400/60 text-red-300 rounded hover:bg-red-400/10">End</button>
                    : <button onClick={onLeave} className="px-[8px] py-[3px] border border-white/30 rounded hover:bg-white/10">Leave</button>}
            </div>
            {room.status === "connecting" && <p className="text-[12px] text-white/60 mt-[4px]">Connecting…</p>}
            {room.role && room.role !== "host" && <p className="text-[12px] text-white/50 mt-[4px]">Only the host can play, pause, seek or stop the movie.</p>}

            <div className="flex gap-[6px] overflow-x-auto movie-scene py-[8px]">
                <Tile stream={room.localStream} muted you camera={room.camera} mic={room.mic} host={room.role === "host"} />
                {peers.map(([sid, p]) => (
                    <Tile key={sid} stream={p.stream} name={p.name} camera={p.camera} mic={p.mic} device={p.device} host={p.role === "host"} />
                ))}
            </div>

            <div className="flex items-center gap-[6px] flex-wrap">
                <button onClick={room.toggleMic} disabled={!room.localStream} title={room.mic ? "Mute" : "Unmute"}
                    className={`w-[36px] h-[36px] rounded-full ${room.mic ? "bg-green-600" : "bg-white/10"} disabled:opacity-40`}>
                    <FontAwesomeIcon icon={room.mic ? faMicrophone : faMicrophoneSlash} />
                </button>
                <button onClick={room.toggleCamera} disabled={!room.localStream} title={room.camera ? "Camera off" : "Camera on"}
                    className={`w-[36px] h-[36px] rounded-full ${room.camera ? "bg-white/10" : "bg-red-600/70"} disabled:opacity-40`}>
                    <FontAwesomeIcon icon={room.camera ? faVideo : faVideoSlash} />
                </button>
                {!room.localStream && room.status === "live" && <span className="text-[11px] text-white/50">No camera or mic - you can still chat and react</span>}
                <div className="ml-auto flex gap-[2px]">
                    {PARTY_REACTIONS.map((e) => (
                        <button key={e} onClick={() => room.react(e)} className="text-[20px] w-[32px] h-[32px] rounded hover:bg-white/10">{e}</button>
                    ))}
                </div>
            </div>

            <div className="mt-[8px] h-[150px] overflow-y-auto movie-scene bg-black/30 rounded p-[8px] text-[13px]">
                {room.messages.length === 0 && <p className="text-white/40">Say hi - messages show on everyone's screen.</p>}
                {room.messages.map((m, i) => (
                    <p key={`${m.at}-${i}`} className="break-words">
                        <span className={m.from === room.me ? "text-[#ffd800]" : "text-white/70"}>{m.from === room.me ? "You" : m.name}: </span>
                        {m.text}
                    </p>
                ))}
                <div ref={chatEnd} />
            </div>
            <form className="mt-[6px] flex gap-[6px]" onSubmit={(e) => { e.preventDefault(); room.sendChat(text); setText(""); }}>
                <input value={text} maxLength={300} onChange={(e) => setText(e.target.value)} placeholder="Message the party"
                    className="flex-1 bg-white/10 rounded px-[10px] py-[6px] text-[13px] outline-none placeholder:text-white/40" />
                <button type="submit" className="px-[12px] rounded bg-[#ffd800] text-black text-[13px] font-bold">Send</button>
            </form>

            {/* reactions float up over the panel */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                {room.reactions.map((r, i) => (
                    <span key={r.key} className="absolute bottom-[40px] text-[30px] animate-bounce" style={{ left: `${10 + ((i * 37) % 80)}%` }} title={r.name}>{r.emoji}</span>
                ))}
            </div>
        </div>
    );
};

/**
 * launch: the player params guests need to open this title. player: the video.js player (null until ready).
 * autoStart: opened from a detail page's "Start a reaction" - show the set-up straight away.
 */
const WatchParty = ({ launch, player, initialCode, autoStart }) => {
    const [code, setCode] = useState(initialCode || null);
    const [starting, setStarting] = useState(false);
    const autoStarted = useRef(false);

    const start = async () => {
        const choice = await Swal.fire({
            title: "Start a reaction",
            html: `<p style="font-size:14px;margin-bottom:10px">Up to 10 people watch this in sync, with camera, mic and chat.
                   Everyone pays the normal play charge. You can also charge guests a fee - you get 60%, UKO keeps 40%. Fees guests pay with bought or ad credits reach your profile wallet as money you can withdraw to M-PESA; fees paid with free credits come to you as credits.</p>
                   <label style="display:block;font-size:13px;text-align:left">Fee to join, in credits (0 = free)
                     <input id="reaction-fee" type="number" min="0" max="${MAX_FEE}" step="1" value="0" class="swal2-input" style="margin:6px 0 12px;width:100%">
                   </label>
                   <label style="display:flex;gap:8px;align-items:center;font-size:13px;text-align:left">
                     <input id="reaction-public" type="checkbox" checked>
                     Public - list it on the Reactions page so anyone can find and join
                   </label>`,
            showCancelButton: true,
            confirmButtonText: "Start reaction",
            focusConfirm: false,
            preConfirm: () => {
                const fee = Number(document.getElementById("reaction-fee").value);
                if (!Number.isInteger(fee) || fee < 0 || fee > MAX_FEE) {
                    Swal.showValidationMessage(`Enter a whole number from 0 to ${MAX_FEE}`);
                    return false;
                }
                return { fee, listed: document.getElementById("reaction-public").checked };
            },
        });
        if (!choice.isConfirmed || !choice.value) return;
        setStarting(true);
        const created = await partyPost("/create", { launch, fee: choice.value.fee, listed: choice.value.listed });
        setStarting(false);
        if (!created.status) return Swal.fire("Reaction", created.message || "Could not start the reaction", "error");
        setCode(created.party.code);
    };

    useEffect(() => {
        if (!autoStart || code || autoStarted.current) return;
        autoStarted.current = true;
        start();
        // start() only reads props; run once when the player page opens
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoStart, code]);

    return (
        <div className="w-[96%] mx-[2%] my-[2%] p-[12px] rounded-lg bg-black/40 border border-white/10">
            {code
                ? <Room code={code} player={player} onLeave={() => setCode(null)} />
                : (
                    <button onClick={start} disabled={starting} className="flex items-center gap-[8px] text-white text-[15px] hover:text-[#ffd800] disabled:opacity-50">
                        <FontAwesomeIcon icon={faUserGroup} className="text-[#ffd800]" />
                        {starting ? "Starting…" : "Start a reaction"}
                        <span className="text-[12px] text-white/50">camera, mic and chat with up to 10 people</span>
                    </button>
                )}
        </div>
    );
};

export default WatchParty;

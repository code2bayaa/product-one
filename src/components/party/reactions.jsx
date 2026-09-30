// /reactions - the reactions (watch parties, movies PRD #11) going on right now that their hosts made public,
// from the reactions service's /reactions/live. Join opens the invite page (party/join.jsx), which shows the fee
// and takes the seat. A private reaction is joined with its code in the box at the top.
// Each card previews the movie the party is playing (the same links speed.jsx plays), muted, for PREVIEW_SECONDS.
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserGroup, faCircle } from "@fortawesome/free-solid-svg-icons";
import NAVBAR from "../nav";
import MOBILE from "../mobileBar";
import { useKeys } from "../safe";
import { EDENIMAGE } from "../eden/shared";
import { partyPost } from "./usePartyRoom";
import { useWindowWidth, DESKTOP_WIDTH } from "../../hooks/useWindowWidth";

const REFRESH_MS = 20000;

// minutes live, counted by the database's own clock (reactions service live_minutes)
const since = (minutes) => (minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)} h ${minutes % 60} min`);

const Picture = ({ party }) => {
    const { safeKeys } = useKeys();
    const path = party.picture;
    if (!path) return <div className="w-full h-full bg-[#2E2E3A]" />;
    // TMDB paths start with "/"; an Eden studio's upload is a bucket key
    if (path.startsWith("/")) return <img src={(safeKeys.IMG_POSTER || "") + path} alt={party.title} loading="lazy" className="w-full h-full object-cover" />;
    return <EDENIMAGE path={path} alt={party.title} className="w-full h-full object-cover" />;
};

// the links speed.jsx plays: DASH when the title was launched with `dash`, else the speed MP4
const DEV = process.env.REACT_APP_ENVIRONMENT === "development";
const SPEED_PLAY = DEV ? process.env.REACT_APP_SPEED_PLAY : process.env.REACT_APP_SPEED_PLAY_LIVE;
const DASH_PLAY = DEV ? process.env.REACT_APP_DASH_PLAY : process.env.REACT_APP_DASH_PLAY_LIVE;
const streamOf = (launch) => {
    const id = launch && launch.id;
    if (!id) return null;
    return launch.dash ? { dash: true, src: `${DASH_PLAY}/${id}/${id}.mpd` } : { dash: false, src: `${SPEED_PLAY}/${id}` };
};
// a taste, not a free screening: the preview stops here and asks the viewer to join
const PREVIEW_SECONDS = 30;

// The movie the party is watching, muted, from where the host's player is (party.now). It loads only while the
// card is on screen and falls back to the poster when the stream can't play.
const Preview = ({ party }) => {
    const box = useRef(null);
    const video = useRef(null);
    const [visible, setVisible] = useState(false);
    const [state, setState] = useState("idle"); // idle | playing | done | failed
    // the position the page first saw - later list refreshes must not jump the preview around
    const start = useRef(party.now);
    const stream = streamOf(party.launch);

    useEffect(() => {
        const el = box.current;
        if (!el || typeof IntersectionObserver === "undefined") { setVisible(true); return; }
        const seen = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.4 });
        seen.observe(el);
        return () => seen.disconnect();
    }, []);

    useEffect(() => {
        const el = video.current;
        if (!visible || !el || !stream || state === "done" || state === "failed") return;
        let dash = null;
        let cancelled = false;
        const from = Math.max(0, Number(start.current && start.current.position) || 0);
        const began = { at: null };
        const onMeta = () => { if (from && Number.isFinite(el.duration)) el.currentTime = Math.min(from, Math.max(0, el.duration - 1)); };
        const onPlaying = () => { if (began.at === null) began.at = el.currentTime; setState("playing"); };
        const onTime = () => {
            if (began.at !== null && el.currentTime - began.at >= PREVIEW_SECONDS) { el.pause(); setState("done"); }
        };
        const onError = () => setState("failed");
        el.addEventListener("loadedmetadata", onMeta);
        el.addEventListener("playing", onPlaying);
        el.addEventListener("timeupdate", onTime);
        el.addEventListener("error", onError);
        if (stream.dash) {
            import("dashjs").then((dashjs) => {
                if (cancelled) return;
                dash = dashjs.MediaPlayer().create();
                dash.on(dashjs.MediaPlayer.events.ERROR, onError);
                dash.initialize(el, stream.src, true);
            }).catch(onError);
        } else {
            el.src = stream.src;
            el.play().catch(() => {}); // muted autoplay; a refused play just leaves the poster
        }
        return () => {
            cancelled = true;
            el.removeEventListener("loadedmetadata", onMeta);
            el.removeEventListener("playing", onPlaying);
            el.removeEventListener("timeupdate", onTime);
            el.removeEventListener("error", onError);
            if (dash) dash.reset();
            else { el.pause(); el.removeAttribute("src"); el.load(); }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible, stream && stream.src]);

    return (
        <div ref={box} className="absolute inset-0">
            <Picture party={party} />
            {stream && state !== "failed" && (
                <video ref={video} muted playsInline preload="metadata"
                    className={`absolute inset-0 w-full h-full object-cover duration-500 ${state === "playing" ? "opacity-100" : "opacity-0"}`} />
            )}
            {state === "done" && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/60 text-[13px] font-bold">Join to keep watching</span>
            )}
        </div>
    );
};

const REACTIONSPAGE = () => {
    const navigate = useNavigate();
    const windowWidth = useWindowWidth();
    const desktop = windowWidth >= DESKTOP_WIDTH;
    const [parties, setParties] = useState(null);
    const [message, setMessage] = useState(null);
    const [code, setCode] = useState("");

    const load = useCallback(async () => {
        const res = await partyPost("/live", {});
        if (!res.status) { setMessage(res.message || "Could not load reactions"); setParties([]); return; }
        setMessage(null);
        setParties(res.parties || []);
    }, []);

    useEffect(() => {
        load();
        const timer = setInterval(load, REFRESH_MS);
        return () => clearInterval(timer);
    }, [load]);

    const joinCode = (e) => {
        e.preventDefault();
        const clean = code.toUpperCase().replace(/[^A-Z0-9]/g, "");
        if (clean.length === 6) navigate(`/party?code=${clean}`);
    };

    return (
        <div className="w-[100%] h-[100%] text-white flex flex-row" style={{ background: "linear-gradient(85deg, #0d0d0d, rgba(0,0,0,0.75), #000, #0f111a)" }}>
            {desktop
                ? <div className="w-[15%] h-[100%] border-r-[3px] border-[#2E2E3A]"><NAVBAR /></div>
                : <MOBILE />}
            <div className={`${desktop ? "w-[85%] px-[3%]" : "w-[100%] px-[16px] pb-24"} h-[100%] overflow-y-auto movie-scene pt-[24px]`}>
                <div className="flex flex-wrap items-end gap-[12px] justify-between">
                    <div>
                        <h1 className="text-[26px] font-bold flex items-center gap-[10px]">
                            <FontAwesomeIcon icon={faUserGroup} className="text-[#ffd800]" /> Reactions
                        </h1>
                        <p className="text-[13px] text-white/60">Watch along live with camera, mic and chat. Start one from any movie or series with "Start a reaction".</p>
                    </div>
                    <form onSubmit={joinCode} className="flex gap-[6px]">
                        <input value={code} maxLength={6} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Code"
                            className="w-[120px] bg-white/10 rounded px-[10px] py-[8px] tracking-[4px] uppercase outline-none placeholder:tracking-normal placeholder:text-white/40" />
                        <button type="submit" className="px-[14px] rounded bg-[#ffd800] text-black font-bold text-[13px]">Join</button>
                    </form>
                </div>

                {message && <p className="mt-[16px] text-red-300 text-[14px]">{message}</p>}
                {parties === null && <p className="mt-[24px] text-white/50">Loading…</p>}
                {parties && parties.length === 0 && !message && (
                    <p className="mt-[24px] text-white/50">No public reactions right now. Start one from a movie or series page.</p>
                )}

                <div className={`mt-[20px] grid gap-[14px] ${desktop ? "grid-cols-3" : "grid-cols-1"}`}>
                    {(parties || []).map((party) => {
                        const full = party.members >= party.max_members;
                        return (
                            <article key={party.code} className="rounded-lg overflow-hidden border border-white/10 bg-black/40 flex flex-col">
                                <div className="relative w-full aspect-video">
                                    <Preview party={party} />
                                    <span className="absolute top-[8px] left-[8px] px-[8px] py-[2px] rounded bg-red-600 text-[11px] font-bold flex items-center gap-[5px]">
                                        <FontAwesomeIcon icon={faCircle} className="text-[7px]" /> LIVE {since(party.live_minutes)}
                                    </span>
                                    {party.eden && <span className="absolute top-[8px] right-[8px] px-[6px] py-[2px] rounded bg-black/70 text-[11px] uppercase tracking-wider">Eden</span>}
                                </div>
                                <div className="p-[12px] flex flex-col gap-[4px] flex-1">
                                    <h2 className="font-bold text-[16px] truncate">{party.title || "Untitled"}</h2>
                                    {party.season ? <p className="text-[12px] text-white/60">Season {party.season}{party.episode ? ` · Episode ${party.episode}` : ""}</p> : null}
                                    <p className="text-[13px] text-white/70">Hosted by {party.host}</p>
                                    <p className="text-[13px] text-white/70">{party.members} / {party.max_members} watching</p>
                                    <p className="text-[13px] text-[#ffd800]">{party.fee > 0 ? `${party.fee} credits to join` : "Free to join"}</p>
                                    <button onClick={() => navigate(`/party?code=${party.code}`)} disabled={full}
                                        className="mt-auto pt-[2px] w-full py-[8px] rounded bg-[#ffd800] text-black font-bold text-[14px] disabled:opacity-40">
                                        {full ? "Full" : "Join"}
                                    </button>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default REACTIONSPAGE;

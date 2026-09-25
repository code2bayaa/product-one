import NAVBAR from "./nav";
import MOBILE from "./mobileBar";
import Swal from "sweetalert2";
import { NavLink } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";

// Earn credits by watching ads (movies-prd #15). Every 5 ads = 50 credits.
// Ads are UKOshop boosted items (image or video) and, when an Ad Manager unit is set, Google rewarded ads.
// The server opens and closes every ad (user/earn/index.js): Next only counts after the minimum time, and after
// the viewer scrolled through the description or watched the video to the end. Nothing here decides the reward.
const EARN = process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_EARN : process.env.REACT_APP_EARN_LIVE;

const api = async (path, body) => {
    const res = await fetch(`${EARN}${path}`, {
        method: body ? "POST" : "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: body ? JSON.stringify(body) : undefined,
    });
    return { code: res.status, ...(await res.json().catch(() => ({}))) };
};

// Google Ad Manager rewarded ad: resolves "granted" | "closed" | "unavailable"
function playGoogleRewarded(unit, onReady) {
    return new Promise((resolve) => {
        const load = () => new Promise((ok) => {
            if (window.googletag && window.googletag.apiReady) return ok();
            window.googletag = window.googletag || { cmd: [] };
            if (!document.getElementById("gpt-js")) {
                const s = document.createElement("script");
                s.id = "gpt-js"; s.async = true;
                s.src = "https://securepubads.g.doubleclick.net/tag/js/gpt.js";
                document.head.appendChild(s);
            }
            window.googletag.cmd.push(ok);
        });
        load().then(() => {
            const g = window.googletag;
            const slot = g.defineOutOfPageSlot(unit, g.enums.OutOfPageFormat.REWARDED);
            if (!slot) return resolve("unavailable"); // rewarded ads are not supported on this page / device
            slot.addService(g.pubads());
            let granted = false;
            const done = (result) => { g.destroySlots([slot]); resolve(result); };
            g.pubads().addEventListener("rewardedSlotReady", (e) => { if (e.slot === slot) onReady(() => e.makeRewardedVisible()); });
            g.pubads().addEventListener("rewardedSlotGranted", (e) => { if (e.slot === slot) granted = true; });
            g.pubads().addEventListener("rewardedSlotClosed", (e) => { if (e.slot === slot) done(granted ? "granted" : "closed"); });
            g.pubads().addEventListener("slotRenderEnded", (e) => { if (e.slot === slot && e.isEmpty) done("unavailable"); });
            g.enableServices();
            g.display(slot);
        });
    });
}

const EARNPAGE = () => {
    const [windowWidth, setWindowWidth] = useState(0);
    const [feed, setFeed] = useState(null);
    const [error, setError] = useState(null);
    const [queue, setQueue] = useState([]);
    const [ad, setAd] = useState(null);           // { provider, kind, data, impression_id, started }
    const [elapsed, setElapsed] = useState(0);
    const [proof, setProof] = useState({ scrolled_to_end: false, watched_to_end: false, interactions: 0 });
    const [busy, setBusy] = useState(false);
    const [googleReady, setGoogleReady] = useState(null);
    const descRef = useRef(null);
    const maxWatched = useRef(0);
    const turn = useRef(0);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        handleResize();
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const loadFeed = useCallback(async () => {
        const res = await api("/feed");
        if (res.code === 401) return setError("login");
        if (!res.status) return setError(res.message || "Could not load ads");
        setFeed(res);
        setQueue(res.ukoshop || []);
    }, []);
    useEffect(() => { loadFeed(); }, [loadFeed]);

    // countdown to the minimum time on an ad
    useEffect(() => {
        if (!ad) return;
        const t = setInterval(() => setElapsed(Math.floor((Date.now() - ad.started) / 1000)), 500);
        return () => clearInterval(t);
    }, [ad]);

    // a short description needs no scrolling - it is read once it is on screen
    useEffect(() => {
        const box = descRef.current;
        if (ad && ad.kind === "image" && box && box.scrollHeight <= box.clientHeight + 4) {
            setProof((p) => ({ ...p, scrolled_to_end: true }));
        }
    }, [ad]);

    const start = async (provider, kind, data) => {
        const res = await api("/start", { provider, kind, ad_ref: data ? String(data.id) : "" });
        if (!res.status) {
            Swal.fire({ icon: "info", title: res.message || "Could not start the ad", timer: 3000, showConfirmButton: false });
            return null;
        }
        setProof({ scrolled_to_end: false, watched_to_end: false, interactions: 0 });
        maxWatched.current = 0;
        setElapsed(0);
        const next = { provider, kind, data, impression_id: res.impression_id, started: Date.now(), min: res.min_seconds };
        setAd(next);
        return next;
    };

    const finish = async (current, extra) => {
        setBusy(true);
        try {
            let res = await api("/complete", {
                impression_id: current.impression_id,
                proof: { ...proof, ...extra, next_clicked: true, dwell_ms: Date.now() - current.started },
            });
            if (!res.status && res.wait) {
                // Google closed its ad before our minimum - hold on and send it again
                await new Promise((r) => setTimeout(r, res.wait * 1000));
                res = await api("/complete", { impression_id: current.impression_id, proof: { ...proof, ...extra, next_clicked: true, dwell_ms: Date.now() - current.started } });
            }
            if (!res.status) {
                Swal.fire({ icon: "warning", title: res.message || "That ad did not count", timer: 3000, showConfirmButton: false });
                return false;
            }
            setFeed((f) => ({ ...f, progress: res.progress }));
            if (res.rewarded) {
                Swal.fire({ icon: "success", title: `+${res.rewarded.credits} credits`, text: "Added to your balance", timer: 2500, showConfirmButton: false });
            } else if (!res.counted && res.reason) {
                Swal.fire({ icon: "info", title: res.reason, timer: 2500, showConfirmButton: false });
            }
            return true;
        } finally {
            setBusy(false);
        }
    };

    const nextAd = async () => {
        setAd(null);
        const useGoogle = feed?.google?.unit && googleReady !== false && (turn.current++ % 2 === 1 || queue.length === 0);
        if (useGoogle) return watchGoogle();
        if (queue.length === 0) return loadFeed();
        const [first, ...rest] = queue;
        setQueue(rest);
        await start("ukoshop", first.video ? "video" : "image", first);
    };

    const watchGoogle = async () => {
        const current = await start("google", "rewarded", null);
        if (!current) return;
        const result = await playGoogleRewarded(feed.google.unit, (show) => setGoogleReady(() => show));
        setGoogleReady(null);
        if (result === "granted") await finish(current, { granted: true });
        else if (result === "unavailable") setGoogleReady(false); // no fill - carry on with UKOshop ads
        setAd(null);
    };

    const next = async () => {
        if (!ad || busy) return;
        const ok = await finish(ad, {});
        if (ok) nextAd();
    };

    const onScroll = (e) => {
        const box = e.currentTarget;
        if (box.scrollTop + box.clientHeight >= box.scrollHeight - 4) setProof((p) => ({ ...p, scrolled_to_end: true }));
    };
    const onTimeUpdate = (e) => { maxWatched.current = Math.max(maxWatched.current, e.currentTarget.currentTime); };
    const onSeeking = (e) => {
        // no skipping ahead to the end
        if (e.currentTarget.currentTime > maxWatched.current + 1) e.currentTarget.currentTime = maxWatched.current;
    };

    const p = feed?.progress;
    const engaged = ad && (ad.kind === "video" ? proof.watched_to_end : proof.scrolled_to_end);
    const left = ad ? Math.max(0, (ad.min || p?.min_seconds || 0) - elapsed) : 0;

    return (
        <div className="w-[100%] min-h-[100%] overflow-y-auto text-white flex flex-row flex-wrap" style={{ background: "linear-gradient(65deg, #0d0d0d, rgba(0,0,0,0.75), #1c2a3b, #0f111a)" }}>
            {windowWidth > 800 ? (
                <div className="w-[20%] absolute h-[100%] border-r-[3px] border-[#2E2E3A]" style={{ background: "transparent" }}>
                    <NAVBAR />
                </div>
            ) : (
                <MOBILE />
            )}
            <div className={`${windowWidth > 800 ? "w-[80%] ml-[20%]" : "w-[100%]"} flex flex-col items-center gap-5 px-4 py-6`}>
                <div className="w-full max-w-[640px]">
                    <h2 className="text-[22px] font-bold">Earn credits</h2>
                    <p className="text-[14px] text-white/60">
                        Watch {p?.per_reward || 5} ads to earn {p?.reward_credits || 50} credits - enough for one movie or episode.
                        Read each ad or watch its video to the end, then press Next.
                    </p>
                </div>

                {error === "login" ? (
                    <div className="w-full max-w-[640px] rounded-lg border border-[#2E2E3A] p-5">
                        <p>Log in to earn credits.</p>
                        <NavLink to="/signin" className="mt-3 inline-block rounded bg-white px-4 py-2 font-bold text-black">Log in</NavLink>
                    </div>
                ) : error ? (
                    <p className="text-red-300">{error}</p>
                ) : !feed ? (
                    <p className="text-white/60">Loading ads…</p>
                ) : (
                    <>
                        <div className="w-full max-w-[640px]">
                            <div className="flex justify-between text-[13px] text-white/70">
                                <span>{p.counted} of {p.per_reward} ads</span>
                                <span>{p.rewards_today * p.reward_credits} of {p.daily_rewards * p.reward_credits} credits today</span>
                            </div>
                            <div className="mt-1 h-2 w-full rounded bg-white/10">
                                <div className="h-2 rounded bg-[#e0b04b]" style={{ width: `${(p.counted / p.per_reward) * 100}%` }} />
                            </div>
                        </div>

                        {!ad ? (
                            <div className="w-full max-w-[640px] rounded-lg border border-[#2E2E3A] p-5 text-center">
                                {queue.length === 0 && !feed.google?.unit ? (
                                    <p className="text-white/60">{feed.shop_error || "No ads right now - check back later."}</p>
                                ) : (
                                    <button type="button" onClick={nextAd} className="rounded bg-white px-5 py-2 font-bold text-black">
                                        {p.counted ? "Continue" : "Start watching"}
                                    </button>
                                )}
                            </div>
                        ) : ad.provider === "google" ? (
                            <div className="w-full max-w-[640px] rounded-lg border border-[#2E2E3A] p-5 text-center">
                                {typeof googleReady === "function" ? (
                                    <button type="button" onClick={() => googleReady()} className="rounded bg-white px-5 py-2 font-bold text-black">
                                        Watch Google ad
                                    </button>
                                ) : busy ? (
                                    <p className="text-white/60">Checking…</p>
                                ) : (
                                    <p className="text-white/60">Loading Google ad…</p>
                                )}
                            </div>
                        ) : (
                            <article className="w-full max-w-[640px] overflow-hidden rounded-lg border border-[#2E2E3A] bg-black/30"
                                onClick={() => setProof((x) => ({ ...x, interactions: x.interactions + 1 }))}>
                                {ad.kind === "video" ? (
                                    <video src={ad.data.video} controls playsInline className="w-full max-h-[360px] bg-black"
                                        onTimeUpdate={onTimeUpdate} onSeeking={onSeeking}
                                        onEnded={() => setProof((x) => ({ ...x, watched_to_end: true }))} />
                                ) : ad.data.images?.[0] ? (
                                    <img src={ad.data.images[0]} alt={ad.data.title} className="w-full max-h-[360px] object-cover" />
                                ) : null}
                                <div className="p-4">
                                    <p className="text-[11px] uppercase tracking-wider text-[#e0b04b]">UKOshop ad</p>
                                    <h3 className="text-[18px] font-bold">{ad.data.title}</h3>
                                    {ad.data.amount ? <p className="text-[15px] text-white/80">KSh {Number(ad.data.amount).toLocaleString()}</p> : null}
                                    <div ref={descRef} onScroll={onScroll} className="mt-3 max-h-[140px] overflow-y-auto whitespace-pre-line pr-2 text-[14px] text-white/75">
                                        {ad.data.description}
                                    </div>
                                    <a href={ad.data.link} target="_blank" rel="noreferrer" className="mt-3 inline-block text-[13px] text-[#e0b04b] underline">
                                        View on UKOshop
                                    </a>
                                    <div className="mt-4 flex items-center justify-between gap-3">
                                        <span className="text-[12px] text-white/55">
                                            {left > 0 ? `${left}s` : !engaged ? (ad.kind === "video" ? "Watch to the end" : "Scroll to the end of the description") : "Ready"}
                                        </span>
                                        <button type="button" disabled={busy || left > 0 || !engaged} onClick={next}
                                            className="rounded bg-white px-5 py-2 font-bold text-black disabled:opacity-40">
                                            {busy ? "…" : "Next"}
                                        </button>
                                    </div>
                                </div>
                            </article>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default EARNPAGE;

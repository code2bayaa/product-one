import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import { ReelActions, ReelComments, useReelStats } from "./reels";

const VIDEO_PAGE = process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_VIDEO_PAGE : process.env.REACT_APP_VIDEO_PAGE_LIVE

//a studio can tag a reel on a season or an episode - only movie and tv ids open an Eden detail page
const DETAIL = {
    movie: "/eden/movies/id",
    tv: "/eden/series/id"
}

//one horizontal row of Eden mini series (unlisted YouTube reels) - stream is "movie" or "tv"
//kept apart from the blockbuster trailer rows (clips.jsx); onPlay lets the page play a reel in its hero
const MINISERIES = ({ stream, title, onPlay }) => {
    const [items, setItems] = useState([])
    const [page, setPage] = useState(0)
    const [totalPages, setTotalPages] = useState(1)
    const [loading, setLoading] = useState(false)
    const [failed, setFailed] = useState(false)
    const [playing, setPlaying] = useState(null)
    const rowRef = useRef(null)
    const navigate = useNavigate()
    // PRD #26: likes + comments per reel
    const keys = useMemo(() => items.map(({ key }) => key), [items])
    const [stats, updateStat] = useReelStats(keys)
    const [commentsOn, setCommentsOn] = useState(null)
    const closeComments = useCallback(() => setCommentsOn(null), [])
    const commentCount = useCallback((comments) => commentsOn && updateStat(commentsOn.key, { comments }), [commentsOn, updateStat])

    const load = useCallback(async (next) => {
        setLoading(true)
        try {
            const res = await fetch(VIDEO_PAGE, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Accept": "application/json" },
                body: JSON.stringify({ page: next, type: stream, mode: "mini_series" })
            })
            const { total_pages, data } = await res.json()
            setTotalPages(total_pages || 1)
            setItems(prev => {
                const seen = new Set(prev.map(({ key }) => key))
                return [...prev, ...(data || []).filter(({ key }) => key && !seen.has(key))]
            })
            setPage(next)
            setFailed(false)
        } catch (error) {
            console.log(error)
            setFailed(true)
        }
        setLoading(false)
    }, [stream])

    useEffect(() => {
        load(1)
    }, [load])

    //fetch the next page when the row is scrolled near its end
    const onScroll = () => {
        const row = rowRef.current
        if (!row || loading || page >= totalPages) return
        if (row.scrollLeft + row.clientWidth >= row.scrollWidth - 200) load(page + 1)
    }

    const play = (item) => {
        if (onPlay) onPlay(item.key)
        else setPlaying(item.key)
    }

    //nothing uploaded yet for this stream - keep the page clean
    if (!loading && !failed && items.length === 0) return null

    return (
        <section className="w-full px-3 md:px-4 mt-4">
            <div className="flex items-center gap-3 mb-2">
                <span className="w-[6px] h-6 bg-[#5A5A68] border-r-[4px] border-white" />
                <h2 className="gradient-text font-bold text-lg md:text-2xl">{title}</h2>
                <span className="text-[11px] uppercase tracking-wider text-[#808C8C] border border-[#2E2E3A] rounded px-2 py-[2px]">Eden</span>
            </div>
            {
                playing && (
                    <div className="w-full max-w-[900px] aspect-video mb-3">
                        <iframe
                            className="w-full h-full rounded-xl"
                            src={`https://www.youtube.com/embed/${playing}?autoplay=1`}
                            title="Eden mini series"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                        />
                    </div>
                )
            }
            {
                failed && items.length === 0 ?
                    <p className="text-[#808C8C] text-sm">Mini series could not load.</p>
                :
                    <div
                        ref={rowRef}
                        onScroll={onScroll}
                        className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 movie-scene">
                        {
                            items.map((item) => (
                                <article
                                    key={item.key}
                                    className="snap-start shrink-0 w-[70%] sm:w-[45%] md:w-[30%] lg:w-[23%] rounded-xl overflow-hidden border border-[#2E2E3A] bg-[#0f111a] text-white">
                                    <button
                                        onClick={() => play(item)}
                                        className="relative block w-full aspect-video group"
                                        aria-label={`Play ${item.name}`}>
                                        {/* hqdefault exists for every upload, maxresdefault does not */}
                                        <img
                                            src={`https://img.youtube.com/vi/${item.key}/hqdefault.jpg`}
                                            alt={item.name}
                                            loading="lazy"
                                            className="w-full h-full object-cover group-hover:contrast-125 duration-200"
                                        />
                                        <span className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 duration-200">
                                            <FontAwesomeIcon icon={faPlay} className="text-[#ffd800] text-3xl" />
                                        </span>
                                    </button>
                                    <div className="flex items-center justify-between gap-2 p-2">
                                        <p className="text-sm line-clamp-2">{item.name}</p>
                                        {
                                            DETAIL[item.type] && item.id && (
                                                <button
                                                    onClick={() => navigate(DETAIL[item.type], { state: { id: item.id } })}
                                                    className="shrink-0 inline-flex items-center gap-1 rounded border border-[#ffd800]/60 px-2 py-[2px] text-xs text-[#ffd800] hover:bg-[#ffd800] hover:text-black duration-200"
                                                    aria-label={`Read more about ${item.name}`}>
                                                    <FontAwesomeIcon icon={faCircleInfo} />
                                                    Read more
                                                </button>
                                            )
                                        }
                                    </div>
                                    <ReelActions
                                        reel={item}
                                        stat={stats[item.key]}
                                        onChange={(change) => updateStat(item.key, change)}
                                        onComments={() => setCommentsOn(item)} />
                                </article>
                            ))
                        }
                        {
                            loading && Array.from({ length: items.length ? 1 : 4 }).map((_, i) => (
                                <div key={`loading-${i}`} className="shrink-0 w-[70%] sm:w-[45%] md:w-[30%] lg:w-[23%] aspect-video rounded-xl bg-[#2E2E3A] animate-pulse" />
                            ))
                        }
                    </div>
            }
            {commentsOn && <ReelComments reel={commentsOn} onClose={closeComments} onCount={commentCount} />}
        </section>
    )
}

export default MINISERIES;

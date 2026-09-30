import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import YouTube from "react-youtube";
import LOAD from "../../midlleware/load";
import { ReelActions, ReelComments, useReelStats } from "./reels";

const VIDEO_PAGE = process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_VIDEO_PAGE : process.env.REACT_APP_VIDEO_PAGE_LIVE

const DETAIL = {
    movie: "/eden/movies/id",
    tv: "/eden/series/id"
}

const STREAMS = ["movie", "tv"]

//one full screen Eden reel - same layout as the blockbuster trailer slides on phones (home.jsx MOBILEVIEW)
const REEL = ({ item, isActive, stat, onChange, onComments, onEnd }) => {
    const navigate = useNavigate()

    return (
        <div
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(https://img.youtube.com/vi/${item.key}/hqdefault.jpg)` }}>
            <div className="w-full h-full flex flex-col backdrop-blur-md bg-black/40 text-white pt-[76px] pb-[10vh]">
                <div className="px-3 flex items-center gap-2">
                    <span className="text-[11px] uppercase tracking-wider text-[#ffd800] border border-[#ffd800]/50 bg-black/50 rounded px-2 py-[2px]">
                        Eden · {item.stream === "tv" ? "Mini series TV" : "Mini series movie"}
                    </span>
                </div>
                <h1 className="px-3 mt-2 text-[26px] leading-tight font-bold line-clamp-2">{item.name}</h1>
                <div className="w-full aspect-video mt-3 bg-black">
                    {/* only the active reel mounts a player (autoplay, muted) - leaving a slide unmounts it */}
                    {
                        isActive ?
                            <YouTube
                                videoId={item.key}
                                title={item.name}
                                className="w-full h-full"
                                iframeClassName="w-full h-full"
                                opts={{ width: "100%", height: "100%", playerVars: { autoplay: 1, mute: 1 } }}
                                onEnd={onEnd}
                            />
                        :
                            <img src={`https://img.youtube.com/vi/${item.key}/hqdefault.jpg`} alt={item.name} className="w-full h-full object-cover" />
                    }
                </div>
                {
                    DETAIL[item.type] && item.id && (
                        <button
                            onClick={() => navigate(DETAIL[item.type], { state: { id: item.id } })}
                            className="mx-3 mt-4 self-start px-4 rounded-md bg-[rgba(0,0,0,0.65)] border-[#ffd800] border-[2px]">
                            <p className="gradient-text text-[25px]">Read more</p>
                        </button>
                    )
                }
                <div className="flex-1" />
                <div className="w-full bg-[rgba(0,0,0,0.45)] pt-2 pb-4">
                    <ReelActions reel={item} stat={stat} onChange={onChange} onComments={onComments} />
                </div>
            </div>
        </div>
    )
}

//phones: Eden mini series (movie + tv) as a vertical full screen reel swiper, like the blockbuster tab
const MINISERIESREELS = () => {
    const [items, setItems] = useState([])
    const [pages, setPages] = useState({ movie: { page: 0, total: 1 }, tv: { page: 0, total: 1 } })
    const [loading, setLoading] = useState(false)
    const [activeIndex, setActiveIndex] = useState(0)
    const swiperRef = useRef(null)
    const keys = useMemo(() => items.map(({ key }) => key), [items])
    const [stats, updateStat] = useReelStats(keys)
    const [commentsOn, setCommentsOn] = useState(null)
    const closeComments = useCallback(() => setCommentsOn(null), [])
    const commentCount = useCallback((comments) => commentsOn && updateStat(commentsOn.key, { comments }), [commentsOn, updateStat])

    const load = useCallback(async (current) => {
        setLoading(true)
        const next = { ...current }
        const results = await Promise.all(STREAMS.map(async (stream) => {
            const { page, total } = current[stream]
            if (page >= total) return []
            try {
                const res = await fetch(VIDEO_PAGE, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "Accept": "application/json" },
                    body: JSON.stringify({ page: page + 1, type: stream, mode: "mini_series" })
                })
                const { total_pages, data } = await res.json()
                next[stream] = { page: page + 1, total: total_pages || 1 }
                return (data || []).filter(({ key }) => key).map((item) => ({ ...item, stream }))
            } catch (error) {
                console.log(error)
                return []
            }
        }))
        //interleave movie and tv reels
        const merged = []
        for (let i = 0; i < Math.max(...results.map((r) => r.length)); i++)
            results.forEach((r) => r[i] && merged.push(r[i]))
        setItems((prev) => {
            const seen = new Set(prev.map(({ key }) => key))
            return [...prev, ...merged.filter(({ key }) => !seen.has(key))]
        })
        setPages(next)
        setLoading(false)
    }, [])

    useEffect(() => {
        load({ movie: { page: 0, total: 1 }, tv: { page: 0, total: 1 } })
    }, [load])

    const onSlideChange = (swiper) => {
        setActiveIndex(swiper.activeIndex)
        const more = STREAMS.some((stream) => pages[stream].page < pages[stream].total)
        if (more && !loading && swiper.activeIndex >= items.length - 3) load(pages)
    }

    if (items.length === 0)
        return loading ?
            <div className="w-full h-full flex justify-center items-center bg-[#000]"><LOAD /></div>
        :
            <p className="text-[#808C8C] text-sm text-center pt-20">No mini series yet.</p>

    return (
        <>
            <Swiper
                slidesPerView={1}
                direction="vertical"
                mousewheel={true}
                style={{ height: "100%" }}
                onSwiper={(swiper) => (swiperRef.current = swiper)}
                onSlideChange={onSlideChange}>
                {items.map((item, node) => (
                    <SwiperSlide key={item.key}>
                        <REEL
                            item={item}
                            isActive={node === activeIndex}
                            stat={stats[item.key]}
                            onChange={(change) => updateStat(item.key, change)}
                            onComments={() => setCommentsOn(item)}
                            onEnd={() => swiperRef.current?.slideNext()} />
                    </SwiperSlide>
                ))}
            </Swiper>
            {commentsOn && <ReelComments reel={commentsOn} onClose={closeComments} onCount={commentCount} />}
        </>
    )
}

export default MINISERIESREELS;

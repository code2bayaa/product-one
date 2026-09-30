import NAVBAR from "./nav"
import { useLocation } from "react-router-dom";
import { useState, useEffect, useCallback, useRef } from "react";
import MOBILE from "./mobileBar";
import CLIPS from './clips';
import YouTube from 'react-youtube';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay } from "@fortawesome/free-solid-svg-icons";
import { useEdenImage } from './eden/shared';
import { useWindowWidth, DESKTOP_WIDTH } from "../hooks/useWindowWidth";

const VIDEO_PAGE = process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_VIDEO_PAGE : process.env.REACT_APP_VIDEO_PAGE_LIVE

//every trailer on one title, laid out like the Eden mini series row - a player on top, a card per trailer below.
//Eden titles read their studio's reels (trailers and mini series); blockbusters read TMDB through CLIPS.
const TRAILER = () => {
    const windowWidth = useWindowWidth()
    const [items, setItems] = useState([]);
    const [playing, setPlaying] = useState(0);
    const [loading, setLoading] = useState(true);
    const playerRef = useRef(null);
    const {state} = useLocation()
    const id = state?.id
    const stream = state?.stream
    const season = state?.season
    const episode = state?.episode
    const eden = !!state?.eden
    const title = state?.title
    const background = state?.background

    //merge a batch into the list once per key
    const addValidation = useCallback((videos) => {
        setItems(prev => {
            const seen = new Set(prev.map(({ key }) => key))
            const fresh = (videos || []).filter(({ key }) => key && !seen.has(key))
            return fresh.length ? [...prev, ...fresh] : prev
        })
        setLoading(false)
    }, []);

    const noop = useCallback(() => {}, []);

    //Eden reels tied to this title
    useEffect(() => {
        if (!eden || !id) return
        const controller = new AbortController()
        const load = async () => {
            try {
                const res = await fetch(VIDEO_PAGE, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "Accept": "application/json" },
                    body: JSON.stringify({ page: 1, type: stream, id, mode: "title" }),
                    signal: controller.signal
                })
                const { data } = await res.json()
                addValidation(data || [])
            } catch (error) {
                if (error.name !== "AbortError") console.log(error)
            }
            setLoading(false)
        }
        load()
        return () => controller.abort()
    }, [eden, id, stream, addValidation])

    //a blockbuster with no trailers never calls back - stop the skeleton after a while
    useEffect(() => {
        if (eden) return
        const timer = setTimeout(() => setLoading(false), 8000)
        return () => clearTimeout(timer)
    }, [eden])

    const current = items[playing]

    const play = (index) => {
        setPlaying(index)
        playerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    }

    //roll on to the next trailer when one ends
    const onEnd = () => {
        if (playing < items.length - 1) setPlaying(playing + 1)
    }

    //Eden images load from Backblaze through VIEW_IMG; only a TMDB title may use the TMDB poster prefix
    const poster = useEdenImage(background?.path, { tmdb: !eden }) || "/image/logo.png"

    return (
        <div className="w-[100%] h-[100%] bg-cover bg-no-repeat bg-center text-white" style={{backgroundImage:`linear-gradient(105deg, #0d0d0d, rgba(0,0,0,0.75), #000, rgba(0,0,0,0.56)),url(${poster})`,backgroundPosition:"0% 40%"}}>
            {
                windowWidth >= DESKTOP_WIDTH ?
                <div className="w-[20%] h-[100%] absolute" style={{background:"linear-gradient(85deg, rgba(13, 13, 13, 0.75), rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.56), rgba(0, 0, 0, 0.45))"}}>
                    <NAVBAR/>
                </div>
                :
                <MOBILE/>
            }
            <div className={windowWidth >= DESKTOP_WIDTH ? "w-[80%] h-[100%] ml-[20%] overflow-y-auto movie-scene flex flex-col px-4 py-3":"w-[98%] mx-[1%] h-[92%] overflow-y-auto movie-scene flex flex-col px-2 py-2"}>
                {/* blockbusters: CLIPS fetches TMDB trailers and hands them to addValidation, it renders nothing here */}
                {
                    !eden && id && (
                        <CLIPS
                            many={true}
                            id={id}
                            season={season}
                            episode={episode}
                            firstClip={false}
                            updateClip={noop}
                            addValidation={addValidation}
                            data={[{ results:[{id}] }]}
                            stream={stream}
                        />
                    )
                }

                <div className="flex items-center gap-3 mb-2">
                    <span className="w-[6px] h-6 bg-[#5A5A68] border-r-[4px] border-white" />
                    <h1 className="gradient-text font-bold text-lg md:text-2xl">{title ? `${title} - trailers` : `${stream === "tv" ? "Series" : "Movie"} trailers`}</h1>
                    {eden && <span className="text-[11px] uppercase tracking-wider text-[#808C8C] border border-[#2E2E3A] rounded px-2 py-[2px]">Eden</span>}
                </div>

                <div ref={playerRef} className="w-full max-w-[1000px] aspect-video mb-3 rounded-xl overflow-hidden bg-black shrink-0">
                    {
                        current ?
                            <YouTube
                                key={current.key}
                                videoId={current.key}
                                title={current.name}
                                className="w-full h-full"
                                iframeClassName="w-full h-full"
                                opts={{ width:"100%", height:"100%", playerVars: { autoplay: 1, rel: 0 } }}
                                onEnd={onEnd}
                            />
                        :
                            <div className={`w-full h-full flex items-center justify-center text-[#808C8C] text-sm ${loading ? "animate-pulse bg-[#2E2E3A]" : ""}`}>
                                {loading ? "" : "No trailers yet for this title."}
                            </div>
                    }
                </div>
                {current && <p className="text-[#ffd800] mb-3">{current.name}</p>}

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 pb-4">
                    {
                        items.map((item, index) => (
                            <article
                                key={item.key}
                                className={`rounded-xl overflow-hidden border bg-[#0f111a] text-white ${index === playing ? "border-[#ffd800]" : "border-[#2E2E3A]"}`}>
                                <button
                                    onClick={() => play(index)}
                                    className="relative block w-full aspect-video group"
                                    aria-label={`Play ${item.name}`}>
                                    {/* hqdefault exists for every upload, maxresdefault does not */}
                                    <img
                                        src={`https://img.youtube.com/vi/${item.key}/hqdefault.jpg`}
                                        alt={item.name}
                                        loading="lazy"
                                        className="w-full h-full object-cover group-hover:contrast-125 duration-200"
                                    />
                                    <span className={`absolute inset-0 flex items-center justify-center bg-black/30 duration-200 ${index === playing ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                                        <FontAwesomeIcon icon={faPlay} className="text-[#ffd800] text-3xl" />
                                    </span>
                                </button>
                                <div className="p-2">
                                    <p className="text-sm line-clamp-2">{item.name}</p>
                                    {item.mode === "mini_series" && <p className="text-[11px] text-[#808C8C] mt-1">Mini series</p>}
                                </div>
                            </article>
                        ))
                    }
                    {
                        loading && items.length === 0 && Array.from({ length: 4 }).map((_, i) => (
                            <div key={`loading-${i}`} className="aspect-video rounded-xl bg-[#2E2E3A] animate-pulse" />
                        ))
                    }
                </div>
            </div>
        </div>
    )
}

export default TRAILER

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import BLOCKBUSTER from "./blockbuster";
import MOBILE from "./mobileBar";
import NAVBAR from "./nav";
// import { NavLink } from "react-router-dom";
import BOX from "./box";
import BAR from "./bar";
import { COLLECT } from "../midlleware/report";
import { Swiper, SwiperSlide } from "swiper/react";
// import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/thumbs";
import {  useNavigate  } from "react-router-dom";
import LOAD from "../midlleware/load";
import YouTube from 'react-youtube';
import PICTURE from "../midlleware/picture";
import { useKeys } from './safe';
import MINISERIES from "./eden/miniseries";
import MINISERIESREELS from "./eden/miniseriesReels";
import { ReelActions, ReelComments, useReelStats } from "./eden/reels";
import { useWindowWidth, DESKTOP_WIDTH } from "../hooks/useWindowWidth";
const HOME = () => {

    const [clip, setClip] = useState(null);
    const windowWidth = useWindowWidth()
    const [validated,setValidated] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);
    //phones show one list at a time - Eden mini series or the blockbuster trailers
    const [mobileTab, setMobileTab] = useState("eden");
    //like + comment at the bottom of every blockbuster trailer preview, as on the Eden mini series (eden/reels.jsx)
    const trailerKeys = useMemo(() => validated.map(({key}) => key), [validated])
    const [trailerStats, updateTrailerStat] = useReelStats(trailerKeys)
    const [commentsOn, setCommentsOn] = useState(null)
    const closeComments = useCallback(() => setCommentsOn(null), [])
    const commentCount = useCallback((comments) => commentsOn && updateTrailerStat(commentsOn.key, { comments }), [commentsOn, updateTrailerStat])
    const swiperRef = useRef(null);
    const navigate = useNavigate();
    const {safeKeys} = useKeys()
    // const onPlayerReady = (event) => {
    //     // access to player in all event handlers via event.target
    //     event.target.pauseVideo();
    // }

    // const opts: YouTubeProps['opts'] = {
    //     height: '390',
    //     width: '640',
    //     playerVars: {
    //     // https://developers.google.com/youtube/player_parameters
    //     autoplay: 1,
    //     },
    // };
    useEffect(() => {

        if(safeKeys && safeKeys.hasOwnProperty("GEO") && safeKeys.GEO)
            COLLECT(false,safeKeys?.GEO)
    },[safeKeys])

    const findClip = useCallback((index) => {
        // console.log("find clip", index)
        setClip(index)
    },[])

    const mobileValidation = useCallback((validData) => {
        setValidated(prev => {
            const newItems = validData.filter(
                v => !prev.some(p => p.key === v.key)
            );

            if (newItems.length === 0) return prev;

            return [...prev, ...newItems];
        });
    }, []);
    const navRoute = ({state,url}) => {
        navigate(url,{
            state : {
                ...state
            }
        })
    }
    const MOBILEVIEW = ({node,name,movie,id,stream,isActive}) => {
        // const [active, setActive] = useState(false)
        const key = node
        // const changeSwipe = (n) => {
        //     if(n){
        //         // setActive(true)
        //         swiperRef.current?.autoplay.stop();
        //     }else{
        //         // setActive(false)
        //         swiperRef.current?.autoplay.start();
        //     }
        // }
        const playerRef = useRef(null);

        const onReady = (event) => {
            playerRef.current = event.target;

            if (isActive) {
                event.target.playVideo();
            } else {
                event.target.pauseVideo();
            }
        };

        const onEnd = () => {
            // console.log("ended")
            swiperRef.current?.slideNext(); // move to next slide
        };

        // const onPlay = () => {
        //     swiperRef.current?.autoplay.stop();
        // }

        useEffect(() => {
            if (playerRef.current) {
                if (isActive) {
                    playerRef.current.playVideo();
                    // swiperRef.current?.autoplay.stop();
                } else {
                    playerRef.current.pauseVideo();
                    // swiperRef.current?.autoplay.start();
                }
            }
        }, [isActive]);

        return (
            <>
                <div
                    className="w-[100%] h-[100%]"
                    style={{backgroundImage:`url(https://img.youtube.com/vi/${key}/maxresdefault.jpg)`}}
                    // onClick={() => changeSwipe(true)}
                >
                    <div
                        className="w-[100%] h-[100%] backdrop-blur-md"
                    >
                        <h1 style={{fontSize:"30px",color:"#fff"}}>{movie?.title || movie?.name}</h1>
                        <p style={{fontStyle:"italic",color:"#ffd800"}}>"{movie?.tagline}"</p>
                        {/* <iframe
                            width="100%"
                            height="100%"
                            src={`https://www.youtube.com/embed/${key}`}
                            title={name}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                            allowFullScreen
                        /> */}
                        {
                            isActive && (
                                <YouTube
                                    videoId={key}
                                    title={name}
                                    opts={{ height:250, playerVars: { autoplay: 1, mute:1 } }}
                                    onEnd={onEnd}
                                    // onPlay={onPlay}
                                    // onPlay={() => changeSwipe(true)}
                                    onReady={onReady}
                                />
                            )
                        }

                        <h3 className="text-amber-900">{movie?.status}</h3>
                        <div className='w-[100%] flex flex-row'>
                            {/* <img
                                width="40%"
                                height="200px"
                                src={`https://img.youtube.com/vi/${key}/maxresdefault.jpg`} // Use a thumbnail instead of the iframe
                                alt={name}
                                style={{ borderRadius: "10px", height:"200px", margin:"1%", position:"relative", marginTop:"-15%" }}
                            /> */}
                            <PICTURE picture={movie?.poster_path} classes={"w-[40%] h-[200px] m-[1%] object-cover rounded-lg my-[-15%]"} />
                            <article className="w-[50%] h-[150px] m-[1%] text-ellipsis text-[#fff]">
                                {/* blockbuster TV trailers (BOX) open the series page, movies the movie page */}
                                <button
                                    onClick={() => navRoute({
                                        url: stream === "tv" ? '/series/id' : '/movies/id',
                                        state:{
                                            id: movie?.id || id
                                        }
                                    })}
                                    className="px-3 rounded-md absolute my-[-15%] bg-[rgba(0,0,0,0.65)] border-[#ffd800] border-[2px]"
                                >
                                    <p className="gradient-text text-[25px]">Read more</p>
                                </button>
                                {movie?.overview?.length > 200 ? movie?.overview.slice(0,200) + "...":movie?.overview}
                            </article>

                        </div>
                        <div className='w-[100%] backdrop-blur-md h-[10%] items-center text-[#ffd800]'>
                            <p>{name}</p>
                        </div>
                        <div className="w-[100%] text-white bg-[rgba(0,0,0,0.45)] pt-2">
                            <ReelActions reel={{ key, name }} stat={trailerStats[key]}
                                onChange={(change) => updateTrailerStat(key, change)}
                                onComments={() => setCommentsOn({ key, name })} />
                        </div>
                    </div>
                </div>
            </>
        );
    }
    return (
        <div className={windowWidth >= DESKTOP_WIDTH ? "w-[100%] h-[100%] overflow-hidden":"w-[100%] h-[100%] text-white flex flex-row flex-wrap"} style={{background:"linear-gradient(65deg, #0d0d0d, rgba(0,0,0,0.75), #1c2a3b, #0f111a)"}}>
            {
                windowWidth >= DESKTOP_WIDTH ?
                    <div className="w-[20%] nav-wall absolute h-[100%] text-[#fff]" style={{background:"linear-gradient(85deg, rgba(13, 13, 13, 0.75), rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.56), rgba(0, 0, 0, 0.45))"}}>
                        <NAVBAR/>
                    </div>
                :
                    <MOBILE/>
            }
            <div className={`${windowWidth >= DESKTOP_WIDTH ? "w-[80%] h-[100%] ml-[20%] component-wall" : "w-[100%] h-[92%] overflow-y-auto movie-scene" }`}>
                {
                    windowWidth >= DESKTOP_WIDTH && <BAR />
                }
                <div className={`${windowWidth >= DESKTOP_WIDTH ? "w-[100%] text-[#000] relative top-[-10%] h-[108%] overflow-y-auto movie-scene":"w-[100%] text-[#000] home h-[auto]"}`}>
                    {
                        windowWidth >= DESKTOP_WIDTH && (
                            <div
                                style={{
                                    backgroundImage: clip ? "url(https://img.youtube.com/vi/" + clip + "/maxresdefault.jpg)" : "none",
                                    zIndex:1,

                                }} className={`${windowWidth >= DESKTOP_WIDTH ? "w-[100%] relative justify-center items-center h-[530px]" : "h-[300px] w-[100%] top-[-1%] justify-center items-center"}`} >
                                {
                                    clip && (
                                    <div className="video-wrapper flex justify-center items-center">
                                        <iframe
                                            // className="top-[9%]"
                                            width="100%"
                                            height="90%"
                                            src={`https://www.youtube.com/embed/${clip}?autoplay=1&mute=1`}
                                            title="YouTube Video Player"
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                                            // style={{ boxShadow: "0 0 5px 10px #ccc", marginTop:"5%" }}
                                        />
                                    </div>
                                    )
                                }
                            </div>
                        )
                    }
                    {
                        !clip && windowWidth < DESKTOP_WIDTH && mobileTab === "blockbuster" && (
                            <div className="w-[100%] h-[100%] flex flex-col justify-center items-center fixed bg-[#000]">
                                {/* <h1 className="text-white">YOU ARE OFFLINE</h1>
                                <NavLink
                                    to="/offline/download"
                                    className={"w-[30%] text-center p-[10px] m-[10px] underline bg-transparent border-[1.5px] border-[#2E073F] rounded-[2px] text-white"}
                                >
                                    Go to Downloads
                                </NavLink> */}
                                <LOAD/>
                            </div>
                        )
                    }
                    {
                        windowWidth >= DESKTOP_WIDTH && (
                            <>
                                <MINISERIES stream="movie" title="Mini Series Movies" onPlay={findClip} />
                                <MINISERIES stream="tv" title="Mini Series TV" onPlay={findClip} />
                            </>
                        )
                    }
                    {/* blockbuster rows on desktop share the Eden mini series section + card look (eden/miniseries.jsx) */}
                    <section className={windowWidth >= DESKTOP_WIDTH ? "w-full px-4 mt-4" : "w-full"}>
                        {
                            windowWidth >= DESKTOP_WIDTH && (
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="w-[6px] h-6 bg-[#5A5A68] border-r-[4px] border-white" />
                                    <h2 className="gradient-text font-bold text-2xl">Blockbuster Movies</h2>
                                </div>
                            )
                        }
                        <BLOCKBUSTER setClip={findClip} mobileView={mobileValidation} />
                    </section>
                    <section className={windowWidth >= DESKTOP_WIDTH ? "w-full px-4 mt-4 pb-6" : "w-full"}>
                        {
                            windowWidth >= DESKTOP_WIDTH && (
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="w-[6px] h-6 bg-[#5A5A68] border-r-[4px] border-white" />
                                    <h2 className="gradient-text font-bold text-2xl">Blockbuster TV</h2>
                                </div>
                            )
                        }
                        <BOX setClip={findClip} mobileView={mobileValidation} />
                    </section>
                    {
                        windowWidth < DESKTOP_WIDTH && (
                            <div className="sticky top-0 z-30 w-full flex gap-2 p-2 bg-[#0d0d0d]/90 backdrop-blur-md" role="tablist">
                                {[["eden","Mini series"],["blockbuster","Blockbusters"]].map(([tab,label]) => (
                                    <button
                                        key={tab}
                                        role="tab"
                                        aria-selected={mobileTab === tab}
                                        onClick={() => setMobileTab(tab)}
                                        className={`flex-1 py-2 rounded-lg text-sm font-bold border ${mobileTab === tab ? "border-[#ffd800] text-[#ffd800]" : "border-[#2E2E3A] text-[#808C8C]"}`}>
                                        {label}
                                    </button>
                                ))}
                            </div>
                        )
                    }
                    {
                        windowWidth < DESKTOP_WIDTH && mobileTab === "eden" && (
                            <div className="w-[100%] h-[100%] absolute top-[-1%]">
                                <MINISERIESREELS />
                            </div>
                        )
                    }
                    {
                        windowWidth < DESKTOP_WIDTH && mobileTab === "blockbuster" && (
                            <div className="w-[100%] h-[100%] absolute top-[-1%]">
                                <Swiper
                                    // modules={[Autoplay]}
                                    slidesPerView={1}
                                    onSwiper={(swiper) => (swiperRef.current = swiper)}
                                    // onTouchStart={() => swiperRef.current?.autoplay.stop()}
                                    onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
                                    // freeMode={true}
                                    direction="vertical"
                                    mousewheel={true}
                                    style={{ height: "100%" }}
                                    watchSlidesProgress={false}
                                    // autoplay={{
                                    //     delay: 10000, // 25 seconds
                                    //     disableOnInteraction: false, // keeps autoplay even after swipe
                                    // }}
                                >
                                    {validated && validated.length > 0 && validated.map(({key,name,movieInfo,id,stream}, node) => (
                                        <>
                                            <SwiperSlide key={node}>
                                                <MOBILEVIEW node={key} name={name} movie={movieInfo} id={id} stream={stream} isActive={node === activeIndex} />
                                            </SwiperSlide>
                                        </>
                                    ))}
                                </Swiper>
                            </div>
                        )
                    }
                    {commentsOn && <ReelComments reel={commentsOn} onClose={closeComments} onCount={commentCount} />}
                </div>
            </div>
        </div>
    )

}

export default HOME;
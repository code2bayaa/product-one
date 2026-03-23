import { useState, useEffect, useCallback } from "react";
import BLOCKBUSTER from "./blockbuster";
import MOBILE from "./mobileBar";
import NAVBAR from "./nav";
import { NavLink } from "react-router-dom";
import BOX from "./box";
import BAR from "./bar";
import { COLLECT } from "../midlleware/report";

const HOME = () => {

    const [clip, setClip] = useState(null);
    const [windowWidth, setWindowWidth] = useState(0);

    useEffect(() => {
        const handleResize = () => {
            console.log("handle resize")
            setWindowWidth(window.screen.width);
        };
        // console.log(window.screen.width)
        // console.log(process.env.REACT_APP_MOVIE_DB,"movie")
        window.addEventListener("resize", handleResize);
        handleResize(); // Call it once to set the initial value
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    },[])

    useEffect(() => {
        COLLECT()
    },[])

    const findClip = useCallback((index) => {
        console.log("find clip", index)
        setClip(index)
    },[])

    return (
        <div className={windowWidth > 800 ? "w-[100%] h-[100%] overflow-hidden":"w-[100%] h-[100%] text-white flex flex-row flex-wrap"} style={{background:"linear-gradient(65deg, #0d0d0d, rgba(0,0,0,0.75), #1c2a3b, #0f111a)"}}>
            {
                clip ? (
                            windowWidth > 800 ? 
                            <div className="w-[20%] nav-wall absolute h-[100%] text-[#fff]" style={{background:"linear-gradient(85deg, rgba(13, 13, 13, 0.75), rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.56), rgba(0, 0, 0, 0.45))"}}>
                                <NAVBAR/>
                            </div>
                            :
                            <MOBILE/>
                    )
                    :
                    <></>
            }
            <div className={`${windowWidth > 800 ? "w-[80%] h-[100%] ml-[20%] component-wall" : "w-[100%] h-[92%] overflow-y-auto movie-scene" }`}>
                {
                    clip && windowWidth > 800 && <BAR />
                }
                <div className={`${windowWidth > 800 ? "w-[100%] text-[#000] relative top-[-10%] h-[108%] overflow-y-auto movie-scene":"w-[100%] text-[#000] home h-[auto]"}`}>                 
                    {
                        clip ?
                            <div 
                                style={{
                                    backgroundImage:"url(https://img.youtube.com/vi/" + clip + "/maxresdefault.jpg)",
                                    zIndex:1,
                                    
                                }} className={`${windowWidth > 800 ? "w-[100%] relative justify-center items-center h-[530px]" : "h-[300px] w-[100%] top-[-1%] justify-center items-center"}`} >
                                {
                                        <div className="video-wrapper flex justify-center items-center">
                                            <iframe
                                                // className="top-[9%]"
                                                width="100%"
                                                height="90%"
                                                src={`https://www.youtube.com/embed/${clip}`}
                                                title="YouTube Video Player"
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                                                allowFullScreen
                                                // style={{ boxShadow: "0 0 5px 10px #ccc", marginTop:"5%" }}
                                            />
                                        </div>
                                    
                                }
                            </div>                        
                        :
                            <div className="w-[100%] h-[100%] flex flex-col justify-center items-center fixed bg-[#000]">
                                <h1 className="text-white">YOU ARE OFFLINE</h1>
                                <NavLink
                                    to="/offline/download"
                                    className={"w-[30%] text-center p-[10px] m-[10px] underline bg-transparent border-[1.5px] border-[#2E073F] rounded-[2px] text-white"}
                                >
                                    Go to Downloads
                                </NavLink>
                            </div>
                    }
                    {
                        clip && (
                            <div className={
                                windowWidth > 800 ? `w-[40%] h-[5%] flex flex-row mt-[2%] relative text-[25px]`
                                : `w-[100%] h-[30px] flex flex-row mt-[15px] z-20 relative text-[20px]`
                            }>
                                <span className="w-[10%] h-[100%] border-r-[10px] border-[#fff] bg-[#5A5A68]"></span>
                                <span className="gradient-text font-bold">Blockbuster Movies Trailers</span>
                            </div>
                        )
                    }
                    <div className="h-[200px] w-[100%]">
                        <BLOCKBUSTER setClip={findClip} />
                    </div>
                    {
                        clip && (
                            <div className={
                                windowWidth > 800 ? `w-[40%] h-[5%] flex flex-row text-[25px]`
                                : `w-[100%] h-[30px] flex flex-row mt-[15px] z-20 relative text-[20px]`
                            }>
                                <span className="w-[10%] h-[100%] border-r-[10px] border-[#fff] bg-[#5A5A68]"></span>
                                <span className="gradient-text font-bold">Blockbuster TV Trailers</span>
                            </div>
                        )
                    }
                    <div className="h-[200px] w-[100%]">
                        <BOX setClip={findClip} />
                    </div>
                </div>
            </div>                    
        </div>
    )

}

export default HOME;
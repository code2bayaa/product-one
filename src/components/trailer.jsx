import NAVBAR from "./nav"
import { useLocation } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
// import LOAD from "../midlleware/load";
import MOBILE from "./mobileBar";

import CLIPS from './clips';

const TRAILER = () => {
    const [clip, setClip] = useState(null);
    const [windowWidth, setWindowWidth] = useState(0);
    const { state } = useLocation();

    const id = state.id
    const stream = state.stream
    const season = state?.season
    const episode = state?.episode
    const background = state.background

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };
        window.addEventListener("resize", handleResize);
        handleResize(); // Call it once to set the initial value
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    },[])


    const firstClip = useCallback((video) => {
        console.log("block buster first clip")
        setClip(video)
    },[setClip])

    const updateClip = (video) => {
        console.log("block buster update clip")
        setClip(video)
    }



    return (
        
        <div className="w-[100%] h-[100%]  bg-cover bg-no-repeat bg-center text-white" style={{backgroundImage:`linear-gradient(105deg, #0d0d0d, rgba(0,0,0,0.75), #000, rgba(0,0,0,0.56)),url(${process.env.REACT_APP_img_poster + "/" + background + ".jpg"})`,backgroundPosition:"0% 40%"}}>
            {
                windowWidth > 800 ? 
                <div className="w-[20%] h-[100%] absolute border-r-[3px] border-[#2E2E3A]" style={{background:"linear-gradient(85deg, rgba(13, 13, 13, 0.75), rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.56), rgba(0, 0, 0, 0.45))"}}>
                    <NAVBAR/>
                </div>
                :
                <MOBILE/>
            }
        {
            // clip ?
                <div className={windowWidth > 800 ? "w-[80%] h-[100%] ml-[20%] overflow-y-auto movie-scene flex flex-col":"w-[98%] mx-[1%] h-[92%] overflow-y-auto movie-scene flex flex-col"}>
                    <div className="w-[100%] h-[500px]">
                        {

                            <iframe
                                width="100%"
                                height="100%"
                                src={`${clip}`}
                                title="YouTube video player"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                                allowFullScreen
                                style={{ borderRadius: "12px", background: "#000" }}
                            />
                            
                        }     
                    </div>
                    <div className="w-[90%] h-[320px] mx-[5%] my-[2%]">

                        <h1 style={{textAlign:"center",textDecoration:"underline"}}>{stream} TRAILOR</h1>

                        <div className="w-[100%] h-[300px] mt-[0.5%]">
                            <CLIPS many={true} id={id} season={season} episode={episode} firstClip={firstClip} updateClip={updateClip} node={1} random={1} stream={stream} />
                        </div>
                    </div>
                </div>
                // :
                // <LOAD/>
            }
            </div>            

    )
}

export default TRAILER
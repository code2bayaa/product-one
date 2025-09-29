import { useState, useEffect, useCallback } from "react";
// import PLYR from "../midlleware/plyr";
import BLOCKBUSTER from "./blockbuster";
import MOBILE from "./mobileBar";
import NAVBAR from "./nav";
import { NavLink } from "react-router-dom";
import BOX from "./box";

const HOME = () => {

    const [clip, setClip] = useState(null);
    const [windowWidth, setWindowWidth] = useState(0);

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

    const findClip = useCallback((video) => {
        console.log("video, home",video)
        setClip(video)
    },[])

    return (
        <div className={windowWidth > 800 ? "w-[100%] h-[100%] overflow-hidden flex flex-row flex-wrap":"w-[100%] h-[100%] text-white flex flex-row flex-wrap"} style={{background:"linear-gradient(65deg, #0d0d0d, rgba(0,0,0,0.75), #1c2a3b, #0f111a)"}}>
            {
                windowWidth > 800 ? 
                <div className="w-[20%] absolute h-[100%] text-[#fff] border-r-[3px] border-[#2E2E3A]" style={{background:"linear-gradient(85deg, #0d0d0d, rgba(0,0,0,0.75), #000, #0f111a)"}}>
                    <NAVBAR/>
                </div>
                :
                <MOBILE/>
            }
            <div className={`${windowWidth > 800 ? "w-[80%] h-[100%]  ml-[20%]" : "w-[100%] h-[92%] overflow-y-auto movie-scene" }`}>
                <div className={`${windowWidth > 800 ? "w-[90%] text-[#000] h-[99%] mx-[5%] overflow-y-auto movie-scene":"w-[100%] text-[#000] home h-[auto]"}`}>                 
                    <div className="w-[100%] h-[8%] text-[#2E073F] text-center flex flex-row bg-[#FFF5F2]">
                        <NavLink
                            to="/privacy"
                            className={"w-[25%] m-[1%] border-[1.5px] border-[#2E073F] rounded-[2px]"}
                        >
                            Privacy
                        </NavLink>
                        <NavLink
                            to="/terms"
                            className={"w-[25%] m-[1%] border-[1.5px] border-[#2E073F] rounded-[2px]"}
                        >
                            Terms
                        </NavLink>
                        <NavLink
                            to="/blogs"
                            className={"w-[25%] m-[1%] border-[1.5px] border-[#2E073F] rounded-[2px]"}
                        >
                            Blog
                        </NavLink>
                        <NavLink
                            to="/about"
                            className={"w-[25%] m-[1%] border-[1.5px] border-[#2E073F] rounded-[2px]"}
                        >
                            About
                        </NavLink>
                    </div>
                    <h1 className="text-[#fff] text-[30px]">UKO movie recommendations</h1>
                    <div className="w-[100%] top-[-1%] justify-center items-center">
                        {
                            clip && 
                            // <PLYR
                            //     // className={"w-[100%] h-[80%] absolute"} 
                            //     videoUrl={`${clip}`}
                            //     youtube={true}
                            // />
                            <iframe
                                width="100%"
                                height="100%"
                                src={clip}
                                title="YouTube video player"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                                allowFullScreen
                                style={{ borderRadius: "3px", background: "#000" }}
                            />
                        }
                    </div>
                    <BLOCKBUSTER setClip={findClip} />
                    <BOX setClip={findClip} />
                </div>
            </div>
        </div>
    )

}

export default HOME;
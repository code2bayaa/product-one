import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import PLYR from "../midlleware/plyr";

const OFFLINE = () => {
    const {state} = useLocation()
    const { video, subtitle, image } = state;
    const [windowWidth, setWindowWidth] = useState(0)

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

    return (
        <div className={`${windowWidth > 800 ? "w-[100%] min-h-[100%]  bg-cover bg-no-repeat bg-center text-white":"w-[100%] h-[100%] overflow-y-auto bg-cover bg-no-repeat bg-center text-white"}`} style={{backgroundImage:`linear-gradient(45deg, rgba(0,0,0,0.75), hsl(220, 70%, 10%)),url(${URL.createObjectURL(image)})`,backgroundPosition:"0% 40%"}}>
            <div className='w-[100%] text-[#ffd800] h-[500px] flex flex-row flex-wrap'>

                {/* <iframe
                    width="100%"
                    height="100%"
                    src={video}
                    title="PLAYING..."
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                    allowFullScreen
                    style={{ borderRadius: "12px", background: "#000" }}
                />
                <track label="English" kind="subtitles" srclang="en" src={subtitle} default></track> */}
                <PLYR 
                    videoUrl={video}
                    subtitleUrl={subtitle}
                    offline={true} 
                />
            </div>

        </div>
    )
}

export default OFFLINE;
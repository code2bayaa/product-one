import MOBILE from "./mobileBar";
import NAVBAR from "./nav"
import { useWindowWidth, DESKTOP_WIDTH } from "../hooks/useWindowWidth";


const LIBRARY = () => {

    const windowWidth = useWindowWidth()

    return (
        <div className="w-[100%] duration-250 h-[100%] text-white flex flex-row flex-wrap" style={{background:"linear-gradient(65deg, #0d0d0d, rgba(0,0,0,0.75), #1c2a3b, #0f111a)"}}>
            {
                windowWidth >= DESKTOP_WIDTH ? 
                <div className="w-[20%] absolute h-[100%] border-r-[3px] border-[#2E2E3A]" style={{background:"linear-gradient(85deg, #0d0d0d, rgba(0,0,0,0.75), #000, #0f111a)"}}>
                    <NAVBAR/>
                </div>
                :
                <MOBILE/>
            }
            <div className={windowWidth >= DESKTOP_WIDTH ? "w-[80%] h-[100%] overflow-y-auto movie-scene ml-[20%] flex flex-col":"w-[100%] h-[92%] overflow-y-auto movie-scene flex flex-col"}>
                <h1>Still on construction</h1>
            </div>
        </div>
    )
}

export default LIBRARY
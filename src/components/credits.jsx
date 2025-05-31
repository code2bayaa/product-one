import NAVBAR from "./nav";
import MOBILE from "./mobileBar";
import { useSearchParams, useLocation } from "react-router-dom";
import { useEffect } from "react";

const CREDITS = () => {

    const location = useLocation();
    const [searchParams] = useSearchParams();
    useEffect(() => {
        const query = searchParams.get("query");
        const url = `${location.pathname}?${searchParams.toString()}`;

        const scriptElement = document.querySelector('script[src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8036256488117651"]');
        // if (query) {
        //     document.title = `Empire | ${query}`;
        // } else {
        //     document.title = "Empire";
        // }
        function handleScriptLoad() {
            try{
                if(window.adsbygoogle){
                    console.log("pushing ads")
                    window.adsbygoogle.push({});
                }else{
                    scriptElement.addEventListener("load",handleScriptLoad)
                    console.log("adsbygoogle not defined, waiting for script to load");
                }
            }catch(error){
                console.error("Error loading script:", error);
            }
        }
        handleScriptLoad()

        return () => {
            if(scriptElement){
                scriptElement.removeEventListener("load", handleScriptLoad);
            }
        }
    }, [searchParams,location]);
    return (
        <div className="w-[100%] h-[100%] overflow-hidden text-white flex flex-row flex-wrap" style={{background:"url(/image/grey.jpg)"}}>
            {
                windowWidth > 800 ? 
                    <div className="w-[20%] absolute h-[100%] border-r-[3px] border-[#2E2E3A]" style={{background:"linear-gradient(85deg, #0d0d0d, rgba(0,0,0,0.75), #000, #0f111a)"}}>
                        <NAVBAR/>
                    </div>
                :
                    <MOBILE/>
            }
            <div className={`${windowWidth > 800 ? "w-[80%] h-[100%]  ml-[20%]" : "w-[100%] h-[auto]" }`}>
                <div style={{overflow:"hidden",margin:"5px"}}>
                    Google Ad Block
                    <ins
                        className="adsbygoogle"
                        style={{display:"block",width:"100%",height:"100px"}}
                        data-ad-client="ca-pub-8036256488117651"
                        data-ad-slot="1234567890"
                        data-ad-format="auto"
                        data-full-width-responsive="true"
                    ></ins>
                </div>
            </div>
        </div>
    )
}

export default CREDITS;
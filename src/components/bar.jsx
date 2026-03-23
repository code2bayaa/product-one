// import { NavLink } from "react-router-dom"
import { 
    // useEffect, 
    useState } from "react"
import {useNavigate} from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { faBars, faBarsStaggered, 
    // faCoins
 } from "@fortawesome/free-solid-svg-icons";
import { gsap } from "gsap";
const BAR = () => {

    // const [windowWidth, setWindowWidth] = useState(0);
    const [open, setOpen] = useState(false)
    const navigate = useNavigate();
    const router = useNavigate()

    // useEffect(() => {
    //     const handleResize = () => {
    //         setWindowWidth(window.innerWidth);
    //     };
    //     window.addEventListener("resize", handleResize);
    //     handleResize(); // Call it once to set the initial value
    //     return () => {
    //         window.removeEventListener("resize", handleResize);
    //     };
    // },[])
    const navRoute = ({state,url}) => {
        navigate(url,{
            state : {
                ...state
            }
        })
    } 

    const openWall = () => {
        // find elements (must exist in DOM)
        const navEl = document.querySelector('.nav-wall');
        const compEl = document.querySelector('.component-wall');

        // fallback toggle if elements not found
        if (!navEl || !compEl) {
            setOpen(o => !o);
            return;
        }

        // timeline with defaults
        const tl = gsap.timeline({ defaults: { duration: 0.45, ease: "power2.out" } });
        if (!open) {
            console.log("open")
            // animate: nav width 15% -> 0% (hide) and comp width 85% -> 100% (expand)
            tl.to(navEl, { width: '0%', xPercent: -100, paddingLeft: 0, paddingRight: 0 }, 0);
            tl.to(compEl, { width: '100%', xPercent: -15 }, 0);
        } else {
            console.log("close")
            // reverse: nav width 0% -> 15% (show) and comp width 100% -> 85% (shrink)
            tl.to(navEl, { width: '15%', xPercent: 0 }, 0);
            tl.to(compEl, { width: '85%', xPercent: 0 }, 0);
        }
        setOpen(o => !o);
    }

    return (
        <div className={`w-[98.5%] h-[50px] border-b-[1px] border-[#fff] background-[transparent] flex flex-row flex-wrap`} style={{zIndex:10,position:"relative"}}>
            <div className="w-[10%] h-[100%] flex justify-center items-center mx-[1%]">
                <img src="/image/logo.png" alt="logo" className="object-cover w-[90%] h-[100%]" />
                <button
                    type="button"
                    className="w-[10%] h-[100%] text-white"
                    onClick={() => openWall()}
                >
                    {
                        open ? 
                        <FontAwesomeIcon icon={faBarsStaggered} className="text-[30px]" />
                        :
                        <FontAwesomeIcon icon={faBars} className="text-[30px]" />
                    }
                </button>
            </div>
            <button
                className="w-[30%] flex backdrop-blur-lg rounded-md ml-[1%] h-[40px] items-center"
                onClick={() => router("/search")}
            >
                <FontAwesomeIcon icon={faSearch} fontSize={30}/> 
                <span>search movies/tv/people</span>
            </button>
            <button
                onClick={() => navRoute({
                    url:"/discover/movie",
                    state:{
                        mode:"movie"
                    }
                })}
                // style={{background:"#808C8C"}}
                className="rounded-md mx-0.5 bg-slate-950 w-[20%] h-[40px] opacity-70 text-[#fff] underline cursor-pointer"
            >
                movie categories
            </button>
            <button
                onClick={() => navRoute({
                    url:"/discover/tv",
                    state:{
                        mode:"tv"
                    }
                })}
                // style={{background:"#808C8C"}}
                className="rounded-md mx-0.5 bg-slate-950 w-[20%] h-[40px] opacity-70 text-[#fff] underline cursor-pointer"
            >
                tv categories
            </button>
        </div>
    )
}

export default BAR
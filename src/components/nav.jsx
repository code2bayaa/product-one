import { NavLink } from "react-router-dom"
import { useEffect, useState } from "react"
import {useNavigate} from "react-router-dom"
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCirclePlay, faCoins, faHome, faSearch, faPoll, faTelevision, faUserFriends, faMobile } from "@fortawesome/free-solid-svg-icons";
import { useCreditRegion } from "./eden/shared";
import { useWindowWidth, DESKTOP_WIDTH } from "../hooks/useWindowWidth";

const NAVBAR = ({fullCover = null,data = null,main = null}) => {

    const windowWidth = useWindowWidth()
    const [loggedIn, setLoggedIn] = useState(false)
    const creditRegion = useCreditRegion()
    
    // const [count,setCount] = useState(0)
    const [coins,setCoins] = useState(0.0)
    const [showFullscreenBtn, setShowFullscreenBtn] = useState(false);
    const router = useNavigate()
    const api_url = process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_API_URL : process.env.REACT_APP_API_URL_LIVE
    const shopPostAdUrl = (process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_SHOP_POST_AD : process.env.REACT_APP_SHOP_POST_AD_LIVE) || "https://shop.uko-app.co.ke/post-ad"
    const edenUrl = (process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_EDEN : process.env.REACT_APP_EDEN_LIVE) || "https://eden.uko-app.co.ke"
    // const linkUrl = process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_SIGNUP : process.env.REACT_APP_SIGNUP_LIVE

    // console.log(linkUrl,"link")

    // let count = 0
    // useEffect(() => {
    //     console.log("count",count)
    //     !count && COLLECT(data)
    //     count++
        
    // },[count,data])

    useEffect(() => {
      async function authentication(){
        let status
        try {
          const res = await fetch(api_url,{credentials: "include"})
          ;({status} = await res.json())
        } catch (error) {
          return null //auth service unreachable: stay signed out
        }
        if(status && status !== 429){
            // console.log(status, "status nav")
            // router('/admin/reports')
            setLoggedIn(true)
        }
        return status
      }
      authentication()
      .then(status => {
            if(status){
                fetch(process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_CHECK_USER_CREDITS : process.env.REACT_APP_CHECK_USER_CREDITS_LIVE,{credentials: "include"})
                .then(res => res.json())
                .then(({sum,message}) => {
                    console.log(message,sum,"check")
                    //affordable for one movie | episode
                    if(sum){
                        setCoins(sum)
                    }
                })

            }else{
                let user = localStorage.getItem("session")
                fetch(`${process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_CHECK_REPORT_CREDITS : process.env.REACT_APP_CHECK_REPORT_CREDITS_LIVE}`,{
                    method:"POST",
                    headers:{
                        "Content-Type":"application/json",
                        "Accept":"application/json"
                    },
                    body:JSON.stringify({
                        user

                    })
                })
                .then((response) => response.json())
                .then(({sum,message}) => {
                    console.log(message,sum,"check session")
                    //affordable for one movie | episode
                    if(sum){
                        setCoins(sum)
                    }
                })

            }
      })
    },[api_url])


    const customSignout = async() => {
        try {

            const response = await fetch(process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_SIGNOUT : process.env.REACT_APP_SIGNOUT_LIVE,{credentials: "include"});
        
            const {status,message} = await response.json()

            // console.log(status,"status")
            if(status){
                setLoggedIn(false)
                router("/")
                return null
            }
            Swal.fire("Oops!", message, "error");
            return null
        
        } catch (error) {
            console.error("Error during sign-out:", error,error.message);
            Swal.fire("Oops!", error.message, "error");
        }
    }

    const bigScreen = () => {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.mozRequestFullScreen) { // Firefox
            elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) { // Chrome, Safari & Opera
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) { // IE/Edge
            elem.msRequestFullscreen();
        }
        setShowFullscreenBtn(true);

    };

    const exitScreen = () => {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) { // Firefox
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) { // Chrome, Safari & Opera
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { // IE/Edge
            document.msExitFullscreen();
        }
        setShowFullscreenBtn(false);
    };

    const navRoute = ({state,url}) => {
        router(url,{
            state : {
                ...state
            }
        })
    } 

    return (
        // <div className={`w-[100%] ${fullCover ? "nav-bar-full" : main ? "" : "nav-bar"} movie-scene h-[100%] overflow-auto`}>
        <div className="bg-[#0b0d10] [background-image:radial-gradient(rgba(255,255,255,.05)_1px,transparent_1px)] [background-size:3px_3px] border-b border-white/10 bg-[#111317] px-4 py-4 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto no-scrollbar lg:w-72 lg:border-b-0 lg:border-r lg:px-4">
            <div className="grain-overlay" aria-hidden />
            { windowWidth < DESKTOP_WIDTH && (
                <button
                    onClick={ showFullscreenBtn ? () => exitScreen(): () => bigScreen()}
                    style={{
                        position: "fixed",
                        top: 10,
                        left: "50%",
                        transform: "translateX(-50%)",
                        zIndex: 1000,
                        background: "#000",
                        color: "#ffd800",
                        padding: "10px 24px",
                        borderRadius: "12px",
                        border: "2px solid #ffd800"
                    }}
                >
                    {
                        showFullscreenBtn ? "Exit Fullscreen" : "Go Fullscreen"
                    }
                </button>
            )}   
            <div className="w-[100%] h-[auto] text-white flex flex-column flex-wrap">
                {
                    windowWidth < DESKTOP_WIDTH && <img src="/image/logo.png" alt="logo" className="object-cover w-[90%] h-[100px]" />

                }
                
                <div className="w-[100%] h-[60px] text-[#ffd800] text-[30px]">
                    <FontAwesomeIcon icon={faCoins} /><span className="gradient-text text-[25px]">{coins} credits</span>
                </div>
                
                <NavLink
                    to="/"
                    className={({ isActive, isPending }) =>
                        isPending ? "pending flex items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]" : isActive ? "active items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]" : "text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]"
                    }
                >
                    <FontAwesomeIcon icon={faHome} fontSize={30}/> mini-series <img src="/image/emoji2.gif" alt="UKOapp" className="w-[20%] ml-[45%] mt-[-15%] h-[100%]" />
                </NavLink>
                {
                    windowWidth < DESKTOP_WIDTH && (
                        <>
                            <button
                                className="w-[100%] flex backdrop-blur-lg text-[15px] h-[40px] items-center"
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
                                style={{background:"#808C8C"}}
                                className="w-[100%] flex h-[40px] text-[15px] items-left text-[#fff] underline"
                            >
                                <FontAwesomeIcon icon={faPoll} fontSize={30}/> movie categories
                            </button>
                            <button
                                onClick={() => navRoute({
                                    url:"/discover/tv",
                                    state:{
                                        mode:"tv"
                                    }
                                })}
                                style={{background:"#808C8C"}}
                                className="w-[100%] flex h-[40px] text-[15px] items-left text-[#fff] underline"
                            >
                                <FontAwesomeIcon icon={faPoll} fontSize={30}/> tv categories
                            </button>
                       </>             
                    )
                }
                {/* {
                    windowWidth >= DESKTOP_WIDTH && 
                    <NavLink
                        to="/search"
                        className={({ isActive, isPending }) =>
                            isPending ? "pending flex items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]" : isActive ? "active flex items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]" : "flex items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]"
                        }
                    >
                        search
                    </NavLink>
                } */}
                <NavLink
                    to="/movies"
                    className={({ isActive, isPending }) =>
                        isPending ? "pending items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]" : isActive ? "active items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]" : " items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]"
                    }
                >
                    <FontAwesomeIcon icon={faCirclePlay} fontSize={30}/> movies
                </NavLink>
                <NavLink
                    to="/series"
                    className={({ isActive, isPending }) =>
                        isPending ? "pending items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]" : isActive ? "active items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]" : "items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]"
                    }
                >
                    <FontAwesomeIcon icon={faTelevision} fontSize={30}/> tv shows
                </NavLink>
                {/* <NavLink
                    to="/korea"
                    className={({ isActive, isPending }) =>
                        isPending ? "pending flex items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]" : isActive ? "active flex items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]" : "flex items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]"
                    }
                >
                    k-pop
                </NavLink>
                <NavLink
                    to="/hindu"
                    className={({ isActive, isPending }) =>
                        isPending ? "pending flex items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]" : isActive ? "active flex items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]" : "flex items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]"
                    }
                >
                    bollywood
                </NavLink>
                <NavLink
                    to="/china"
                    className={({ isActive, isPending }) =>
                        isPending ? "pending flex items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]" : isActive ? "active flex items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]" : "flex items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]"
                    }
                >
                    chinese
                </NavLink> */}
                <NavLink
                    to="/people"
                    className={({ isActive, isPending }) =>
                        isPending ? "pending items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]" : isActive ? "active items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]" : "items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]"
                    }
                >
                    <FontAwesomeIcon icon={faUserFriends} fontSize={30} /> people
                </NavLink>
                {/* <NavLink
                    to="/netflix"
                    className={({ isActive, isPending }) =>
                        isPending ? "pending flex items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]" : isActive ? "active flex items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]" : "flex items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]"
                    }
                >
                    netflix
                </NavLink>
                <NavLink
                    to="/disney"
                    className={({ isActive, isPending }) =>
                        isPending ? "pending flex items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]" : isActive ? "active flex items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]" : "flex items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]"
                    }
                >
                    disney
                </NavLink>
                */}
                {/* <NavLink
                    to="/anime"
                    className={({ isActive, isPending }) =>
                        isPending ? "pending flex items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]" : isActive ? "active flex items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]" : "flex items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]"
                    }
                >
                    anime
                </NavLink>                  */}
                {loggedIn && creditRegion && <>
                <NavLink
                    to="/earn"
                    className={({ isActive, isPending }) =>
                        isPending ? "pending flex items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]" : isActive ? "active flex items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]" : "flex items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]"
                    }
                >
                    earn credit
                </NavLink>
                <NavLink
                    to="/subscribe"
                    className={({ isActive, isPending }) =>
                        isPending ? "pending flex items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]" : isActive ? "active flex items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]" : "flex items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]"
                    }
                >
                    buy credits
                </NavLink>
                </>}
                {/* PRD #11: live reactions (watch parties) */}
                <NavLink
                    to="/reactions"
                    className={({ isActive, isPending }) =>
                        isPending ? "pending flex items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]" : isActive ? "active flex items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]" : "flex items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]"
                    }
                >
                    reactions
                </NavLink>
                {
                    !loggedIn ? 
                    <>
                        {/* <NavLink
                            to="/signin"
                            className={({ isActive, isPending }) =>
                                isPending ? "pending flex items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]" : isActive ? "active flex items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]" : "flex items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]"
                            }
                        >
                            sign in
                        </NavLink> */}
                        <a
                            href="/signin"                    
                            className="flex items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]"
                            rel="noreferrer"
                            target="blank"
                        >
                            sign in
                        </a>
                        {/* <a
                            // href={`${linkUrl}`}
                            href="/forgot"
                            // target="_blank"
                            rel="noreferrer"
                            className="flex items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]"
                            // style={{cursor:"pointer",background:"transparent",height:"40px",color:"#fff",textDecoration:"underline"}}
                        >
                            forgot password
                        </a>                         */}
                    </>
                    :
                    <>
                        {/* <NavLink
                            to="/upload-video"
                            className={({ isActive, isPending }) =>
                                isPending ? "pending flex items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]" : isActive ? "active flex items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]" : "flex items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]"
                            }
                        >
                            upload video
                        </NavLink> */}
                        <NavLink
                            to="/profile"
                            className="flex items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]"
                        >
                            profile
                        </NavLink>
                        <button
                            onClick={customSignout}
                            style={{background:"transparent",height:"40px",color:"#fff",textDecoration:"underline"}}
                        >
                            SIGNOUT
                        </button>
                    </>
                }
                <a
                    href={shopPostAdUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="post-ad-btn flex items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]"
                >
                    <span className="post-ad-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1z" />
                            <path className="post-ad-wave" d="M15.5 8.5a5 5 0 0 1 0 7" />
                            <path className="post-ad-wave post-ad-wave-2" d="M18.5 5.5a9 9 0 0 1 0 13" />
                        </svg>
                    </span>
                    Post an ad
                </a>
                <a
                    href={edenUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center my-[6px] text-[15px] font-bold text-[#000] bg-[#ffd800] hover:bg-[#ffe54d] rounded-[12px] border-[2px] border-[#ffd800] h-[40px] w-[100%]"
                >
                    launch film content
                </a>
                <NavLink
                    to="/follow"
                    className={({ isActive, isPending }) =>
                        isPending ? "pending flex items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]" : isActive ? "active flex items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]" : "flex items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]"
                    }
                >
                    following
                </NavLink>     

                <NavLink
                    to="/playlist"
                    className={({ isActive, isPending }) =>
                        isPending ? "pending flex items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]" : isActive ? "active flex items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]" : "flex items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]"
                    }
                >
                    playlist
                </NavLink>
                {/* <NavLink
                    to="/library"
                    className={({ isActive, isPending }) =>
                        isPending ? "pending flex items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]" : isActive ? "active flex items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]" : "flex items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]"
                    }
                >
                    library
                </NavLink> */}

            </div>
            <div className="w-[100%] h-[auto] text-[#fff] text-center flex flex-row bg-[rgb(222.2 84% 4.9%)]">
                <FontAwesomeIcon icon={faMobile} fontSize={30} />
                <NavLink
                    to="/devices"
                    className={`${windowWidth >= DESKTOP_WIDTH ? "w-[98%]" : "w-[98%]"} m-[1%] underline bg-transparent border-[1.5px] border-[#2E073F] rounded-[2px]`}
                >
                    <p>Watch in mobile, tv</p>
                </NavLink>
            </div>
            <div className="w-[100%] h-[auto] text-[#fff] text-center flex flex-row bg-[rgb(222.2 84% 4.9%)]">
                <NavLink
                    to="/privacy"
                    className={`${windowWidth >= DESKTOP_WIDTH ? "w-[48%]" : "w-[80%]"} m-[1%] underline bg-transparent border-[1.5px] border-[#2E073F] rounded-[2px]`}
                >
                    Privacy
                </NavLink>
                <NavLink
                    to="/terms"
                    className={`${windowWidth >= DESKTOP_WIDTH ? "w-[48%]" : "w-[80%]"} m-[1%] underline bg-transparent border-[1.5px] border-[#2E073F] rounded-[2px]`}
                >
                    Terms
                </NavLink>
                <NavLink
                    to="/blogs"
                    className={`${windowWidth >= DESKTOP_WIDTH ? "w-[48%]" : "w-[80%]"} m-[1%] underline bg-transparent border-[1.5px] border-[#2E073F] rounded-[2px]`}
                >
                    Blog
                </NavLink>
                <NavLink
                    to="/about"
                    className={`${windowWidth >= DESKTOP_WIDTH ? "w-[48%]" : "w-[80%]"} m-[1%] underline bg-transparent border-[1.5px] border-[#2E073F] rounded-[2px]`}
                >
                    About
                </NavLink>
            </div>
            <h3>webmaster: 
                <a
                    href="https://brianwekesa.netlify.app"
                    target="_blank"
                    rel="noreferrer"
                >
                    Brian Wekesa
                </a>
            </h3>
        </div>
    )
}

export default NAVBAR
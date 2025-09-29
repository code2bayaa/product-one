import { NavLink } from "react-router-dom"
import { useEffect, useState } from "react"
import { COLLECT } from "../midlleware/report";
import {useNavigate} from "react-router-dom"
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCoins } from "@fortawesome/free-solid-svg-icons";
const NAVBAR = () => {

    const [windowWidth, setWindowWidth] = useState(0);
    const [loggedIn, setLoggedIn] = useState(false)
    // const [count,setCount] = useState(0)
    const [coins,setCoins] = useState(0.0)
    const [showFullscreenBtn, setShowFullscreenBtn] = useState(false);
    const router = useNavigate()
    const api_url = process.env.REACT_APP_environment === "development" ? process.env.REACT_APP_api_url : process.env.REACT_APP_api_url_live
    // const linkUrl = process.env.REACT_APP_environment === "development" ? process.env.REACT_APP_signup : process.env.REACT_APP_signup_live

    // console.log(linkUrl,"link")

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
    let count = 0
    useEffect(() => {
        console.log("count",count)
        !count && COLLECT()
        count++
        
    },[count])

    useEffect(() => {
      async function authentication(){
        const res = await fetch(api_url,{credentials: "include"})
        const {status,message} = await res.json()
        console.log(message)
        if(status){
            // router('/admin/reports')
            setLoggedIn(true)
        }
        return status
      }
      authentication()
      .then(status => {
            if(status){
                fetch(process.env.REACT_APP_environment === "development" ? process.env.REACT_APP_check_user_credits : process.env.REACT_APP_check_user_credits_live,{credentials: "include"})
                .then(res => res.json())
                .then(({sum,message}) => {
                    console.log(message,sum)
                    //affordable for one movie | episode
                    if(sum){
                        setCoins(sum)
                    }
                })

            }else{
                let user = localStorage.getItem("session")
                fetch(`${process.env.REACT_APP_environment === "development" ? process.env.REACT_APP_check_report_credits : process.env.REACT_APP_check_report_credits_live}`,{
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
                    console.log(message,sum)
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

            const response = await fetch(process.env.REACT_APP_environment === "development" ? process.env.REACT_APP_signout : process.env.REACT_APP_signout_live,{credentials: "include"});
        
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

    return (
        <div className="w-[100%] movie-scene h-[100%] overflow-auto">
            <img src="/image/logo.png" alt="logo late-developers.com" className="w-[100%] h-[200px]" />
            { windowWidth < 800 && (
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
            <div className="w-[100%] h-[auto] text-white">
                <div className="w-[100%] h-[60px] text-[#ffd800] text-[30px]">
                    <FontAwesomeIcon icon={faCoins} />{coins} <span className="text-[20px]">credits</span>
                </div>
                
                <NavLink
                    to="/"
                    className={({ isActive, isPending }) =>
                        isPending ? "pending flex items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]" : isActive ? "active flex items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]" : "flex items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]"
                    }
                >
                    home
                </NavLink>
                {
                    windowWidth > 800 && 
                    <NavLink
                        to="/search"
                        className={({ isActive, isPending }) =>
                            isPending ? "pending flex items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]" : isActive ? "active flex items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]" : "flex items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]"
                        }
                    >
                        search
                    </NavLink>
                }
                <NavLink
                    to="/movies"
                    className={({ isActive, isPending }) =>
                        isPending ? "pending flex items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]" : isActive ? "active flex items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]" : "flex items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]"
                    }
                >
                    movies
                </NavLink>
                <NavLink
                    to="/series"
                    className={({ isActive, isPending }) =>
                        isPending ? "pending flex items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]" : isActive ? "active flex items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]" : "flex items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]"
                    }
                >
                    tv shows
                </NavLink>
                <NavLink
                    to="/people"
                    className={({ isActive, isPending }) =>
                        isPending ? "pending flex items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]" : isActive ? "active flex items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]" : "flex items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]"
                    }
                >
                    people
                </NavLink>
                <NavLink
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
                <NavLink
                    to="/anime"
                    className={({ isActive, isPending }) =>
                        isPending ? "pending flex items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]" : isActive ? "active flex items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]" : "flex items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]"
                    }
                >
                    anime
                </NavLink>                
                <NavLink
                    to="/credits"
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
                {/* <NavLink
                    to="/reactions"
                    className={({ isActive, isPending }) =>
                        isPending ? "pending flex items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]" : isActive ? "active flex items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]" : "flex items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]"
                    }
                >
                    reactions
                </NavLink> */}
                {
                    !loggedIn ? 
                    <>
                        <NavLink
                            to="/signin"
                            className={({ isActive, isPending }) =>
                                isPending ? "pending flex items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]" : isActive ? "active flex items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]" : "flex items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]"
                            }
                        >
                            sign in
                        </NavLink>
                        {/* <a
                            href="/signin"                    
                            className="flex items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]"
                            rel="noreferrer"
                            target="blank"
                        >
                            sign in
                        </a> */}
                        {/* <a
                            // href={`${linkUrl}`}
                            href="/signup"
                            // target="_blank"
                            rel="noreferrer"
                            className="flex items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]"
                            // style={{cursor:"pointer",background:"transparent",height:"40px",color:"#fff",textDecoration:"underline"}}
                        >
                            sign up
                        </a>
                        <a
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
                        <NavLink
                            to="/library"
                            className={({ isActive, isPending }) =>
                                isPending ? "pending flex items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]" : isActive ? "active flex items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]" : "flex items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]"
                            }
                        >
                            library
                        </NavLink>
                        {/* <NavLink
                            to="/upload-video"
                            className={({ isActive, isPending }) =>
                                isPending ? "pending flex items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]" : isActive ? "active flex items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]" : "flex items-left text-[15px] border-b-[1px] border-[#2E2E3A] font-bold hover:bg-[#2E2E3A] h-[40px] w-[100%]"
                            }
                        >
                            upload video
                        </NavLink> */}
                        <button
                            onClick={customSignout}
                            style={{background:"transparent",height:"40px",color:"#fff",textDecoration:"underline"}}
                        >
                            SIGNOUT
                        </button>
                    </>
                }


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
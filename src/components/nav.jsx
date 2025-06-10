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
    const router = useNavigate()
    const api_url = process.env.REACT_APP_api_url
    const linkUrl = process.env.REACT_APP_signup

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
      }
      authentication()
    },[api_url,setLoggedIn])

    useEffect(() => {
        async function sumCredits(){
            if(loggedIn){
                const res = await fetch(process.env.REACT_APP_check_user_credits,{credentials: "include"})
                const {sum,message} = await res.json()
                console.log(message,sum)
                //affordable for one movie | episode
                if(sum){
                    setCoins(sum)
                }
            }else{
                let user = localStorage.getItem("session")
                const response = await fetch(`${process.env.REACT_APP_check_report_credits}`,{
                    method:"POST",
                    headers:{
                        "Content-Type":"application/json",
                        "Accept":"application/json"
                    },
                    body:JSON.stringify({
                        user

                    })
                })
                const {sum,message} = await response.json()
                console.log(message,sum)
                //affordable for one movie | episode
                if(sum){
                    setCoins(sum)
                }
            }
        }
        sumCredits()

    },[setCoins,loggedIn])

    const customSignout = async() => {
        try {

            const response = await fetch(process.env.REACT_APP_signout,{credentials: "include"});
        
            const {status,message} = await response.json()

            console.log(status,"status")
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

    return (
        <div className="w-[100%] h-[100%]">
            <img src="/image/logo.png" alt="logo late-developers.com" className="w-[100%] h-[200px]" />
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
                        <a
                            href={`${linkUrl}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{cursor:"pointer",background:"transparent",height:"40px",color:"#fff",textDecoration:"underline"}}
                        >
                            sign up
                        </a>
                    </>
                    :
                    <>

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
            <h3>webmaster: <NavLink to="https://late-developers.com" className="h-[30px]">late developers</NavLink></h3>
        </div>
    )
}

export default NAVBAR
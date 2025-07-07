import { faStar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState, useEffect } from 'react'
import Swal from 'sweetalert2'

const COLLECTIONS = ({index,title,token,quality,id,background,maxRate,seeders,size,windowWidth}) => {

    const [loading, setLoading] = useState(false);
    // const [open,setOpen] = useState(false);
    // const [URLS,setURLS] = useState(null);
    const [rate,setRate] = useState(0);
    // const containerRef = useRef(null);

    useEffect(() => {
        // Check if the rate is a number and set it
            const index = (Number(seeders)/Number(maxRate)) * 10
            setRate(index);
    }, [maxRate,seeders]);

    useEffect(() => {
        const destroySession = async() => {
            console.log("destroying...")

            const sessionDestroy = ({status, error, message, newToken}) => {
                
                console.log(newToken,"newToken")
                console.log(error,message)
                if(error || !status){
                    // Swal.fire({
                    //     icon: 'error',
                    //     title: 'Could not destroy session ' + error + message,
                    //     text: error || message,
                    //     showConfirmButton: false,
                    //     timer: 2500
                    // })
                    return null
                }
                Swal.fire({
                    icon: 'success',
                    title: 'Session destroyed',
                    text: "success" + message,
                    showConfirmButton: false,
                    timer: 2500
                })
                return true                
            }

            async function authentication(){
                const res = await fetch(process.env.REACT_APP_environment === "development" ? process.env.REACT_APP_api_url : process.env.REACT_APP_api_url_live,{credentials: "include"})
                const {status,message,user} = await res.json()
                console.log(message)
                return ({status,user})
            }
            const isLoggedIn = await authentication()

            if(isLoggedIn.status){
                const response = await fetch(`${process.env.REACT_APP_environment === "development" ? process.env.REACT_APP_destroy_token : process.env.REACT_APP_destroy_token_live}`, {
                    method: "POST",
                    body:JSON.stringify({
                        id,
                        index,
                        user:isLoggedIn.user
                    }),
                    headers: {
                        'Content-Type': 'application/json', // Indicates the body is JSON
                    },
                });
                const {status, error, message, newToken} = await response.json()
                return sessionDestroy({status, error, message, newToken})
            }else{
                let user = localStorage.getItem("session")
                const response = await fetch(`${process.env.REACT_APP_environment === "development" ? process.env.REACT_APP_destroy_token : process.env.REACT_APP_destroy_token_live}`, {
                    method: "POST",
                    body:JSON.stringify({
                        id,
                        index,
                        user
                    }),
                    headers: {
                        'Content-Type': 'application/json', // Indicates the body is JSON
                    },
                });
                const {status, error, message, newToken} = await response.json()
                return sessionDestroy({status, error, message, newToken})
            }

        }
        destroySession()
    },[id,index])

    const runStream = async(e,token) => { 
        //check for credits
        async function authentication(){
            const res = await fetch(process.env.REACT_APP_environment === "development" ? process.env.REACT_APP_api_url : process.env.REACT_APP_api_url_live,{credentials: "include"})
            const {status,message,user} = await res.json()
            console.log(message)
            return ({status,user})
        }
        const isLoggedIn = await authentication()
        let hasCredits = false
        let hasPaid = false
        let user;
        if(isLoggedIn.status){
            user = isLoggedIn.user

            const response = await fetch(`${process.env.REACT_APP_environment === "development" ? process.env.REACT_APP_user_paid : process.env.REACT_APP_user_paid_live}`,{
                credentials: "include",
                method:"POST",
                headers:{
                    "Content-Type":"application/json",
                    "Accept":"application/json"
                },
                body:JSON.stringify({
                    id
                })
            })

            const response_data = await response.json()
            console.log(response_data.message)

            if(response_data.status){
                hasPaid = true
            }

            const res = await fetch(process.env.REACT_APP_environment === "development" ? process.env.REACT_APP_check_user_credits : process.env.REACT_APP_check_user_credits_live,{credentials: "include"})
            const {sum,message} = await res.json()
            console.log(message)
            //affordable for one movie | episode
            if(sum && sum > 49){
                hasCredits = true
            }
        }else{
            user = localStorage.getItem("session")
            const res = await fetch(`${process.env.REACT_APP_environment === "development" ? process.env.REACT_APP_paid : process.env.REACT_APP_paid_live}`,{
                method:"POST",
                headers:{
                    "Content-Type":"application/json",
                    "Accept":"application/json"
                },
                body:JSON.stringify({
                    user,
                    id
                })
            })

            const res_data = await res.json()
            console.log(res_data.message)
            if(res_data.status){
                hasPaid = true
                Swal.fire({
                    icon: 'success',
                    title: 'rent paid',
                    text: res_data.message,
                    showConfirmButton: false,
                    timer: 2500
                })
            }else if(res_data.message === "day for movie credits ended"){
                Swal.fire({
                    icon: 'error',
                    title: 'rent elapsed',
                    text: res_data.message,
                    showConfirmButton: false,
                    timer: 1500
                })
            }

            const response = await fetch(`${process.env.REACT_APP_environment === "development" ? process.env.REACT_APP_check_report_credits : process.env.REACT_APP_check_report_credits_live}`,{
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
            console.log(message)
            //affordable for one movie | episode
            if(sum && sum > 49){
                hasCredits = true
            }
        }

        if(!hasCredits && !hasPaid){
            Swal.fire({
                icon: 'error',
                title: 'NO CREDITS',
                text: "add more credits",
                showConfirmButton: false,
                timer: 1500
            })
            return 
        }
        if (token) {
            setLoading(true)
            // const HTMLMARK = e.target.innerText
            // e.target.innerText = "loading..."
            
            console.log("clicked play...")
            //
            const response = await fetch(`${process.env.REACT_APP_environment === "development" ? process.env.REACT_APP_play : process.env.REACT_APP_play_live}`,{
                method:"POST",
                headers:{
                    "Content-Type":"application/json",
                    "Accept":"application/json"
                },
                body:JSON.stringify({
                    token,
                    id,
                    index,
                    user
                })
            })
            const {status, error, message, url, files} = await response.json()
            console.log(message || error)
            if(status){
                const video = files.find(({name}) => name.endsWith('.mp4') || name.endsWith('.mkv'));
                if(video){
                    const type = video && video.hasOwnProperty("name") && video.name.split(".").pop()
                    // e.target.innerText = HTMLMARK
                    // setPlay(null)
                    setLoading(false)
                    if(type === "mp4"){
                        // setPlaying(`${url}/${video.index}`)
                        // router(`/play/${url}/${video.index}/${type}/${background}`)
                        // window.location.href = `/play/${id}/${url}/${video.index}/${type}/${background}`
                        window.location.href = `/play/${id}/${url}/${index}/${type}/${background}`
                        // setFetchedPlay(() => true)
                        
                        
                        return null
                    }else{
                        //unless VLC situation changes, we will not use this
                        // setURLS(`/play/${id}/${url}/${video.index}/${type}/${background}`)
                        // //for mkv files open disclaimer
                        // if(open){
                        //     // $(containerRef.current).slideUp(500)
                        //     // $(containerRef.current).addClass("hidden")
                        //     setOpen(false)
                            
                        // }else{
                        //     // $(containerRef.current).removeClass("hidden")
                        //     // $(containerRef.current).slideDown(500)
                        //     setOpen(true)
                        // }

                        // window.location.href = `/play/${id}/${url}/${video.index}/${type}/${background}`
                        window.location.href = `/play/${id}/${url}/${index}/${type}/${background}`
                        return null
                        
                    }
                }

                Swal.fire({
                    icon: 'error',
                    title: 'media not ready',
                    text: error,
                    showConfirmButton: false,
                    timer: 1500
                })
                        // mutateUpdatePlay({ variables: {
                        //     type:stream === "series" ? "tv" : stream === "season" ? "season" : stream === "episode" ? "episode" : "movie",
                        //     season:season ? parseInt(season) : -1,
                        //     episode:episode ? parseInt(episode) : -1,
                        //     id:id?parseInt(id):-1,
                        //     tokens:getToken
                        // }})
            }else{
                // e.target.innerText = HTMLMARK
                setLoading(false)
                Swal.fire({
                    icon: 'error',
                    title: 'choose next collection',
                    text: "was not worth your time",
                    showConfirmButton: false,
                    timer: 1500
                })
            }
                        //in case no video file found -- destroy token
            // setPlay(null)
            setLoading(false)
            // e.target.innerText = HTMLMARK
            const responseDestroy = await fetch(`${process.env.REACT_APP_environment === "development" ? process.env.REACT_APP_destroy_token : process.env.REACT_APP_destroy_token_live}`,{
                method:"POST",
                headers:{
                    "Content-Type":"application/json",
                    "Accept":"application/json"
                },
                body:JSON.stringify({
                    id,
                    index
                })
            })
            const responseDestroyData = await responseDestroy.json()
            console.log(responseDestroyData.message,"destruction")
            console.log(responseDestroyData.newToken,"new token")
        }
    }

    // const destroySession = async() => {
    //     console.log("destroying...")
    //     // setOpen(false)
    //     const response = await fetch(`${process.env.REACT_APP_destroy_token}`, {
    //         method: "POST",
    //         body:JSON.stringify({
    //             id,
    //             index
    //         }),
    //         headers: {
    //             'Content-Type': 'application/json', // Indicates the body is JSON
    //         },
    //     });
    //     const {status, error, message, newToken} = await response.json()
    //     console.log(newToken,"newToken")
    //     if(error || !status){
    //         return null
    //     }
    //     Swal.fire({
    //         icon: 'success',
    //         title: 'Session destroyed',
    //         text: "success" + message,
    //         showConfirmButton: false,
    //         timer: 2500
    //     })
    //     return true
    // }

    return (
        <>
            <button
                disabled={loading}
                onClick={(e) => runStream(e,token)}
                type="button"
                key={index}
                className={`bg-[transparent] m-[1%] border-[2px] text-white ${windowWidth > 800 ? "w-[48%]" : "w-[98%]"} h-[auto] text-[20px] font-bold`}
            >
                {
                    loading ? "loading..."
                    :
                    <>
                        {quality}
                        {rate > 0 && (
                            <span className="text-[#ffd800] ml-2">
                                <FontAwesomeIcon icon={faStar}/> {rate.toFixed(1)}
                            </span>
                        )}
                        <span className="text-[italic] ml-2">
                            {`${size.replace("i","").toLowerCase()}`}
                        </span>                    
                    </>
                }        
            </button>
         {/* {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
                    <div className="bg-[#18181c] p-6 rounded-lg shadow-lg w-full max-w-lg relative">
                        <button
                            className="absolute top-2 right-2 text-white text-2xl"
                            onClick={() => destroySession()}
                        >
                            &times;
                        </button>
                        <img 
                            src="/image/vlc.webp"
                            className='w-[15%] h-[auto]'
                            alt="https://uko-app.com vlc"
                        />
                        <h2 className='text-[#ffd800] mb-2'>This file is mkv, follow instructions below</h2>
                        <ol className="mb-4 list-decimal pl-6">
                            <li>
                                <p className='text-[#ffd800]'>Download VLC media player</p>
                            </li>
                            <li>
                                <p className='text-[#ffd800]'>Go to Preferences -- (Click Tools -- Preferences) or (Ctrl + P) </p>
                            </li>
                            <li>
                                <p className='text-[#ffd800]'>Switch to Advanced Settings -- At the bottom left, click "All" under "Show settings"</p>
                            </li>
                            <li>
                                <p className='text-[#ffd800]'>Navigate to -- Interface (Click) -- Main Interfaces (Click) -- Check the box for <i>Web</i> and <b>HTTP remote control interface</b></p>
                            </li>
                        </ol>
                        <h2 className="mb-2">Click the watch button below after following the instructions</h2>
                        <button
                            disabled={loading}
                            type="button"
                            onClick={() => {
                                window.location.href = URLS
                            }}
                            className="bg-[transparent] m-[1%] border-[2px] text-white w-[48%] h-[auto] text-[20px] font-bold"
                        >
                            watch
                        </button>
                    </div>
                </div>
            )} */}
        </>
    )
}

export default COLLECTIONS

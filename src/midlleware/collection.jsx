import { useState, useEffect } from 'react'
import Swal from 'sweetalert2'

const COLLECTIONS = ({index,token,quality,id,background,title}) => {

    const [loading, setLoading] = useState(false);
    const [open,setOpen] = useState(false);
    const [URLS,setURLS] = useState(null);
    // const containerRef = useRef(null);

    useEffect(() => {
        const destroySession = async() => {
            console.log("destroying...")
            const response = await fetch(`${process.env.REACT_APP_destroy_token}`, {
                method: "POST",
                body:JSON.stringify({
                    id,
                    index
                }),
                headers: {
                    'Content-Type': 'application/json', // Indicates the body is JSON
                },
            });
            const {status, error, message, newToken} = await response.json()
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
        destroySession()
    },[id,index])

    const runStream = async(e,token) => { 
        //check for credits
        async function authentication(){
            const res = await fetch(process.env.REACT_APP_api_url,{credentials: "include"})
            const {status,message} = await res.json()
            console.log(message)
            return status
        }
        const isLoggedIn = await authentication()
        let hasCredits = false
        let hasPaid = false
        if(isLoggedIn){
            const response = await fetch(`${process.env.REACT_APP_user_paid}`,{
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

            const res = await fetch(process.env.REACT_APP_check_user_credits,{credentials: "include"})
            const {sum,message} = await res.json()
            console.log(message)
            //affordable for one movie | episode
            if(sum && sum > 49){
                hasCredits = true
            }
        }else{
            let user = localStorage.getItem("session")
            const res = await fetch(`${process.env.REACT_APP_paid}`,{
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
            }else{
                Swal.fire({
                    icon: 'error',
                    title: 'rent elapsed',
                    text: res_data.message,
                    showConfirmButton: false,
                    timer: 1500
                })
            }

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
            const HTMLMARK = e.target.innerHTML
            e.target.innerHTML = "loading..."
            
            console.log("clicked play...")
            const response = await fetch(`${process.env.REACT_APP_play}`,{
                method:"POST",
                headers:{
                    "Content-Type":"application/json",
                    "Accept":"application/json"
                },
                body:JSON.stringify({
                    token,
                    id,
                    index
                })
            })
            const {status, error, message, url, files} = await response.json()
            // /series/video/series/${id}/${serie.title || serie.original_title}/${serie.season_number}/${serie.episode_number}/${imdb.imdb_id}/${background}
            console.log(message || error)
            if(status){
                const video = files.find(({name}) => name.endsWith('.mp4') || name.endsWith('.mkv'));
                if(video){
                    const type = video && video.hasOwnProperty("name") && video.name.split(".").pop()
                    e.target.innerHTML = HTMLMARK
                    // setPlay(null)
                    setLoading(false)
                    if(type === "mp4"){
                        // setPlaying(`${url}/${video.index}`)
                        // router(`/play/${url}/${video.index}/${type}/${background}`)
                        window.location.href = `/play/${id}/${url}/${video.index}/${type}/${background}`
                        // setFetchedPlay(() => true)
                        
                        
                        return null
                    }else{
                        setURLS(`/play/${id}/${url}/${video.index}/${type}/${background}`)
                        //for mkv files open disclaimer
                        if(open){
                            // $(containerRef.current).slideUp(500)
                            // $(containerRef.current).addClass("hidden")
                            setOpen(false)
                            
                        }else{
                            // $(containerRef.current).removeClass("hidden")
                            // $(containerRef.current).slideDown(500)
                            setOpen(true)
                        }

                        return null
                        
                    }
                }
                //in case no video file found -- destroy token
                // setPlay(null)
                setLoading(false)
                e.target.innerHTML = HTMLMARK
                const response = await fetch(`${process.env.REACT_APP_destroy_token}`,{
                    method:"POST",
                    headers:{
                        "Content-Type":"application/json",
                        "Accept":"application/json"
                    },
                    body:JSON.stringify({
                        id,
                    })
                })
                const { error, message, newToken} = await response.json()
                console.log(message,"destruction")
                console.log(newToken,"new token")

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
                e.target.innerHTML = HTMLMARK
                setLoading(false)
                Swal.fire({
                    icon: 'error',
                    title: 'choose next collection',
                    text: "was not worth your time",
                    showConfirmButton: false,
                    timer: 1500
                })
            }
        }
    }

    const destroySession = async() => {
        console.log("destroying...")
        setOpen(false)
        const response = await fetch(`${process.env.REACT_APP_destroy_token}`, {
            method: "POST",
            body:JSON.stringify({
                id
            }),
            headers: {
                'Content-Type': 'application/json', // Indicates the body is JSON
            },
        });
        const {status, error, message, newToken} = await response.json()
        console.log(newToken,"newToken")
        if(error || !status){
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

    return (
        <>
            <button
                disabled={loading}
                onClick={(e) => runStream(e,token)}
                type="button"
                key={index}
                className="bg-[transparent] m-[1%] border-[2px] text-white w-[48%] h-[auto] text-[20px] font-bold"
            >
                {quality}
            </button>
         {open && (
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
            )}
        </>
    )
}

export default COLLECTIONS

import { useState } from 'react'
import Swal from 'sweetalert2'

const COLLECTIONS = ({index,token,quality,id,background}) => {

    const [loading, setLoading] = useState(false);
    const [open,setOpen] = useState(false);
    const [URLS,setURLS] = useState(null);
    // const containerRef = useRef(null);

    const runStream = async(e,token) => { 
        if (token) {
            setLoading(true)
            const HTMLMARK = e.target.innerHTML
            e.target.innerHTML = "loading..."
            
            const response = await fetch(`${process.env.REACT_APP_play}`,{
                method:"POST",
                headers:{
                    "Content-Type":"application/json",
                    "Accept":"application/json"
                },
                body:JSON.stringify({
                    token,
                    id,

                })
            })
            const {status, error, message, url, files} = await response.json()
            // /series/video/series/${id}/${serie.title || serie.original_title}/${serie.season_number}/${serie.episode_number}/${imdb.imdb_id}/${background}
            console.log(message)
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
                Swal.fire({
                    icon: 'error',
                    title: 'Run Stream Oops...',
                    text: error,
                    showConfirmButton: false,
                    timer: 1500
                })
            }
        }
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
                            onClick={() => setOpen(false)}
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

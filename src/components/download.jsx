import { listVideos, deleteVideo } from '../models/idb';
import { faEye, faRemove, faStar } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useEffect, useState } from 'react';
import { useNavigate  } from "react-router-dom";
import PICTURE from "../midlleware/picture";

const DOWNLOAD = () => {

    const [movies,setMovies] = useState(null)
    const [windowWidth, setWindowWidth] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        console.log("set movies")
        listVideos()
        .then(data => setMovies([...data]))
    },[])

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };
        window.addEventListener("resize", handleResize);
        handleResize(); // Call it once to set the initial value
    },[])

    const remove = async (key) => {
        await deleteVideo(key)
        listVideos()
        .then(data => setMovies([...data]))
    }

    const navRoute = ({state,url}) => {
        navigate(url,{
            state : {
                ...state
            }
        })
    } 

    return (
        <div className="w-[100%] duration-250 h-[100%] text-white" style={{background:"linear-gradient(65deg, #0d0d0d, rgba(0,0,0,0.75), #1c2a3b, #0f111a)"}}>
            <div className={windowWidth > 800 ? "w-[90%] h-[100%] flex flex-wrap flex-col mx-[5%]" : "w-[100%] h-[100%] flex flex-wrap flex-col mt-[10%]"}>
                <h1 className="my-t-[5%]">YOUR DOWNLOADS</h1>
                <div className="w-[15%] h-[10px] border-r-[4px] bg-[#5A5A68]"></div>
                <div className={`w-[100%] h-[90%] overflow-y-auto flex flex-row flex-wrap`}>
                    {
                        movies && movies.map(({
                            data,
                            name,
                            video,
                            image,
                            subtitle
                        },movie_key) => 
                            <div 
                                key={movie_key} 
                                className={windowWidth > 800 ? "cursor-pointer w-[30%] m-[0.5%] h-[400px] hover:skew-4 hover:contrast-150":"cursor-pointer w-[100%] hover:skew-4 h-[200px] hover:contrast-150"}>
                                <div className="w-[100%] h-[100%] flex flex-row"
                            >
                                    <PICTURE key={data?.id} classes={`object-cover h-[100%] w-[60%] ${windowWidth > 800 ? "" : "rounded-xl"}`} url={true} picture={URL.createObjectURL(image)} />
                                    <div className="w-[40%] relative h-[100%] bg-[#000000] bg-opacity-60 text-white flex flex-col items-center justify-center">
                                        <h2 className={windowWidth > 800 ? "text-[15px] font-bold":""}>{ data?.title || data?.original_title || data?.name || data?.original_name }</h2>
                                        <p style={{color:"#ffd800"}}><FontAwesomeIcon icon={faStar} /> { parseFloat(data?.vote_average).toFixed(1) || parseFloat(data?.popularity).toFixed(1) || data?.vote_count}</p>
                                        <button
                                            onClick={() => remove(name)}
                                            className="flex items-center gap-1 text-red-600 hover:text-red-800 hover:underline"
                                        >
                                            <FontAwesomeIcon icon={faRemove} /> remove
                                        </button>
                                        <button
                                            onClick={() => navRoute({
                                                url:'/offline',
                                                state:{
                                                    video,
                                                    subtitle,
                                                    image
                                                }
                                            })}
                                            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline"
                                        >
                                            <FontAwesomeIcon icon={faEye} /> watch
                                        </button>                                    
                                    </div>
                                </div>
                            </div>
                        )
                    }
                </div> 
            </div>
        </div>

    )
}

export default DOWNLOAD
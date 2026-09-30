import { shortRow } from "../midlleware/shortRow"
import { useEffect, useState, useRef } from "react"
import NAVBAR from "./nav"
import { useNavigate } from "react-router-dom"
import MOBILE from "./mobileBar";
import { useKeys } from "./safe"
import { useWindowWidth, DESKTOP_WIDTH } from "../hooks/useWindowWidth";
const RECENTLY = () => {

    const [movies, setMovies] = useState(null)
    const windowWidth = useWindowWidth()
    const hasFetched = useRef(false)
    const {safeKeys} = useKeys()
    const navigate = useNavigate();
    // useEffect(() => {
    //     if (hasChecked.current) return;
    //     hasChecked.current = true;

    //     try {
    //         async function authentication() {
    //             const res = await fetch(
    //             process.env.REACT_APP_ENVIRONMENT === "development"
    //                 ? process.env.REACT_APP_API_URL
    //                 : process.env.REACT_APP_API_URL_LIVE,
    //             { credentials: "include" }
    //             );
    //             return await res.json();
    //         }

    //         authentication().then(async (isLoggedIn) => {

    //             if (isLoggedIn.status) {
    //                 console.log("logged in")
    //             } else {
    //                 let user = localStorage.getItem("session");
    //                 console.log(user)
    //                 navigate("/signin")
    //             }

    //         })
    //     } catch (error) {
    //         console.log(error);
    //     }
    // }, []);

    useEffect(() => {
        if(hasFetched.current){
            return
        }
        hasFetched.current = true

        function getRecentMovies(){
            fetch(`${process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_RECENT_VIEWS : process.env.REACT_APP_RECENT_VIEWS_LIVE}`, {
                method: "POST",
                credentials: "include",
                headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
                },
                body: JSON.stringify({
                    session:localStorage.getItem("session")
                })
            })
            .then(res => {
                console.log(res)
                if (!res.ok) {
                    throw new Error('Network response was not ok');
                }
                return res.json();
            })
            .then(({ status, tv, movies }) => {
                if (status) {
                    console.log("check recent")
                    console.log(tv,movies,"data")
                    // setTv(tv)
                    const tempData = []
                    if(movies.length > 0){
                        tempData.push({
                            index:"movies",
                            results:movies.map(({movie_type}) => JSON.parse(movie_type)),
                            page:1,
                            total_pages:1
                        })
                    }
                    if(tv.length > 0){
                        tempData.push({
                            index:"tv",
                            results:tv.map(({movie_type}) => JSON.parse(movie_type)),
                            page:1,
                            total_pages:1
                        })  
                    }
                    setMovies(() => [...tempData])
                }
            })
        }
        getRecentMovies()
    },[])

    const navRoute = ({state,url}) => {
        navigate(url,{
            state : {
                ...state
            }
        })
    } 

    return (
        <div className="w-[100%] duration-250 h-[100%] text-white flex flex-row flex-wrap" style={{background:"linear-gradient(65deg, #0d0d0d, rgba(0,0,0,0.75), #1c2a3b, #0f111a)"}}>
            {
                windowWidth >= DESKTOP_WIDTH ? 
                <div className="w-[20%] nav-wall absolute h-[100%]" >
                    <NAVBAR main={true} />
                </div>
                :
                <MOBILE/>
            }
            <div className={windowWidth >= DESKTOP_WIDTH ? "w-[80%] component-wall movie-scene h-[100%] ml-[20%] overflow-y-auto flex flex-col":"w-[100%] movie-scene overflow-y-auto h-[92%] flex flex-col"}>
                
                {
                    movies ? movies.map(({index,results},node) =>
                        <div className={windowWidth >= DESKTOP_WIDTH ? "w-[90%] h-[auto] flex flex-wrap flex-col mx-[5%]":"w-[100%] h-[auto] flex flex-wrap flex-col"} key={node}>
                            <div className="w-[40%] h-[40px] flex flex-row my-t-[5%] my-b-[2%]">
                                <span className="w-[5%] h-[100%] border-r-[10px] border-[#fff] bg-[#5A5A68]"></span>
                                <span className="gradient-text default-text text-[25px]">{index}</span>
                            </div>
                            {/* <SWEETPAGE intitializeMovies={intitializeMovies} page={page} index={index} total_pages={total_pages}/> */}
                            <div className={`w-[100%] duration-50 movie-scene ${windowWidth >= DESKTOP_WIDTH ? "h-[400px]" : "h-[200px]"} flex flex-col flex-wrap overflow-x-auto overflow-y-hidden my-[1%]${shortRow(results)}`}>
                                {
                                    results.map(({id,name,background,season,episode,anime,serieID},movie_key) => 
                                        <div 
                                            key={movie_key} 
                                            onClick={() => navRoute({
                                                url:season ? '/series/episode' : '/movies/id',
                                                state:{
                                                    id:season? serieID:id,
                                                    stream:"series",
                                                    episodeID:id,
                                                    season,
                                                    episode,
                                                    name,
                                                    background,
                                                    anime,
                                                }
                                            })}
                                            className={windowWidth >= DESKTOP_WIDTH ? "cursor-pointer w-[25%] h-[100%] hover:contrast-150 hover:scale-115 duration-700":`${index === "popular" || index === "airing" ? "w-[50%]" :"cursor-pointer w-[40%]"} h-[100%] hover:contrast-150 scale-115 duration-700`}
                                        >
                                            <div 
                                                className="w-[100%] h-[100%] background"
                                                style={{
                                                    backgroundImage: `
                                                        linear-gradient(to bottom, rgba(0,0,0,0) 60%, rgba(0,0,0,0.85) 100%),
                                                        url(${safeKeys.IMG_POSTER + background})
                                                    `
                                                }}
                                            >
                                                <div className="relative backdrop-blur-md top-[50%] left-1/2 transform -translate-x-1/2 w-[100%] min-h-[60px] bg-opacity-60 text-white flex flex-col items-center justify-center z-10">
                                                    <h2 className={windowWidth >= DESKTOP_WIDTH ? "text-[15px] font-bold":"text-[12px]"}>{name }</h2>
                                                    <p className={windowWidth >= DESKTOP_WIDTH ? "text-[10px]":"text-[8px]"}>{season} | {episode}</p>
                                                </div>
                                            </div>
                                        </div> 
                                    )
                                }
                            </div>
                        </div>

                    )
                    :
                    <img src="/videos/load.gif" alt="loader" className="w-[250px] h-[250px] mx-auto mt-[10%]" />
                }
            </div>
        </div>
    )
}

export default RECENTLY
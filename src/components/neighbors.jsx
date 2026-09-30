import { shortRow } from "../midlleware/shortRow"
import { useEffect, useState, useRef } from "react"
import NAVBAR from "./nav"
import { useNavigate } from "react-router-dom"
import MOBILE from "./mobileBar";
import { useKeys } from "./safe"
import { useWindowWidth, DESKTOP_WIDTH } from "../hooks/useWindowWidth";
const NEIGHBOR = () => {

    const [movies, setMovies] = useState(null)
    const windowWidth = useWindowWidth()
    const hasFetched = useRef(false)
    const {safeKeys} = useKeys()
    const navigate = useNavigate();
    useEffect(() => {
        if(hasFetched.current){
            return
        }
        hasFetched.current = true
        const sendForm = async({url,options}) => {
            const response = await fetch(
                url,
                options,
            )
            return await response.json()
        }

        async function runLocale(){
            try {
                let user_location = localStorage.getItem("location") || null;
                if(!user_location){
                    const urls = [
                        "https://ipinfo.io/json",
                        "https://ipapi.co/json/",
                        safeKeys?.GEO ? "https://api.ipgeolocation.io/ipgeo?apiKey=" + safeKeys.GEO : null //no key yet: skip, it only answers 401
                    ]

                    const locations = await Promise.all(urls.map(async(url) => {
                        if (!url) return null
                        try{
                            return await sendForm({url, options : {
                                method:"GET",
                                headers : {'Content-type': 'application/json; charset=UTF-8'},
                            }})
                        }catch(err){
                            if (err.name === 'AbortError') return null;
                            console.warn("location fetch failed", err);
                            return null;
                        }
                    }))
                    user_location = locations
                }else{
                    user_location = JSON.parse(user_location);
                }

                return user_location
            } catch(err){
                if (err.name === 'AbortError') return;
                console.error("runLocale error", err);
            } finally {
                // nothing
            }
        }

        async function getNeighborMovies(){
            const location = {}
            const raw_locations = await runLocale()
            if(raw_locations && raw_locations.length > 0){
                const [ipinfo, ipapi, ipgeolocation] = raw_locations
                location.city = ipinfo?.city || ipapi?.city || ipgeolocation?.city || null
                location.region = ipinfo?.region || ipapi?.region || ipgeolocation?.state_prov || null
                location.country = ipinfo?.country || ipapi?.country || ipgeolocation?.country_code2 || null
                location.loc = ipinfo?.loc || (ipapi ? `${ipapi.latitude},${ipapi.longitude}` : null) || (ipgeolocation ? `${ipgeolocation.latitude},${ipgeolocation.longitude}` : null) || null
                location.postal = ipinfo?.postal || ipapi?.postal || ipgeolocation?.zipcode || null
                location.continent_code = ipapi?.continent_code || ipgeolocation?.continent_code || null
                location.state = ipgeolocation?.state_prov || null
            }
            fetch(`${process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_NEIGHBORS_VIEWS : process.env.REACT_APP_NEIGHBORS_VIEWS_LIVE}`, {
                method: "POST",
                credentials: "include",
                headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
                },
                body: JSON.stringify({
                    location,
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
        getNeighborMovies()
    },[safeKeys?.GEO])

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

export default NEIGHBOR
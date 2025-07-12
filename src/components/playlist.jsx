import { useCallback, useEffect, useState } from "react";
import MOBILE from "./mobileBar";
import NAVBAR from "./nav"
import PICTURE from "../midlleware/picture"
import { faStar } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { gql, useLazyQuery } from '@apollo/client';
import Swal from "sweetalert2";
import SWEETPAGE from "../midlleware/pages";
import { NavLink } from "react-router-dom";
// import LOAD from "../midlleware/load";

const PLAYLIST = () => {
    const [windowWidth, setWindowWidth] = useState(0);
    const [playlist, setPlaylist] = useState({
        movie: { count: 0, data: [], page:1, tags:[] },
        tv: { count: 0, data:[], page:1, tags:[] },
        season: { count: 0, data: [],page:1, tags:[] },
        episode: { count: 0, data: [], page:1, tags:[] }
    });
    const [userID, setUserID] = useState(null)

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        // Set initial width
        handleResize();

        // Add event listener for window resize
        window.addEventListener('resize', handleResize);

        // Cleanup event listener on component unmount
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const FETCH_PLAYLIST_QUERY = gql`
        query Playlist (
            $user:ID!
            $type:String!
            $page:Int!
        ){
            playlist(
                user:$user
                type:$type
                page:$page
            ){
                results {
                    id
                    name
                    original_name
                    original_title
                    poster_path
                    backdrop_path
                    still_path
                    title
                    vote_average
                    popularity
                    vote_count
                    episode_number
                    season_number
                }
                tags {
                    tag
                    type {
                        type
                        season
                        episode
                        id
                    }
                }
                count
                success
                error
            }
        }
    `

    const [fetchPlaylist] = useLazyQuery(FETCH_PLAYLIST_QUERY,{
        // pollInterval: 500, // fetches new data at that interval
        notifyOnNetworkStatusChange: true,
    });

    const intitializeMovies = useCallback(async({page, type}) => {

        fetchPlaylist({
            variables: {
                user:userID,
                type,
                page
            }
        })
        .then(({data}) => {
            console.log(data)
            if (data && data.playlist.success && data.playlist.results.length > 0) {
                setPlaylist(prev => ({
                    ...prev,
                    [type]: {
                        count: data.playlist.count,
                        data: data.playlist.results,
                        page:1,
                        tags: data.playlist.tags
                    }
                }));
            }else if(data && data.playlist.error) {
                console.error("Error fetching playlist:", data.playlist.error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: data.playlist.error,
                    confirmButtonText: 'OK'
                });
            }else if(data && data.playlist.tags && data.playlist.tags.length > 0 && data.playlist.results.length < 0) {
                
                data.playlist.tags.forEach((playlistData) => {
                    console.error(`Tag: ${playlistData.tag}`);
                    //understood
                    const {type, season, episode} = playlistData.type;
                    let apiUrl; 
                    if(type === "movie") {
                        apiUrl = `${process.env.REACT_APP_movie_db}movie/${playlistData.tag}?api_key=${process.env.REACT_APP_api_key}`
                    }else if(type === "tv") {
                        apiUrl = `${process.env.REACT_APP_movie_db}tv/${playlistData.tag}?api_key=${process.env.REACT_APP_api_key}`
                    }else if(type === "season") {
                        apiUrl = `${process.env.REACT_APP_movie_db}tv/${playlistData.tag}/season/${season}?api_key=${process.env.REACT_APP_api_key}`
                    }else if(type === "episode") {
                        apiUrl = `${process.env.REACT_APP_movie_db}tv/${playlistData.tag}/season/${season}/episode/${episode}?api_key=${process.env.REACT_APP_api_key}`   
                    }

                    fetch(`${apiUrl}`)
                    .then(res => res.json())
                    .then(movieData => {
                        console.log(`Fetched movie data for tag ${playlistData.tag}:`, movieData);
                        setPlaylist(prev => ({
                            ...prev,
                            [type]: {
                                count: prev[type].count + 1,
                                data: [...prev[type].data, movieData],
                                page:1,
                                tags:[...prev[type].tags, playlistData.tag]
                            }
                        }));
                    })

                });
            }else if(data && data.playlist.results === 0){
                Swal.fire({
                    title:"empty",
                    text:"add more movies",
                    timer:2000
                })
            }
        })
    },[fetchPlaylist, userID])

    useEffect(() => {
        fetch(process.env.REACT_APP_environment === "development" ? process.env.REACT_APP_api_url : process.env.REACT_APP_api_url_live,{credentials: "include"})
        .then(res => {
            if (!res.ok) {
                throw new Error('Network response was not ok');
            }
            return res.json();
        })
        .then(({status,message, user}) => {
            if (status) {
                setUserID(user)
            }
        })
    },[])

    useEffect(() => {

        [
            "movie",
            "tv",
            "season",
            "episode"
        ].forEach(type => {
            intitializeMovies({
                page:1,
                type
            })
        })
    }, [intitializeMovies]);
        
    return (
        <div className="w-[100%] duration-250 h-[100%] text-white flex flex-row flex-wrap" style={{background:"linear-gradient(65deg, #0d0d0d, rgba(0,0,0,0.75), #1c2a3b, #0f111a)"}}>
            {
                windowWidth > 800 ? 
                <div className="w-[20%] absolute h-[100%] border-r-[3px] border-[#2E2E3A]">
                    <NAVBAR/>
                </div>
                :
                <MOBILE/>
            }
            <div className={windowWidth > 800 ? "w-[80%] h-[100%] overflow-y-auto movie-scene ml-[20%] flex flex-col":"w-[100%] h-[85%] overflow-y-auto movie-scene flex flex-col"}>
                <div className="w-[100%] h-[auto] flex flex-col items-center justify-center">
                    <h1 className="text-[2rem] font-bold mt-[20px]">Playlist</h1>
                    <p className="text-[1.2rem] text-gray-300 mt-[10px]">Your favorite movies and series in one place.</p>
                </div>
                <div className="w-[100%] h-[auto] flex flex-row items-center justify-center mt-[2%]">
                    <div className={windowWidth > 800 ? "w-[24%] h-[auto] p-[20px] border-r-[1px] border-gray-600 m-[0.5%]":"w-[48%] h-[auto] p-[20px]"}>
                        <h2 className="text-[1.5rem] font-semibold">movies</h2>
                        <p className="text-gray-300 mt-[10px]">{playlist.movie.count}</p>
                    </div>
                    <div className={windowWidth > 800 ? "w-[24%] h-[auto] p-[20px] border-r-[1px] border-gray-600 m-[0.5%]":"w-[48%] h-[auto] p-[20px]"}>
                        <h2 className="text-[1.5rem] font-semibold">series</h2>
                        <p className="text-gray-300 mt-[10px]">{playlist.tv.count}</p>
                    </div>  
                    <div className={windowWidth > 800 ? "w-[24%] h-[auto] p-[20px] border-r-[1px] border-gray-600 m-[0.5%]":"w-[48%] h-[auto] p-[20px]"}>
                        <h2 className="text-[1.5rem] font-semibold">season</h2>
                        <p className="text-gray-300 mt-[10px]">{playlist.season.count}</p>
                    </div>     
                    <div className={windowWidth > 800 ? "w-[24%] h-[auto] p-[20px] border-r-[1px] border-gray-600 m-[0.5%]":"w-[48%] h-[auto] p-[20px]"}>
                        <h2 className="text-[1.5rem] font-semibold">episode</h2>
                        <p className="text-gray-300 mt-[10px]">{playlist.episode.count}</p>
                    </div>                                                         
                </div>

                {
                    playlist.movie.count > 0 || playlist.tv.count > 0 || playlist.season.count > 0 || playlist.episode.count > 0?
                        Object.entries(playlist).map(([key,value],node) =>
                            value.count > 0 && 
                            (
                                <div className={windowWidth > 800 ? "w-[90%] h-[auto] flex flex-wrap flex-col mx-[5%]":"w-[100%] h-[auto] flex flex-wrap flex-col"} key={node}>
                                    <h1 className="my-t-[5%]">{key}</h1>
                                    <div className="w-[15%] h-[10px] border-r-[4px] bg-[#5A5A68]"></div>
                                    <SWEETPAGE intitializeMovies={intitializeMovies} page={value.page} index={key} total_pages={value.count}/>
                                    <div className={`w-[100%] duration-50 movie-scene ${windowWidth > 800 ? "h-[400px]" : "h-[300px]"} flex flex-col flex-wrap overflow-x-auto overflow-y-hidden my-[1%]`}>
                                        {
                                            value.data.map(({season_number,episode_number,poster_path,still_path,backdrop_path,vote_average,popularity,vote_count,name,original_name,title,original_title,id},movie_key) => 
                                                <NavLink key={movie_key} to={key === "tv" ? `/playlist/series/${id}` : key === "movie" ? `/playlist/movies/${id}` : key === "season" ? `/playlist/series/${value.tags[movie_key].tag}/${id}/${season_number}/null${poster_path}` : `/playlist/series/${value.tags[movie_key].tag}/${id}/${season_number}/${episode_number}/null${still_path}`} className={windowWidth > 800 ? "w-[25%] h-[100%] hover:skew-4 hover:contrast-150":"w-[50%] hover:skew-4 h-[100%] hover:contrast-150"}>
                                                    <div className="w-[100%] h-[100%]">
                                                        <PICTURE key={id} classes={"object-cover h-[100%]"} picture={poster_path || backdrop_path || still_path} />
                                                        <div className="w-[100%] relative min-h-[60px] top-[-50%] bg-[#000000] bg-opacity-60 text-white flex flex-col items-center justify-center">
                                                            <h2 className="text-[15px] font-bold">{title || original_title || name || original_name }</h2>
                                                            <p style={{color:"#ffd800"}}><FontAwesomeIcon icon={faStar} /> { parseFloat(vote_average).toFixed(1) || parseFloat(popularity).toFixed(1) || vote_count}</p>
                                                        </div>
                                                    </div>
                                                </NavLink>
                                            )
                                        }
                                    </div>
                                </div>
                            )

                        )
                    :
                        <img src="/image/playlist.svg" width={200} height={200} className="w-[80%] ml-[10%] h-[80%]" alt="late developers https://late-developers.com" />

                }                
            </div>
        </div>
    )
}

export default PLAYLIST;
import { shortRow } from "../../midlleware/shortRow"
import { useLazyQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { useEffect, useState, useCallback, useRef } from "react"
import NAVBAR from "./../nav"
import { faStar } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useNavigate } from "react-router-dom"
import SWEETPAGE from "./../../midlleware/pages"
import LOAD from "./../../midlleware/load"
import MOBILE from "./../mobileBar";
import CryptoJS from "crypto-js";
import BAR from "./../bar"
// import POPSTAR from "../midlleware/popstar"
import CELEBRATIES from "./../../midlleware/stars"
import { useWindowWidth, DESKTOP_WIDTH } from "../../hooks/useWindowWidth";
import { useEdenImage } from "./shared";

//an Eden series' poster as the tile background, read from Backblaze (VIEW_IMG) - never TMDB
const POSTERTILE = ({ path, children }) => {
    const poster = useEdenImage(path)
    return (
        <div
            className="w-[100%] h-[100%] background"
            style={{
                backgroundImage: `
                    linear-gradient(to bottom, rgba(0,0,0,0) 60%, rgba(0,0,0,0.85) 100%),
                    url(${poster || "/image/alt.webp"})
                `
            }}
        >
            {children}
        </div>
    )
}
const SERIES = () => {

    const hasFetched = useRef(false)
    const [movies, setMovies] = useState(null)
    const windowWidth = useWindowWidth()
    const navigate = useNavigate(); 

    const FETCH_MOVIES_COLLECTION_QUERY = gql`
        query EdenMovieCollection (
            $data:[EDEN_COLLECTION_TRACK_DATA_OUTPUT],
            $hashedKey:String!
        ){
            edenMovieCollection(
                data :$data,
                hashedKey:$hashedKey
            ) {
                data {
                    results {
                        adult
                        backdrop_path
                        genre_ids
                        id
                        movie_id
                        original_language
                        original_name
                        overview
                        popularity
                        poster_path
                        release_date
                        name
                        video 
                        vote_average
                        vote_count
                    }
                    page
                    total_pages
                    total_results   
                    index               
                }              
                success
                error
                message
            }
        }
    `
    const [fetchMoviesCollection] = useLazyQuery(FETCH_MOVIES_COLLECTION_QUERY,{
        notifyOnNetworkStatusChange: true,
        fetchPolicy: 'cache-first',
    });
    
    // const INSERT_MOVIES_COLLECTION_MUTATION = gql`
    //     mutation AddCollectionMovies(
    //         $data:[ADD_COLLECTION_MOVIES],
    //         $hashedKey:String!,
    //         $date:String!,
    //     ) {
    //         addCollectionMovies(
    //             hashedKey:$hashedKey,
    //             date:$date,
    //             data:$data
    //         ) {
    //             success
    //             message
    //         }
    //     }
    // `;
    // const [mutateInsertMoviesCollection] = useMutation(INSERT_MOVIES_COLLECTION_MUTATION, {
    //     onCompleted: (data) => {
    //         console.log(data)
    //         if (data.addMovies.success) {
    //             // if(data.addMovies.message === "already inserted")
    //             //     console.log("movie inserting already started...")
    //             console.log("Movies successfully inserted into MySQL:", data.addMovies.message);
    //             // fetchedMoviesData.refetch()
    //             // .then(status => console.log(status,"status"))
    //         } else {
    //             console.error("Failed to insert movies into MySQL:", data.addMovies.message, data.addMovies.error);
    //         }
    //     },
    //     onError: (error) => {
    //         // Ignore abort-related network errors (they are expected when requests are cancelled)
    //         const isAbort = error && (
    //             error.name === 'AbortError' ||
    //             (error.networkError && error.networkError.name === 'AbortError') ||
    //             (typeof error.message === 'string' && /abort(ed)?/i.test(error.message))
    //         );
    //         if (isAbort) return;
    //         console.error("insert video Error:", error);
    //     },
    // });

    const FETCH_MOVIES_QUERY = gql`
        query EdenTv(
            $page: Int!,
            $genre : String,
            $region : String,
            $language : String,
            $index : String!,
            $date:String!,
            $hashedKey:String!
        ){
            edenTv(
                page:$page,
                genre:$genre,
                region:$region,
                language:$language,
                index:$index,
                date:$date,
                hashedKey:$hashedKey
            ) {
                results {
                    adult
                    backdrop_path
                    genre_ids
                    id
                    origin_country
                    original_language
                    original_name
                    first_air_date
                    overview
                    popularity
                    poster_path
                    name 
                    vote_average
                    vote_count
                }
                page
                total_pages
                total_results                
                success
                error
                message
            }
        }
    `
    const [fetchMovies] = useLazyQuery(FETCH_MOVIES_QUERY,{
        // pollInterval: 500, // fetches new data at that interval
        notifyOnNetworkStatusChange: true,
        fetchPolicy: 'cache-first',
        // variables,
        // skip: !variables.page, // Skip query execution if variables are not set
    });
    // useEffect(() => {
    //     const invalidateCache = () => {
    //         console.log("Invalidating Apollo Client cache");
    //         client.refetchQueries({
    //             include: [FETCH_MOVIES_QUERY] // Refetch all queries using this query
    //         });
    //         // client.resetStore(); // Alternative: Clears the entire cache (more aggressive)
    //     };

    //     // Set up the timer to invalidate the cache after 24 hours
    //     const timerId = setTimeout(invalidateCache, 86400000); // 24 hours in milliseconds

    //     // Clear the timer when the component unmounts to prevent memory leaks
    //     return () => clearTimeout(timerId);
    // }, [client,FETCH_MOVIES_QUERY]); // 
    
    const intitializeMovies = useCallback(async ({
        runContent,
        page,
        adjustable = false,
        genreId = '',
        regionId = '',
        languageId='',
        yearId=0
    }) => {
        
        console.log("how are you...")
        const fetchMoviesFromAPI = async (actual_index) => {

            const current_date = new Date().toISOString().split("T")[0]
            const temp_movies = [
                // {"index":"discover","results":[],"api":"discover/tv",page:1,total_pages:0},
                // {"index":"airing","results":[],"api":"tv/airing_today",page:1,total_pages:0},
                {"index":"trending","results":[],"api":"trending/tv/day",page:1,total_pages:0},
                {"index":"popular","results":[],"api":"tv/popular",page:1,total_pages:0},
                {"index":"top rated","results":[],"api":"tv/top_rated",page:1,total_pages:0},                
                // {"index":"on air","results":[],"api":"tv/on_the_air",page:1,total_pages:0}
            ];
            const key = temp_movies.findIndex(({ index }) => index === actual_index);

            if (page) {
                temp_movies[key].page = page;
            }

            const hashed = temp_movies[key].page + actual_index + "tv+eden" + current_date
            const hashedKey = CryptoJS.SHA256(hashed).toString();

            if(adjustable){
                const fetched = await fetchMovies({
                    variables : {
                    page: temp_movies[key].page,
                    index: actual_index,
                    date: current_date,
                    hashedKey  
                }})
                // console.log(fetched)
                //one read: Eden titles only live in our DB, so retrying cannot change the answer
                //(the old retry loop re-assigned this const and read data.tv, which is not returned)
                if(fetched?.data?.edenTv?.results && fetched.data.edenTv.results.length > 0){
                    setMovies((prevMovies) => {
                        prevMovies = prevMovies || [];
                        const updatedMovies = [...prevMovies]
                        const existingIndex = updatedMovies.findIndex(
                            (tv) => tv.index === actual_index
                        );

                        if (existingIndex > -1) {
                            updatedMovies[existingIndex].results = [
                                // ...updatedMovies[existingIndex].results,
                                ...fetched.data.edenTv.results,
                            ];
                        } else {
                            updatedMovies.push({
                                index: actual_index,
                                results: fetched.data.edenTv.results,
                                page: fetched.data.edenTv.page,
                                total_pages: fetched.data.edenTv.total_pages,
                                total_results:fetched.data.edenTv.total_results
                            });
                        }

                        return updatedMovies;
                    });
                }
            }
        };
        runContent.forEach((index) => {
            fetchMoviesFromAPI(index)
            .then(status => {
                if(!status){

                }
            })
        })
    },[fetchMovies])
      
    const intitializeMoviesInit = useCallback(async({
            runContent,
            page,
            adjustable = false,
        }) => {
            
            const current_date = new Date().toISOString().split("T")[0]
            let hashed = "tv" + current_date
            const movieWrap = await Promise.all(runContent.map(actual_index => {
                const temp_movies = [
                    // {"index":"airing","results":[],"api":"tv/airing_today",page:1,total_pages:0},
                    {"index":"trending","results":[],"api":"trending/tv/day",page:1,total_pages:0},
                    {"index":"popular","results":[],"api":"tv/popular",page:1,total_pages:0},
                    {"index":"top rated","results":[],"api":"tv/top_rated",page:1,total_pages:0},                
                    // {"index":"on air","results":[],"api":"tv/on_the_air",page:1,total_pages:0}
                ];
                
                const key = temp_movies.findIndex(({ index }) => index === actual_index);
                // console.log(page,"page",key,"key")

                if (page) {
                    temp_movies[key].page = page;
                }
                
                hashed += temp_movies[key].page + actual_index

                return ({
                    page: temp_movies[key].page, 
                    index: actual_index,
                    date: current_date,
                    type:"tv",
                })
            }))
            const hashedKey = CryptoJS.SHA256(hashed).toString();
            if(adjustable){
                console.log("adjustable...")

                //the Eden collection query (it called the edenTv paging query and asked for
                //type "movie", so the series page never loaded); Eden lists are read straight
                //from our DB, so one call is enough
                const fetched = await fetchMoviesCollection({
                    variables : {
                        data:movieWrap.map(({page,index}) => ({index,page,date:current_date,type:"tv"})),
                        hashedKey
                }})

                if(fetched?.data?.edenMovieCollection?.data && fetched.data.edenMovieCollection.data.length > 0)
                    setMovies(() => [...fetched.data.edenMovieCollection.data]);
                
            }       
    },[fetchMoviesCollection])

    useEffect(() => { 
        if(hasFetched.current){
            return
        }
        intitializeMoviesInit(
            {runContent:[
            // "latest",
                // "airing",
                "trending",
                "popular",
                "top rated",
                // "on air"
            ],
            page:1,
            adjustable:true
        })

    },[intitializeMoviesInit])

    const navRoute = ({state,url}) => {
        navigate(url,{
            state : {
                ...state
            }
        })
    } 

    const loadComponent = () => {

        if(movies){
            return (
                <div className="relative top-[-2%] w-[100%] min-h-[100%]">
                    {/* <COUNTRIES fetchMovies={fetchMovies} mutateInsertMovies={mutateInsertMovies} mode={'movie'}/> */}
                    <CELEBRATIES actedMovies={movies} mode={"tv"} />
                    <h3 className="mt-[0.2%] ml-[0.2%]">click to watch</h3>
                    <div className="w-[100%] flex flex-row flex-wrap">
                        <div 
                            onClick={() => navRoute({
                                url:'/series',
                            })} 
                            className="cursor-pointer rounded-lg uko-nav w-[18%] h-[150px] m-[0.2%]"
                        >
                            <div 
                                className="w-[100%] rounded-lg h-[100%] justify-center"
                                style={{zIndex:2,background:"linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 1))"}}
                            >
                                <h2 className="top-[80%] relative">blockbusters</h2>
                            </div>
                        </div>                        
                        <div 
                            onClick={() => navRoute({
                                url:'/anime',
                            })} 
                            className="cursor-pointer rounded-lg anime-nav w-[18%] h-[150px] m-[0.2%]"
                        >
                            <div 
                                className="w-[100%] rounded-lg h-[100%] justify-center"
                                style={{zIndex:2,background:"linear-gradient(rgba(209, 0, 0, 0.4), rgba(209, 0, 0, 0.5), rgba(209, 0, 0, 1))"}}
                            >
                                <h2 className="top-[80%] relative">anime</h2>
                            </div>
                        </div>
                        <div 
                            onClick={() => navRoute({
                                url:'/korea',
                            })} 
                            className="cursor-pointer rounded-lg korea-nav w-[18%] h-[150px] m-[0.2%]"
                        >
                            <div 
                                className="w-[100%] rounded-lg h-[100%] justify-center"
                                style={{zIndex:2,background:"linear-gradient(rgba(0, 178, 169, 0.4), rgba(0, 178, 169, 0.5), rgba(0, 178, 169, 1))"}}
                            >
                                <h2 className="top-[80%] relative">korean</h2>
                            </div>
                        </div>
                        <div 
                            onClick={() => navRoute({
                                url:'/hindu',
                            })} 
                            className="cursor-pointer rounded-lg bollywood-nav w-[18%] h-[150px] m-[0.2%]"
                        >
                            <div 
                                className="w-[100%] rounded-lg h-[100%] justify-center"
                                style={{zIndex:2,background:"linear-gradient(rgba(50, 255, 106, 0.4), rgba(50, 255, 106, 0.5), rgba(50, 255, 106, 1))"}}
                            >
                                <h2 className="top-[80%] relative">bollywood</h2>
                            </div>
                        </div>
                        <div 
                            onClick={() => navRoute({
                                url:'/china',
                            })} 
                            className="cursor-pointer rounded-lg china-nav w-[18%] h-[150px] m-[0.2%]"
                        >
                            <div 
                                className="w-[100%] rounded-lg h-[100%] justify-center"
                                style={{zIndex:2,background:"linear-gradient(rgba(255, 195, 0, 0.4), rgba(255, 195, 0, 0.4), rgba(255, 195, 0, 1))"}}
                            >
                                <h2 className="top-[80%] relative">china</h2>
                            </div>
                        </div>
                    </div>
                    {
                        movies && movies.map(({index,results,page,total_pages},node) =>
                            <div className={windowWidth >= DESKTOP_WIDTH ? "w-[95%] ml-[1%] h-[auto] flex flex-wrap flex-col" : "w-[100%] h-[auto] flex flex-wrap flex-col mt-[10%]"} key={node}>
                                <div className="w-[40%] h-[40px] flex flex-row my-t-[5%] my-b-[2%]">
                                    <span className="w-[5%] h-[100%] border-r-[10px] border-[#fff] bg-[#5A5A68]"></span>
                                    <span className="gradient-text default-text text-[25px]">{index}</span>
                                </div>
                                <SWEETPAGE intitializeMovies={intitializeMovies} page={page} index={index} total_pages={total_pages}/>
                                <div className={`w-[100%] duration-50 movie-scene ${windowWidth >= DESKTOP_WIDTH ? "h-[400px]" : "h-[200px]"} flex flex-col flex-wrap overflow-x-auto overflow-y-hidden my-[1%]${shortRow(results)}`}>
                                    {
                                        results.map(({adult,backdrop_path,genre_ids,id,original_language,original_name,name,overview,popularity,poster_path,release_date,title,video,vote_average,vote_count},movie_key) => 
                                            <div 
                                                key={movie_key} 
                                                onClick={() => navRoute({
                                                    url:'/eden/series/id',
                                                    state:{
                                                        id
                                                    }
                                                })}
                                                className={windowWidth >= DESKTOP_WIDTH ? "cursor-pointer w-[25%] h-[100%] hover:scale-110 duration-150":`${index === "upcoming" || index === "trending" ? "w-[50%]" :"cursor-pointer w-[45%]"} h-[100%] hover:scale-110 duration-400`}
                                            >
                                                <POSTERTILE path={poster_path || backdrop_path}>
                                                    <div className={`relative backdrop-blur-md ${windowWidth >= DESKTOP_WIDTH ? "top-[50%]" : "top-[50%]"} left-1/2 transform -translate-x-1/2 w-[100%] min-h-[60px] bg-opacity-60 text-white flex flex-col items-center justify-center z-10`}>
                                                        <h2 className={windowWidth >= DESKTOP_WIDTH ? "text-[15px]  font-bold":"text-[12px]"}>{original_name || name}</h2>
                                                        <p style={{color:"#ffd800"}}><FontAwesomeIcon icon={faStar} /> { parseFloat(vote_average).toFixed(1) || parseFloat(popularity).toFixed(1) || vote_count}</p>
                                                        {/* <article className="text-[15px]">{overview}</article>
                                                        <p className="text-[15px]">Release Date: {release_date}</p>
                                                        <p className="text-[15px]">Vote Average: {vote_average}</p>
                                                        <p className="text-[15px]">Vote Count: {vote_count}</p> */}
                                                    </div>
                                                </POSTERTILE>
                                            </div>
                                        )
                                    }
                                </div>
                            </div>

                        )  
                    }                              
                </div>

            )
        }else{
        console.log("loading...")
            return (
            <>
                <LOAD/>
            </>
            )
        }
    }   
    return (
        <div className={`w-[100%] ${windowWidth >= DESKTOP_WIDTH ? "h-[100%]" : "h-[92%]"} overflow-x-hidden  bg-cover bg-no-repeat bg-center text-white`} style={{background:"linear-gradient(65deg, #0d0d0d, rgba(0,0,0,0.75), #1c2a3b, #0f111a)"}}>
            {
                windowWidth >= DESKTOP_WIDTH ? 
                <div className="w-[20%] h-[100%] nav-wall absolute">
                    <NAVBAR main={true}/>
                </div>
                :
                <MOBILE/>
            }
            <div className={windowWidth >= DESKTOP_WIDTH ? "w-[80%] overflow-x-hidden component-wall duration-100 h-[100%] overflow-y-auto movie-scene ml-[20%] flex flex-col":"w-[100%] overflow-y-auto movie-scene duration-150 h-[100%] flex flex-col"}>
                {/* <div className="w-[100%]">
                    <CONTROLLERS intitializeMovies={intitializeMovies} type={"tv"}/>
                </div> */}
                {
                    windowWidth >= DESKTOP_WIDTH && <BAR />
                }
                {loadComponent()}
            </div>
        </div>
    )
}
export default SERIES
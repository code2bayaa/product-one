import { shortRow } from "../../midlleware/shortRow"
import { useEffect, useState, useCallback, useRef } from "react"
import NAVBAR from "./../nav"
import { useNavigate } from "react-router-dom"
import SWEETPAGE from "./../../midlleware/pages"
import CryptoJS from "crypto-js";
import LOAD from "./../../midlleware/load"
import MOBILE from "./../mobileBar";
import BAR from "./../bar"
import CELEBRATIES from "./../../midlleware/stars"
import { useLazyQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import Swal from "sweetalert2"
import { useWindowWidth, DESKTOP_WIDTH } from "../../hooks/useWindowWidth";
const MOVIES = () => {

    const [movies, setMovies] = useState(null)
    const windowWidth = useWindowWidth()
    const navigate = useNavigate();
    const didRun = useRef(false);

    const FETCH_MOVIES_QUERY = gql`
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
                        original_title
                        overview
                        popularity
                        poster_path
                        release_date
                        title
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
    const [fetchMovies] = useLazyQuery(FETCH_MOVIES_QUERY,{
        notifyOnNetworkStatusChange: true,
        fetchPolicy: 'cache-first',
    });

    // const INSERT_MOVIES_MUTATION = gql`
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

    // const [mutateInsertMovies] = useMutation(INSERT_MOVIES_MUTATION, {
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

    const FETCH_SET_QUERY = gql`
        query edenMovie (
            $page: Int!,
            $data:EDEN_TRACK_DATA_OUTPUT,
            $hashedKey:String!
        ){
            edenMovie(
                page:$page,
                data :$data,
                hashedKey:$hashedKey
            ) {
                results {
                    adult
                    backdrop_path
                    genre_ids
                    id
                    original_language
                    original_title
                    overview
                    popularity
                    poster_path
                    release_date
                    title
                    video 
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
    const [fetchSet] = useLazyQuery(FETCH_SET_QUERY,{
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
    // }, [client,FETCH_MOVIES_QUERY]); // A
    
    const intitializeMovies = useCallback(async({
        runContent,
        page,
        adjustable = false,
        genreId = false,
        regionId = false,
        languageId = false,
        yearId = 0,
    }) => {
        
        const fetchMoviesFromAPI = async (actual_index) => {

            const current_date = new Date().toISOString().split("T")[0]

            const temp_movies = [
                // { index: "discover", results: [], api: "discover/movie", page: 1, total_pages: 0 },
                { index: "popular", results: [], api: "movie/popular", page: 1, total_pages: 0 },
                { index: "trending", results: [], api: "trending/movie/day", page: 1, total_pages: 0 },
                { index: "top_rated", results: [], api: "movie/top_rated", page: 1, total_pages: 0 },
                // { index: "upcoming", results: [], api: "movie/upcoming", page: 1, total_pages: 0 },
                // { index: "now_playing", results: [], api: "movie/now_playing", page: 1, total_pages: 0 },
            ];
            const key = temp_movies.findIndex(({ index }) => index === actual_index);

            if (page) {
                temp_movies[key].page = page;
            }
            const hashed = temp_movies[key].page + genreId + regionId + languageId + yearId + actual_index + "movie+eden" + current_date
            const hashedKey = CryptoJS.SHA256(hashed).toString();

            if(adjustable || genreId || regionId || languageId || yearId){
                // console.log(actual_index,"actual_index")
                const fetched = await fetchSet({
                    variables : {
                    page: temp_movies[key].page,
                    data : {
                        genre: genreId,
                        year: yearId,
                        region: regionId,
                        language: languageId,  
                        index: actual_index,
                        date: current_date,
                        type:"movie"
                    },
                    hashedKey
                }})

                //one read: Eden titles only live in our DB, so retrying cannot change the answer
                //(the old retry loop read data.movie, which this query never returns)
                if(fetched?.data?.edenMovie?.results && fetched.data.edenMovie.results.length > 0){
                    setMovies((prevMovies) => {
                        prevMovies = prevMovies || [];
                        const updatedMovies = [...prevMovies]
                        const existingIndex = updatedMovies.findIndex(
                            (movie) => movie.index === actual_index
                        );

                        if (existingIndex > -1) {
                            updatedMovies[existingIndex].results = [
                                // ...updatedMovies[existingIndex].results,
                                ...fetched.data.edenMovie.results,
                            ];
                        } else {
                            updatedMovies.push({
                                index: actual_index,
                                results: fetched.data.edenMovie.results,
                                page: fetched.data.edenMovie.page,
                                total_pages: fetched.data.edenMovie.total_pages,
                                total_results:fetched.data.edenMovie.total_results
                            });
                        }

                        return updatedMovies;
                    });
                }
            }

        };

        // runContent.forEach((index) => {
        //     fetchMoviesFromAPI(index)
        //     .then(status => console.log(status))
        // }) 
        for (const index of runContent) {
            // if (signal.aborted) break;
            await fetchMoviesFromAPI(index);
        } 
    },[fetchSet]);


    useEffect(() => { 
        const intitializeMoviesInit = async({
            runContent,
            page,
            adjustable = false,
        }) => {
            
            const current_date = new Date().toISOString().split("T")[0]
            let hashed = "movie+eden" + current_date
            const movieWrap = await Promise.all(runContent.map(actual_index => {
                const temp_movies = [
                    // { index: "discover", results: [], api: "discover/movie", page: 1, total_pages: 0 },
                    { index: "popular", results: [], api: "movie/popular", page: 1, total_pages: 0 },
                    { index: "trending", results: [], api: "trending/movie/day", page: 1, total_pages: 0 },
                    { index: "top_rated", results: [], api: "movie/top_rated", page: 1, total_pages: 0 },
                ];
                const key = temp_movies.findIndex(({ index }) => index === actual_index);

                if (page) {
                    temp_movies[key].page = page;
                }
                
                hashed += temp_movies[key].page + actual_index

                return ({
                    page: temp_movies[key].page, 
                    index: actual_index,
                    date: current_date,
                    type:"movie",
                })
            }))
            const hashedKey = CryptoJS.SHA256(hashed).toString();
            if(adjustable){
                let fetched = await fetchMovies({
                    variables : {
                        data:movieWrap.map(({page,index,...rest}) => ({index,page,date:current_date,type:"movie"})),
                        hashedKey
                }})

                let retry = 1
                while(!fetched || !fetched.data || (fetched && fetched.data && fetched.data?.movieCollection?.message === "not initialized") || (fetched && fetched.data && fetched.data?.movieCollection?.error)){
                    if(retry >= 5){
                        console.log(fetched,"fetched")
                        Swal.fire('error','reload page')
                        break
                    }
                        
                    fetched = await fetchMovies({
                        variables : {
                            data:movieWrap.map(({page,index,...rest}) => ({index,page,date:current_date,type:"movie"})),
                            hashedKey
                    }})
                    retry++
                }
                console.log("finally using cached data",fetched.data.edenMovieCollection.data)
                if(fetched.data.edenMovieCollection.data){
                    setMovies(() => [...fetched.data.edenMovieCollection.data]);
                }
                return true
                //  return await freshFetch()
                
            }       
        }
        intitializeMoviesInit({
            runContent: [
                "popular",
                "trending",
                "top_rated",
                // "upcoming",
                // "now_playing"
            ],
            page:1,
            adjustable: true
        })
        didRun.current = true;  

    },[fetchMovies])


    const navRoute = ({state,url}) => {
        navigate(url,{
            state : {
                ...state
            }
        })
    } 
    const POSTER = ({ image, title, original_title }) => {
        const [poster, setPoster] = useState(null)
        useEffect(() => {
            (async() => {
                try{
                    const res = await fetch(
                        `${
                        process.env.REACT_APP_ENVIRONMENT === 'development'
                            ? process.env.REACT_APP_VIEW_IMG
                            : process.env.REACT_APP_VIEW_IMG_LIVE
                        }`,
                        {
                        method: 'POST',
                        // credentials: 'include',
                        headers: {
                            // 'x-api-key': import.meta.env.VITE_API_KEY,
                            'Content-Type': 'application/json',
                        },
                        body:JSON.stringify({
                            image
                        })
                        },
                    )
                    //image service down or not an image - leave poster null
                    const type = res.headers.get('content-type') || ''
                    if(!res.ok || !type.startsWith('image/')) return
                    const blob = await res.blob()
                    setPoster(URL.createObjectURL(blob))
                }catch{
                    //network failure - leave poster null
                }
            })()
        },[image])

        return (
            <>
            {
                poster && (
                    <div 
                        className="w-[100%] h-[100%] background"
                        style={{
                            backgroundImage: `
                                linear-gradient(to bottom, rgba(0,0,0,0) 60%, rgba(0,0,0,0.85) 100%),
                                url(${poster})
                            `
                        }}
                    >
                        <div className={`relative backdrop-blur-md ${windowWidth >= DESKTOP_WIDTH ? "top-[50%]" : "top-[50%]"} left-1/2 transform -translate-x-1/2 w-[100%] min-h-[60px] bg-opacity-60 text-white flex flex-col items-center justify-center z-10`}>
                            <h2 className={windowWidth >= DESKTOP_WIDTH ? "text-[15px]  font-bold":"text-[12px]"}>{title || original_title}</h2>
                        </div>
                    </div>                    
                )
            }
            </>
        )
    }
    const loadComponent = () => {

        if(movies){
            return (
                <div className="relative top-[-7%] w-[100%] min-h-[100%]">
                    <CELEBRATIES actedMovies={movies} mode={"movie"} />
                    <h3 className="mt-[0.2%] ml-[0.2%]">click to watch</h3>
                    <div className="w-[98%] ml-[2%] flex flex-row flex-wrap">
                        <div 
                            onClick={() => navRoute({
                                url:'/movies',
                            })} 
                            className="cursor-pointer rounded-lg uko-nav w-[17%] h-[150px] m-[0.5%]"
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
                            className="cursor-pointer rounded-lg anime-nav w-[17%] h-[150px] m-[0.5%]"
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
                            className="cursor-pointer rounded-lg korea-nav w-[17%] h-[150px] m-[0.5%]"
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
                            className="cursor-pointer rounded-lg bollywood-nav w-[17%] h-[150px] m-[0.5%]"
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
                            className="cursor-pointer rounded-lg china-nav w-[17%] h-[150px] m-[0.5%]"
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
                            <div className={windowWidth >= DESKTOP_WIDTH ? "w-[90%] h-[auto] flex flex-wrap flex-col ml-[1%]" : "w-[100%] h-[auto] flex flex-wrap flex-col mt-[10%]"} key={node}>
                                <div className="w-[40%] h-[40px] flex flex-row my-t-[5%] my-b-[2%]">
                                    <span className="w-[5%] h-[100%] border-r-[10px] border-[#fff] bg-[#5A5A68]"></span>
                                    <span className="gradient-text default-text text-[25px]">{index}</span>
                                </div>
                                <SWEETPAGE intitializeMovies={intitializeMovies} page={page} index={index} total_pages={total_pages}/>
                                <div className={`w-[100%] duration-50 movie-scene ${windowWidth >= DESKTOP_WIDTH ? "h-[400px]" : "h-[200px]"} flex flex-col flex-wrap overflow-x-auto overflow-y-hidden my-[1%]${shortRow(results)}`}>
                                    {
                                        results.map(({adult,backdrop_path,genre_ids,id,original_language,original_title,overview,popularity,poster_path,release_date,title,video,vote_average,vote_count},movie_key) => 
                                            <div 
                                                key={movie_key} 
                                                onClick={() => navRoute({
                                                    url:'/eden/movies/id',
                                                    state:{
                                                        id
                                                    }
                                                })}
                                                className={windowWidth >= DESKTOP_WIDTH ? "cursor-pointer w-[25%] h-[100%] hover:scale-110 duration-700":`${index === "upcoming" || index === "trending" ? "w-[50%]" :"cursor-pointer w-[40%]"} h-[100%] hover:scale-110 duration-700`}
                                            >
                                                <POSTER
                                                    image={poster_path}
                                                    title={title}
                                                    original_title={original_title}
                                                    className="w-[100%] h-[100%] object-cover"
                                                />
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
        // console.log("loading...")
            return (
            <>
                <LOAD/>
            </>
            )
        }
    }
    return (
        <div className="w-[100%] duration-250 h-[100%] text-white flex flex-row flex-wrap" style={{background:"linear-gradient(65deg, #0d0d0d, rgba(0,0,0,0.75), #1c2a3b, #0f111a)"}}>
            {
                windowWidth >= DESKTOP_WIDTH ? 
                <div className="w-[20%] nav-wall absolute h-[100%]" style={{background:"linear-gradient(85deg, #0d0d0d, rgba(0,0,0,0.75), rgb(9 11 29/var(--tw-bg-opacity)), #0f111a)"}}>
                    <NAVBAR main={true}/>
                </div>
                :
                <MOBILE/>
            }
            <div className={windowWidth >= DESKTOP_WIDTH ? "w-[80%] component-wall movie-scene h-[100%] ml-[20%] overflow-x-hidden overflow-y-auto flex flex-col":"w-[100%] movie-scene overflow-y-auto h-[92%] flex flex-col"}>
                {
                    windowWidth >= DESKTOP_WIDTH && <BAR />
                }
                { loadComponent() }
                           
            </div>
        </div>
    )
}

export default MOVIES
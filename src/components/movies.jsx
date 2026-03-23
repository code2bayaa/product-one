import { useEffect, useState, useCallback, useRef } from "react"
import NAVBAR from "./nav"
import { faStar } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { NavLink, useNavigate } from "react-router-dom"
import SWEETPAGE from "../midlleware/pages"
import CryptoJS from "crypto-js";
import LOAD from "../midlleware/load"
import MOBILE from "./mobileBar";
import BAR from "./bar"
import CELEBRATIES from "../midlleware/celebraties"
import { useMutation, useLazyQuery, useApolloClient } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { useKeys } from './safe';
const MOVIES = () => {

    const [movies, setMovies] = useState(null)
    const [windowWidth, setWindowWidth] = useState(0);
    const navigate = useNavigate();
    const client = useApolloClient();
    // const router = useRouter()
    const didRun = useRef(false);
    const {safeKeys} = useKeys()

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.screen.width);
        };
        window.addEventListener("resize", handleResize);
        handleResize(); // Call it once to set the initial value
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    },[])
    
    const FETCH_MOVIES_QUERY = gql`
        query MovieCollection (
            $data:[COLLECTION_TRACK_DATA_OUTPUT],
            $hashedKey:String!
        ){
            movieCollection(
                data :$data,
                hashedKey:$hashedKey
            ) {
                data {
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

    const INSERT_MOVIES_MUTATION = gql`
        mutation AddCollectionMovies(
            $data:[ADD_COLLECTION_MOVIES],
            $hashedKey:String!,
            $date:String!,
        ) {
            addCollectionMovies(
                hashedKey:$hashedKey,
                date:$date,
                data:$data
            ) {
                success
                message
            }
        }
    `;

    const [mutateInsertMovies] = useMutation(INSERT_MOVIES_MUTATION, {
        onCompleted: (data) => {
            console.log(data)
            if (data.addMovies.success) {
                // if(data.addMovies.message === "already inserted")
                //     console.log("movie inserting already started...")
                console.log("Movies successfully inserted into MySQL:", data.addMovies.message);
                // fetchedMoviesData.refetch()
                // .then(status => console.log(status,"status"))
            } else {
                console.error("Failed to insert movies into MySQL:", data.addMovies.message, data.addMovies.error);
            }
        },
        onError: (error) => {
            // Ignore abort-related network errors (they are expected when requests are cancelled)
            const isAbort = error && (
                error.name === 'AbortError' ||
                (error.networkError && error.networkError.name === 'AbortError') ||
                (typeof error.message === 'string' && /abort(ed)?/i.test(error.message))
            );
            if (isAbort) return;
            console.error("insert video Error:", error);
        },
    });

    const FETCH_SET_QUERY = gql`
        query Movie (
            $page: Int!,
            $data:TRACK_DATA_OUTPUT,
            $hashedKey:String!
        ){
            movie(
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

    const INSERT_SET_MUTATION = gql`
        mutation AddMovies(
            $page:Int!,
            $results:[ADD_MOVIE_RESULTS_INPUT],
            $total_pages:Int!,
            $total_results:Int!,
            $data :TRACK_DATA_INPUT,
            $hashedKey:String!
        ) {
            addMovies(
                page:$page,
                results:$results,
                total_pages:$total_pages,
                total_results:$total_results,
                data:$data,
                hashedKey:$hashedKey
            ) {
                success
                message
            }
        }
    `;

    const [mutateInsertSet] = useMutation(INSERT_SET_MUTATION, {
        onCompleted: (data) => {
            console.log(data)
            if (data.addMovies.success) {
                // if(data.addMovies.message === "already inserted")
                //     console.log("movie inserting already started...")
                console.log("Movies successfully inserted into MySQL:", data.addMovies.message);
                // fetchedMoviesData.refetch()
                // .then(status => console.log(status,"status"))
            } else {
                console.error("Failed to insert movies into MySQL:", data.addMovies.message, data.addMovies.error);
            }
        },
        onError: (error) => {
            // Ignore abort-related network errors (they are expected when requests are cancelled)
            const isAbort = error && (
                error.name === 'AbortError' ||
                (error.networkError && error.networkError.name === 'AbortError') ||
                (typeof error.message === 'string' && /abort(ed)?/i.test(error.message))
            );
            if (isAbort) return;
            console.error("insert video Error:", error);
        },
    });

    useEffect(() => {
        const invalidateCache = () => {
            console.log("Invalidating Apollo Client cache");
            client.refetchQueries({
                include: [FETCH_MOVIES_QUERY] // Refetch all queries using this query
            });
            // client.resetStore(); // Alternative: Clears the entire cache (more aggressive)
        };

        // Set up the timer to invalidate the cache after 24 hours
        const timerId = setTimeout(invalidateCache, 86400000); // 24 hours in milliseconds

        // Clear the timer when the component unmounts to prevent memory leaks
        return () => clearTimeout(timerId);
    }, [client,FETCH_MOVIES_QUERY]); // A
    
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
                { index: "discover", results: [], api: "discover/movie", page: 1, total_pages: 0 },
                { index: "popular", results: [], api: "movie/popular", page: 1, total_pages: 0 },
                { index: "trending", results: [], api: "trending/movie/day", page: 1, total_pages: 0 },
                { index: "top_rated", results: [], api: "movie/top_rated", page: 1, total_pages: 0 },
                { index: "upcoming", results: [], api: "movie/upcoming", page: 1, total_pages: 0 },
                { index: "now_playing", results: [], api: "movie/now_playing", page: 1, total_pages: 0 },
            ];
            const key = temp_movies.findIndex(({ index }) => index === actual_index);

            if (page) {
                temp_movies[key].page = page;
            }
            const hashed = temp_movies[key].page + genreId + regionId + languageId + yearId + actual_index + "movie"
            const hashedKey = CryptoJS.SHA256(hashed).toString();

            // console.log(current_date,"date")
            async function freshFetch(){
                // Fetch data from the API if not found in the cache
                const response = await fetch(
                    `${safeKeys.MOVIE_DB}${temp_movies[key].api}?api_key=${safeKeys.API_KEY}&language=en-US&page=${temp_movies[key].page}&with_genres=${genreId}&with_origin_country=${regionId}&sort_by=popularity.desc&with_original_language=${languageId}&primary_release_year=${yearId}`
                );
                const data = await response.json();
                
                const themeResults = data?.results || []

                if (themeResults.length > 0) {
                    temp_movies[key].results = [
                        ...temp_movies[key].results,
                        ...data.results,
                    ];
                    temp_movies[key].total_pages = data.total_pages;
                    temp_movies[key].total_results = data.total_results;

                    // Update the movies state
                    setMovies((prevMovies) => {
                        prevMovies = prevMovies || [];
                        const updatedMovies = [...prevMovies];
                        const existingIndex = updatedMovies.findIndex(
                            (movie) => movie.index === actual_index
                        );

                        if (existingIndex > -1) {
                            updatedMovies[existingIndex].results = [
                                // ...updatedMovies[existingIndex].results,
                                ...data.results,
                            ];
                        } else {
                            updatedMovies.push(temp_movies[key]);
                        }

                        return updatedMovies;
                    });

                    // Insert the fetched data into MySQL using the mutation
                    mutateInsertSet({
                        variables: {
                            page:temp_movies[key].page,
                            results:data.results,
                            total_pages:data.total_pages,
                            total_results:data.total_results,
                            hashedKey,
                            data :{
                                genre: genreId,
                                region: regionId,
                                language: languageId,
                                year: yearId,
                                index:actual_index,
                                date:current_date,
                                type:"movie",
                            },
                                                   
                        },
                    });

                    return true
                }
                return false
            }

            if(adjustable || genreId || regionId || languageId || yearId){
                console.log(actual_index,"actual_index")
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
                console.log(fetched)

                if (fetched.data) {
                    if(fetched.data.movie.success && fetched.data.movie.results &&  fetched.data.movie.results.length < 20){
                        console.log("less items")
                        return await freshFetch()
                    }else if(fetched.data.movie.error === "insert movies" || fetched.data.movie.error === "no records found"){
                        console.log("no records found")
                        return await freshFetch()
                    }else{
                        console.log("finally using cached data")
                        setMovies((prevMovies) => {
                            prevMovies = prevMovies || [];
                            const updatedMovies = [...prevMovies]
                            const existingIndex = updatedMovies.findIndex(
                                (movie) => movie.index === actual_index
                            );
        
                            if (existingIndex > -1) {
                                updatedMovies[existingIndex].results = [
                                    // ...updatedMovies[existingIndex].results,
                                    ...fetched.data.movie.results,
                                ];
                            } else {
                                updatedMovies.push({
                                    index: actual_index,
                                    results: fetched.data.movie.results,
                                    page: fetched.data.movie.page,
                                    total_pages: fetched.data.movie.total_pages,
                                    total_results:fetched.data.movie.total_results
                                });
                            }
        
                            return updatedMovies;
                        });
                    

                        return true
                    }

                } else {
                    console.log("nothing")
                    return await freshFetch()
                }
                
            }

        };

        runContent.forEach((index) => {
            fetchMoviesFromAPI(index)
            .then(status => console.log(status))
        }) 
           
    },[fetchSet,mutateInsertSet]);


    useEffect(() => { 
        if (didRun.current) return;
            didRun.current = true;        
        const intitializeMoviesInit = async({
            runContent,
            page,
            adjustable = false,
        }) => {
            
            const current_date = new Date().toISOString().split("T")[0]
            let hashed = "movie" + current_date
            const movieWrap = await Promise.all(runContent.map(actual_index => {
                const temp_movies = [
                    { index: "discover", results: [], api: "discover/movie", page: 1, total_pages: 0 },
                    { index: "popular", results: [], api: "movie/popular", page: 1, total_pages: 0 },
                    { index: "trending", results: [], api: "trending/movie/day", page: 1, total_pages: 0 },
                    { index: "top_rated", results: [], api: "movie/top_rated", page: 1, total_pages: 0 },
                    { index: "upcoming", results: [], api: "movie/upcoming", page: 1, total_pages: 0 },
                    { index: "now_playing", results: [], api: "movie/now_playing", page: 1, total_pages: 0 },
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
                
                async function freshFetch(){
                    let hashed = "movie" + current_date
                    const insertContent = (await Promise.all(runContent.map(async actual_index => {
                        const temp_movies = [
                            { index: "discover", results: [], api: "discover/movie", page: 1, total_pages: 0 },
                            { index: "popular", results: [], api: "movie/popular", page: 1, total_pages: 0 },
                            { index: "trending", results: [], api: "trending/movie/day", page: 1, total_pages: 0 },
                            { index: "top_rated", results: [], api: "movie/top_rated", page: 1, total_pages: 0 },
                            { index: "upcoming", results: [], api: "movie/upcoming", page: 1, total_pages: 0 },
                            { index: "now_playing", results: [], api: "movie/now_playing", page: 1, total_pages: 0 },
                        ];
                        const key = temp_movies.findIndex(({ index }) => index === actual_index);
                        if (page) {
                            temp_movies[key].page = page;
                        }
                        
                        hashed += temp_movies[key].page + actual_index
                        // Fetch data from the API if not found in the cache
                        const response = await fetch(
                            `${safeKeys.MOVIE_DB}${temp_movies[key].api}?api_key=${safeKeys.API_KEY}&language=en-US&page=${temp_movies[key].page}`
                        );
                        const data = await response.json();
                        
                        const themeResults = data?.results || []

                        if (themeResults.length > 0) {
                            temp_movies[key].results = [
                                ...temp_movies[key].results,
                                ...data.results,
                            ];
                            temp_movies[key].total_pages = data.total_pages;
                            temp_movies[key].total_results = data.total_results;

                            // Update the movies state
                            setMovies((prevMovies) => {
                                prevMovies = prevMovies || [];
                                const updatedMovies = [...prevMovies];
                                const existingIndex = updatedMovies.findIndex(
                                    (movie) => movie.index === actual_index
                                );

                                if (existingIndex > -1) {
                                    updatedMovies[existingIndex].results = [
                                        // ...updatedMovies[existingIndex].results,
                                        ...data.results,
                                    ];
                                } else {
                                    updatedMovies.push(temp_movies[key]);
                                }

                                return updatedMovies;
                            });

                            return ({
                                page:temp_movies[key].page,
                                results:data.results,
                                total_pages:data.total_pages,
                                total_results:data.total_results,
                                index:actual_index, 
                                type:"movie"                          
                            })
                        }

                        return false
                    }))).filter(Boolean)
                    const hashedKey = CryptoJS.SHA256(hashed).toString();

                    // Insert the fetched data into MySQL using the mutation
                    mutateInsertMovies({
                        variables: {
                            data:insertContent,
                            // type:"movie",
                            date:current_date,
                            hashedKey
                        },
                    });
                }

                const fetched = await fetchMovies({
                    variables : {
                        data:movieWrap,
                        hashedKey
                }})
                console.log(fetched)

                if (fetched.data) {
                    if(fetched.data?.movieCollection?.message === "not initialized" || fetched.data?.movieCollection?.error){
                        console.log("no yet initialized")
                        return await freshFetch()
                    }else{
                        console.log("finally using cached data")
                        setMovies(() => [...fetched.data.movieCollection.data]);
                        return true
                    }

                } else {
                    console.log("nothing")
                    return await freshFetch()
                }
                //  return await freshFetch()
                
            }       
        }
        intitializeMoviesInit({
            runContent: [
                "popular",
                "trending",
                "top_rated",
                "upcoming",
                "now_playing"
            ],
            page:1,
            adjustable: true
        })

    },[fetchMovies,mutateInsertMovies])


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
            <div className="relative top-[-7%] w-[100%] min-h-[100%]">
                {/* <COUNTRIES fetchMovies={fetchMovies} mutateInsertMovies={mutateInsertMovies} mode={'movie'}/> */}
                <CELEBRATIES actedMovies={movies} mode={"movie"} />
                <h3 className="mt-[10%] ml-[2%]">click to watch</h3>
                <div className="w-[98%] ml-[2%] flex flex-row flex-wrap">
                    <div 
                        onClick={() => navRoute({
                            url:'/anime',
                        })} 
                        className="cursor-pointer rounded-lg anime-nav w-[21%] h-[150px] m-[1%]"
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
                        className="cursor-pointer rounded-lg korea-nav w-[23%] h-[150px] m-[1%]"
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
                        className="cursor-pointer rounded-lg bollywood-nav w-[23%] h-[150px] m-[1%]"
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
                        className="cursor-pointer rounded-lg china-nav w-[23%] h-[150px] m-[1%]"
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
                        <div className={windowWidth > 800 ? "w-[90%] h-[auto] flex flex-wrap flex-col mx-[5%]" : "w-[100%] h-[auto] flex flex-wrap flex-col mt-[10%]"} key={node}>
                            <div className="w-[40%] h-[40px] flex flex-row my-t-[5%] my-b-[2%]">
                                <span className="w-[5%] h-[100%] border-r-[10px] border-[#fff] bg-[#5A5A68]"></span>
                                <span className="gradient-text default-text text-[25px]">{index}</span>
                            </div>
                            <SWEETPAGE intitializeMovies={intitializeMovies} page={page} index={index} total_pages={total_pages}/>
                            <div className={`w-[100%] duration-50 movie-scene ${windowWidth > 800 ? "h-[400px]" : "h-[200px]"} flex flex-col flex-wrap overflow-x-auto overflow-y-hidden my-[1%]`}>
                                {
                                    results.map(({adult,backdrop_path,genre_ids,id,original_language,original_title,overview,popularity,poster_path,release_date,title,video,vote_average,vote_count},movie_key) => 
                                        <div 
                                            key={movie_key} 
                                            onClick={() => navRoute({
                                                url:'/movies/id',
                                                state:{
                                                    id
                                                }
                                            })}
                                            className={windowWidth > 800 ? "cursor-pointer w-[25%] h-[100%] hover:scale-110 duration-700":`${index === "upcoming" || index === "trending" ? "w-[50%]" :"cursor-pointer w-[40%]"} h-[100%] hover:scale-110 duration-700`}
                                        >
                                            <div 
                                                className="w-[100%] h-[100%] background"
                                                style={{
                                                    // boxShadow:windowWidth > 800 ? "rgba(0,0,0,0.8) -20px -150px 130px inset, rgba(0, 0, 0, 0.7) 0px 100px 10px, rgba(0, 0, 0, 0.8) 100px 50px 10px" : "",

                                                    backgroundImage: `
                                                        linear-gradient(to bottom, rgba(0,0,0,0) 60%, rgba(0,0,0,0.85) 100%),
                                                        url(${safeKeys.IMG_POSTER + poster_path})
                                                    `
                                                }}
                                            >
                                                <div className={`relative ${windowWidth > 800 ? "top-[50%]" : "top-[50%]"} left-1/2 transform -translate-x-1/2 w-[100%] min-h-[60px] bg-opacity-60 text-white flex flex-col items-center justify-center z-10`}>
                                                    <h2 className={windowWidth > 800 ? "text-[15px]  font-bold":"text-[12px]"}>{title ? title : original_title ? original_title : title}</h2>
                                                    <p style={{color:"#ffd800"}}><FontAwesomeIcon icon={faStar} /> { parseFloat(vote_average).toFixed(1) || parseFloat(popularity).toFixed(1) || vote_count}</p>
                                                    {/* <article className="text-[15px]">{overview}</article>
                                                    <p className="text-[15px]">Release Date: {release_date}</p>
                                                    <p className="text-[15px]">Vote Average: {vote_average}</p>
                                                    <p className="text-[15px]">Vote Count: {vote_count}</p> */}
                                                </div>
                                            </div>
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
                windowWidth > 800 ? 
                <div className="w-[20%] nav-wall absolute h-[100%]" style={{background:"linear-gradient(85deg, #0d0d0d, rgba(0,0,0,0.75), rgb(9 11 29/var(--tw-bg-opacity)), #0f111a)"}}>
                    <NAVBAR main={true}/>
                </div>
                :
                <MOBILE/>
            }
            <div className={windowWidth > 800 ? "w-[80%] component-wall movie-scene h-[100%] ml-[20%] overflow-x-hidden overflow-y-auto flex flex-col":"w-[100%] movie-scene overflow-y-auto h-[92%] flex flex-col"}>
                {
                    windowWidth > 800 && <BAR />
                }
                { loadComponent() }
                           
            </div>
        </div>
    )
}

export default MOVIES
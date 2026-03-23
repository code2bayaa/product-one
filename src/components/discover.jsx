import { useEffect, useState, useCallback, useRef } from "react"
import { faPlay, faStar, faTvAlt } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useMutation, useLazyQuery, useApolloClient } from '@apollo/client/react';
import { gql } from '@apollo/client';
import CryptoJS from "crypto-js";
import NAVBAR from "./nav"
import PICTURE from "../midlleware/picture"
import CONTROLLERS from "../midlleware/controllers"
import { NavLink, useNavigate, useLocation } from "react-router-dom"
import SWEETPAGE from "../midlleware/pages"
import MOBILE from "./mobileBar";
import BAR from "./bar"
import { useKeys } from "./safe"
const DISCOVER = () => {

    const {state} = useLocation()
    
    const {safeKeys} = useKeys()
    const navigate = useNavigate();
    const [movies, setMovies] = useState(null)
    const [windowWidth, setWindowWidth] = useState(0);
    const hasFetched = useRef(false)
    const client = useApolloClient();
    let { mode } = state;

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
        query Movie (
            $page: Int!,
            $data:TRACK_DATA_OUTPUT,
            $hashedKey:String!
        ){
            movie(
                page:$page,
                data:$data,
                hashedKey:$hashedKey
            ) {
                results {
                    adult
                    backdrop_path
                    genre_ids
                    genres {
                        id
                        name
                    }
                    id
                    original_language
                    original_title
                    title
                    name
                    original_name
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
    const [fetchMovies] = useLazyQuery(FETCH_MOVIES_QUERY,{
        // pollInterval: 500, // fetches new data at that interval
        notifyOnNetworkStatusChange: true,
        fetchPolicy: 'cache-first',
        // variables,
        // skip: !variables.page, // Skip query execution if variables are not set
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

    const INSERT_MOVIES_MUTATION = gql`
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

    const [mutateInsertMovies] = useMutation(INSERT_MOVIES_MUTATION, {
        onCompleted: (data) => {
            console.log(data)
            if (data.addMovies.success) {
                // if(data.addMovies.message === "already inserted")
                //     console.log("movie inserting already started...")
                console.log("Movies successfully inserted into MySQL:", data.addMovies.message);
                // fetchedMoviesData.refetch()
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

// ...existing code...
    const intitializeMovies = useCallback(async({
        page = 1,
        adjustable = false,
        genreId = '',
        regionId = '',
        languageId='',
        yearId=0
    }) => {

        // make the work cancellable
        const controller = new AbortController();
        const { signal } = controller;
        let cancelled = false;

        const fetchMoviesFromAPI = async () => {

            console.log("mode",mode)
            const current_date = new Date().toISOString().split("T")[0]
            const temp = [
                { index: "discover_movie", actual:"movie", results: [], api: "discover/movie", page: 1, total_pages: 0, type:"movie",people_page:1,total_results:0 },
                { index: "discover_tv", actual:"tv", results: [], api: "discover/tv", page: 1, total_pages: 0,type:"tv" ,people_page:1,total_results:0},
            ];

            const key = temp.findIndex(({ actual }) => actual === mode);
            if (page) {
                temp[key].page = page;
            }

            const hashed = temp[key].page + temp[key].index + genreId + regionId + languageId + yearId
            const hashedKey = CryptoJS.SHA256(hashed).toString();

            async function freshFetch(){
                try {
                    const response = await fetch(
                        `${safeKeys.MOVIE_DB}${temp[key].api}?api_key=${safeKeys.API_KEY}&language=en-US&page=${temp[key].page}&with_genres=${genreId}&with_origin_country=${regionId}&sort_by=popularity.desc&with_original_language=${languageId}&primary_release_year=${yearId}`,
                        { signal }
                    );
                    if (!response.ok) {
                        console.warn("fresh fetch response not ok", response.status);
                        return false;
                    }
                    const data = await response.json();

                    if (cancelled || signal.aborted) return false;

                    if (data.results && data.results.length > 0) {
                        temp[key].results = [
                            ...temp[key].results,
                            ...data.results,
                        ];
                        temp[key].total_pages = data.total_pages;
                        temp[key].total_results = data.total_results;

                        // Update the movies state only if not cancelled
                        if (!cancelled) {
                            setMovies((prevMovies) => {
                                prevMovies = prevMovies || [];
                                const updatedMovies = [...prevMovies];
                                const existingIndex = updatedMovies.findIndex(
                                    (movie) => movie.index === temp[key].index
                                );

                                if (existingIndex > -1) {
                                    updatedMovies[existingIndex].results = [
                                        // ...updatedMovies[existingIndex].results,
                                        ...data.results,
                                    ];
                                } else {
                                    updatedMovies.push(temp[key]);
                                }

                                return updatedMovies;
                            });
                        }

                        // Insert the fetched data into MySQL using the mutation (guarded)
                        if (!cancelled) {
                            try {
                                await mutateInsertMovies({
                                    variables: {
                                        page:temp[key].page,
                                        results:data.results,
                                        total_pages:data.total_pages,
                                        total_results:data.total_results,
                                        data :{
                                            genre: genreId,
                                            region: regionId,
                                            language: languageId,
                                            year: yearId,
                                            index:temp[key].index,
                                            date:current_date,
                                            type:temp[key].type,
                                        },
                                        hashedKey,

                                    },
                                    context: { fetchOptions: { signal } }
                                });
                            } catch (err) {
                                if (err && err.name === 'AbortError') {
                                    // abort - ignore
                                } else {
                                    console.error("mutateInsertMovies error", err);
                                }
                            }
                        }

                        return true
                    }
                    return false
                } catch (err) {
                    if (err && err.name === 'AbortError') {
                        // aborted - ignore
                        return false;
                    }
                    console.error("freshFetch error", err);
                    return false;
                }
            }

            if(adjustable ){
                let fetched = null;
                try {
                    fetched = await fetchMovies({
                        variables : {
                        page: temp[key].page,
                        data : {
                            genre: genreId,
                            year: yearId,
                            region: regionId,
                            language: languageId,
                            index: temp[key].index,
                            date: current_date,
                            type:temp[key].type
                        },
                        hashedKey
                    },
                    context: { fetchOptions: { signal } },
                    fetchPolicy: 'network-only' // prefer fresh for this call
                    });
                } catch (err) {
                    if (err && err.name === 'AbortError') {
                        // aborted - bail out quietly
                        return false;
                    }
                    console.error("fetchMovies error", err);
                    // fallback to fresh fetch on other errors
                    return await freshFetch();
                }

                if (cancelled || signal.aborted) return false;

                if (fetched && fetched.data && fetched.data.movie) {
                    if(fetched.data.movie.success && fetched.data.movie.results &&  fetched.data.movie.results.length < 20){
                        return await freshFetch()
                    }else if(fetched.data.movie.error === "insert movies" || fetched.data.movie.error === "no records found"){
                        return await freshFetch()
                    }else{
                        // apply cached response to state (guarded)
                        if (!cancelled) {
                            setMovies((prevMovies) => {
                                prevMovies = prevMovies || [];
                                const updatedMovies = [...prevMovies]
                                const existingIndex = updatedMovies.findIndex(
                                    (movie) => movie.index === temp[key].index
                                );

                                if (existingIndex > -1) {
                                    updatedMovies[existingIndex].results = [
                                        // ...updatedMovies[existingIndex].results,
                                        ...fetched.data.movie.results,
                                    ];
                                } else {
                                    updatedMovies.push({
                                        index: temp[key].index,
                                        results: fetched.data.movie.results,
                                        page: fetched.data.movie.page,
                                        total_pages: fetched.data.movie.total_pages,
                                        total_results:fetched.data.movie.total_results
                                    });
                                }

                                return updatedMovies;
                            });
                        }
                        return true
                    }

                } else {
                    return await freshFetch()
                }

            }

        };
        // kick off work
        fetchMoviesFromAPI().catch(err => {
            if (err && err.name !== 'AbortError') console.error("intitializeMovies top-level error", err);
        });

        // return a cancel function so callers can abort
        return () => {
            cancelled = true;
            try { controller.abort(); } catch(e) { /* ignore */ }
        };
    },[fetchMovies,mutateInsertMovies,state]);

    useEffect(() => {
        if(hasFetched.current){
            return
        }
        hasFetched.current = true
        const cancel = intitializeMovies(
            {
            adjustable:true,
            // manualMode:mode
        })

        // cleanup to abort in-flight work when unmounting
        return () => {
            if (typeof cancel === 'function') cancel();
        }
    },[intitializeMovies])

    const navRoute = ({url,state}) => {
        navigate(url,{
            state : {
                ...state
            }
        })
    }
    return (
        <div className="w-[100%] duration-250 h-[100%] text-white flex flex-row flex-wrap" style={{background:"linear-gradient(65deg, #0d0d0d, rgba(0,0,0,0.75), #1c2a3b, #0f111a)"}}>
            {
                windowWidth > 800 ? 
                    <div className="w-[20%] absolute h-[100%] border-r-[3px] border-[#2E2E3A]">
                        <NAVBAR main={true}/>
                    </div>
                :
                <MOBILE/>
            }
            <div className={windowWidth > 800 ? "w-[80%] movie-scene h-[100%] ml-[20%] overflow-y-auto flex flex-col":"w-[100%] movie-scene overflow-y-auto h-[92%] flex flex-col"}>
                {
                    windowWidth > 800 && <BAR />
                }
                <div className="w-[100%]">
                    <CONTROLLERS intitializeMovies={intitializeMovies} type={mode}/>
                </div>
                {
                    movies ? movies.map(({results,page,total_pages,index,people_total_pages,people_page,box,people_next},node) =>
                        <div className={windowWidth > 800 ? "w-[90%] h-[auto] flex flex-wrap flex-col mx-[5%]":"w-[100%] h-[auto] flex flex-wrap flex-col"} key={node}>
                            <div className="w-[40%] h-[30px] flex flex-row my-t-[5%] my-b-[2%]">
                                <span className="w-[5%] h-[100%] border-r-[10px] border-[#fff] bg-[#5A5A68]"></span>
                                <span className="gradient-text default-text text-[25px]">{index}</span>
                            </div>
                            <SWEETPAGE intitializeMovies={intitializeMovies} page={page} index={index} total_pages={total_pages}/>
                            <div className={windowWidth > 800 ? `w-[100%] h-auto flex flex-row flex-wrap`: "w-[90%] flex flex-row flex-wrap mx-[5%]"}>
                                {
                                    results.map(({adult,backdrop_path,first_air_date,genres,id,original_language,original_name,name,original_title,overview,popularity,poster_path,release_date,title,video,vote_average,vote_count},movie_key) => 
                                        <div 
                                            key={movie_key} 
                                            className={windowWidth > 800 ? "w-[31%] m-[0.5%] h-[250px] hover:skew-4 hover:contrast-150 flex flex-row":"w-[30%] m-[0.5%] hover:skew-4 h-[200px] hover:contrast-150"}
                                        >
                                            <div className={
                                                windowWidth > 800 ? "w-[45%] m-[1%]" 
                                                : "w-[100%] h-[160px] p-0"
                                                }
                                            >
                                                <PICTURE 
                                                    key={id} 
                                                    classes={`object-cover rounded-lg h-[100%] ${windowWidth > 800 ? "" : "rounded-xl"}`} 
                                                    picture={poster_path || backdrop_path} 
                                                />
                                            </div>
                                            {
                                                windowWidth > 800 ?
                                                    <div className="w-[50%] h-[100%]">
                                                        <h2 className={windowWidth > 800 ? "text-[18px] h-[10%] gradient-text font-bold":""}>{title || original_title || name || original_name }</h2>

                                                        <div className="w-[100%] h-[10%] flex">
                                                            <FontAwesomeIcon icon={faTvAlt}/>

                                                            |

                                                            <span style={{color:"#ffd800"}} className="text-[15px]" ><FontAwesomeIcon icon={faStar} /> { parseFloat(vote_average).toFixed(1) || parseFloat(popularity).toFixed(1) || vote_count}</span>

                                                            |
                                                            {(release_date && release_date.split("-")[0]) || (first_air_date && first_air_date.split("-")[0])}
                                                            {/* {console.log(genres)} */}
                                                        
                                                            {/* {genres && genres.length > 0 ? genres[0].name : "N/A"} */}
                                                        </div>
                                                        <article className="w-[100%] text-ellipsis overflow-hidden h-[70%] text-[15px] relative bg-opacity-60 text-white flex flex-col items-center justify-center">
                                                            {overview.length > 150 ? overview.slice(0,150) + "..." : overview}
                                                        </article>
                                                        <button
                                                            onClick={() => navRoute({
                                                                url:name || original_name ? `/series/id` : `/movies/id`,
                                                                state:{
                                                                    id
                                                                }
                                                            })}
                                                            className="h-[10%] w-[70%] text-[#fff] bg-[#808C8C] rounded-md cursor-pointer"
                                                        >
                                                            <FontAwesomeIcon icon={faPlay} /> <span>play</span>
                                                        </button>
                                                    </div> 
                                                :
                                                    <div className="w-[100%] h-[40px]">
                                                        <button
                                                            onClick={() => navRoute({
                                                                url:name || original_name ? `/series/id` : `/movies/id`,
                                                                state:{
                                                                    id
                                                                }
                                                            })}
                                                            className="h-[100%] w-[100%] text-[#fff] bg-[#808C8C] rounded-md cursor-pointer"
                                                        >
                                                            <FontAwesomeIcon icon={faPlay} /> <span>play</span>
                                                        </button>                                                        
                                                    </div>
                                            }

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

export default DISCOVER
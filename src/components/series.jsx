import { useMutation, useLazyQuery, useApolloClient } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { useEffect, useState, useCallback, useRef } from "react"
import NAVBAR from "./nav"
import { faStar } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useNavigate } from "react-router-dom"
import SWEETPAGE from "../midlleware/pages"
import LOAD from "../midlleware/load"
import MOBILE from "./mobileBar";
import CryptoJS from "crypto-js";
import BAR from "./bar"
// import POPSTAR from "../midlleware/popstar"
import CELEBRATIES from "../midlleware/celebraties"
import { useKeys } from './safe';
const SERIES = () => {

    const hasFetched = useRef(false)
    const [movies, setMovies] = useState(null)
    const [windowWidth, setWindowWidth] = useState(0);
    const navigate = useNavigate(); 
    // const router = useRouter();  
    const client = useApolloClient();
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

    const FETCH_MOVIES_COLLECTION_QUERY = gql`
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
    const [fetchMoviesCollection] = useLazyQuery(FETCH_MOVIES_COLLECTION_QUERY,{
        notifyOnNetworkStatusChange: true,
        fetchPolicy: 'cache-first',
    });
    
    const INSERT_MOVIES_COLLECTION_MUTATION = gql`
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
    const [mutateInsertMoviesCollection] = useMutation(INSERT_MOVIES_COLLECTION_MUTATION, {
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

    const FETCH_MOVIES_QUERY = gql`
        query Tv(
            $page: Int!,
            $genre : String!,
            $year : Int!,
            $region : String!,
            $language : String!,
            $index : String!,
            $date:String!,
            $hashedKey:String!
        ){
            tv(
                page:$page,
                genre:$genre,
                year:$year,
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
    
    const INSERT_MOVIES_MUTATION = gql`
        mutation AddTVS(
            $page:Int!,
            $results:[ADD_TV_RESULTS_INPUT],
            $total_pages:Int!,
            $total_results:Int!,
            $data :TRACK_TV_DATA_INPUT,
            $type:String!,
            $hashedKey:String!
        ) {
            addTVS(
                page:$page,
                results:$results,
                total_pages:$total_pages,
                total_results:$total_results,
                data:$data,
                type:$type,
                hashedKey:$hashedKey
            ) {
                success
                message
            }
        }
    `;

    const [mutateInsertMovies] = useMutation(INSERT_MOVIES_MUTATION, {
        onCompleted: (data) => {
            if (data.addTVS.success) {
                // if(data.addTVS.message === "already inserted")
                    console.log("tv inserting already started...",data.addTVS.message)
                // fetchedMoviesData.refetch()
                // .then(status => console.log(status,"status"))
            } else {
                console.error("Failed to insert tv into MySQL:", data.addTVS.message, data.addTVS.error);
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
                {"index":"airing","results":[],"api":"tv/airing_today",page:1,total_pages:0},
                {"index":"trending","results":[],"api":"trending/tv/day",page:1,total_pages:0},
                {"index":"popular","results":[],"api":"tv/popular",page:1,total_pages:0},
                {"index":"top rated","results":[],"api":"tv/top_rated",page:1,total_pages:0},                
                {"index":"on air","results":[],"api":"tv/on_the_air",page:1,total_pages:0}
            ];
            const key = temp_movies.findIndex(({ index }) => index === actual_index);

            if (page) {
                temp_movies[key].page = page;
            }

            const hashed = temp_movies[key].page + genreId + regionId + languageId + yearId + actual_index + "tv"
            const hashedKey = CryptoJS.SHA256(hashed).toString();

            async function freshFetch(){
                // Fetch data from the API if not found in the cache
                const response = await fetch(
                    `${safeKeys.MOVIE_DB}${temp_movies[key].api}?api_key=${safeKeys.API_KEY}&language=en-US&page=${temp_movies[key].page}&with_genres=${genreId}&with_origin_country=${regionId}&sort_by=popularity.desc&with_original_language=${languageId}&primary_release_year=${yearId}`
                );
                const data = await response.json();

                // console.log(data)
                if (data.results.length > 0) {
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
                    mutateInsertMovies({
                        variables: {
                            page:temp_movies[key].page,
                            results:data.results,
                            total_pages:data.total_pages,
                            total_results:data.total_results,
                            data :{
                                genre: genreId,
                                region: regionId,
                                language: languageId,
                                year: yearId,
                                index:actual_index,
                                date:current_date,
                            },
                            hashedKey,
                            type:"tv",
                        },
                    });

                    return true
                }
                return false
            }

            if(adjustable || genreId || regionId || languageId || yearId){
                const fetched = await fetchMovies({
                    variables : {
                    page: temp_movies[key].page,
                    genre: genreId,
                    region: regionId,
                    language: languageId,
                    year: yearId,
                    index: actual_index,
                    date: current_date,
                    hashedKey  
                }})
                console.log(fetched)

                if (fetched.data) {
                    console.log("Using cached data:", fetched.data);
                    if(fetched.data.tv.success && fetched.data.tv.results &&  fetched.data.tv.results.length < 20){
                        console.log("less items")
                        return await freshFetch()
                    }else if(fetched.data.tv.error === "insert tv" || fetched.data.tv.error === "no records found"){
                        console.log("no records found")
                        return await freshFetch()
                    }else{
                        console.log("finally using cached data")
                        setMovies((prevMovies) => {
                            prevMovies = prevMovies || [];
                            const updatedMovies = [...prevMovies]
                            const existingIndex = updatedMovies.findIndex(
                                (tv) => tv.index === actual_index
                            );

                            if (existingIndex > -1) {
                                updatedMovies[existingIndex].results = [
                                    // ...updatedMovies[existingIndex].results,
                                    ...fetched.data.tv.results,
                                ];
                            } else {
                                updatedMovies.push({
                                    index: actual_index,
                                    results: fetched.data.tv.results,
                                    page: fetched.data.tv.page,
                                    total_pages: fetched.data.tv.total_pages,
                                    total_results:fetched.data.tv.total_results
                                });
                            }

                            return updatedMovies;
                        });
                        return true
                    }

                } else {
                    return await freshFetch()
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
    },[fetchMovies,mutateInsertMovies])

    // const intitializeMoviesInit = useCallback(async({
    //     runContent,
    //     page,
    //     adjustable = false,
    // }) => {
        
    //     const fetchMoviesFromAPI = async (actual_index) => {

    //         const current_date = new Date().toISOString().split("T")[0]
    //         const temp_movies = [
    //             // {"index":"discover","results":[],"api":"discover/tv",page:1,total_pages:0},
    //             {"index":"airing","results":[],"api":"tv/airing_today",page:1,total_pages:0},
    //             {"index":"trending","results":[],"api":"trending/tv/day",page:1,total_pages:0},
    //             {"index":"popular","results":[],"api":"tv/popular",page:1,total_pages:0},
    //             {"index":"top rated","results":[],"api":"tv/top_rated",page:1,total_pages:0},                
    //             {"index":"on air","results":[],"api":"tv/on_the_air",page:1,total_pages:0}
    //         ];
    //         const key = temp_movies.findIndex(({ index }) => index === actual_index);

    //         if (page) {
    //             temp_movies[key].page = page;
    //         }

    //         const hashed = temp_movies[key].page + genreId + regionId + languageId + yearId + actual_index + "tv"
    //         const hashedKey = CryptoJS.SHA256(hashed).toString();

    //         async function freshFetch(){
    //             // Fetch data from the API if not found in the cache
    //             const response = await fetch(
    //                 `${safeKeys.MOVIE_DB}${temp_movies[key].api}?api_key=${safeKeys.API_KEY}&language=en-US&page=${temp_movies[key].page}&with_genres=${genreId}&with_origin_country=${regionId}&sort_by=popularity.desc&with_original_language=${languageId}&primary_release_year=${yearId}`
    //             );
    //             const data = await response.json();

    //             // console.log(data)
    //             if (data.results.length > 0) {
    //                 temp_movies[key].results = [
    //                     ...temp_movies[key].results,
    //                     ...data.results,
    //                 ];
    //                 temp_movies[key].total_pages = data.total_pages;
    //                 temp_movies[key].total_results = data.total_results;

    //                 // Update the movies state
    //                 setMovies((prevMovies) => {
    //                     prevMovies = prevMovies || [];
    //                     const updatedMovies = [...prevMovies];
    //                     const existingIndex = updatedMovies.findIndex(
    //                         (movie) => movie.index === actual_index
    //                     );

    //                     if (existingIndex > -1) {
    //                         updatedMovies[existingIndex].results = [
    //                             // ...updatedMovies[existingIndex].results,
    //                             ...data.results,
    //                         ];
    //                     } else {
    //                         updatedMovies.push(temp_movies[key]);
    //                     }

    //                     return updatedMovies;
    //                 });


    //                 // Insert the fetched data into MySQL using the mutation
    //                 mutateInsertMovies({
    //                     variables: {
    //                         page:temp_movies[key].page,
    //                         results:data.results,
    //                         total_pages:data.total_pages,
    //                         total_results:data.total_results,
    //                         data :{
    //                             genre: genreId,
    //                             region: regionId,
    //                             language: languageId,
    //                             year: yearId,
    //                             index:actual_index,
    //                             date:current_date,
    //                         },
    //                         hashedKey,
    //                         type:"tv",
    //                     },
    //                 });

    //                 return true
    //             }
    //             return false
    //         }

    //         if(adjustable || genreId || regionId || languageId || yearId){
    //             const fetched = await fetchMovies({
    //                 variables : {
    //                 page: temp_movies[key].page,
    //                 genre: genreId,
    //                 region: regionId,
    //                 language: languageId,
    //                 year: yearId,
    //                 index: actual_index,
    //                 date: current_date,
    //                 hashedKey  
    //             }})
    //             console.log(fetched)

    //             if (fetched.data) {
    //                 console.log("Using cached data:", fetched.data);
    //                 if(fetched.data.tv.success && fetched.data.tv.results &&  fetched.data.tv.results.length < 20){
    //                     console.log("less items")
    //                     return await freshFetch()
    //                 }else if(fetched.data.tv.error === "insert tv" || fetched.data.tv.error === "no records found"){
    //                     console.log("no records found")
    //                     return await freshFetch()
    //                 }else{
    //                     console.log("finally using cached data")
    //                     setMovies((prevMovies) => {
    //                         prevMovies = prevMovies || [];
    //                         const updatedMovies = [...prevMovies]
    //                         const existingIndex = updatedMovies.findIndex(
    //                             (tv) => tv.index === actual_index
    //                         );

    //                         if (existingIndex > -1) {
    //                             updatedMovies[existingIndex].results = [
    //                                 // ...updatedMovies[existingIndex].results,
    //                                 ...fetched.data.tv.results,
    //                             ];
    //                         } else {
    //                             updatedMovies.push({
    //                                 index: actual_index,
    //                                 results: fetched.data.tv.results,
    //                                 page: fetched.data.tv.page,
    //                                 total_pages: fetched.data.tv.total_pages,
    //                                 total_results:fetched.data.tv.total_results
    //                             });
    //                         }

    //                         return updatedMovies;
    //                     });
    //                     return true
    //                 }

    //             } else {
    //                 return await freshFetch()
    //             }
    //         }

    //     };
    //     runContent.forEach((index) => {
    //         fetchMoviesFromAPI(index)
    //         .then(status => {
    //             if(!status){

    //             }
    //         })
    //     })
    // },[fetchMovies,mutateInsertMovies])  
      
    const intitializeMoviesInit = useCallback(async({
            runContent,
            page,
            adjustable = false,
        }) => {
            
            const current_date = new Date().toISOString().split("T")[0]
            let hashed = "tv" + current_date
            const movieWrap = await Promise.all(runContent.map(actual_index => {
                const temp_movies = [
                    {"index":"airing","results":[],"api":"tv/airing_today",page:1,total_pages:0},
                    {"index":"trending","results":[],"api":"trending/tv/day",page:1,total_pages:0},
                    {"index":"popular","results":[],"api":"tv/popular",page:1,total_pages:0},
                    {"index":"top rated","results":[],"api":"tv/top_rated",page:1,total_pages:0},                
                    {"index":"on air","results":[],"api":"tv/on_the_air",page:1,total_pages:0}
                ];
                
                const key = temp_movies.findIndex(({ index }) => index === actual_index);
                console.log(page,"page",key,"key")

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
                async function freshFetch(){
                    let hashed = "tv" + current_date
                    const insertContent = (await Promise.all(runContent.map(async actual_index => {
                        const temp_movies = [
                            {"index":"airing","results":[],"api":"tv/airing_today",page:1,total_pages:0},
                            {"index":"trending","results":[],"api":"trending/tv/day",page:1,total_pages:0},
                            {"index":"popular","results":[],"api":"tv/popular",page:1,total_pages:0},
                            {"index":"top rated","results":[],"api":"tv/top_rated",page:1,total_pages:0},                
                            {"index":"on air","results":[],"api":"tv/on_the_air",page:1,total_pages:0}
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
                                type:"tv"                         
                            })
                        }

                        return false
                    }))).filter(Boolean)
                    const hashedKey = CryptoJS.SHA256(hashed).toString();

                    // Insert the fetched data into MySQL using the mutation
                    mutateInsertMoviesCollection({
                        variables: {
                            data:insertContent,
                            // type:"tv",
                            date:current_date,
                            hashedKey
                        },
                    });
                }

                const fetched = await fetchMoviesCollection({
                    variables : {
                        data:movieWrap,
                        hashedKey
                }})
                // console.log(fetched)

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
    },[fetchMoviesCollection,mutateInsertMoviesCollection])

    useEffect(() => { 
        if(hasFetched.current){
            return
        }
        hasFetched.current = true
        intitializeMoviesInit(
            {runContent:[
            // "latest",
                "airing","trending",
                "popular",
                "top rated",
                "on air"
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
                    <h3 className="mt-[5%] ml-[2%]">click to watch</h3>
                    <div className="w-[100%] flex flex-row flex-wrap">
                        <div 
                            onClick={() => navRoute({
                                url:'/anime',
                            })} 
                            className="cursor-pointer rounded-lg anime-nav w-[23%] h-[150px] m-[1%]"
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
                            <div className={windowWidth > 800 ? "w-[95%] mx-[2.5%] h-[auto] flex flex-wrap flex-col" : "w-[100%] h-[auto] flex flex-wrap flex-col mt-[10%]"} key={node}>
                                <div className="w-[40%] h-[40px] flex flex-row my-t-[5%] my-b-[2%]">
                                    <span className="w-[5%] h-[100%] border-r-[10px] border-[#fff] bg-[#5A5A68]"></span>
                                    <span className="gradient-text default-text text-[25px]">{index}</span>
                                </div>
                                <SWEETPAGE intitializeMovies={intitializeMovies} page={page} index={index} total_pages={total_pages}/>
                                <div className={`w-[100%] duration-50 movie-scene ${windowWidth > 800 ? "h-[400px]" : "h-[200px]"} flex flex-col flex-wrap overflow-x-auto overflow-y-hidden my-[1%]`}>
                                    {
                                        results.map(({adult,backdrop_path,genre_ids,id,original_language,original_name,name,overview,popularity,poster_path,release_date,title,video,vote_average,vote_count},movie_key) => 
                                            <div 
                                                key={movie_key} 
                                                onClick={() => navRoute({
                                                    url:'/series/id',
                                                    state:{
                                                        id
                                                    }
                                                })}
                                                className={windowWidth > 800 ? "cursor-pointer w-[25%] h-[100%] hover:scale-110 duration-150":`${index === "upcoming" || index === "trending" ? "w-[50%]" :"cursor-pointer w-[45%]"} h-[100%] hover:scale-110 duration-400`}
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
                                                    {/* <PICTURE key={id} classes={"object-cover h-[100%]"} picture={poster_path} /> */}
                                                    <div className={`relative ${windowWidth > 800 ? "top-[50%]" : "top-[50%]"} left-1/2 transform -translate-x-1/2 w-[100%] min-h-[60px] bg-opacity-60 text-white flex flex-col items-center justify-center z-10`}>
                                                        <h2 className={windowWidth > 800 ? "text-[15px]  font-bold":"text-[12px]"}>{original_name || name}</h2>
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
        console.log("loading...")
            return (
            <>
                <LOAD/>
            </>
            )
        }
    }   
    return (
        <div className={`w-[100%] ${windowWidth > 800 ? "h-[100%]" : "h-[92%]"} overflow-x-hidden  bg-cover bg-no-repeat bg-center text-white`} style={{background:"linear-gradient(65deg, #0d0d0d, rgba(0,0,0,0.75), #1c2a3b, #0f111a)"}}>
            {
                windowWidth > 800 ? 
                <div className="w-[20%] h-[100%] nav-wall absolute">
                    <NAVBAR main={true}/>
                </div>
                :
                <MOBILE/>
            }
            <div className={windowWidth > 800 ? "w-[80%] overflow-x-hidden component-wall duration-100 h-[100%] overflow-y-auto movie-scene ml-[20%] flex flex-col":"w-[100%] overflow-y-auto movie-scene duration-150 h-[100%] flex flex-col"}>
                {/* <div className="w-[100%]">
                    <CONTROLLERS intitializeMovies={intitializeMovies} type={"tv"}/>
                </div> */}
                {
                    windowWidth > 800 && <BAR />
                }
                {loadComponent()}
            </div>
        </div>
    )
}
export default SERIES
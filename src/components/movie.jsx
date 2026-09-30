
import REACTIONBUTTON, { reactionNeedsUpload } from "./party/ReactionButton";
import { shortRow } from "../midlleware/shortRow"
import { useMutation, useLazyQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import NAVBAR from "./nav"
import { useLocation, useNavigate  } from "react-router-dom";
import { useState, useEffect, useCallback, useRef } from "react";
import PICTURE from "../midlleware/picture";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlayCircle, faStar, faBasketShopping, faCirclePlus, } from "@fortawesome/free-solid-svg-icons";
import LOAD from "../midlleware/load";
import MOBILE from "./mobileBar";
// import { Rating } from 'react-simple-star-rating'
import Swal from "sweetalert2";
import { useKeys } from './safe';
import { usePlayGate, PHONEPROMPT } from "./access";
import COMMENTS from "./comments";
import { noCreditsAlert } from "../midlleware/noCredits";
import { useWindowWidth, DESKTOP_WIDTH } from "../hooks/useWindowWidth";
const MOVIE = () => {
    // const { id } = useParams();
    const hasFetched = useRef(null)
    const [movie, setMovie] = useState(null);
    const [images,setImages] = useState(null)
    const [credits,setCredit] = useState(null)
    const windowWidth = useWindowWidth()
    const [playlist,setPlaylist] = useState(null)
    const [generateGenre, setGenerateGenre] = useState([])
    const [checkURL, setCheckURL] = useState(null)
    
    const {safeKeys,loadKeys} = useKeys()
    const { allowed: layouts, needsPhone } = usePlayGate(safeKeys?.GEO)
    // const params = useSearchParams();
    // const state = JSON.parse(decodeURIComponent(params.get("state")));
    // console.log(state,"open state")
    // const state = useStates("movies")
    const navigate = useNavigate();
    const {state} = useLocation()
    let { id } = state;

    // const router = useRouter();
    // const { state } = useLocation();
    // const navigate = useNavigate();
    // const id = state.id
    // const [fetchedImage, setFetchedImage] = useState(null)
    // useEffect(() => {
    //     //for maintenance
    //     // const historyState = window.history.state;
    //     // setState(historyState);
        
    // }, []);

    // useEffect(() => {
    //     // Create the inline script
    //     const inlineScript = document.createElement("script");
    //     inlineScript.type = "text/javascript";
    //     inlineScript.text = "var infolinks_pid = 3436935; var infolinks_wsid = 0;";

    //     // Create the external script
    //     const externalScript = document.createElement("script");
    //     externalScript.type = "text/javascript";
    //     externalScript.src = "//resources.infolinks.com/js/infolinks_main.js";

    //     // Append both to the body
    //     document.body.appendChild(inlineScript);
    //     document.body.appendChild(externalScript);

    //     // Cleanup on unmount
    //     return () => {
    //         document.body.removeChild(inlineScript);
    //         document.body.removeChild(externalScript);
    //     };
    // }, []);

    useEffect(() => {
        // Create the inline script
        const inlineScript = document.createElement("script");
        inlineScript.type = "text/javascript";
        inlineScript.crossorigin = "anonymous";
        inlineScript.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8036256488117651"
        inlineScript.async = true
        // Create the external script
        // const externalScript = document.createElement("script");
        // externalScript.type = "text/javascript";
        // externalScript.src = "//resources.infolinks.com/js/infolinks_main.js";

        // Append both to the body
        document.body.appendChild(inlineScript);
        // document.body.appendChild(externalScript);

        // Cleanup on unmount
        return () => {
            document.body.removeChild(inlineScript);
            // document.body.removeChild(externalScript);
        };
    }, []);

    //the play gate (Africa / Australia / Brazil device + phone number) lives in access.jsx usePlayGate

    const FETCH_GENRE_QUERY = gql`
        query Genre {
            genre {
                success
                date
                data {
                    id
                    name
                    mode
                }
            }
        }
    `
    const [fetchGenre] = useLazyQuery(FETCH_GENRE_QUERY,{
        // pollInterval: 500, // fetches new data at that interval
        notifyOnNetworkStatusChange: true,
        fetchPolicy: 'cache-first',
        // variables,
        // skip: !variables.page, // Skip query execution if variables are not set
    });

    // const [fetchedImageBackgrounds,setFetchedImageBackgrounds] = useState(null)

    const FETCH_COMINED_QUERY = gql`
        query MoviePayload (
            $image: IMAGE_ARGUMENTS!
            $movie: SINGLE_MOVIE_ARGUMENTS!
            $credit: CREDIT_ITEM_ARGUMENTS!
        ) {
            moviePayload(
                image: $image,
                movie: $movie,
                credit: $credit
            ) {
                image {
                    data {
                        id
                        path
                        logo
                    }
                    meta_data {
                        type
                        season
                        episode
                    }
                    success
                    error
                }
                movie {
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
                    overview
                    popularity
                    poster_path
                    release_date
                    title
                    video 
                    runtime
                    revenue
                    budget
                    status
                    origin_country
                    production_companies {
                        id
                        name
                    }
                    tagline
                    vote_average
                    vote_count   
                    url {
                        fileName
                    }
                    player {
                        type
                        index
                        quality
                        stream
                        size
                        token
                    }             
                    success
                    error
                    message
                }
                credit {
                    cast {
                        adult
                        gender
                        id
                        known_for_department
                        name
                        original_name
                        popularity
                        profile_path
                        cast_id
                        character
                        credit_id
                        order
                    }
                    crew {
                        adult
                        gender
                        id
                        known_for_department
                        name
                        original_name
                        popularity
                        profile_path
                        credit_id
                        department
                        job
                    }              
                    success
                    error
                    message                
                }
                success
                error
            }
        }
    `

    const [fetchCombined] = useLazyQuery(FETCH_COMINED_QUERY,{
        // pollInterval: 500, // fetches new data at that interval
        notifyOnNetworkStatusChange: true,
        // fetchPolicy: 'cache-first',
        fetchPolicy: 'network-only'
        // variables,
        // skip: !variables.page, // Skip query execution if variables are not set
    });

    
        const [mutateInsertImage] = useMutation(gql`
            mutation AddImage(
                $meta_data: META_DATA_INPUT!
                $data: DATA_INPUT!
            ) {
                addImage(
                    meta_data: $meta_data
                    data: $data
                ){
                    data {
                        id
                        path
                        logo
                    }
                    meta_data {
                        id
                        type
                        season
                        episode
                    }
                    success
                    error
                }
            }
        `,
        {
            onCompleted: (data) => {
                // console.log(data)
                if (data && data.addImage.success) {
                    // Refetch the query to get updated data
                    // console.log(fetchImage)
                    // fetchImageData.refetch().then((refetched) => {
                    //     console.log(refetched)
                    //     if(refetched.data.image.success){
                    //         const ref = refetched?.data?.image?.data
                    //         const typeGetImageData = {...ref}
                    //         setImages(() => typeGetImageData)
                    //     }

                    // })
    
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


        // const FETCH_MOVIE_QUERY = gql`
        //     query Single (
        //         $id: ID!
        //     ){
        //         single(
        //             id:$id
        //         ) {
        //             adult
        //             backdrop_path
        //             genre_ids
        //             genres {
        //                 id
        //                 name
        //             }
        //             id
        //             original_language
        //             original_title
        //             overview
        //             popularity
        //             poster_path
        //             release_date
        //             title
        //             video 
        //             runtime
        //             revenue
        //             budget
        //             status
        //             origin_country
        //             production_companies {
        //                 id
        //                 name
        //             }
        //             tagline
        //             vote_average
        //             vote_count   
        //             url {
        //                 fileName
        //             }             
        //             success
        //             error
        //             message
        //         }
        //     }
        // `
        // const [fetchSingleMovie] = useLazyQuery(FETCH_MOVIE_QUERY,{
        //     // pollInterval: 500, // fetches new data at that interval
        //     notifyOnNetworkStatusChange: true,
        //     fetchPolicy: 'cache-first',
        //     // variables,
        //     // skip: !variables.page, // Skip query execution if variables are not set
        // });

        const INSERT_MOVIE_MUTATION = gql`
            mutation AddMovie(
                $adult:Boolean!
                $backdrop_path:String
                $id:Int!
                $original_language:String!
                $original_title:String!
                $overview:String!
                $popularity:Float!
                $poster_path:String
                $release_date:String!
                $title:String!
                $video :Boolean!
                $vote_average:Float!
                $vote_count:Float!
                $belongs_to_collection:COLLECTION_INPUT
                $production_companies:[PRODUCTION_COMPANIES_INPUT]
                $production_countries:[PRODUCTION_COUNTRIES_INPUT]
                $spoken_languages:[SPOKEN_LANGUAGES_INPUT]
                $runtime:Int
                $genres:[GENRES_IDS_INPUT]
                $budget:Float
                $revenue:Float
                $tagline:String
                $status:String
                $imdb_id:String
                $homepage:String
                $origin_country:[String]
            ) {
                addMovie(
                    adult:$adult
                    backdrop_path:$backdrop_path
                    genres:$genres
                    id:$id
                    original_language:$original_language
                    original_title:$original_title
                    overview:$overview
                    popularity:$popularity
                    poster_path:$poster_path
                    release_date:$release_date
                    title:$title
                    video:$video 
                    vote_average:$vote_average
                    vote_count:$vote_count
                    belongs_to_collection:$belongs_to_collection
                    production_companies:$production_companies
                    production_countries:$production_countries
                    runtime:$runtime
                    spoken_languages:$spoken_languages
                    budget:$budget
                    revenue:$revenue
                    tagline:$tagline
                    status:$status
                    imdb_id:$imdb_id
                    homepage:$homepage
                    origin_country:$origin_country
                ) {
                    success
                    message
                }
            }
        `;

        const [mutateInsertMovie] = useMutation(INSERT_MOVIE_MUTATION, {
            onCompleted: (data) => {
                console.log(data)
                if (data.addMovie.success) {
                    if(data.addMovie.message === "already inserted")
                        console.log("movie inserting already started...")
                    console.log("Movie successfully inserted into MySQL:", data.addMovie.message);
                    // fetchedMovieData.refetch()
                    // .then(status => console.log(status,"status"))
                } else {
                    console.error("Failed to insert movies into MySQL:", data.addMovie.message, data.addMovie.error);
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

    //     const FETCH_CREDITS_QUERY = gql`
    //         query Credits (
    //             $id:ID
    //         ){
    //             credits(
    //                 id:$id
    //             ) {
    //                 cast {
    //                     adult
    //                     gender
    //                     id
    //                     known_for_department
    //                     name
    //                     original_name
    //                     popularity
    //                     profile_path
    //                     cast_id
    //                     character
    //                     credit_id
    //                     order
    //                 }
    //                 crew {
    //                     adult
    //                     gender
    //                     id
    //                     known_for_department
    //                     name
    //                     original_name
    //                     popularity
    //                     profile_path
    //                     credit_id
    //                     department
    //                     job
    //                 }              
    //                 success
    //                 error
    //                 message
    //             }
    //         }
    //     `
    // const [fetchCreditsData] = useLazyQuery(FETCH_CREDITS_QUERY,{
    //     // pollInterval: 500, // fetches new data at that interval
    //     notifyOnNetworkStatusChange: true,
    //     fetchPolicy: 'cache-first',
    //     // variables,
    //     // skip: !variables.page, // Skip query execution if variables are not set
    // });

    const INSERT_CREDITS_MUTATION = gql`
        mutation AddCredits(
            $id:Int!
            $cast:[CAST_INPUT]
            $crew:[CREW_INPUT]
            $chunking:Boolean!
            $chunking_index:Int!
        ) {
            addCredits(
                id:$id
                cast:$cast
                crew:$crew
                chunking:$chunking
                chunking_index:$chunking_index
            ) {
                success
                message
            }
        }
    `;

    const [mutateInsertCredits] = useMutation(INSERT_CREDITS_MUTATION, {
        onCompleted: (data) => {
            console.log(data)
            if (data && data.addCredits.success) {
                // Refetch the query to get updated data
                // console.log(fetchImage)
                // fetchedCredits.refetch().then((refetched) => {
                //     console.log(refetched)
                //     if(refetched.data.credits.success){
                //         const ref = refetched?.data?.credits
                //         const typeGetImageData = {...ref}
                //         setCredit(() => ({...typeGetImageData}))
                //     }

                // })

            } else {
                console.error("Failed to insert credits into MySQL:", data.addCredits.message, data.addCredits.error);
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

    // const graphImages = useCallback(async() => {

    //     async function freshFetch(){
    //         const response = await fetch(`${safeKeys.MOVIE_DB}movie/${id}/images?api_key=${safeKeys.API_KEY}`);
    //         const getImageData = await response.json();
    //         // console.log(getImageData,"images")
    //         let value = 0
    //         const {backdrops, posters, logos} = getImageData
    //         let path = ''
    //         if(backdrops && backdrops.length > 0){
    //             value = Math.max(...backdrops.map(({height}) => height))
    //             let key = backdrops.findIndex(({height}) => height === value)
    //             if(key > -1){
    //                 path = backdrops[key].file_path
    //             }
    //         } 
    //         if(posters && posters.length > 0){
    //             let posters_value = Math.max(...posters.map(({height}) => height))
    //             if(posters_value > value){
    //                 let key = posters.findIndex(({height}) => height === posters_value)
    //                 if(key > -1){
    //                     path = posters[key].file_path
    //                 }
    //                 value = posters_value
    //             }
    //         }
    //         if(logos && logos.length > 0){
    //             let logos_value = Math.max(...logos.map(({height}) => height))
    //             if(logos_value > value){
    //                 let key = logos.findIndex(({height}) => height === logos_value)
    //                 if(key > -1){
    //                     path = logos[key].file_path
    //                 }
    //             }
    //         }

    //         mutateInsertImage({ variables: { meta_data : {
    //                 type:"movie",
    //                 season:-1,
    //                 episode:-1,
    //                 id:id?parseInt(id):-1
    //             }, data:{id:getImageData.id,path}                  
    //         } });
    //         return path
    //     }         
    //     try{
    //         const fetched = await fetchImage({
    //             variables : {
    //             type:"movie",
    //             episode:-1,
    //             season:-1,
    //             id:id?parseInt(id):-1
    //         }})
    //         console.log(fetched)
    //         if (fetched.data && fetched.data.image.success) {
    //             console.log("image cached data:", fetched.data);
    //             setImages(() => (fetched.data.image.data.path))

    //         }else {
    //             const path = await freshFetch()
    //             console.log(path,"path")
    //             setImages(path)
    //         }
        
            
    //     }catch(error){
    //         console.log(error)
    //         const path = await freshFetch()
    //         setImages(path)            
        

    //     }
    // },[fetchImage,id,mutateInsertImage])

    // const fetchMovie = useCallback(async() => {    
        
    //     async function freshFetch(){
    //         const response = await fetch(`${safeKeys.MOVIE_DB}movie/${id}?api_key=${safeKeys.API_KEY}`);
    //         const data = await response.json();
    //         // console.log(data)
    //         mutateInsertMovie({
    //             variables: {...data},
    //         });
    //         return {...data}
    //     }            

    //     const fetched = await fetchSingleMovie({
    //     variables : { id }})
    //     console.log(fetched)
    //     if(fetched.data && fetched.data.single && !fetched.data.single.runtime){
    //         //first time
    //         console.log("first time...")
    //         const movie = await freshFetch()
    //         setMovie(() => ({...fetched.data.single,...movie}));
    //     }else if(fetched.data && fetched.data.single.success){
    //         console.log("Using cached data:", fetched.data);
    //         setMovie(() => ({...fetched.data.single}));
    //         // checkFeedback(fetched.data.single.id)
    //         // setGenreIDS(fetched.data.single.genre_ids)
    //     }else {
    //         const movie = await freshFetch()
    //         setMovie(() => ({...movie}));
    //         // checkFeedback(movie.id)
    //         // setGenreIDS(movie.genre_ids)
    //     }

    //     return true
        
    // },[fetchSingleMovie,id, mutateInsertMovie])

    const checkFeedback = (id) => {
        // console.log(id,"id")
        //authentication
        const controller = new AbortController();
        fetch(process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_API_URL : process.env.REACT_APP_API_URL_LIVE,{credentials: "include"})
        .then(async res => {
            const {status, user} = await res.json()
            if(status){
                fetch(`${process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_PLAYLIST_SELECT : process.env.REACT_APP_PLAYLIST_SELECT_LIVE}`,{
                    method:"POST",
                    signal:controller.signal,
                    headers:{
                        "Content-Type":"application/json"
                    },
                    body:JSON.stringify({id, user, type:"movie"})
                })
                .then(res => res.json())
                .then(({status}) => {
                    if(status){
                        setPlaylist(() => true)
                    }
                })
            }
        })
    } 
    const setGenreIDS = useCallback(async(genre = []) => {
        const {data} = await fetchGenre()
        if(data && data.genre && data.genre.success){
            // console.log(genre)
            // console.log(data.genre?.data)
            const genreData = data.genre?.data.filter(({id,mode}) => genre && genre.includes(Number(id)) && mode === "movie")
            // console.log(genreData)
            setGenerateGenre(() => [...genreData])
        }else{
            setGenerateGenre(() => [])
        }
        
    },[fetchGenre])

    useEffect(() => {
        // if(hasFetched.current.feedback){
        //     return
        // }
        // hasFetched.current.feedback = true        
        if (movie && movie.id) {
            checkFeedback(movie.id);
        }
        if(movie && movie.genre_ids){
            setGenreIDS(movie.genre_ids)
        }
    }, [movie,setGenreIDS]);

    // const fetchCredits = useCallback(async() => {
    //     // const credits_response = await fetch(`${safeKeys.MOVIE_DB}movie/${id}/credits?api_key=${safeKeys.API_KEY}`);
    //     // const credits_data = await credits_response.json();
    //     // setCredit(() => ({...credits_data})); 
    //     // console.log(credits_data)

    //     async function freshFetch(){
    //         const response = await fetch(`${safeKeys.MOVIE_DB}movie/${id}/credits?api_key=${safeKeys.API_KEY}`);
    //         const credits_data = await response.json();
    //         // console.log(credits_data)
    //         function chunkArray(array, size) {
    //             const result = [];
    //             for (let i = 0; i < array.length; i = size) {
    //                 result.push(array.slice(i, i  size));
    //             }
    //             return result;
    //         }
    //         let cast_all_results = [...credits_data.cast]
    //         if(cast_all_results.length > 100){
    //             const chunks = chunkArray(cast_all_results, 100);
    //             for (let i = 0; i < chunks.length; i) {
    //                 mutateInsertCredits({
    //                     variables: {
    //                         cast:chunks[i],
    //                         id:id?parseInt(id):0,
    //                         chunking:true,
    //                         chunking_index:i
    //                     },
    //                 });
    //             }
    //         }else{
    //             mutateInsertCredits({
    //                 variables: {
    //                     cast:cast_all_results,
    //                     id:id?parseInt(id):0,
    //                     chunking:false,
    //                     chunking_index:0
    //                 },
    //             });
    //         }
    //         // let crew_all_results = [...credits_data.crew]
    //         // if(crew_all_results.length > 100){
    //         //     const chunks = chunkArray(crew_all_results, 100);
    //         //     for (let i = 0; i < chunks.length; i) {
    //         //         mutateInsertCredits({
    //         //             variables: {
    //         //                 crew:chunks[i],
    //         //                 id:id?parseInt(id):0,
    //         //                 chunking:true,
    //         //                 chunking_index:i                        
    //         //             },
    //         //         });
    //         //     }
    //         // }else{
    //         //     mutateInsertCredits({
    //         //         variables: {
    //         //             crew:crew_all_results,
    //         //             id:id?parseInt(id):0,
    //         //             chunking:false,
    //         //             chunking_index:0                    
    //         //         },
    //         //     });
    //         // }
    //         return {...credits_data}
    //     } 

    //     const current_date = new Date().toISOString().split("T")[0]
    //     const fetched = await fetchCreditsData({
    //         variables : { id:id?parseInt(id):0, date:current_date }})
    //     console.log(fetched)
    //     if(fetched.data && fetched.data.credits.success){
    //         console.log("Using cached data:", fetched.data);
    //         return setCredit(() => ({...fetched.data.credits}));
    //     }else {
    //         const credits = await freshFetch()
    //         return setCredit(() => ({...credits}));
    //     }
    
    // },[fetchCreditsData,id,mutateInsertCredits])

    // useEffect(() => {
    //     if(hasFetched.current.images){
    //         return
    //     }
    //     hasFetched.current.images = true        
    //     graphImages()
    // },[graphImages])

    // useEffect(() => {
    //     if(hasFetched.current.movie){
    //         return
    //     }
    //     hasFetched.current.movie = true        
    //   fetchMovie();
    // }, [fetchMovie]);

    // useEffect(() => {
    //     if(hasFetched.current.credits){
    //         return
    //     }
    //     hasFetched.current.credits = true        
    //     fetchCredits();
    // }, [fetchCredits]);

    // useEffect(() => {
    //     async function addRecommendations(){
    //         const user = localStorage.getItem("session")
    //         const response = await fetch(`${process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_ADD_RECOMMENDATIONS : process.env.REACT_APP_ADD_RECOMMENDATIONS_LIVE}`, {
    //             method: "POST",
    //             credentials: "include",
    //             body:JSON.stringify({
    //                 title:movie.original_title || movie.title,
    //                 overview:movie.overview,
    //                 type:"movie",
    //                 user
    //             }),
    //             signal:controller.signal,
    //             headers: {
    //                 'Content-Type': 'application/json', // Indicates the body is JSON
    //             },
    //         });

    //         const {status,message} = await response.json()

    //         console.log(status,message)
    //     }
    //     if(movie)
    //         addRecommendations()
    // },[movie])

    const creditRing = useCallback(async(payload) => {
        try{
            async function freshFetch(){
                const response = await fetch(`${safeKeys.MOVIE_DB}movie/${id}/credits?api_key=${safeKeys.API_KEY}`);
                const credits_data = await response.json();
                // console.log(credits_data)
                //both loops used to never advance (i = size, and no i++), freezing the tab for any
                //title with more than 100 cast; crew was never stored, so it vanished on a cache hit
                function chunkArray(array, size) {
                    const result = [];
                    for (let i = 0; i < array.length; i += size) {
                        result.push(array.slice(i, i + size));
                    }
                    return result;
                }
                const storeCredits = (group, people) => {
                    const all = Array.isArray(people) ? people : []
                    const chunks = all.length > 100 ? chunkArray(all, 100) : [all]
                    chunks.forEach((chunk, index) => {
                        mutateInsertCredits({
                            variables: {
                                [group]:chunk,
                                id:id?parseInt(id):0,
                                chunking:chunks.length > 1,
                                chunking_index:index
                            },
                        });
                    })
                }
                storeCredits("cast", credits_data.cast)
                storeCredits("crew", credits_data.crew)
                return {...credits_data}
            } 

            console.log(payload,"payload: credits")
            if(payload && payload.success){
                console.log("credits cached data:", payload);
                return setCredit(() => ({...payload}));
            }else {
                console.log("fetching credits from API...")
                const credits = await freshFetch()
                return setCredit(() => ({...credits}));
            }
        }catch(error){
            console.log("credi error:",error)
        }

    },[safeKeys, id, mutateInsertCredits])

    
    const movieRing = useCallback(async(payload) => {
        async function freshFetch(){
            const response = await fetch(`${safeKeys.MOVIE_DB}movie/${id}?api_key=${safeKeys.API_KEY}`);
            const data = await response.json();
            // console.log(data)
            mutateInsertMovie({
                variables: {...data},
            });
            return {...data}
        } 
        
        //runtime null = not stored yet or stale (the server nulls it); 0 is a real runtime, not a miss
        if(payload && (payload.runtime === null || payload.runtime === undefined)){
            //first time
            console.log("first time...")
            const movie = await freshFetch()
            setMovie(() => ({...payload,...movie}));
        }else if(payload && payload.success){
            console.log("Using cached data:", payload);
            setMovie(() => ({...payload}));
        }else {
            const movie = await freshFetch()
            setMovie(() => ({...movie}));
        }
    },[safeKeys, id, mutateInsertMovie])

    const imageRing = useCallback(async(payload) => {
        async function freshFetch(){
            const response = await fetch(`${safeKeys.MOVIE_DB}movie/${id}/images?api_key=${safeKeys.API_KEY}`);
            const getImageData = await response.json();
            // console.log(getImageData,"images")
            let value = 0
            const {backdrops, posters, logos} = getImageData
            let path = ''
            let logo = ''
            if(backdrops && backdrops.length > 0){
                value = Math.max(...backdrops.map(({height}) => height))
                let key = backdrops.findIndex(({height}) => height === value)
                if(key > -1){
                    path = backdrops[key].file_path
                }
            } 
            if(posters && posters.length > 0){
                let posters_value = Math.max(...posters.map(({height}) => height))
                if(posters_value > value){
                    let key = posters.findIndex(({height}) => height === posters_value)
                    if(key > -1){
                        path = posters[key].file_path
                    }
                    value = posters_value
                }
            }
            if(logos && logos.length > 0){
                let logos_value = Math.max(...logos.map(({height}) => height))
                let key = logos.findIndex(({height}) => height === logos_value)
                if(logos_value > value){
                    if(key > -1){
                        path = logos[key].file_path
                    }
                }
                let f = logos.findIndex(({iso_639_1}) => iso_639_1 === "en")
                logo = logos[f]?.file_path
            }

            mutateInsertImage({ variables: { meta_data : {
                    type:"movie",
                    season:-1,
                    episode:-1,
                    id:id?parseInt(id):-1
                }, data:{id:getImageData.id,path,logo}                  
            } });
            return {
                path,
                logo
            }
        }         
        try{
            if (payload && payload.success) {
                console.log("image cached data:", payload);
                setImages(() => ({path: payload.data.path, logo:payload.data.logo}))

            }else {
                const imagesObj = await freshFetch()
                // console.log(path,"path")
                setImages(imagesObj)
            }
        
            
        }catch(error){
            console.log(error)
            // const path = await freshFetch()
            // setImages(path)            
        

        }
    },[safeKeys, id, mutateInsertImage])
    const oneRing = useCallback(async() => {
        let count = 0;
        try{
    
            // console.log("movie id", id)
            const fetched = await fetchCombined({
            variables : { 
                    movie: {id},
                    image: {
                        type:"movie",
                        episode:-1,
                        season:-1,
                        id:id?parseInt(id):-1
                    },
                    credit: {
                        id:id?parseInt(id):-1,
                        season:-1,
                        episode:-1
                    }
                }
            })
            console.log(fetched)
            // if(fetched.data.moviePayload.success){
                const imagePayload = fetched.data?.moviePayload?.image
                const moviePayload = fetched.data?.moviePayload?.movie
                const creditPayload = fetched.data?.moviePayload?.credit

                movieRing(moviePayload)
                imageRing(imagePayload)
                creditRing(creditPayload)
            // }
            
        }catch(error){
            console.log(error)
            console.log("reloading...")
            // navigate(0)
            count++
            if(count < 5)
                window.location.reload()
            else{
                Swal.fire({
                    icon: 'error',
                    title: 'Network Error',
                    showConfirmButton: false,
                    timer: 1500
                })
            }
            
        }
    },[fetchCombined, id, movieRing, imageRing, creditRing])

    useEffect(() => {

        if(hasFetched.current)
            return 
        function runID(){
            // console.log(safeKeys,"safe keys")
            if(safeKeys && safeKeys.hasOwnProperty("MOVIE_DB") && safeKeys.MOVIE_DB){
                console.log("running one Ring")
                
                oneRing()
                hasFetched.current = true

            }else{
                console.log("not one ring...")
                console.log("loading keys")
                loadKeys()
                

            }
        }

        runID()
        const controller = new AbortController();
        return () => {
            controller.abort();
        };
    }, [oneRing,safeKeys,loadKeys]);
    // const oneRing = useCallback(async(signal) => {
    //     try{
    
    //         const fetched = await fetchCombined({
    //             variables : { 
    //                 movie: {id},
    //                 image: {
    //                     type:"movie",
    //                     episode:-1,
    //                     season:-1,
    //                     id:id?parseInt(id):-1
    //                 },
    //                 credit: {id:id?parseInt(id):0}
    //             },
    //             context: { fetchOptions: { signal } } // allow network abortion
    //         })
    //         // if(fetched.data.moviePayload.success){
    //             const imagePayload = fetched.data?.moviePayload?.image
    //             const moviePayload = fetched.data?.moviePayload?.movie
    //             const creditPayload = fetched.data?.moviePayload?.credit

    //             movieRing(moviePayload)
    //             imageRing(imagePayload)
    //             creditRing(creditPayload)
    //         // }
            
    //     }catch(error){
    //         console.log(error)
            
    //     }
    // },[fetchCombined, id])

    // useEffect(() => {
    //     // const controller = new AbortController();
    //     // oneRing(controller.signal).catch(err => {
    //     //     if (err && err.name === 'AbortError') return;
    //     //     console.error("oneRing outer error", err);
    //     // });
    //     // return () => {
    //     //     controller.abort();
    //     // };
    //     if(!safeKeys.MOVIE_DB)
    //         return 
    //     const controller = new AbortController();
    //     oneRing(controller.signal).catch(err => {
    //         if (err && err.name === 'AbortError') return;
    //         console.error("oneRing outer error", err);
    //     });
    //     return () => {
    //         try { controller.abort(); } catch(e) { /* ignore */ }
    //     };
    // }, [oneRing]);

    const addToPlayList = async() => {

        //authentication
        const res = await fetch(process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_API_URL : process.env.REACT_APP_API_URL_LIVE,{credentials: "include"})
        const {status, user} = await res.json()
        if(status){
            fetch(`${process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_INSERT_PLAYLIST : process.env.REACT_APP_INSERT_PLAYLIST_LIVE}`,{
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                // signal:controller.signal,
                body:JSON.stringify({id:movie.id, user, type:"movie"})
            })
            .then(res => res.json())
            .then(({status}) => {
                if(status){
                    Swal.fire({
                        icon: 'success',
                        title: 'Added to playlist',
                        showConfirmButton: false,
                        timer: 1500
                    })

                    
                }else{
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: "Already in playlist",
                        showConfirmButton: false,
                        timer: 1500
                    })
                }
                setPlaylist(() => true)
            })
        }else{
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: "Sign in to add to playlist",
                showConfirmButton: false,
                timer: 1500
            })
        }

    }

    // reaction: from "Start a reaction" - the player then opens the reaction set-up (speed.jsx startParty)
    const openPlay = async(reaction = false) => {
        //PRD #11: a reaction plays the title's own UKO copy - movie.url - never a stream found elsewhere
        if(reaction && !(movie && movie.url)) return reactionNeedsUpload()

        async function goTOSPEED(){
            function getCurrentWeek() {
                const now = new Date();
                const startOfYear = new Date(now.getFullYear(), 0, 1);
                const pastDaysOfYear = (now - startOfYear) / 86400000;
                return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
            }

            // Usage:
            const currentWeek = getCurrentWeek();            
            if(movie && movie.url && movie.url.quality === "CAM" && currentWeek > movie.url.week){
                // document.location.href = `/video/movie/${movie.id}/${movie.title || movie.original_title}/${movie.release_date.substring(0,4)}/${movie.release_date}/${movie.imdb_id}${images}`;
                navRoute({
                    // ref:"movie",
                url:`/video/movie`,
                state:{
                    stream:"movie",
                    id:movie.id,
                    name:movie.title || movie.original_title,
                    background:images,
                    date:movie.release_date,
                    year:movie.release_date.substring(0,4),
                    imdbId:movie.imdb_id,
                    anime:movie.genres ? movie.genres.find(({id}) => id === 16):movie.genre_ids?movie.genre_ids.includes(16):false,
                }})
            }else if(checkURL && checkURL.quality === "CAM" && currentWeek > checkURL.week){
                navRoute({
                    // ref:"movie",
                url:`/video/movie`,
                state:{
                    stream:"movie",
                    id:movie.id,
                    name:movie.title || movie.original_title,
                    background:images,
                    date:movie.release_date,
                    year:movie.release_date.substring(0,4),
                    imdbId:movie.imdb_id,
                    anime:movie.genres ? movie.genres.find(({id}) => id === 16):movie.genre_ids?movie.genre_ids.includes(16):false,
                }})
            }else{
                async function authentication(){
                    const res = await fetch(process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_API_URL : process.env.REACT_APP_API_URL_LIVE,{credentials: "include"})
                    const {status,user} = await res.json()
                    // console.log(message)
                    return ({status,user})
                }
                const isLoggedIn = await authentication()
                let hasCredits = false
                let hasPaid = false
                let user;
                if(isLoggedIn.status){
                    user = isLoggedIn.user

                    const response = await fetch(`${process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_USER_PAID : process.env.REACT_APP_USER_PAID_LIVE}`,{
                        credentials: "include",
                        method:"POST",
                        headers:{
                            "Content-Type":"application/json",
                            "Accept":"application/json"
                        },
                        // signal:controller.signal,
                        body:JSON.stringify({
                            id
                        })
                    })

                    const response_data = await response.json()
                    console.log(response_data.message)

                    if(response_data.status){
                        hasPaid = true
                        Swal.fire({
                            icon: 'success',
                            title: 'rent paid',
                            text: response_data.message,
                            showConfirmButton: false,
                            timer: 2500
                        })
                    }else if(response_data.message === "day for movie credits ended"){
                        Swal.fire({
                            icon: 'error',
                            title: 'rent elapsed',
                            text: response_data.message,
                            showConfirmButton: false,
                            timer: 1500
                        })
                    }

                    const res = await fetch(process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_CHECK_USER_CREDITS : process.env.REACT_APP_CHECK_USER_CREDITS_LIVE,{credentials: "include"})
                    const {sum} = await res.json()
                    // console.log(message)
                    //affordable for one movie | episode
                    if(sum && sum > 49){
                        hasCredits = true
                    }
                }else{
                    user = localStorage.getItem("session")
                    const res = await fetch(`${process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_PAID : process.env.REACT_APP_PAID_LIVE}`,{
                        method:"POST",
                        headers:{
                            "Content-Type":"application/json",
                            "Accept":"application/json"
                        },
                        // signal:controller.signal,
                        body:JSON.stringify({
                            user,
                            id
                        })
                    })

                    const res_data = await res.json()
                    // console.log(res_data.message)
                    if(res_data.status){
                        hasPaid = true
                        Swal.fire({
                            icon: 'success',
                            title: 'rent paid',
                            text: res_data.message,
                            showConfirmButton: false,
                            timer: 2500
                        })
                    }else if(res_data.message === "day for movie credits ended"){
                        Swal.fire({
                            icon: 'error',
                            title: 'rent elapsed',
                            text: res_data.message,
                            showConfirmButton: false,
                            timer: 1500
                        })
                    }

                    const response = await fetch(`${process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_CHECK_REPORT_CREDITS : process.env.REACT_APP_CHECK_REPORT_CREDITS_LIVE}`,{
                        method:"POST",
                        headers:{
                            "Content-Type":"application/json",
                            "Accept":"application/json"
                        },
                        // signal:controller.signal,
                        body:JSON.stringify({
                            user

                        })
                    })
                    const {sum,message} = await response.json()
                    console.log(message)
                    //affordable for one movie | episode
                    if(sum && sum > 49){
                        hasCredits = true
                    }
                }

                if(!hasCredits && !hasPaid){
                    noCreditsAlert(isLoggedIn.status)
                    return 
                }
                // document.location.href = `/speed/${movie.url.fileName}${images}/${movie.id}/movie`
                navRoute({
                    ref:"speed",
                url:`/speed`,
                state:{
                    stream:"movie",
                    id:movie.id,
                    name:movie.title || movie.original_title,
                    background:images,
                    dash:movie.url.hasOwnProperty("dash")?true:false,
                    anime:movie.genres ? movie.genres.find(({id}) => id === 16):movie.genre_ids?movie.genre_ids.includes(16):false,
                    year:movie.release_date.substring(0,4),
                    date:movie.release_date,
                    imdbId:movie.imdb_id,
                    startParty:reaction
                }})                
            }            
        }
        if(movie && movie.hasOwnProperty("url") && movie.url){
            await goTOSPEED()
            
        }else if(checkURL){
            await goTOSPEED()
        }else if(movie && movie.hasOwnProperty("player") && movie.player){
            const response = await fetch(`${process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_PLAY : process.env.REACT_APP_PLAY_LIVE}`,{
                method:"POST",
                headers:{
                    "Content-Type":"application/json",
                    "Accept":"application/json"
                },
                
                body:JSON.stringify({
                    token:movie.player.token,
                    id:movie.id,
                    index:movie.player.index,
                    quality:movie.player.quality,
                    stream:movie.player.stream,
                    size:movie.player.size,
                })
            })
            const {status} = await response.json()
            if(status){
                console.log("ready to play")
                navRoute({url:`/play`,
                    state:{
                        id:movie.id,
                        // url,
                        index:movie.player.index,
                        type:movie.player.type,
                        // token:movie.player.token,
                        // quality:movie.player.quality,
                        // size:movie.player.size,
                        // stream:movie.player.stream,
                        background:images,
                        player:true,
                        year:movie.release_date.substring(0,4),
                        date:movie.release_date,
                        imdbId:movie.imdb_id,
                        // seasons,
                        // episodes,
                        // serieID,
                        anime:movie.genres ? movie.genres.find(({id}) => id === 16):movie.genre_ids?movie.genre_ids.includes(16):false,
                        serie_name:movie.title || movie.original_title,
                        // season,
                        // episode
                    }
                })
            }
        }else{
            // document.location.href = `/video/movie/${movie.id}/${movie.title || movie.original_title}/${movie.release_date.substring(0,4)}/${movie.release_date}/${movie.imdb_id}${images}`
            // console.log("year",)
            // console.log(movie)
            navRoute({
                // ref:"movie",
                url:`/video/movie`,
                state:{
                    stream:"movie",
                    id:movie.id,
                    name:movie.title || movie.original_title,
                    background:images,
                    year:movie.release_date.substring(0,4),
                    date:movie.release_date,
                    anime:movie.genres ? movie.genres.find(({id}) => id === 16):movie.genre_ids?movie.genre_ids.includes(16):false,
                    imdbId:movie.imdb_id
                }})        
        }
    }

    useEffect(() => {
        
        async function checkURLFN(){
            const controller = new AbortController();
            const signal = controller.signal;
            try{
                const response = await fetch(`${process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_CHECK_URL : process.env.REACT_APP_CHECK_URL_LIVE}`,{
                    method:"POST",
                    headers:{
                        "Content-Type":"application/json",
                        "Accept":"application/json"
                    },
                    signal,
                    body:JSON.stringify({
                        type:"movie",
                        id
                    })
                })

                const {status,data} = await response.json()
                if(status) setCheckURL(data)
                console.log("creating fast stream...")
            }catch(err){
                if (err.name === 'AbortError') return;
                console.error("checkURLFN error", err);
            } finally {
                // controller local - nothing else
            }
        }

        if(movie && movie.hasOwnProperty("url") && movie.url){
            console.log("no need to check")
        }else
            checkURLFN()

    },[id,movie])

    const navRoute = ({url,state}) => {
        navigate(url,{
            state : {
                ...state
            }
        })
    }
    return (
        <>
        {
            credits && movie  ?
        
            <div className="w-[100%] duration-150 h-[100%] text-white  bg-cover bg-no-repeat bg-center" style={{backgroundImage:`linear-gradient(105deg, #0d0d0d, rgba(0,0,0,0.75), #000, rgba(0,0,0,0.56)),url(${images ? safeKeys.IMG_POSTER + images.path : "/image/logo.png"})`,backgroundPosition:"0% 40%"}}>
                {
                    windowWidth >= DESKTOP_WIDTH ? 
                    <div className="w-[20%] absolute h-[100%]" style={{background:"linear-gradient(85deg, rgba(13, 13, 13, 0.75), rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.56), rgba(0, 0, 0, 0.45))"}}>
                        <NAVBAR data = {movie.original_title || movie.title}/>
                    </div>
                    :
                    <MOBILE/>
                }
        
                <div className={windowWidth >= DESKTOP_WIDTH ? "w-[80%] relative h-[100%] ml-[20%] overflow-y-auto movie-scene":"w-[98%] mx-[1%] h-[100%] overflow-y-auto movie-scene"}>
                    <div className={windowWidth >= DESKTOP_WIDTH ? "w-[100%] min-h-[90%] flex flex-row flex-wrap":"w-[100%] h-[auto]"}>
                        <div 
                            className={windowWidth >= DESKTOP_WIDTH ? "w-[37%] min-h-[100%] shadow background":"w-[100%] h-[auto] m-[0.5%]"} 
                            style={{
                                backgroundImage:"url(" + safeKeys.IMG_POSTER + movie.poster_path + ")",
                                boxShadow:"rgba(0, 0, 0, 0.97) -180px -200px 130px inset, rgba(0, 0, 0, 0.9) 0px 100px 10px, rgba(0, 0, 0, 0.9) 100px 50px 10px"
                                // boxShadow:"rgba(0, 0, 0, 0.97) -180px -200px 130px inset, rgba(6, 4, 4, 0.9) 0px 100px 10px, rgba(0, 0, 0, 0.9) 100px 50px 10px"
                            }}
                        >
                            <div className="backdrop-blur-md w-[100%]">
                                {
                                    windowWidth < DESKTOP_WIDTH && <PICTURE picture={movie?.poster_path} classes={windowWidth >= DESKTOP_WIDTH ? "shadow-lg h-[70%] shadow-[#ffd800]" : "shadow-lg h-[200px] shadow-[#ffd800] object-contain"} />

                                }
                            </div> 
                        </div>
                        <div 
                            style={{
                                boxShadow:"inset 0 0 30px rgba(0,0,0,0.6),0 10px 30px rgba(0,0,0,0.7),0 0 60px rgba(0,0,0,0.5)",
                                //   overflow: "hidden",
                            }}
                            className={windowWidth >= DESKTOP_WIDTH ? "w-[61%] m-[1%] h-[60%] justify-center items-center shadow":"w-[100%] h-[auto]"}>
                                {
                                    images && images.hasOwnProperty("logo") && images.logo ? 
                                        <PICTURE picture={images.logo} classes={"object-contain w-[70%] h-[150px]"} />
                                    :
                                        <h1 className="text-[30px] gradient-text">{movie.original_title || movie.title}</h1>
                                }
                            <p style={{fontStyle:"italic",color:"#ffd800"}}>"{movie.tagline}"</p>
                            <div className={windowWidth >= DESKTOP_WIDTH ? "" : "w-[50%] gap-2 flex flex-col flex-wrap items-left justify-items-center"}>
                                <h3>{movie.release_date}</h3>
                                {
                                    movie?.revenue && (
                                        <>
                                            <h2>Revenue</h2>
                                            <p>${movie.revenue}</p>                                            
                                        </>

                                    )
                                }
                                {
                                    movie?.budget && (
                                        <>
                                            <h2>Budget</h2>
                                            <p>${movie.budget}</p>                                            
                                        </>
                                    )
                                }
                                <p style={{fontStyle:"italic"}}>{movie?.status}</p>
                                {/* <h3>{movie.video ? "available":"CAM"}</h3> */}
                                <p className="text-[#ffd800]"><FontAwesomeIcon icon={faStar} style={{ fontSize: '30px' }} /> {movie.vote_average.toFixed(1)}/10</p>
                            </div>
                            <div className="w-[100%]">
                                <h4>{ (movie.runtime > 60) ? (Math.floor(movie.runtime / 60)) + " h " + (movie.runtime % 60) + " min" : movie.runtime + " min" }</h4>
                                {
                                    generateGenre && generateGenre.length > 0 ?
                                        generateGenre.map(({name}) => name).join(" || ")
                                    :
                                    movie.genres.map(({name},index) => (
                                        <span className="gradient-text" key={index}>
                                            {name}{index < movie.genres.length -1 ? " || " : ""}
                                        </span>
                                    ))
                                }
                                {
                                    movie && movie.hasOwnProperty("url") && movie.url && movie.url.hasOwnProperty("quality") && movie.url.quality && <h3 className="text-[#ffd800]">{movie.url.quality}</h3>
                                }
                                {
                                    checkURL && checkURL.hasOwnProperty("quality") && checkURL.quality && <h3 className="text-[#ffd800]">{checkURL.quality}</h3>
                                }
                                {
                                    ((movie && movie.hasOwnProperty("url") && movie.url) || checkURL) ? <p>fast stream</p> : <p>slow stream</p>
                                }
                            </div>
                            <article>
                                {movie.overview || "waiting for more content"}
                                <div style={{overflow:"hidden",margin:"5px"}}>
                                    <ins
                                        className="adsbygoogle"
                                        style={{display:"block",width:"100%",height:"auto"}}
                                        data-ad-client="ca-pub-8036256488117651"
                                        data-ad-slot="1234567890"
                                        data-ad-format="auto"
                                        data-full-width-responsive="true"
                                    ></ins>
                                </div>
                            </article>
                            <h2>{movie.origin_country && movie.origin_country[0]} || {movie.original_language}</h2>
                            {
                                movie.production_companies && movie.production_companies.length > 0 &&
                                <div>
                                    <h3>Production Companies</h3>
                                    <div className="flex flex-row gap-3 flex-wrap">
                                        {
                                            movie.production_companies.map(({name,id},index) => (
                                                <div key={index} className='bg-gray-600 text-white p-1 rounded-md text-[9px]'>{name}</div>
                                            ))
                                        }
                                    </div>
                                </div>
                            }
                            <h1 className="gradient-text">{movie.status}</h1>
                            <div className="w-[100%]">
                                
                                <button
                                    onClick={() => navRoute({
                                        url:`/movies/trailer/`,
                                        state:{
                                            stream:"movie",
                                            title:movie.title,
                                            id:movie.id,
                                            background:images
                                        }})}
                                    // style={{background:"radial-gradient(circle,#FFD800 0%, #005B6E 100%)"}} 
                                    className={windowWidth >= DESKTOP_WIDTH ? "w-[23%] text-[#fff] text-[12px] active rounded-md bg-red-950 border-2 border-[#fff] text-center h-[40px] ":"w-[48%] bg-red-950 border-2 border-[#fff] active text-[10px] mt-1 ml-1 text-center h-[40px] underline"}
                                >
                                    {/* <img src="/image/2503508.png" alt="UKOapp" className="w-[50%]"/> */}
                                    <h2>trailers</h2>
                                </button>
                                {needsPhone && <PHONEPROMPT className="m-[1%]" />}
                                {
                                    layouts && 
                                    (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => openPlay()}
                                                className={windowWidth >= DESKTOP_WIDTH ? "text-[#ffd800] text-[20px] w-[15%] underline text-center min-h-[30px]  ml-2":"text-[#ffd800] text-[20px] w-[48%]  ml-2 text-center justify-center h-[30px] rounded-full"}
                                            >
                                                <span className="default-text">
                                                    {/* play  */}
                                                    <FontAwesomeIcon icon={faPlayCircle} />
                                                </span>
                                            </button>
                                            {/* PRD #11: the player opens with the reaction set-up showing */}
                                            {movie && movie.url && <REACTIONBUTTON desktop={windowWidth >= DESKTOP_WIDTH} onClick={() => openPlay(true)} />}
                                        </>                                            
                                    )
                                }
                                
                                <button
                                    onClick={() => navRoute({
                                        url:`/movies/similar`,
                                        state:{
                                            stream:"movies",
                                            id:movie.id,
                                            background:images
                                        }})}
                                    className={windowWidth >= DESKTOP_WIDTH ? "w-[23%] text-[#fff] text-[12px] active rounded-md bg-red-950 border-2 border-[#fff] text-center h-[40px]  ml-1":"w-[48%] ml-1 bg-red-950 border-2 border-[#fff] active text-[10px] mt-1 text-center h-[40px] underline"}
                                >
                                    <h2>similar movies</h2>
                                </button>
                                
                                <button
                                    onClick={() => navRoute({
                                        url:`/movies/recommendations`,
                                        state:{
                                            stream:"movies",
                                            id:movie.id,
                                            background:images
                                        }})}
                                    className={windowWidth >= DESKTOP_WIDTH ? "w-[23%] text-[#fff] text-[12px] active rounded-md bg-red-950 border-2 border-[#fff] text-center h-[40px]  ml-1":"w-[48%] ml-1 bg-red-950 border-2 border-[#fff] active text-[10px] mt-1 text-center h-[40px] underline"}
                                >
                                    <h2>recommended movies</h2>
                                </button>
                                <div className="w-[100%]">
                                    <button
                                        type="button"
                                        className="w-[98%] rounded-md mt-[1%] ml-[1%] h-[50px] bg-[#ffd800] text-black font-bold hover:bg-[#ffd800]/80 duration-200"
                                        onClick={() => addToPlayList()}
                                    >
                                        {
                                            playlist ? 
                                                <>
                                                    <FontAwesomeIcon icon={faBasketShopping} /> <span>Added to Playlist</span>
                                                </>
                                            :
                                                <>
                                                    <FontAwesomeIcon icon={faCirclePlus} /> Add to Playlist
                                                </>
                                                
                                        }
                                        
                                    </button>
                                </div>
                            </div>
                        </div>                          
                    </div>
                    {
                        credits.cast && credits.cast.length > 0 &&
                        <div className={windowWidth >= DESKTOP_WIDTH ? "w-[90%] h-[420px] mx-[5%] my-[2%]":"w-[100%] h-[auto] my-[2%]"}>

                            <h1 style={{textAlign:"left",textDecoration:"underline"}}>CASTS</h1>
                            {/* <SWEETPAGE intitializeMovies={intitializeMovies} page={page} index={{index,api,page}} total_pages={total_pages}/> */}

                            <div className={`w-[100%] duration-50 movie-scene ${windowWidth >= DESKTOP_WIDTH ? "h-[400px]" : "h-[200px]"} flex flex-col flex-wrap overflow-x-auto overflow-y-hidden my-[1%]${shortRow(credits.cast)}`}>
                                
                                {
                                    credits.cast.map(({character,profile_path,popularity,original_name,name,media_type,known_for_department,id,gender,adult},people_key) => 
                                        <div 
                                            key={people_key} 
                                            onClick={() => navRoute({
                                                url:`/people/id`,
                                                state:{
                                                    id
                                                }})}  
                                            className={windowWidth >= DESKTOP_WIDTH ? "cursor-pointer w-[25%] h-[100%] hover:scale-115 duration-700 hover:contrast-150":"cursor-pointer w-[40%] hover:scale-115 duration-700 h-[100%] m-[0.5%] hover:contrast-150"}>
                                            <div className="w-[100%] h-[100%]">
                                                <PICTURE picture={profile_path} classes={windowWidth >= DESKTOP_WIDTH ? "object-cover h-[100%]":"object-cover h-[100%] rounded-xl"} />
                                                <div className="w-[100%] relative min-h-[60px] top-[-50%] bg-[rgba(0,0,0,0.75)] bg-opacity-60 text-white flex flex-col items-center justify-center">
                                                    <h2 className={windowWidth >= DESKTOP_WIDTH ? "text-[15px] font-bold":"text-[12px] font-bold"}>{name ? name : original_name ? original_name : name}</h2>
                                                    <p style={{color:"#ffd800"}}><FontAwesomeIcon icon={faStar} /> {popularity && parseFloat(popularity).toFixed(2)}</p>
                                                    <h3 style={{fontStyle:"italic"}}>{character}</h3>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }
                            </div>
                        </div>
                    }
                    {/* {
                        credits.crew && credits.crew.length > 0 &&
                        <div className={windowWidth >= DESKTOP_WIDTH ? "w-[90%] h-[420px] mx-[5%] my-[2%]":"w-[100%] h-[220px] my-[2%]"}>

                            <h1 style={{textAlign:"left",textDecoration:"underline"}}>CREW</h1>

                            <div className={`w-[100%] duration-50 movie-scene ${windowWidth >= DESKTOP_WIDTH ? "h-[400px]" : "h-[200px]"} flex flex-col flex-wrap overflow-x-auto overflow-y-hidden my-[1%]${shortRow(credits.crew)}`}>
                                
                                {
                                    credits.crew.map(({job,profile_path,popularity,original_name,name,media_type,known_for_department,id,gender,adult},people_key) => 
                                        <div 
                                            key={people_key} 
                                            onClick={() => navRoute({
                                                url:`/movies/person`,
                                                state:{
                                                    id
                                                }})} 
                                            className={windowWidth >= DESKTOP_WIDTH ? "cursor-pointer w-[25%] h-[100%] hover:scale-115 duration-700 hover:contrast-150":"cursor-pointer w-[40%] hover:scale-115 duration-700 h-[100%] m-[0.5%] hover:contrast-150"}>
                                            <div className="w-[100%] h-[100%]">
                                                <PICTURE picture={profile_path} classes={windowWidth >= DESKTOP_WIDTH ? "object-cover h-[100%]":"object-cover h-[100%] rounded-xl"} />
                                                <div className="w-[100%] relative min-h-[60px] top-[-50%] bg-[rgba(0,0,0,0.75)] bg-opacity-60 text-white flex flex-col items-center justify-center">
                                                    <h2 className="text-[15px] font-bold">{name ? name : original_name ? original_name : name}</h2>
                                                    <p style={{color:"#ffd800"}}><FontAwesomeIcon icon={faStar} /> {popularity && parseFloat(popularity).toFixed(2)}</p>
                                                    <h3>{job}</h3>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }
                            </div>
                        </div>
                    } */}
                    {/* <div className="w-[90%] duration-50 mx-[5%] mt-[1%] movie-scene flex flex-row min-h-[100%] flex-wrap">
                        {
                            Object.entries(images).map(([key,value],node) => 
                                value && typeof(value) === "object" && value.map(({file_path},index) => 
                                    <div className="m-[0.5%] w-[48%] h-[50%]" key={node  index}>
                                        <PICTURE picture={file_path} classes={"object-contain h-[100%]"} />
                                    </div>
                                )
                            )
                        }

                    </div> */}
                    <COMMENTS type="movie" id={id} windowWidth={windowWidth} />
                </div>

            </div>
            :
        <LOAD/>
        }       
        </>

    )
}

export default MOVIE
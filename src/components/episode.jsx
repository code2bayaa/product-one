import { shortRow } from "../midlleware/shortRow"
import NAVBAR from "./nav"
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback, useRef } from "react";
import PICTURE from "../midlleware/picture";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlayCircle, faStar, faBasketShopping, faCirclePlus } from "@fortawesome/free-solid-svg-icons";
import { useMutation, useLazyQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import LOAD from "../midlleware/load";
import MOBILE from "./mobileBar";
import Swal from "sweetalert2";
import { useKeys } from "./safe";
import { usePlayGate, PHONEPROMPT } from "./access";
import { noCreditsAlert } from "../midlleware/noCredits";
import { useWindowWidth, DESKTOP_WIDTH } from "../hooks/useWindowWidth";
const EPISODE = () => {
    const [checkURL, setCheckURL] = useState(null)
    const {safeKeys,loadKeys} = useKeys()
    const { allowed: layouts, needsPhone } = usePlayGate(safeKeys?.GEO)
    // const [state,setState] = useState(null)
    // const router = useRouter()
    // const params = useSearchParams();
    // const state = JSON.parse(decodeURIComponent(params.get("state"))); 
    const hasFetched = useRef({id:false,credits:false,images:false,tv:false})
    // const state = useStates("season")
    const navigate = useNavigate();
    const {state} = useLocation()
    const id = state.id
    const name = state.name
    const episodeID = state.episodeID
    const season = state.season
    const episode = state.episode
    const background = state.background
    const anime = state.anime
    // const moveEpisodes = state.moveEpisodes
    // const moveSeasons = state.moveSeasons    
    // const client = useApolloClient();

    // useEffect(() => {
    //     setState(() => JSON.parse(localStorage.getItem("season")))
    // },[])

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
    const [serie, setSerie] = useState(null);
    const [images,setImages] = useState(null)
    const [credits,setCredit] = useState(null)
    const [imdb,setIMDB] = useState(null)
    const windowWidth = useWindowWidth()
    const [playlist,setPlaylist] = useState(null)

    const FETCH_IMAGE_QUERY = gql`
        query Image (
            $type: String!
            $season: Int!
            $episode: Int! 
            $id : ID! 
        ){
            image(
                type:$type,
                episode:$episode,
                season:$season,
                id:$id
            ) {
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
        }
    `
    const [fetchImage] = useLazyQuery(FETCH_IMAGE_QUERY,{
        notifyOnNetworkStatusChange: true,
        fetchPolicy: 'cache-first',
    })

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
            if (data && data.addImage.success) {
                // Refetch the query to get updated data
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


    const FETCH_MOVIE_QUERY = gql`
        query Episode (
            $id: Int!
        ){
            episode(
                id:$id
            ) {

                air_date
                episode_number
                episode_type
                id
                name
                overview
                production_code
                runtime
                season_number,
                url {
                    fileName
                    week
                    quality
                }
                player {
                    type
                    index
                    token
                    quality
                    size
                    stream
                }
                imdb_id
                still_path
                vote_average
                vote_count
                success
            }
        }
    `
    const [fetchEpisode] = useLazyQuery(FETCH_MOVIE_QUERY,{
        // pollInterval: 500, // fetches new data at that interval
        notifyOnNetworkStatusChange: true,
        // fetchPolicy: 'cache-first',
        fetchPolicy: 'network-only'
        // variables,
        // skip: !variables.page, // Skip query execution if variables are not set
    });
    // useEffect(() => {
    //     const invalidateCache = () => {
    //         console.log("Invalidating Apollo Client cache");
    //         client.refetchQueries({
    //             include: [FETCH_MOVIE_QUERY] // Refetch all queries using this query
    //         });
    //         // client.resetStore(); // Alternative: Clears the entire cache (more aggressive)
    //     };

    //     // Set up the timer to invalidate the cache after 24 hours
    //     const timerId = setTimeout(invalidateCache, 86400000); // 24 hours in milliseconds

    //     // Clear the timer when the component unmounts to prevent memory leaks
    //     return () => clearTimeout(timerId);
    // }, [client,FETCH_MOVIE_QUERY]); // 

    const INSERT_MOVIE_MUTATION = gql`
        mutation AddEpisode(
            $single:COLLECT_EPISODE_INPUT
        ) {
            addEpisode(
                single:$single
            ) {
                success
                message
            }
        }
    `;

    const [mutateInsertTV] = useMutation(INSERT_MOVIE_MUTATION, {
        onCompleted: (data) => {
            console.log(data.addEpisode,"checking insert...")
            if (data.addEpisode.success) {
                if(data.addEpisode.message === "already inserted")
                    console.log("episode inserting already started...")
                console.log("Movie successfully inserted into MySQL:", data.addEpisode.message);
                // fetchedMovieData.refetch()
                // .then(status => console.log(status,"status"))
                // fetchedMovieData.refetch().then((refetched) => {
                //     console.log(refetched)
                //     if(refetched.data.episode.success){
                //         const ref = refetched?.data?.episode
                //         const typeGetImageData = {...ref}
                //         setCredit(() => ({...typeGetImageData}))
                //     }

                // })                
            } else {
                console.error("Failed to insert movies into MySQL:", data.addEpisode.message, data.addEpisode.error);
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

    const FETCH_CREDITS_QUERY = gql`
        query Credits (
            $id: Int!
            $season: Int!
            $episode: Int!
        ){
            credits(
                id:$id
                season:$season
                episode:$episode
            ) {
                cast {
                    roles {
                        credit_id
                        character
                        episode_count
                    }
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
                    total_episode_count
                    order
                }
                crew {
                    jobs {
                        credit_id
                        job
                        episode_count
                    }
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
                    total_episode_count
                    order
                    department
                }    
                guest_stars {
                    character
                    credit_id
                    order
                    adult
                    gender
                    id
                    known_for_department
                    name
                    original_name
                    popularity
                    profile_path
                }
                success
                error
                message
            }
        }
    `
    const [fetchCreditsData] = useLazyQuery(FETCH_CREDITS_QUERY,{
    // pollInterval: 500, // fetches new data at that interval
        notifyOnNetworkStatusChange: true,
        fetchPolicy: 'cache-first',
    });

    // useEffect(() => {
    //     const invalidateCache = () => {
    //         console.log("Invalidating Apollo Client cache");
    //         client.refetchQueries({
    //             include: [FETCH_CREDITS_QUERY] // Refetch all queries using this query
    //         });
    //         // client.resetStore(); // Alternative: Clears the entire cache (more aggressive)
    //     };

    //     // Set up the timer to invalidate the cache after 24 hours
    //     const timerId = setTimeout(invalidateCache, 86400000); // 24 hours in milliseconds

    //     // Clear the timer when the component unmounts to prevent memory leaks
    //     return () => clearTimeout(timerId);
    // }, [client,FETCH_CREDITS_QUERY]); //

    const INSERT_CREDITS_MUTATION = gql`
        mutation AddCredits(
            $id:Int!
            $season:Int!
            $episode:Int!
            $cast:[CAST_INPUT]
            $guest_stars:[GUEST_INPUT]
            $chunking:Boolean!
            $chunking_index:Int!            
        ) {
            addCredits(
                id:$id
                season:$season
                episode:$episode
                cast:$cast
                guest_stars:$guest_stars
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
            if (data && data.addCredits.success) {
                // Refetch the query to get updated data
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

    const FETCH_IMDB_QUERY = gql`
        query IMDB(
            $id: Int!
            $season_number: Int
            $episode_number: Int
        ){
            imdb(
                id:$id
                season_number:$season_number
                episode_number:$episode_number
            ){
                id
                imdb_id
                success
                error
                message
            }
        }
    `
    const [fetchIMDBData] = useLazyQuery(FETCH_IMDB_QUERY,{
        notifyOnNetworkStatusChange: true,
        fetchPolicy: 'cache-first',
    });

    const UPDATE_IMDB_MUTATION = gql`
        mutation UpdateIMDB(
            $id:Int!
            $external_ids:EXTERNAL_INPUT
            $season_number:Int
            $episode_number:Int
        ) {
            updateIMDB(
                id:$id
                external_ids:$external_ids
                season_number:$season_number
                episode_number:$episode_number
            ) {
                success
                message
            }
        }
    `;

    const [mutateUpdateIMDB] = useMutation(UPDATE_IMDB_MUTATION, {
        onCompleted: (data) => {
            if (data && data.updateIMDB.success) {
                // Refetch the query to get updated data
                // fetchedIMDB.refetch().then((refetched) => {
                //     console.log(refetched)
                //     if(refetched.data.imdb.success){
                //         const ref = refetched?.data?.imdb
                //         const typeGetImageData = {...ref}
                //         setCredit(() => ({...typeGetImageData}))
                //     }

                // })

            } else {
                console.error("Failed to insert credits into MySQL:", data.updateIMDB.message, data.updateIMDB.error);
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

    const graphImages = useCallback(async() => {

        async function freshFetch(){
            const response = await fetch(`${safeKeys.MOVIE_DB}tv/${id}/season/${season}/episode/${episode}/images?api_key=${safeKeys.API_KEY}`);
            const getImageData = await response.json();
            console.log(getImageData,"images")
            let value = 0
            const {stills, logos} = getImageData
            let path = ''
            let logo = ''
            if(stills && stills.length > 0){
                value = Math.max(...stills.map(({height}) => height))
                let key = stills.findIndex(({height}) => height === value)
                if(key > -1){
                    path = stills[key].file_path
                }
            } 

            if(logos && logos.length > 0){
                let logos_value = Math.max(...logos.map(({height}) => height))
                let key = logos.findIndex(({height}) => height === logos_value)
                if(key > -1){
                    logo = logos[key].file_path
                }
            }

            mutateInsertImage({ variables: { meta_data : {
                    type:"tv",
                    season:season?parseInt(season):-1,
                    episode:episode?parseInt(episode):-1,
                    id:id?parseInt(id):-1
                }, data:{id:getImageData.id,path,logo}                  
            } });
            return {path,logo}
        }         
        try{
            const fetched = await fetchImage({
                variables : {
                type:"tv",
                episode:episode?parseInt(episode):-1,
                season:season?parseInt(season):-1,
                id:id?parseInt(id):-1
            }})
            console.log(fetched)
            if (fetched.data && fetched.data.image.success) {
                console.log("image cached data:", fetched.data);
                setImages(() => ({path: fetched.data.image.data.path,logo: fetched.data.image.data.logo}))

            }else {
                const path = await freshFetch()
                setImages(path)
            }
        
            
        }catch(error){
            console.log(error, "image error")
            // const path = await freshFetch()
            // setImages(path)            
        

        }
    },[mutateInsertImage,id,season,episode, safeKeys, fetchImage])

    const fetchCredits = useCallback(async() => {

        if(!id || season < 0 || episode < 0){
            console.log("Missing parameters for credits fetch")
            return
        }
        async function freshFetch(){
            const response = await fetch(`${safeKeys.MOVIE_DB}tv/${id}/season/${season}/episode/${episode}/credits?api_key=${safeKeys.API_KEY}`);
            const credits_data = await response.json();
            // console.log(credits_data)
            let cast_all_results = credits_data.hasOwnProperty("cast") ? [...credits_data.cast] : [];
            let guest_stars_all_results = credits_data.hasOwnProperty("guest_stars") ? [...credits_data.guest_stars] : [];
            
            
            // if(cast_all_results.length > 100){
            //     const chunks = chunkArray(cast_all_results, 100);
            //     for (let i = 0; i < chunks.length; i++) {
            //         mutateInsertCredits({
            //             variables: {
            //                 cast:chunks[i],
            //                 id:id?parseInt(id):-1,
            //                 season:season?parseInt(season):-1,
            //                 episode:episode?parseInt(episode):-1,
            //                 chunking:true,
            //                 chunking_index:i
            //             },
            //         });
            //     }
            // }else{

            // }
            try{
                mutateInsertCredits({
                    variables: {
                        cast:cast_all_results,
                        guest_stars:guest_stars_all_results,
                        id:id?parseInt(id):-1,
                        season:season?parseInt(season):-1,
                        episode:episode?parseInt(episode):-1,                        
                        chunking:false,
                        chunking_index:0
                    },
                });
            }catch(error){
                console.log(error,"credits error")
            }
            // if(guest_stars_all_results.length > 100){
            //     const chunks = chunkArray(guest_stars_all_results, 100);
            //     for (let i = 0; i < chunks.length; i++) {
            //         mutateInsertCredits({
            //             variables: {
            //                 guest_stars:chunks[i],
            //                 id:id?parseInt(id):-1,
            //                 season:season?parseInt(season):-1,
            //                 episode:episode?parseInt(episode):-1,
            //                 chunking:true,
            //                 chunking_index:i
            //             },
            //         });
            //     }
            // }else{
            //     mutateInsertCredits({
            //         variables: {
            //             guest_stars:guest_stars_all_results,
            //             id:id?parseInt(id):-1,
            //             season:season?parseInt(season):-1,
            //             episode:episode?parseInt(episode):-1,
            //             chunking:false,
            //             chunking_index:0
            //         },
            //     });
            // }
            // let crew_all_results = [...credits_data.crew]
            // if(crew_all_results.length > 100){
            //     const chunks = chunkArray(crew_all_results, 100);
            //     for (let i = 0; i < chunks.length; i++) {
            //         mutateInsertCredits({
            //             variables: {
            //                 crew:chunks[i],
            //                 id:id?parseInt(id):0,
            //                 chunking:true,
            //                 chunking_index:i                        
            //             },
            //         });
            //     }
            // }else{
            //     mutateInsertCredits({
            //         variables: {
            //             crew:crew_all_results,
            //             id:id?parseInt(id):0,
            //             chunking:false,
            //             chunking_index:0                    
            //         },
            //     });
            // }
            return {...credits_data}
        } 
        try{
            const fetched = await fetchCreditsData({
                variables : { id:id?parseInt(id):0, season:parseInt(season), episode:parseInt(episode) }})
            // console.log(fetched)
            if(fetched.data && fetched.data.credits.success){
                console.log("Using cached data:", fetched.data);
                setCredit(() => ({...fetched.data.credits}));
            }else {
                const credits = await freshFetch()
                setCredit(() => ({...credits}));
            }
        }catch(error){
            console.log(error,"credits error")
            // const credits = await freshFetch()
            // setCredit(() => ({...credits}));
        }

        

    },[id, season, episode, safeKeys, mutateInsertCredits, fetchCreditsData])

    const fetchID = useCallback(async() => {
        if(!imdb){
            async function freshFetch(){
                const response = await fetch(`${safeKeys.MOVIE_DB}tv/${id}/season/${season}/episode/${episode}/external_ids?api_key=${safeKeys.API_KEY}`);
                const imdb_data = await response.json();
                // console.log(imdb_data,"imdb")
                mutateUpdateIMDB({
                    variables: {
                        external_ids:{
                            id:imdb_data.id,
                            imdb_id:imdb_data.imdb_id,
                            freebase_mid:imdb_data.freebase_mid,
                            freebase_id:imdb_data.freebase_id,
                            tvdb_id:imdb_data.tvdb_id,
                            tvrage_id:imdb_data.tvrage_id != null ? String(imdb_data.tvrage_id) : null,
                            wikidata_id:imdb_data.wikidata_id
                        },
                        id:id?parseInt(id):0,
                        season_number:parseInt(season),
                        episode_number:parseInt(episode)
                    },
                });
                return {...imdb_data}
            } 
            try{
                const current_date = new Date().toISOString().split("T")[0]
                const fetched = await fetchIMDBData({
                    variables : { id:id?parseInt(id):0, season_number:parseInt(season), episode_number:parseInt(episode), date:current_date }})
                console.log(fetched)
                if(fetched.data && fetched.data.imdb.success){
                    console.log("Using cached data:", fetched.data);
                    setIMDB(() => ({...fetched.data.imdb}));
                }else {
                    const imdb = await freshFetch()
                    setIMDB(() => ({...imdb}));
                }
            }catch(error){
                console.log(error,"error")
                const imdb = await freshFetch()
                setIMDB(() => ({...imdb}));
            }

        }

    },[id, season, episode, safeKeys, mutateUpdateIMDB, imdb, fetchIMDBData])

    const fetchTV = useCallback(async() => {

        async function freshFetch(){
            const response = await fetch(`${safeKeys.MOVIE_DB}tv/${id}/season/${season}/episode/${episode}?api_key=${safeKeys.API_KEY}`);
            const data = await response.json();
            const newData = {...data}
            delete newData.crew
            delete newData.guest_stars
            delete newData.cast
            // newData.episodes = newData.episodes.map(({crew,guest_stars,cast, ...rest}) => rest)
            // console.log(newData,"newData")
            mutateInsertTV({
                variables: {
                    single : {...newData}
                },
            });
            return {...data}
        } 

        const checkFeedback = (id) => {
            console.log(id,"id")
            //authentication
            fetch(process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_API_URL : process.env.REACT_APP_API_URL_LIVE,{credentials: "include"})
            .then(async res => {
                const {status, user} = await res.json()
                if(status){
                    fetch(`${process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_PLAYLIST_SELECT : process.env.REACT_APP_PLAYLIST_SELECT_LIVE}`,{
                        method:"POST",
                        headers:{
                            "Content-Type":"application/json"
                        },
                        body:JSON.stringify({id, episodeID, user, season, episode, type:"episode"})
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
        let count = 0;
        try{
            const fetched = await fetchEpisode({
                variables : { 
                    id:episodeID
                    // season:season ? parseInt(season):-1,
                    // episode: episode? parseInt(episode):-1
                }})
                console.log(fetched)
            if (fetched.data && fetched.data.episode.air_date === null) {
                console.log("first time...")
                const tv = await freshFetch()
                setSerie(() => ({...fetched.data.episode,...tv}));
                checkFeedback(tv.id)
            }else if(fetched.data && fetched.data.episode.success){
                console.log("Using cached data:", fetched.data)
                setSerie(() => ({...fetched.data.episode}))
                checkFeedback(fetched.data.episode.id)
            }else {
                const tv = await freshFetch()
                setSerie(() => ({...tv}))
                checkFeedback(tv.id)
            }
            //accessed window successfully > now go for credits and images
            fetchCredits();
            graphImages();
            fetchID();
        }catch(error){
            console.log(error,"episode error")
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
            // const tv = await freshFetch()
            // setSerie(() => ({...tv}))
            // checkFeedback(tv.id)
        }

    },[id, season, episode, episodeID, mutateInsertTV, safeKeys, fetchCredits, graphImages, fetchID, fetchEpisode])

    useEffect(() => {
        if(hasFetched.current.tv){
            return
        }
        if(safeKeys && safeKeys.hasOwnProperty("MOVIE_DB") && safeKeys.MOVIE_DB){
            hasFetched.current.tv = true 
                
            fetchTV();
        }else{
            loadKeys()
        }
    }, [fetchTV,safeKeys,loadKeys]);

    // useEffect(() => {
    //     if(hasFetched.current.id){
    //         return
    //     }
    //     if(safeKeys && safeKeys.hasOwnProperty("MOVIE_DB") && safeKeys.MOVIE_DB){
    //         hasFetched.current.id = true
    //         fetchID()
    //     }
    // },[fetchID,safeKeys])

    // useEffect(() => {
    //     if(hasFetched.current.images){
    //         return
    //     }
    //     if(safeKeys && safeKeys.hasOwnProperty("MOVIE_DB") && safeKeys.MOVIE_DB){
    //         hasFetched.current.images = true        
    //         graphImages()
    //     }
    // },[graphImages,safeKeys])

    // useEffect(() => {
    //     if(hasFetched.current.credits){
    //         return
    //     }
    //     if(safeKeys && safeKeys.hasOwnProperty("MOVIE_DB") && safeKeys.MOVIE_DB){
    //         hasFetched.current.credits = true        
    //         fetchCredits();
    //     }
    // }, [fetchCredits]);

    const addToPlayList = async() => {

        //authentication
        const res = await fetch(process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_API_URL : process.env.REACT_APP_API_URL_LIVE,{credentials: "include"})
        const {status, user} = await res.json()
        if(status){
            fetch(`${process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_PLAYLIST : process.env.REACT_APP_PLAYLIST_LIVE}`,{
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify({id, episodeID, season:parseInt(season), episode:parseInt(episode), user, type:"episode"})
            })
            .then(res => res.json())
            .then(({status, message}) => {
                if(status){
                    Swal.fire({
                        icon: 'success',
                        title: 'Added to playlist',
                        showConfirmButton: false,
                        timer: 1500
                    })

                    setPlaylist(() => true)
                }else if(message === "Playlist already exists for this user"){
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: "Already in playlist",
                        showConfirmButton: false,
                        timer: 1500
                    })
                    setPlaylist(() => true)
                }
                
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
    const openPlay = async() => {

        async function goTOSPEED(){
            function getCurrentWeek() {
                const now = new Date();
                const startOfYear = new Date(now.getFullYear(), 0, 1);
                const pastDaysOfYear = (now - startOfYear) / 86400000;
                return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
            }

            // Usage:
            const currentWeek = getCurrentWeek();            
            if(serie && serie.url && serie.url.quality && serie.url.quality === "CAM" && currentWeek > serie.url.week){
                // document.location.href = `/video/episode/${episodeID}/${name}/${serie.season_number}/${serie.episode_number}/${serie.air_date}/${imdb.imdb_id}${images}`;
                navRoute({
                    // ref:"episode",
                    url:`/video/episode`,
                    state:{
                        stream:"episode",
                        id:episodeID,
                        serieID:id,
                        name,
                        season:serie.season_number,
                        episode:serie.episode_number,
                        background:images.hasOwnProperty("logo") ? images : background,
                        date:serie.air_date,
                        imdbId:imdb?.imdb_id,
                        year:serie.air_date.substring(0,4),
                        anime,
                        // seasons:moveSeasons,
                        // episodes:moveEpisodes
                }})
            }else if(checkURL && checkURL.quality && checkURL.quality === "CAM" && currentWeek > checkURL.week){
                navRoute({
                    // ref:"episode",
                    url:`/video/episode`,
                    state:{
                        stream:"episode",
                        id:episodeID,
                        serieID:id,
                        name,
                        season:serie.season_number,
                        episode:serie.episode_number,
                        background:images.hasOwnProperty("logo") ? images : background,
                        date:serie.air_date,
                        imdbId:imdb?.imdb_id,
                        anime,
                        year:serie.air_date.substring(0,4),
                        // seasons:moveSeasons,
                        // episodes:moveEpisodes
                }})
            }else{
                async function authentication(){
                    const res = await fetch(process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_API_URL : process.env.REACT_APP_API_URL_LIVE,{credentials: "include"})
                    const {status,message,user} = await res.json()
                    console.log(message)
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
                        body:JSON.stringify({
                            id:episodeID
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
                    const {sum,message} = await res.json()
                    console.log(message)
                    //affordable for one movie | episode
                    if(sum && sum > 49){
                        hasCredits = true
                    }
                }else{
                    user = localStorage.getItem("session")
                    console.log("id",episodeID)
                    const res = await fetch(`${process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_PAID : process.env.REACT_APP_PAID_LIVE}`,{
                        method:"POST",
                        headers:{
                            "Content-Type":"application/json",
                            "Accept":"application/json"
                        },
                        body:JSON.stringify({
                            user,
                            id:episodeID
                        })
                    })

                    const res_data = await res.json()
                    console.log(res_data.message)
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
                navRoute({
                    // ref:"speed",
                    url:`/speed`,
                    state:{
                        stream:"tv",
                        id:episodeID,
                        name,
                        season:serie.season_number,
                        episode:serie.episode_number,
                        background:images,
                        dash:serie.url.hasOwnProperty("dash")?true:false,
                        // seasons:moveSeasons,
                        // episodes:moveEpisodes,
                        serieID:id,
                        serie_name:name,
                        date:serie.air_date,
                        year:serie.air_date.substring(0,4),
                        imdbId:imdb?.imdb_id,
                }}) 
            }
        }

        if(serie && serie.hasOwnProperty("url") && serie.url){
            await goTOSPEED()
        }else if(checkURL){
            await goTOSPEED()
        }else{
            if(serie && serie.hasOwnProperty("player") && serie.player){
                const response = await fetch(`${process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_PLAY : process.env.REACT_APP_PLAY_LIVE}`,{
                    method:"POST",
                    headers:{
                        "Content-Type":"application/json",
                        "Accept":"application/json"
                    },
                    
                    body:JSON.stringify({
                        token:serie.player.token,
                        id:episodeID,
                        index:serie.player.index,
                        quality:serie.player.quality,
                        stream:serie.player.stream,
                        size:serie.player.size,
                    })
                })
                const {status} = await response.json()
                if(status){
                    console.log("ready to play")
                    navRoute({
                        url:`/play`,
                        state:{
                            id:episodeID,
                            index:serie.player.index,
                            background,
                            player:true,
                            type:serie.player.type,
                            serieID:id,
                            serie_name:serie.name || serie.original_name,
                            season:serie.season_number,
                            episode:serie.episode_number,
                            date:serie.air_date,
                            year:serie.air_date.substring(0,4),
                            imdbId:imdb?.imdb_id,
                        }})
                }   

                // navRoute({
                //     url:`/play`,
                //     state:{
                //         // id:direct,
                //         id:episodeID,
                //         // index,
                //         background,
                //         player:true,
                //         index:serie.player.index,
                //         type:serie.player.type,
                //         token:serie.player.token,
                //         stream:serie.player.stream,
                //         size:serie.player.size,
                //         quality:serie.player.quality,
                //         date:serie.air_date,
                //         year:serie.air_date.substring(0,4),
                //         imdbId:imdb?.imdb_id,
                //         // many:serie.episode_number,
                //         // seasons:moveSeasons,
                //         // episodes:moveEpisodes,
                //         serieID:id,
                //         serie_name:serie.name || serie.original_name,
                //         season:serie.season_number,
                //         episode:serie.episode_number,
                //     }})
            }else{
                navRoute({
                    url:`/video/episode`,
                    state:{
                        stream:"episode",
                        id:episodeID,
                        serieID:id,
                        name,
                        season:serie.season_number,
                        episode:serie.episode_number,
                        background:images.hasOwnProperty("logo") ? images : background,
                        date:serie.air_date,
                        year:serie.air_date.substring(0,4),
                        imdbId:imdb?.imdb_id,
                        anime,
                        // seasons:moveSeasons,
                        // episodes:moveEpisodes,
                }})
            }
        }
    }
    useEffect(() => {
        async function checkURLFN(){
            const response = await fetch(`${process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_CHECK_URL : process.env.REACT_APP_CHECK_URL_LIVE}`,{
                method:"POST",
                headers:{
                    "Content-Type":"application/json",
                    "Accept":"application/json"
                },
                body:JSON.stringify({
                    type:"episode",
                    id:episodeID
                })
            })

            const {status,data} = await response.json()

            if(status)
                setCheckURL(data)

            console.log("creating fast stream...")
        }

        if(serie && serie.hasOwnProperty("url") && serie.url){
            console.log("no need to check")
        }else
            checkURLFN()

    },[episodeID,serie])

    const navRoute = ({url,state,ref}) => {
        navigate(url,{
            state : {
                ...state
            }
        })
    }
    return (
    credits && serie ? 
        <div className="w-[100%] h-[100%]  bg-cover bg-no-repeat bg-center text-white" style={{backgroundImage:`linear-gradient(105deg, #0d0d0d, rgba(0,0,0,0.75), #000, rgba(0,0,0,0.56)),url(${images ? safeKeys.IMG_POSTER + images?.path : safeKeys.IMG_POSTER + background?.path})`,backgroundPosition:"0% 40%"}}>
            {
                windowWidth >= DESKTOP_WIDTH ? 
                <div className="w-[20%] h-[100%] absolute" style={{background:"linear-gradient(85deg, #0d0d0d, rgba(0,0,0,0.75), #000, #0f111a)"}}>
                    <NAVBAR data={`${name} || season ${serie.season_number} || episode ${serie.episode_number}`}/>
                </div>
                :
                <MOBILE/>
            }
            <div className={windowWidth >= DESKTOP_WIDTH ? "w-[80%] overflow-y-auto movie-scene h-[100%] ml-[20%] flex flex-col":"w-[98%] mx-[1%]  h-[92%] overflow-y-auto movie-scene flex flex-col"}>
                
                    
                        <>
                        <div className={windowWidth >= DESKTOP_WIDTH ? "w-[100%] flex flex-row flex-wrap":"w-[100%] flex flex-col flex-wrap"}>
                            <div 
                                className={windowWidth >= DESKTOP_WIDTH ? "w-[37%] min-h-[100%] shadow background":"w-[100%] h-[auto]"} 
                                style={{
                                    backgroundImage:"url(" + (serie && serie.hasOwnProperty("still_path") && serie.still_path ? safeKeys.IMG_POSTER + serie.still_path : images ?  safeKeys.IMG_POSTER + images?.path :  safeKeys.IMG_POSTER + background?.path) + ")",
                                    boxShadow:"rgba(0, 0, 0, 0.97) -70px -100px 120px inset, rgba(0, 0, 0, 0.9) 0px 100px 10px, rgba(0, 0, 0, 0.9) 100px 50px 10px"
                                }}
                            >
                                {
                                    windowWidth < DESKTOP_WIDTH && <PICTURE picture={`${serie && serie.hasOwnProperty("still_path") && serie.still_path ? serie.still_path : images}`} classes={windowWidth >= DESKTOP_WIDTH ? "shadow-lg h-[70%] shadow-blue-500/50" : "shadow-lg h-[200px] shadow-blue-500/50 object-cover"} />

                                }
                            </div>
                            <div className={windowWidth >= DESKTOP_WIDTH ? "w-[61%] m-[1%] h-[60%] justify-center items-center":"w-[100%] h-auto"}>
                                <h1 className="text-[30px] text-[#ffd800]">{serie.name}</h1>
                                {/* <p style={{fontStyle:"italic",color:"#ffd800"}}>"{serie.tagline}"</p> */}
                                <h3>{serie.air_date}</h3>
                                <h3>season {serie.season_number} || episode {serie.episode_number}</h3>
                                {
                                    serie.hasOwnProperty("url") && serie.url && serie.url.hasOwnProperty("quality") && serie.url.quality && <h3 className="text-[#ffd800]">{serie.url.quality}</h3>
                                }
                                {
                                    checkURL && checkURL.hasOwnProperty("quality") && checkURL.quality && <h3 className="text-[#ffd800]">{checkURL.quality}</h3>
                                }
                                {
                                    ((serie && serie.hasOwnProperty("url") && serie.url) || checkURL) ? <p>fast stream</p> : <p>slow stream</p>
                                }
                                <article>
                                    {serie.overview}
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
                                <div className="w-[100%] flex flex-row flex-wrap border-b-[#fff] border-b-[2px]">
                                    <button
                                        onClick={() => navRoute({
                                            ref:"trailer",
                                            url:`/series/episode/trailer`,
                                            state:{
                                                stream:"series",
                                                id:id,
                                                season:serie.season_number,
                                                episode:serie.episode_number,
                                                background
                                            }})}                                       
                                        className={windowWidth >= DESKTOP_WIDTH ? "w-[23%] text-[#fff] text-[12px] active rounded-md bg-red-950 border-2 border-[#fff] text-center min-h-[20px] m-1":"w-[48%] m-1 bg-red-950 border-2 border-[#fff] active text-[10px] text-center min-h-[20px] underline"}
                                    >
                                        {/* <img src="/image/2503508.png" alt="UKOapp" className="w-[50%]"/> */}
                                        <h2>trailers</h2>
                                    </button>
                                    <button
                                        onClick={() => navRoute({
                                            url:`/series/similar`,
                                            state:{
                                                stream:"series",
                                                id,
                                                background:images
                                            }})}                                        
                                        className={windowWidth >= DESKTOP_WIDTH ? "w-[23%] text-[#fff] text-[12px] active rounded-md bg-red-950 border-2 border-[#fff] text-center min-h-[20px] m-1":"w-[48%] m-1 bg-red-950 border-2 border-[#fff] active text-[10px] text-center min-h-[20px] underline"}
                                    >
                                        {/* <img src="/image/2798007.png" alt="UKOapp" className="w-[50%]"/> */}
                                        <h2>similar tv</h2>
                                    </button>
                                    
                                    <button
                                        onClick={() => navRoute({
                                            url:`/series/recommendations`,
                                            state:{
                                                stream:"series",
                                                id,
                                                background:images
                                            }})}                                        
                                        className={windowWidth >= DESKTOP_WIDTH ? "w-[23%] text-[#fff] text-[12px] active rounded-md bg-red-950 border-2 border-[#fff] text-center min-h-[20px] m-1":"w-[48%] m-1 bg-red-950 border-2 border-[#fff] active text-[10px] text-center min-h-[20px] underline"}
                                    >
                                        {/* <img src="/image/11327060.png" alt="UKOapp" className="w-[50%]"/> */}
                                        <h2>recommended movies</h2>
                                    </button>  
                                    {needsPhone && <PHONEPROMPT className="m-[1%]" />}
                                    {
                                        layouts && 
                                        (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => openPlay()}
                                                    className={windowWidth >= DESKTOP_WIDTH ? "text-[#ffd800] text-[30px] w-[15%] underline text-center min-h-[40px] m-[1%]":"text-[#ffd800] text-[30px] w-[48%] mt-[1%] ml-[1%] text-center justify-center h-[40px] rounded-full"}
                                                >
                                                    {/* <h3>play</h3>  */}
                                                    <FontAwesomeIcon icon={faPlayCircle} fontSize={50}/>
                                                </button>
                                            </>                                            
                                        )
                                    }                                       
                                </div>
                                <div className="w-[100%]">
                                    <button
                                        type="button"
                                        className="w-[100%] h-[50px] bg-[#ffd800] text-black font-bold hover:bg-[#ffd800]/80 duration-200"
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
                        {
                            credits.cast && credits.cast.length > 0 &&
                            <div className={windowWidth >= DESKTOP_WIDTH ? "w-[90%] h-[420px] mx-[5%] my-[2%]":"w-[100%] h-[420px] my-[2%]"}>

                                <h1 style={{textAlign:"left",textDecoration:"underline",color:"#ffd800"}}>CASTS</h1>
                                <div className={`w-[100%] movie-scene ${windowWidth >= DESKTOP_WIDTH ? "h-[400px]" : "h-[300px]"} flex flex-col flex-wrap overflow-x-auto overflow-y-hidden my-[1%]${shortRow(credits.cast)}`}>
                                    
                                    {
                                        credits.cast.map(({roles,profile_path,popularity,original_name,name,media_type,known_for_department,id,gender,adult},serie_key) => 
                                            <div 
                                                key={serie_key} 
                                                onClick={() => navRoute({
                                                    ref:"person",
                                                    url:`/series/person`,
                                                    state:{
                                                        id
                                                    }})} 
                                                className={windowWidth >= DESKTOP_WIDTH ? "cursor-pointer w-[25%] h-[100%] hover:contrast-150":"cursor-pointer w-[48%] h-[100%] mx-[0.5%] hover:contrast-150"}>
                                                <div className="w-[100%] h-[100%]">
                                                    <PICTURE key={id} classes={"object-cover h-[100%]"} picture={profile_path} />
                                                    <div className="w-[100%] relative min-h-[60px] top-[-50%] bg-[rgba(0,0,0,0.75)] bg-opacity-60 text-white flex flex-col items-center justify-center">
                                                        <h2 className="text-[15px] font-bold">{original_name || name}</h2>
                                                        <p style={{color:"#ffd800"}}><FontAwesomeIcon icon={faStar} /> {parseFloat(popularity).toFixed(1)}</p>
                                                        <h3 style={{fontStyle:"italic"}}>{roles && roles.length > 0 && roles[0].character}</h3>
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
                            <div className={windowWidth >= DESKTOP_WIDTH ? "w-[90%] h-[420px] mx-[5%] my-[2%]":"cursor-pointerw-[100%] h-[420px] my-[2%]"}>

                                <h1 style={{textAlign:"left",textDecoration:"underline"}}>CREW</h1>
                                <div className={`w-[100%] movie-scene ${windowWidth >= DESKTOP_WIDTH ? "h-[400px]" : "h-[300px]"} flex flex-col flex-wrap overflow-x-auto overflow-y-hidden my-[1%]${shortRow(credits.crew)}`}>
                                    
                                    {
                                        credits.crew.map(({profile_path,popularity,jobs,original_name,name,media_type,known_for_department,id,gender,adult},serie_key) => 
                                            <div 
                                                key={serie_key} 
                                                onClick={() => navRoute({
                                                    url:`/series/person`,
                                                    state:{
                                                        id
                                                    }})} 
                                                className={windowWidth >= DESKTOP_WIDTH ? "w-[25%] h-[100%] hover:contrast-150 cursor-pointer":"cursor-pointer w-[48%] h-[100%] mx-[0.5%] hover:contrast-150"}>
                                                <div className="w-[100%] h-[100%]">
                                                    <PICTURE key={id} classes={"object-cover h-[100%]"} picture={profile_path} />
                                                    <div className="w-[100%] relative min-h-[60px] top-[-50%] bg-[#000000] bg-opacity-60 text-white flex flex-col items-center justify-center">
                                                        <h2 className="text-[15px] font-bold">{original_name || name}</h2>
                                                        <p style={{color:"#ffd800"}}><FontAwesomeIcon icon={faStar} /> {parseFloat(popularity).toFixed(1)}</p>
                                                        <h3>{jobs && jobs.length > 0 && jobs[0].job}</h3>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    }
                                </div>
                            </div>
                        } */}
                        {
                            credits.guest_stars && credits.guest_stars.length > 0 &&
                            <div className={windowWidth >= DESKTOP_WIDTH ? "w-[90%] h-[420px] mx-[5%] my-[2%]":"w-[100%] h-[420px] my-[2%]"}>

                                <h1 style={{textAlign:"left",textDecoration:"underline",color:"#ffd800"}}>GUEST STARS</h1>
                                <div className={`w-[100%] movie-scene ${windowWidth >= DESKTOP_WIDTH ? "h-[400px]" : "h-[300px]"} flex flex-col flex-wrap overflow-x-auto overflow-y-hidden my-[1%]${shortRow(credits.guest_stars)}`}>
                                    
                                    {
                                        credits.guest_stars.map(({profile_path,popularity,character,original_name,name,media_type,known_for_department,id,gender,adult},serie_key) => 
                                            <div 
                                                key={serie_key} 
                                                onClick={() => navRoute({
                                                    ref:"person",
                                                    url:`/series/person`,
                                                    state:{
                                                        id
                                                    }})}  
                                                className={windowWidth >= DESKTOP_WIDTH ? "w-[25%] h-[100%] cursor-pointer hover:contrast-150":"cursor-pointer w-[48%] h-[100%] mx-[0.5%] hover:contrast-150"}>
                                                <div className="w-[100%] h-[100%]">
                                                    <PICTURE key={id} classes={"object-cover h-[100%]"} picture={profile_path} />
                                                    <div className="w-[100%] relative min-h-[60px] top-[-50%] bg-[rgba(0,0,0,0.75)] bg-opacity-60 text-white flex flex-col items-center justify-center">
                                                        <h2 className="text-[15px] font-bold">{original_name || name}</h2>
                                                        <p style={{color:"#ffd800"}}><FontAwesomeIcon icon={faStar} /> {parseFloat(popularity).toFixed(1)}</p>
                                                        <h3 style={{fontStyle:"italic"}}>{character}</h3>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    }
                                </div>
                            </div>
                        }
                        </>

                </div>
            </div>
                    :
                        <LOAD/>
                    
    )
}

export default EPISODE
import { shortRow } from "../midlleware/shortRow"
import NAVBAR from "./nav"
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback, useRef } from "react";
import PICTURE from "../midlleware/picture";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faBasketShopping, faCirclePlus, faPlayCircle } from "@fortawesome/free-solid-svg-icons";
// import LOAD from "../midlleware/load";
import MOBILE from "./mobileBar";
import Swal from "sweetalert2";
import { useMutation, useLazyQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { useKeys } from "./safe";
import { usePlayGate, PHONEPROMPT } from "./access";
import { noCreditsAlert } from "../midlleware/noCredits";
import { useWindowWidth, DESKTOP_WIDTH } from "../hooks/useWindowWidth";
const SEASON = () => {
    const hasFetched = useRef({tv:false,images:false,credits:false})
    const [serie, setSerie] = useState(null);
    const [images,setImages] = useState(null)
    const [credits,setCredit] = useState(null)
    const windowWidth = useWindowWidth()
    const [playlist,setPlaylist] = useState(null)
    const {state} = useLocation()
    const {safeKeys,loadKeys} = useKeys()
    const { allowed: layouts, needsPhone } = usePlayGate(safeKeys?.GEO)
    const navigate = useNavigate()
    // const router = useRouter()
    // const params = useSearchParams();
    // const state = JSON.parse(decodeURIComponent(params.get("state")));  
    // const state = useStates("serie")
    const id = state.id
    const serie_name = state.name
    const seasonID = state.seasonID
    const season = state.season
    const background = state.background
    const anime = state.anime
    // const moveSeasons = state.seasons

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
            console.log(data)
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
        query Season (
            $id: Int!
        ){
            season(
                id:$id
            ) {

                adult
                backdrop_path
                episodes {
                    air_date
                    episode_number
                    episode_type
                    id
                    name
                    overview
                    production_code
                    runtime
                    season_number,
                    show_id
                    still_path
                    vote_average
                    vote_count
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

                }
                air_date
                id
                name
                overview
                popularity
                poster_path
                vote_average
                vote_count
                season_number
                success
            }
        }
    `
    const [fetchSeason] = useLazyQuery(FETCH_MOVIE_QUERY,{
        // pollInterval: 500, // fetches new data at that interval
        notifyOnNetworkStatusChange: true,
        // fetchPolicy: 'cache-first',
        fetchPolicy: 'network-only'
        // variables,
        // skip: !variables.page, // Skip query execution if variables are not set
    });

    const INSERT_MOVIE_MUTATION = gql`
        mutation AddSeason(
            $single:COLLECT_SEASON_INPUT
        ) {
            addSeason(
                single:$single
            ) {
                success
                message
            }
        }
    `;

    const [mutateInsertTV] = useMutation(INSERT_MOVIE_MUTATION, {
        onCompleted: (data) => {
            if (data.addSeason.success) {
                if(data.addSeason.message === "already inserted")
                    console.log("season inserting already started...")
                console.log("Movie successfully inserted into MySQL:", data.addSeason.message);
                // fetchedMovieData.refetch()
                // .then(status => console.log(status,"status"))
            } else {
                console.error("Failed to insert movies into MySQL:", data.addSeason.message, data.addSeason.error);
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
        // variables,
        // skip: !variables.page, // Skip query execution if variables are not set
    });

    const INSERT_CREDITS_MUTATION = gql`
        mutation AddCredits(
            $id:Int!
            $season:Int!
            $episode:Int!
            $cast:[CAST_INPUT]
            $crew:[CREW_INPUT]
            $chunking:Boolean!
            $chunking_index:Int!            
        ) {
            addCredits(
                id:$id
                season:$season
                episode:$episode
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
            if (data && data.addCredits.success) {
                console.log(data)
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
            console.error("insert credits Error:", error);
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
            const response = await fetch(`${safeKeys.MOVIE_DB}tv/${id}/season/${season}/images?api_key=${safeKeys.API_KEY}`);
            const getImageData = await response.json();
            // console.log(getImageData,"images")
            let value = 0
            const {backdrops, posters, logos} = getImageData
            let path = ''
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
            let logo = ''
            if(logos && logos.length > 0){
                let logos_value = Math.max(...logos.map(({height}) => height))
                let key = logos.findIndex(({height}) => height === logos_value)
                if(logos_value > value){
                    if(key > -1){
                        path = logos[key].file_path
                    }
                }
                logo = logos[key].file_path
            }

            mutateInsertImage({ variables: { meta_data : {
                    type:"tv",
                    season:season?parseInt(season):-1,
                    episode:-1,
                    id:id?parseInt(id):-1
                }, data:{id:getImageData.id,path,logo}                  
            } });
            return {path,logo}
        }         
        try{
            const fetched = await fetchImage({
                variables : {
                type:"tv",
                episode:-1,
                season:season?parseInt(season):-1,
                id:id?parseInt(id):-1
            }})
            console.log(fetched)
            if (fetched.data && fetched.data.image.success) {
                console.log("image cached data:", fetched.data);
                setImages(() => ({path: fetched.data.image.data.path, logo: fetched.data.image.data.logo}))

            }else {
                console.log("fetching new image data...")
                const path = await freshFetch()
                setImages(path)
            }
        
            
        }catch(error){
            console.log(error,"image error")
            // const path = await freshFetch()
            // setImages(path)   

        

        }
    },[id, season, mutateInsertImage,safeKeys, fetchImage])

    const fetchCredits = useCallback(async() => {
        async function freshFetch(){
            const response = await fetch(`${safeKeys.MOVIE_DB}tv/${id}/season/${season}/aggregate_credits?api_key=${safeKeys.API_KEY}`);
            const credits_data = await response.json();
            console.log("results",credits_data)
            // function chunkArray(array, size) {
            //     const result = [];
            //     for (let i = 0; i < array.length; i += size) {
            //         result.push(array.slice(i, i + size));
            //     }
            //     return result;
            // }
            let cast_all_results = [...credits_data?.cast]
            let crew_all_results = [...credits_data?.crew]
            // let cast_all_results = [...credits_data?.cast]
            // if(cast_all_results.length > 100){
            //     const chunks = chunkArray(cast_all_results, 100);
            //     for (let i = 0; i < chunks.length; i++) {
            //         mutateInsertCredits({
            //             variables: {
            //                 cast:chunks[i],
            //                 id:id?parseInt(id):-1,
            //                 season:season?parseInt(season):-1,
            //                 episode:-1,
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
                        crew:crew_all_results,
                        id:id?parseInt(id):-1,
                        season:season?parseInt(season):-1,
                        episode:-1,
                        chunking:false,
                        chunking_index:0
                    },
                });
            }catch(Error){
                console.error("Error occurred while processing cast data:", Error);
            }

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
            // const current_date = new Date().toISOString().split("T")[0]
            const fetched = await fetchCreditsData({
                variables : { id:id?parseInt(id):0, season:season?parseInt(season):-1, episode:-1 }})
            console.log(fetched)
            if(fetched.data && fetched.data.credits.success){
                console.log("Using cached data:", fetched.data);
                setCredit(() => ({...fetched.data.credits}));
            }else {
                const credits = await freshFetch()
                console.log("fresh credits",credits)
                setCredit(() => ({...credits}));
            }
        }catch(error){
            console.log(error,"credit error")
            // const credits = await freshFetch()
            // setCredit(() => ({...credits}));
        }

    },[ id, season, mutateInsertCredits, safeKeys, fetchCreditsData]);

    const fetchTV = useCallback(async() => {

        async function freshFetch(){
            const response = await fetch(`${safeKeys.MOVIE_DB}tv/${id}/season/${season}?api_key=${safeKeys.API_KEY}`);
            const data = await response.json();
            const newData = {...data }
            newData.episodes = newData?.episodes.map(({crew,guest_stars,cast, ...rest}) => rest) || []

            console.log(newData,"new data")
            mutateInsertTV({
                variables: {
                    single : {...newData}
                },
            });
            return {...data}
        } 
        const checkFeedback = (id) => {
            // console.log(id,"id")
            //authentication
            fetch(process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_API_URL: process.env.REACT_APP_API_URL_LIVE,{credentials: "include"})
            .then(async res => {
                const {status, user} = await res.json()
                if(status){
                    fetch(`${process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_PLAYLIST_SELECT : process.env.REACT_APP_PLAYLIST_SELECT_LIVE}`,{
                        method:"POST",
                        headers:{
                            "Content-Type":"application/json"
                        },
                        body:JSON.stringify({id, user, seasonID, season, type:"season"})
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
            const fetched = await fetchSeason({
                variables : { id:seasonID }})
            console.log(fetched,seasonID,"id")
            if (fetched.data && fetched.data.season && !fetched.data.season.episodes) {
                console.log("first time...")
                const tv = await freshFetch()
                setSerie(() => ({...tv}));
                checkFeedback(tv.id)
            }else if(fetched.data && fetched.data.season.success){
                console.log("Using cached data:", fetched.data);
                setSerie(() => ({...fetched.data.season}));
                checkFeedback(fetched.data.season.id)
            }else {
                const tv = await freshFetch()
                setSerie(() => ({...tv}));
                checkFeedback(tv.id)
            }
            //now go for cedits thne images > windows accessed successfully
            fetchCredits()
            graphImages()
        }catch(error){
            console.log(error,"season error")
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
            // setSerie(() => ({...tv}));
            // checkFeedback(tv.id)
        }


    },[id, season, seasonID, mutateInsertTV, safeKeys, fetchCredits, graphImages, fetchSeason]);

    useEffect(() => {
        if(hasFetched.current.tv){
            return
        }
        if(safeKeys && safeKeys.hasOwnProperty("API_KEY") && safeKeys.API_KEY){
            hasFetched.current.tv = true
            fetchTV();
        }else{
            loadKeys()
        }

    }, [fetchTV,safeKeys,loadKeys]);

    // useEffect(() => {
    //     if(hasFetched.current.images){
    //         return
    //     }
        
    //     if(safeKeys && safeKeys.hasOwnProperty("API_KEY") && safeKeys.API_KEY){
    //         console.log("image running")
    //         graphImages()
    //         hasFetched.current.images = true
    //     }
    // },[graphImages,safeKeys])

    // useEffect(() => {
    //     if(hasFetched.current.credits){
    //         return
    //     }
        
    //     if(safeKeys && safeKeys.hasOwnProperty("API_KEY") && safeKeys.API_KEY){
    //         console.log("credits running")
    //         fetchCredits();
    //         hasFetched.current.credits = true
    //     }
    // }, [fetchCredits,safeKeys]);
    const addToPlayList = async() => {

        //authentication
        const res = await fetch(process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_API_URL : process.env.REACT_APP_API_URL_LIVE,{credentials: "include"})
        const {status, user} = await res.json()
        if(status){
            fetch(`${process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_PLAYLIST :process.env.REACT_APP_PLAYLIST_LIVE}`,{
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify({id, user, seasonID, season:parseInt(season), type:"season"})
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

    const navRoute = ({url,state,ref}) => {
        navigate(url,{
            state : {
                ...state
            }
        })
    }
    const fetchID = useCallback(async() => {
        async function freshFetch(){
            const response = await fetch(`${safeKeys.MOVIE_DB}tv/${id}/season/${season}/episode/1/external_ids?api_key=${safeKeys.API_KEY}`);
            const imdb_data = await response.json();
            //this season's episode 1 ids, stored and read as that episode's - `external_id` was ignored
            //by the mutation, so nothing was stored and every Play refetched TMDB
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
                    episode_number:1
                },
            });
            return {...imdb_data}
        }
        try{
            const fetched = await fetchIMDBData({
                variables : { id:id?parseInt(id):0, season_number:parseInt(season), episode_number:1 }})
            if(fetched.data && fetched.data.imdb.success){
                return ({...fetched.data.imdb})
            }else {
                const imdb = await freshFetch()
                return ({...imdb})
            }
        }catch(error){
            console.log(error,"imdb error")
            return false
        }
    },[id, safeKeys, season, mutateUpdateIMDB, fetchIMDBData])
    
    const openPlay = async() => {
        
        const episodeOne = serie.episodes.find(({episode_number}) => 1 === episode_number)
        const episodeID = episodeOne.id
        const imdb = await fetchID()

        

        async function goTOSPEED(){
            function getCurrentWeek() {
                const now = new Date();
                const startOfYear = new Date(now.getFullYear(), 0, 1);
                const pastDaysOfYear = (now - startOfYear) / 86400000;
                return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
            }

            const currentWeek = getCurrentWeek();            
            if(episodeID && episodeID.url && episodeID.url.quality && episodeID.url.quality === "CAM" && currentWeek > episodeID.url.week){
                navRoute({
                    ref:"episode",
                    url:`/video/episode`,
                    state:{
                        stream:"episode",
                        id:episodeID,
                        serieID:id,
                        name:serie_name,
                        season:serie.season_number,
                        episode:1,
                        background,
                        date:episodeID.air_date,
                        imdbId:imdb?.imdb_id,
                        anime
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
                        body:JSON.stringify({
                            id:episodeID
                        })
                    })

                    const response_data = await response.json()
                    // console.log(response_data.message)

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
                    const {sum} = await response.json()
                    // console.log(message)
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
                    ref:"speed",
                    url:`/speed`,
                    state:{
                        stream:"tv",
                        id:episodeID,
                        name:serie.name || serie.original_name,
                        season:serie.season_number,
                        episode:1,
                        background,
                        serieID:id,
                        serie_name:serie.name || serie.original_name,
                }}) 
            }
        }

        if(episodeOne && episodeOne.hasOwnProperty("url") && episodeOne.url){
            await goTOSPEED()
        }else{
            if(episodeOne && episodeOne.hasOwnProperty("player") && episodeOne.player){
                const response = await fetch(`${process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_PLAY : process.env.REACT_APP_PLAY_LIVE}`,{
                    method:"POST",
                    headers:{
                        "Content-Type":"application/json",
                        "Accept":"application/json"
                    },
                    
                    body:JSON.stringify({
                        token:episodeOne.player.token,
                        id:episodeID,
                        index:episodeOne.player.index,
                        quality:episodeOne.player.quality,
                        stream:episodeOne.player.stream,
                        size:episodeOne.player.size,
                    })
                })
                const {status} = await response.json()
                if(status){
                    console.log("ready to play")
                    navRoute({
                        url:`/play`,
                        state:{
                            id:episodeID,
                            index:episodeOne.player.index,
                            background,
                            player:true,
                            type:episodeOne.player.type,
                            serieID:id,
                            serie_name,
                            season:serie.season_number,
                            episode:1,
                            date:episodeOne.air_date,
                            year:episodeOne.air_date.substring(0,4),
                            imdbId:episodeOne.imdb_id,
                        }})
                }

            }else{
                navRoute({
                    url:`/video/episode`,
                    state:{
                        stream:"episode",
                        id:episodeID,
                        serieID:id,
                        name:serie_name,
                        season:serie.season_number,
                        episode:1,
                        background,
                        date:episodeOne.air_date,
                        year:episodeOne.air_date.substring(0,4),
                        imdbId:imdb?.imdb_id,
                        anime:serie.genres ? serie.genres.find(({id}) => id === 16):serie.genre_ids?serie.genre_ids.includes(16):false
                }})
            }
        }
    }
    return (
        
        <div className="w-[100%] h-[100%]  bg-cover bg-no-repeat bg-center text-white" style={{backgroundImage:`linear-gradient(105deg, #0d0d0d, rgba(0,0,0,0.75), #000, rgba(0,0,0,0.56)),url(${images ? safeKeys.IMG_POSTER + images?.path : background ? safeKeys.IMG_POSTER + background?.path : "/image/logo.png"})`,backgroundPosition:"0% 40%"}}>
            {
                windowWidth >= DESKTOP_WIDTH ? 
                    <div className="w-[20%] h-[100%] absolute" style={{background:"linear-gradient(85deg, rgba(13, 13, 13, 0.75), rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.56), rgba(0, 0, 0, 0.45))"}}>
                        <NAVBAR/>
                    </div>
                :
                <MOBILE/>
            }

            <div className={windowWidth >= DESKTOP_WIDTH ? "w-[80%] overflow-y-auto movie-scene duration-100 h-[100%] ml-[20%] flex flex-col":"w-[98%] duration-100 overflow-y-auto movie-scene mx-[1%] h-[92%] flex flex-col"}>
                {
                    credits && serie ?
                    <>
                        <div className={windowWidth >= DESKTOP_WIDTH ? "w-[100%] min-h-[70%] flex flex-row flex-wrap":"w-[100%] flex flex-col flex-wrap"}>
                            <div 
                                className={windowWidth >= DESKTOP_WIDTH ? "w-[37%] min-h-[100%] shadow background":"w-[100%] h-[auto]"} 
                                style={{
                                    backgroundImage:"url(" + (serie && serie.hasOwnProperty("poster_path") && serie.poster_path ? safeKeys.IMG_POSTER + serie.poster_path : images ? images?.path : background ? background?.path : "/image/logo.png") + ")",
                                    boxShadow:"rgba(0, 0, 0, 0.97) -180px -200px 130px inset, rgba(0, 0, 0, 0.9) 0px 100px 10px, rgba(0, 0, 0, 0.9) 100px 50px 10px"
                                }}
                            >
                                {
                                    windowWidth < DESKTOP_WIDTH && <PICTURE picture={`${serie && serie.hasOwnProperty("poster_path") && serie.poster_path ? serie.poster_path : images?.path || background?.path || "/image/logo.png"}`} classes={windowWidth >= DESKTOP_WIDTH ? "shadow-lg h-[70%] shadow-blue-500/50" : "shadow-lg h-[200px] shadow-blue-500/50 object-contain"} />
                                }
                            </div>
                            <div className={windowWidth >= DESKTOP_WIDTH ? "w-[61%] m-[1%] h-[60%] justify-center items-center":"w-[100%] h-auto"}>
                                {
                                    images && images.hasOwnProperty("logo") && images.logo ? 
                                        <PICTURE picture={images.logo} classes={"object-contain h-[150px]"} />
                                    :
                                        <h1 className="text-[30px] gradient-text">{serie.name}</h1>
                                }
                                <h3>{serie.air_date}</h3>
                                <h3>season {serie.season_number}</h3>
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
                                <div className={windowWidth >= DESKTOP_WIDTH ? "w-[100%] flex flex-row flex-wrap border-b-[#fff] border-b-[2px]":"w-[100%] flex flex-col flex-wrap border-b-[#fff] border-b-[2px]"}>
                                    <button
                                        onClick={() => navRoute({
                                            url:`/series/season/trailer`,
                                            state:{
                                                stream:"series",
                                                id:id,
                                                season:serie.season_number,
                                                background:images
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
                                <div className={`w-[100%] h-[100px] movie-scene duration-50 overflow-x-auto flex flex-col flex-wrap${shortRow(serie?.episodes)}`}>
                                    {
                                        serie?.episodes && serie?.episodes.map((episode,node) => 
                                            <button
                                                // to={`/series/${id}/${episode.id}/${episode.season_number}/${episode.episode_number}/${serie_name}${images}}`}
                                                onClick={() => navRoute({
                                                    url:`/series/episode`,
                                                    state:{
                                                        stream:"series",
                                                        id,
                                                        episodeID:episode.id,
                                                        season:episode.season_number,
                                                        episode:episode.episode_number,
                                                        name:serie_name,
                                                        background:images,
                                                        anime,
                                                        // moveSeasons,
                                                        // moveEpisodes:serie.episodes
                                                        // direct:fromAnime?serie?.id:false,
                                                        // index:fromAnime?fromAnime.count:false
                                                    }})}                                                 
                                                key={node}
                                                className={windowWidth >= DESKTOP_WIDTH ? "min-w-[24%] h-[95%] m-[1%] rounded-md hover:contrast-150 border-[2px] p-1":"p-1 min-w-[48%] h-[98%] m-[1%] rounded-md hover:contrast-150 border-[2px]"}
                                            >
                                                <p>{episode.name}</p>
                                                <p>episode {episode.episode_number}</p>
                                                <p style={{color:"#ffd800"}}><FontAwesomeIcon icon={faStar} /> {(parseFloat(episode.vote_average)).toFixed(1)}</p>
                                            </button>
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
                            <div className={windowWidth >= DESKTOP_WIDTH ? "w-[90%] h-[420px] mx-[5%] my-[2%]":"w-[100%] h-[220px] my-[2%]"}>

                                <h1 style={{textAlign:"left",textDecoration:"underline",color:"#ffd800"}}>CASTS</h1>
                                <div className={`w-[100%] movie-scene ${windowWidth >= DESKTOP_WIDTH ? "h-[400px]" : "h-[200px]"} flex flex-col flex-wrap overflow-x-auto overflow-y-hidden my-[1%]${shortRow(credits.cast)}`}>
                                    
                                    {
                                        credits.cast.map(({roles,profile_path,popularity,original_name,name,media_type,known_for_department,id,gender,adult},serie_key) => 
                                            <div 
                                                key={serie_key} 
                                                // to={`/people/${id}`} 
                                                onClick={() => navRoute({
                                                    url:`/series/person`,
                                                    state:{
                                                        id
                                                    }})}                                                
                                                className={windowWidth >= DESKTOP_WIDTH ? "cursor-pointer w-[25%] h-[100%] hover:scale-115 duration-700 hover:contrast-150":"cursor-pointer w-[45%] hover:scale-115 duration-700 h-[100%] hover:contrast-150"}>
                                                <div className="w-[100%] h-[100%]">
                                                    <PICTURE key={id} classes={"object-cover h-[100%]"} picture={profile_path} />
                                                    <div className="w-[100%] relative min-h-[60px] top-[-50%] bg-[rgba(0,0,0,0.75)] bg-opacity-60 text-white flex flex-col items-center justify-center">
                                                        <h2 className={windowWidth >= DESKTOP_WIDTH ? "text-[15px] font-bold":""}>{original_name || name}</h2>
                                                        <p style={{color:"#ffd800"}}><FontAwesomeIcon icon={faStar} /> {parseFloat(popularity).toFixed(1)}</p>
                                                        {
                                                            roles && roles.map(({character,episode_count},node) => 
                                                                <div className="" key={node}>
                                                                    <h3 style={{fontStyle:"italic"}}>{character}</h3>
                                                                    <p>{episode_count} episodes</p>
                                                                </div>
                                                            )
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    }
                                </div>
                            </div>
                        }
                    </>

                    :
                        <img src="/videos/load.gif" alt="loader" className="w-[250px] h-[250px] mx-auto mt-[10%]" />
                }
                {/* {
                    credits.crew && credits.crew.length > 0 &&
                    <div className={windowWidth >= DESKTOP_WIDTH ? "w-[90%] h-[420px] mx-[5%] my-[2%]":"w-[100%] h-[420px] my-[2%]"}>

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
                                        className={windowWidth >= DESKTOP_WIDTH ? "cursor-pointer w-[25%] h-[100%] hover:scale-115 duration-700 hover:contrast-150":"cursor-pointer w-[48%] hover:scale-115 duration-700 h-[100%] hover:contrast-150"}>
                                        <div className="w-[100%] h-[100%]">
                                            <PICTURE key={id} classes={"object-cover h-[100%]"} picture={profile_path} />
                                            <div className="w-[100%] relative min-h-[60px] top-[-50%] bg-[#000000] bg-opacity-60 text-white flex flex-col items-center justify-center">
                                                <h2 className="text-[15px] font-bold">{original_name || name}</h2>
                                                <p style={{color:"#ffd800"}}><FontAwesomeIcon icon={faStar} /> {parseFloat(popularity).toFixed(1)}</p>
                                                {
                                                    jobs && jobs.map(({job,episode_count},node) => 
                                                        <div className="" key={node}>
                                                            <h3>{job}</h3>
                                                            <p>{episode_count} episodes</p>
                                                        </div>
                                                    )
                                                }
                                            </div>
                                        </div>
                                    </div>
                                )
                            }
                        </div>
                    </div>
                } */}
            </div>             
        </div>
                    
    )
}

export default SEASON
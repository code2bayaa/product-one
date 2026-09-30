
import REACTIONBUTTON, { reactionNeedsUpload } from "../party/ReactionButton";
import { shortRow } from "../../midlleware/shortRow"
import { useLazyQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import NAVBAR from "./../nav"
import { useLocation, useNavigate  } from "react-router-dom";
import { useState, useEffect, useCallback, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlayCircle, faStar, faBasketShopping, faCirclePlus, } from "@fortawesome/free-solid-svg-icons";
import LOAD from "./../../midlleware/load";
import MOBILE from "./../mobileBar";
import Swal from "sweetalert2";
import { useKeys } from './../safe';
import { usePlayGate, PHONEPROMPT } from "../access";
import COMMENTS from "../comments";
import { EDENIMAGE, useEdenImage } from './shared';
import { noCreditsAlert } from "../../midlleware/noCredits";
import { useWindowWidth, DESKTOP_WIDTH } from "../../hooks/useWindowWidth";
const MOVIE = () => {
    const hasFetched = useRef(null)
    const [movie, setMovie] = useState(null);
    const [images,setImages] = useState(null)
    const [credits,setCredit] = useState(null)
    const windowWidth = useWindowWidth()
    const [playlist,setPlaylist] = useState(null)
    const [generateGenre, setGenerateGenre] = useState([])
    const [checkURL, setCheckURL] = useState(null)
    const navigate = useNavigate();
    const {state} = useLocation()
    const {safeKeys,loadKeys} = useKeys()
    const { allowed: layouts, needsPhone } = usePlayGate(safeKeys?.GEO)
    let { id } = state;
    //Eden bucket keys - the image payload is usually empty, so fall back to the movie's own backdrop
    const backdrop = useEdenImage(images?.path || movie?.backdrop_path)

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
    useEffect(() => {
        loadKeys()
    },[loadKeys])

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

    const FETCH_COMINED_QUERY = gql`
        query EdenMoviePayload (
            $image: EDEN_IMAGE_ARGUMENTS!
            $movie: EDEN_SINGLE_MOVIE_ARGUMENTS!
            $credit: EDEN_CREDIT_ITEM_ARGUMENTS!
        ) {
            edenMoviePayload(
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

    const creditRing = useCallback(async(payload) => {
        try{
            console.log(payload,"payload: credits")
            if(payload && payload.success){
                console.log("credits cached data:", payload);
                return setCredit(() => ({...payload}));
            }
            //a studio that listed no cast still has a page - the render waits on credits
            setCredit(() => ({cast:[], crew:[]}))
        }catch(error){
            console.log("credi error:",error)
        }

    },[])

    
    const movieRing = useCallback(async(payload) => {
        if(payload && payload.success){
            console.log("Using cached data:", payload);
            setMovie(() => ({...payload}));
        }
    },[])

    const imageRing = useCallback(async(payload) => {        
        try{
            if (payload && payload.success) {
                console.log("image cached data:", payload);
                setImages(() => ({path: payload.data.path, logo:payload.data.logo}))
            }
        }catch(error){
            console.log(error)
            // const path = await freshFetch()
            // setImages(path)            
        

        }
    },[])
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
                const imagePayload = fetched.data?.edenMoviePayload?.image
                const moviePayload = fetched.data?.edenMoviePayload?.movie
                const creditPayload = fetched.data?.edenMoviePayload?.credit

                movieRing(moviePayload)
                imageRing(imagePayload)
                creditRing(creditPayload)
            // }
            
        }catch(error){
            console.log(error)
            //leaving the page aborts the query - that is not a network error
            if(error?.name === "AbortError") return
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
            console.log("running one Ring")
            
            oneRing()
            hasFetched.current = true
        }

        runID()
        const controller = new AbortController();
        return () => {
            controller.abort();
        };
    }, [oneRing]);

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
                    background:images || {path:movie.backdrop_path},
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
                    background:images || {path:movie.backdrop_path},
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
                    eden:true,   //Eden content - the credit charge pays the studio (user/credits/earnings.js)
                    stream:"movie",
                    id:movie.id,
                    name:movie.title || movie.original_title,
                    background:images || {path:movie.backdrop_path},
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
                    eden:true,   //Eden content - the credit charge pays the studio (user/credits/earnings.js)
                        id:movie.id,
                        // url,
                        index:movie.player.index,
                        type:movie.player.type,
                        // token:movie.player.token,
                        // quality:movie.player.quality,
                        // size:movie.player.size,
                        // stream:movie.player.stream,
                        background:images || {path:movie.backdrop_path},
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
                    background:images || {path:movie.backdrop_path},
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
        
            <div className="w-[100%] duration-150 h-[100%] text-white  bg-cover bg-no-repeat bg-center" style={{backgroundImage:`linear-gradient(105deg, #0d0d0d, rgba(0,0,0,0.75), #000, rgba(0,0,0,0.56)),url(${backdrop || "/image/logo.png"})`,backgroundPosition:"0% 40%"}}>
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
                                boxShadow:"rgba(0, 0, 0, 0.97) -180px -200px 130px inset, rgba(0, 0, 0, 0.9) 0px 100px 10px, rgba(0, 0, 0, 0.9) 100px 50px 10px"
                                // boxShadow:"rgba(0, 0, 0, 0.97) -180px -200px 130px inset, rgba(6, 4, 4, 0.9) 0px 100px 10px, rgba(0, 0, 0, 0.9) 100px 50px 10px"
                            }}
                        >
                            <div className="backdrop-blur-md w-[100%]">
                                {
                                    <EDENIMAGE path={movie?.poster_path} alt={movie.title} className={windowWidth >= DESKTOP_WIDTH ? "w-[100%] shadow-lg shadow-[#ffd800] object-cover" : "w-[100%] shadow-lg h-[200px] shadow-[#ffd800] object-contain"} />

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
                                        <EDENIMAGE path={images.logo} alt={movie.title} className={"object-contain w-[70%] h-[150px]"} />
                                    :
                                        <h1 className="text-[30px] gradient-text">{movie.original_title || movie.title}</h1>
                                }
                            {movie.tagline && <p style={{fontStyle:"italic",color:"#ffd800"}}>"{movie.tagline}"</p>}
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
                                {movie.vote_average ? <p className="text-[#ffd800]"><FontAwesomeIcon icon={faStar} style={{ fontSize: '30px' }} /> {Number(movie.vote_average).toFixed(1)}/10</p> : null}
                            </div>
                            <div className="w-[100%]">
                                {movie.runtime > 0 && <h4>{ (movie.runtime > 60) ? (Math.floor(movie.runtime / 60)) + " h " + (movie.runtime % 60) + " min" : movie.runtime + " min" }</h4>}
                                {
                                    generateGenre && generateGenre.length > 0 ?
                                        generateGenre.map(({name}) => name).join(" || ")
                                    :
                                    (movie.genres || []).map(({name},index) => (
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
                                            eden:true,
                                            title:movie.title || movie.name,
                                            id:movie.id,
                                            background:images || {path:movie.backdrop_path}
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
                                            background:images || {path:movie.backdrop_path}
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
                                            background:images || {path:movie.backdrop_path}
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
                                                url:`/eden/people/id`,
                                                //Eden credits are Eden people - their page reads the database, not TMDB
                                                state:{
                                                    id,
                                                    eden:true
                                                }})}  
                                            className={windowWidth >= DESKTOP_WIDTH ? "cursor-pointer w-[25%] h-[100%] hover:scale-115 duration-700 hover:contrast-150":"cursor-pointer w-[40%] hover:scale-115 duration-700 h-[100%] m-[0.5%] hover:contrast-150"}>
                                            <div className="w-[100%] h-[100%]">
                                                <EDENIMAGE path={profile_path} alt={name} className={windowWidth >= DESKTOP_WIDTH ? "w-[100%] object-cover h-[100%]":"w-[100%] object-cover h-[100%] rounded-xl"} />
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
                                                url:`/eden/people/id`,
                                                //Eden credits are Eden people - their page reads the database, not TMDB
                                                state:{
                                                    id,
                                                    eden:true
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
                    <COMMENTS type="movie" id={id} eden windowWidth={windowWidth} />
                </div>

            </div>
            :
        <LOAD/>
        }       
        </>

    )
}

export default MOVIE
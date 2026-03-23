import { useLazyQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';

import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, 
    // useRef
} from "react";
// import { Rating } from 'react-simple-star-rating'
import Swal from "sweetalert2";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faEye,
    //  faStar, faUserCheck
     } from '@fortawesome/free-solid-svg-icons';
import DashPlayer from '../midlleware/dash';
import { saveVideo, listVideoKeys, listVideos } from '../models/idb';
import VIDEO from "../midlleware/plyr";
import axios from "axios"
import { COLLECT } from "../midlleware/report";

const SPEED = () => {
    // const hasFetched = useRef({paid:false,rate:false})
    const {state} = useLocation()
    const [subFiles,setFiles] = useState([]);
    // const params = useSearchParams();
    // const state = JSON.parse(decodeURIComponent(params.get("state")));
    // const state = useStates("speed")
    const { name, background, id, type, dash,
        seasons,
        serie_name,
        serieID,
        episodes,
        season,
        episode,
        anime
    } = state;
    console.log(name)
    // const [rating, setRating] = useState(3.2)
    // const [stars,setStars] = useState(0)
    // const [users, setUsers] = useState(0)
    // const [paid, setPaid] = useState(false)
    const [windowWidth, setWindowWidth] = useState(0)
    const [views, setViews] = useState(1000)
    const [download, setDownload] = useState(false)
    const [progress, setProgress] = useState(0)
    const [subtitleProgress, setSubtitleProgress] = useState(0)
    const navigate = useNavigate()
    const FETCH_MOVIE_QUERY = gql`
        query Single (
            $id: ID!
        ){
            single(
                id:$id
            ) {
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
                vote_average
                vote_count   
                url {
                    fileName
                }             
                success
            }
        }
    `
    const [fetchSingleMovie] = useLazyQuery(FETCH_MOVIE_QUERY,{
        // pollInterval: 500, // fetches new data at that interval
        notifyOnNetworkStatusChange: true,
        // variables,
        // skip: !variables.page, // Skip query execution if variables are not set
    });

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };
        window.addEventListener("resize", handleResize);
        handleResize(); // Call it once to set the initial value
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    },[]) 
    useEffect(() => {

        const insertViews = async () => {
            fetch(`${process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_INSERT_VIEWS : process.env.REACT_APP_INSERT_VIEWS_LIVE}`, {
                method: "POST",
                credentials: "include",
                headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
                },
                body: JSON.stringify({
                    movies_id: id,
                    // email: await AsyncStorage.getItem("user"),
                    platform: "web",
                    wireframe: "speed"
                })
            })
                .then(res => {
                    console.log(res)
                    if (!res.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return res.json();
                })
                .then(({ status, count }) => {
                    if (status) {
                        // console.log("check views")
                        setViews(prevView => (prevView + count))
                    }
                })
        }

        insertViews()
    }, [])
    //pay with credits
    useEffect(() => {
        try{
        // if(hasFetched.current.paid){
        //     return
        // }
        // hasFetched.current.paid = true
            async function authentication(){
                const res = await fetch(process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_API_URL : process.env.REACT_APP_API_URL_LIVE,{credentials: "include"})
                return  await res.json()
                // console.log(message)
                // return status
            }
            authentication().then(async isLoggedIn => {
                console.log(isLoggedIn)
                //pay with credits from session | user
                // let paid = false
                let hasCredits = false
                let hasPaid = false
                if(isLoggedIn.status){
                    
                    // setUser(isLoggedIn.user)
                    const response = await fetch(`${process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_USER_PAID : process.env.REACT_APP_USER_PAID_LIVE}`,{
                        credentials: "include",
                        method:"POST",
                        headers:{
                            "Content-Type":"application/json",
                            "Accept":"application/json"
                        },
                        body:JSON.stringify({
                            id
                        })
                    })

                    const response_data = await response.json()
                    // console.log(response_data)

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

                    // if(response_data.status){
                    //     hasPaid = true
                    // }

                    const res = await fetch(process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_CHECK_USER_CREDITS : process.env.REACT_APP_CHECK_USER_CREDITS_LIVE,{credentials: "include"})
                    const {sum,message} = await res.json()
                    console.log(message)
                    //affordable for one movie | episode
                    if(sum && sum > 49){
                        hasCredits = true
                    }

                    if(!hasCredits && !hasPaid){
                        Swal.fire({
                            icon: 'error',
                            title: 'NO CREDITS',
                            text: "add more credits",
                            showConfirmButton: false,
                            timer: 1500
                        })
                        navigate(-1)
                        return 
                    }

                    if(response_data.status){
                        const res = await fetch(`${process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_UPDATE_USER_CREDITS : process.env.REACT_APP_UPDATE_USER_CREDITS_LIVE}`,{
                            credentials: "include",
                            method:"POST",
                            headers:{
                                "Content-Type":"application/json",
                                "Accept":"application/json"
                            },
                            body:JSON.stringify({
                                type,
                                id

                            })
                        })
                        const {success,message} = await res.json()
                        console.log(message,success)
                        // setPaid(success)
                        // paid = success
                    }else{
                        const res = await fetch(`${process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_PAY_USER_CREDITS : process.env.REACT_APP_PAY_USER_CREDITS_LIVE}`,{
                            credentials: "include",
                            method:"POST",
                            headers:{
                                "Content-Type":"application/json",
                                "Accept":"application/json"
                            },
                            body:JSON.stringify({
                                credit:50.00,
                                data:{
                                    "receipt":"player",
                                    "player-type":[type],
                                    "title":id
                                }

                            })
                        })
                        const {status,message} = await res.json()
                        console.log(message)
                        
                        //affordable for one movie | episode
                        if(status){
                            // setPaid(status)
                            // paid = status
                            Swal.fire({
                                icon: 'success',
                                title: 'paid with credits',
                                text: "success",
                                showConfirmButton: false,
                                timer: 2500
                            })
                        }
                        
                    }

                }else{
                    let user = localStorage.getItem("session")

                    // setUser(user)
                    const res = await fetch(`${process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_PAID : process.env.REACT_APP_PAID_LIVE}`,{
                        method:"POST",
                        headers:{
                            "Content-Type":"application/json",
                            "Accept":"application/json"
                        },
                        body:JSON.stringify({
                            user,
                            id
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

                    if(!hasCredits && !hasPaid){
                        Swal.fire({
                            icon: 'error',
                            title: 'NO CREDITS',
                            text: "add more credits",
                            showConfirmButton: false,
                            timer: 1500
                        })
                        navigate(-1)
                        return 
                    }

                    if(res_data.status){
                        const res = await fetch(`${process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_UPDATE_REPORT_CREDITS : process.env.REACT_APP_UPDATE_REPORT_CREDITS_LIVE}`,{
                            method:"POST",
                            headers:{
                                "Content-Type":"application/json",
                                "Accept":"application/json"
                            },
                            body:JSON.stringify({
                                user,
                                type,
                                id

                            })
                        })
                        const {success,message} = await res.json()
                        console.log(success,message)
                        // setPaid(success)
                        // paid = success
                    }else{

                        const response = await fetch(`${process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_PAY_REPORT_CREDITS : process.env.REACT_APP_PAY_REPORT_CREDITS_LIVE}`,{
                            method:"POST",
                            headers:{
                                "Content-Type":"application/json",
                                "Accept":"application/json"
                            },
                            body:JSON.stringify({
                                user,
                                credit:50.00,
                                data:{
                                    "receipt":"player",
                                    "player-type":[type],
                                    "title":id
                                }

                            })
                        })
                        const {status,message} = await response.json()
                        console.log(message)
                        
                        //affordable for one movie | episode
                        if(status){
                            // setPaid(status)
                            // paid = status
                            Swal.fire({
                                icon: 'success',
                                title: 'paid with credits',
                                text: "success",
                                showConfirmButton: false,
                                timer: 2500
                            })
                        }
                    }

                }


                // if(!paid){
                //     navigate(-1)
                // }
            })
        }catch(error){
            console.log(error,"error")
        }

    },[type,id,navigate])
    const navRoute = ({url,state,ref}) => {
        navigate(url,{
            state : {
                ...state
            }
        })
    }

    // useEffect(() => {
    //     if(hasFetched.current.rate){
    //         return
    //     }
    //     hasFetched.current.rate = true
    //     const getRate = async() => {
    //         const response = await fetch(`${process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_pull : process.env.REACT_APP_pull_LIVE}`, {
    //             method: "POST",
    //             credentials: "include",
    //             body:JSON.stringify({
    //                 id
    //             }),
    //             headers: {
    //                 'Content-Type': 'application/json', // Indicates the body is JSON
    //             },
    //         });

    //         const {human, personal, all} = await response.json()
    //         console.log(human, personal, all)
    //         setRating(personal)
    //         setStars(all)
    //         setUsers(human)
    //     }
    //     getRate()
    // },[id])

    // useEffect(() => {
    //     if(!paid){
    //         navigate(-1)
    //     }
    // },[paid,navigate])

    // const ratingChanged = async(rating) => {
    //     const response = await fetch(`${process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_rate_add : process.env.REACT_APP_rate_add_LIVE}`, {
    //       method: "POST",
    //       credentials: "include",
    //       body:JSON.stringify({
    //         id,
    //         rate:rating
    //       }),
    //       headers: {
    //         'Content-Type': 'application/json', // Indicates the body is JSON
    //       },
    //     });

    //     const {status, error, message} = await response.json()

    //     if(error || !status){
    //         Swal.fire({
    //             icon: 'error',
    //             title: 'Oops...',
    //             text: error || message,
    //             showConfirmButton: false,
    //             timer: 2500
    //         })

    //         return null
    //     }
    //     Swal.fire({
    //         icon: 'success',
    //         title: 'I will find you...',
    //         text: "success",
    //         showConfirmButton: false,
    //         timer: 2500
    //     })
    // }
    useEffect(() => {
        async function getSubtitles() {
            try {
                const response = await fetch(
                process.env.REACT_APP_ENVIRONMENT === "development"
                    ? process.env.REACT_APP_SPEED_SUBTITLES_FILES
                    : process.env.REACT_APP_SPEED_SUBTITLES_FILES_LIVE,
                {
                    method: "POST",
                    headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    },
                    body: JSON.stringify({
                        id,
                        index,
                    }),
                }
                );
                const { status, files } = await response.json();
                console.log("gotten files: " + files)
                if(status) {
                    setFiles([...files])
                }
            } catch (error) {
                console.log("Error fetching subtitles:", error);
            }
        }
        getSubtitles()
    },[index,id])
    useEffect(() => {
        listVideos()
        .then(data => console.log(data))
    },[])

    let count = 0
    useEffect(() => {
        console.log("count",count)
        let nameStr = `
            ${
                name || serie_name
            }
            ${
                season && "||" + season
            }
            ${
                episode && "||" + episode
            }
        `
        !count && COLLECT(nameStr)
        count++
        
    },[count,name,season,episode,serie_name])

    const offlineDownload = async() => {
        const runDownload = async() => {
            try{   
                // await saveVideo(null, null, null, {}, '5555');
                // console.log(await getVideoRecord('5555'))
                // return
                //check if already downloaded
                setDownload(true);

                async function getVideo(){
                    try{
                        const url = `${process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_DOWNLOAD + '/' + id : process.env.REACT_APP_DOWNLOAD_LIVE + '/' + id}`

                        const response = await axios.get(`${url}`, {
                            responseType: "blob",
                            onDownloadProgress: (event) => {
                                console.log("downloading...")
                                if (event.total) {
                                    const percent = Math.round((event.loaded * 100) / event.total);
                                    setProgress(percent);
                                }
                            },
                        });

                        if(response.data){
                            const blob = new Blob([response.data], { type: "video/mp4" });
                            return blob
                        }
                            
                        return null
                    }catch(error){
                        console.log(error)
                        return null
                    }
                }

                async function getSubtitle(){
                    try{
                        const subtitle_url = `${process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_DOWNLOAD_subtitle + '/' + id : process.env.REACT_APP_DOWNLOAD_subtitle_LIVE + '/' + id}`
                        // const subtitle_res = await fetch(subtitle_url)
                        // const subtitle_blob = await subtitle_res.blob();
                        const subtitle_response = await axios.get(`${subtitle_url}`, {
                            responseType: "blob",
                            onDownloadProgress: (event) => {
                                if (event.total) {
                                    const percent = Math.round((event.loaded * 100) / event.total);
                                    setSubtitleProgress(percent);
                                }
                            },
                        });

                        if(subtitle_response.data){
                            const subtitle_blob = new Blob([subtitle_response.data], { type: "video/mp4" });
                            return subtitle_blob
                        }
                        return null
                    }catch(error){
                        console.log(error)
                        return null
                    }
                }
                

                const fetched = await fetchSingleMovie({
                    variables : { id }})

                const imageUrl = `${process.env.REACT_APP_IMG_POSTER + fetched.data.single?.poster_path}`
                const proxyUrl = `${process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_DOWNLOAD_img : process.env.REACT_APP_DOWNLOAD_img_LIVE }?url=${encodeURIComponent(imageUrl)}`;
                const poster_res = await fetch(proxyUrl);
                let poster_blob = null;
                if(poster_res)
                    poster_blob = await poster_res.blob();
                // console.log(poster_blob)
                await saveVideo(
                    await getVideo(), 
                    await getSubtitle(),
                    poster_blob, 
                    {...fetched?.data?.single}, 
                    id);
                setDownload(false);
                Swal.fire({
                    icon: 'success',
                    title: 'downloaded',
                    text: "success",
                    showConfirmButton: false,
                    timer: 2500
                })
                
            }catch(error){
                console.log(error)
            }
        }

        if(listVideoKeys.length < 15){
            async function authentication(){
                const res = await fetch(process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_API_URL : process.env.REACT_APP_API_URL_LIVE,{credentials: "include"})
                return  await res.json()
            }
            authentication().then(async isLoggedIn => {
                // let hasCredits = false
                // let hasPaid = false
                if(isLoggedIn.status){

                    const res = await fetch(process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_CHECK_USER_CREDITS : process.env.REACT_APP_CHECK_USER_CREDITS_LIVE,{credentials: "include"})
                    const {sum} = await res.json()
                    //affordable for one movie | episode
                    if(sum && sum > 99){
                        const res = await fetch(`${process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_PAY_USER_CREDITS : process.env.REACT_APP_PAY_USER_CREDITS_LIVE}`,{
                            credentials: "include",
                            method:"POST",
                            headers:{
                                "Content-Type":"application/json",
                                "Accept":"application/json"
                            },
                            body:JSON.stringify({
                                credit:100.00,
                                data:{
                                    "receipt":"download",
                                    "player-type":[type],
                                    "title":id
                                }

                            })
                        })
                        const {status,message} = await res.json()
                        console.log(message)
                        
                        //affordable for one movie | episode
                        if(status){
                            // setPaid(status)
                            // paid = status
                            Swal.fire({
                                icon: 'success',
                                title: 'paid with credits',
                                text: "success",
                                showConfirmButton: false,
                                timer: 2500
                            })
                            runDownload()
                        }
                    }else{
                        Swal.fire({
                            icon: 'error',
                            title: '100 CREDITS REQUIRED',
                            text: "add more credits",
                            showConfirmButton: false,
                            timer: 1500
                        })
                                            
                    }

                }else{
                    let user = localStorage.getItem("session")
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
                    //affordable for one movie | episode
                    if(sum && sum > 99){
                        const res = await fetch(`${process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_PAY_REPORT_CREDITS : process.env.REACT_APP_PAY_REPORT_CREDITS_LIVE}`,{
                            credentials: "include",
                            method:"POST",
                            headers:{
                                "Content-Type":"application/json",
                                "Accept":"application/json"
                            },
                            body:JSON.stringify({
                                user,
                                credit:100.00,
                                data:{
                                    "receipt":"download",
                                    "player-type":[type],
                                    "title":id
                                }

                            })
                        })
                        const {status} = await res.json()                    
                        //affordable for one movie | episode
                        if(status){
                            // setPaid(status)
                            // paid = status
                            Swal.fire({
                                icon: 'success',
                                title: 'paid with credits',
                                text: "success",
                                showConfirmButton: false,
                                timer: 2500
                            })
                            runDownload()
                        }
                    }else{
                        Swal.fire({
                            icon: 'error',
                            title: '100 CREDITS REQUIRED',
                            text: "add more credits",
                            showConfirmButton: false,
                            timer: 1500
                        })
                    }

                }
            })   
        }else{
            Swal.fire({
                icon: 'error',
                title: 'storage is full',
                text: "full",
                showConfirmButton: false,
                timer: 2500
            })
        }    
    }
    return (
        <div className={`${windowWidth > 800 ? "w-[100%] min-h-[100%]  bg-cover bg-no-repeat bg-center text-white":"w-[100%] h-[100%] overflow-y-auto bg-cover bg-no-repeat bg-center text-white"}`} style={{backgroundImage:`linear-gradient(45deg, rgba(0,0,0,0.75), hsl(220, 70%, 10%)),url(${process.env.REACT_APP_IMG_POSTER + "/" + background + ".jpg"})`,backgroundPosition:"0% 40%"}}>
            <div className='w-[100%] text-[#ffd800] h-[500px] flex flex-row flex-wrap'>
                <h2>Playing {name || serie_name} {
                    season && " || " + season
                }
                {
                    episode && " || " + episode
                }</h2>
                <p className="text-white">
                  {views} <FontAwesomeIcon icon={faEye} />
                </p>
                {
                   dash ? 
                        <DashPlayer src={process.env.REACT_APP_ENVIRONMENT === "development" ? `${process.env.REACT_APP_DASH_PLAY}/${id}/${id}.mpd`:`${process.env.REACT_APP_DASH_PLAY_LIVE}/${id}/${id}.mpd`} />
                    :
                        <>
                            <VIDEO 
                                videoUrl={process.env.REACT_APP_ENVIRONMENT === "development"
                                    ? `${process.env.REACT_APP_SPEED_PLAY}/${id}`
                                    : `${process.env.REACT_APP_SPEED_PLAY_LIVE}/${id}`}
                                subtitleUrl={process.env.REACT_APP_ENVIRONMENT === "development"
                                        ? `${process.env.REACT_APP_HOST_SUB}/${id}`
                                        : `${process.env.REACT_APP_HOST_SUB_LIVE}/${id}`} 
                                subFiles={subFiles}
                            />
                        </>


                }
                <div className='w-[100%] text-[20px] flex flex-col mt-[7%]'>
                    <button
                        onClick={() => offlineDownload()}
                        disabled={download}
                    >
                        {
                            download ? 
                                <>
                                    <FontAwesomeIcon icon={faDownload} spin /> 
                                    <span>downloading...</span>
                                </>
                                
                            : 
                                <>
                                    <FontAwesomeIcon icon={faDownload} />
                                    <span>download</span>
                                </>
                                    
                        }
                    </button>
                    {
                        download && (
                            <div className="w-[100%]">
                                <p>Video Progress</p>
                                <div className="w-64 bg-gray-200 h-4 rounded mt-3">
                                    <div
                                        className="bg-green-500 h-4 rounded"
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                                <p>{progress}%</p>
                                <p>Subtitle Progress</p>
                                <div className="w-64 bg-gray-200 h-4 rounded mt-3">
                                    <div
                                        className="bg-green-500 h-4 rounded"
                                        style={{ width: `${subtitleProgress}%` }}
                                    ></div>
                                </div>
                                <p>{subtitleProgress}%</p>
                            </div>
                        )
                    }
                    
                </div>
                {
                    seasons && episodes?
                    <div className="w-[80%] ml-[10%] mt-[2%] mb-[5%]">
                        <h2>Episodes</h2>
                        <div className={`w-[100%] duration-50 movie-scene ${windowWidth > 800 ? "h-[200px]" : "h-[150px]"} flex flex-col flex-wrap overflow-x-auto overflow-y-hidden my-[2%]`}>
                            {
                                episodes.map(({
                                    air_date,
                                    episode_number,
                                    episode_type,
                                    id,
                                    name,
                                    overview,
                                    production_code,
                                    runtime,
                                    season_number,
                                    show_id,
                                    still_path,
                                    vote_average,
                                    vote_count       
                                },movie_key) => 
                                    <div 
                                        key={movie_key} 
                                        onClick={() => navRoute({
                                            url:`/series/episode`,
                                            state:{
                                                stream:"series",
                                                id:serieID,
                                                anime,
                                                episodeID:id,
                                                season:season_number,
                                                episode:episode_number,
                                                name:serie_name,
                                                background:still_path,
                                                anime:seasons.find(season => season.season_number === season_number)?.genres 
                                                ? 
                                                    seasons.find(season => season.season_number === season_number)?.genres.find(({id}) => id === 16)
                                                :
                                                    seasons.find(season => season.season_number === season_number).genre_ids?seasons.find(season => season.season_number === season_number).genre_ids.includes(16)
                                                :
                                                    false,
                                                moveSeasons:seasons,
                                                moveEpisodes:episodes
                                            }})}   
                                        className={windowWidth > 800 ? "cursor-pointer w-[25%] h-[100%] hover:contrast-150":`w-[40%] h-[100%] hover:contrast-150`}
                                    >
                                        <div 
                                            className="w-[100%] h-[100%] background"
                                            style={{
                                                // boxShadow:windowWidth > 800 ? "rgba(0,0,0,0.8) -20px -150px 130px inset, rgba(0, 0, 0, 0.7) 0px 100px 10px, rgba(0, 0, 0, 0.8) 100px 50px 10px" : "",

                                                backgroundImage: `
                                                    linear-gradient(to bottom, rgba(0,0,0,0) 60%, rgba(0,0,0,0.85) 100%),
                                                    url(${process.env.REACT_APP_IMG_POSTER + still_path})
                                                `
                                            }}
                                        >
                                            {/* <PICTURE key={id} classes={"object-cover h-[100%]"} picture={poster_path} /> */}
                                            <div className={`relative ${windowWidth > 800 ? "top-[50%]" : "top-[50%]"} left-1/2 transform -translate-x-1/2 w-[100%] min-h-[60px] bg-opacity-60 text-white flex flex-col items-center justify-center z-10`}>
                                                <h1>episode: {episode_number}</h1>
                                                <h2 className={windowWidth > 800 ? "text-[15px]  font-bold":"text-[12px]"}>{name}</h2>
                                                {/* <p style={{color:"#ffd800"}}><FontAwesomeIcon icon={faStar} /> { parseFloat(vote_average).toFixed(1) || parseFloat(popularity).toFixed(1) || vote_count}</p> */}
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
                        <h2>Seasons</h2>
                        <div className={`w-[100%] duration-50 movie-scene ${windowWidth > 800 ? "h-[200px]" : "h-[150px]"} flex flex-col flex-wrap overflow-x-auto overflow-y-hidden my-[1%]`}>
                            {
                                seasons.map(({
                                    air_date,
                                    episode_count,
                                    id,
                                    name,
                                    overview,
                                    poster_path,
                                    season_number,
                                    vote_average    
                                },movie_key) => 
                                    <div 
                                        key={movie_key} 
                                        onClick={() => navRoute({
                                            url:`/series/season`,
                                            state:{
                                                stream:"series",
                                                id:serieID,
                                                seasonID:id,
                                                season:season_number,
                                                name:serie_name,
                                                anime,
                                                seasons,
                                                background:poster_path,
                                                anime:seasons.find(season => season.season_number === season_number)?.genres 
                                                    ? 
                                                        seasons.find(season => season.season_number === season_number)?.genres.find(({id}) => id === 16)
                                                    :
                                                        seasons.find(season => season.season_number === season_number).genre_ids?seasons.find(season => season.season_number === season_number).genre_ids.includes(16)
                                                    :
                                                        false,
                                            }

                                        })}   
                                        className={windowWidth > 800 ? "cursor-pointer w-[25%] h-[100%] hover:contrast-150":`w-[40%] h-[100%] hover:contrast-150`}
                                    >
                                        <div 
                                            className="w-[100%] h-[100%] background"
                                            style={{
                                                backgroundImage: `
                                                    linear-gradient(to bottom, rgba(0,0,0,0) 60%, rgba(0,0,0,0.85) 100%),
                                                    url(${process.env.REACT_APP_IMG_POSTER + poster_path})
                                                `
                                            }}
                                        >
                                            <div className={`relative ${windowWidth > 800 ? "top-[50%]" : "top-[50%]"} left-1/2 transform -translate-x-1/2 w-[100%] min-h-[60px] bg-opacity-60 text-white flex flex-col items-center justify-center z-10`}>
                                                <h2 className={windowWidth > 800 ? "text-[15px]  font-bold":"text-[12px]"}>{name}</h2>
                                            </div>
                                        </div>
                                    </div>
                                )
                            }
                        </div>                    
                    </div>
                    :
                    ""
                }
            </div>

        </div>
    )
}

export default SPEED;
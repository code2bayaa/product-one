import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { Rating } from 'react-simple-star-rating'
import Swal from "sweetalert2";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faStar, faUserCheck } from '@fortawesome/free-solid-svg-icons';
import DashPlayer from '../midlleware/dash';
import { gql, useLazyQuery } from '@apollo/client';
// import { v4 as uuidv4 } from "uuid";
import { saveVideo, listVideoKeys, listVideos } from '../models/idb';
import PLYR from "../midlleware/plyr";

const SPEED = () => {
    const hasFetched = useRef({paid:false,rate:false})
    const {state} = useLocation()
    const { name, background, id, type, dash } = state;
    console.log(name)
    const [rating, setRating] = useState(3.2)
    const [stars,setStars] = useState(0)
    const [users, setUsers] = useState(0)
    // const [paid, setPaid] = useState(false)
    const [windowWidth, setWindowWidth] = useState(0)
    const [download, setDownload] = useState(false)
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

    //pay with credits
    useEffect(() => {
        try{
        // if(hasFetched.current.paid){
        //     return
        // }
        // hasFetched.current.paid = true
            async function authentication(){
                const res = await fetch(process.env.REACT_APP_environment === "development" ? process.env.REACT_APP_api_url : process.env.REACT_APP_api_url_live,{credentials: "include"})
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
                    const response = await fetch(`${process.env.REACT_APP_environment === "development" ? process.env.REACT_APP_user_paid : process.env.REACT_APP_user_paid_live}`,{
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
                    console.log(response_data)

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

                    const res = await fetch(process.env.REACT_APP_environment === "development" ? process.env.REACT_APP_check_user_credits : process.env.REACT_APP_check_user_credits_live,{credentials: "include"})
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
                        const res = await fetch(`${process.env.REACT_APP_environment === "development" ? process.env.REACT_APP_update_user_credits : process.env.REACT_APP_update_user_credits_live}`,{
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
                        const res = await fetch(`${process.env.REACT_APP_environment === "development" ? process.env.REACT_APP_pay_user_credits : process.env.REACT_APP_pay_user_credits_live}`,{
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
                    const res = await fetch(`${process.env.REACT_APP_environment === "development" ? process.env.REACT_APP_paid : process.env.REACT_APP_paid_live}`,{
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

                    const response = await fetch(`${process.env.REACT_APP_environment === "development" ? process.env.REACT_APP_check_report_credits : process.env.REACT_APP_check_report_credits_live}`,{
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
                        const res = await fetch(`${process.env.REACT_APP_environment === "development" ? process.env.REACT_APP_update_report_credits : process.env.REACT_APP_update_report_credits_live}`,{
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

                        const response = await fetch(`${process.env.REACT_APP_environment === "development" ? process.env.REACT_APP_pay_report_credits : process.env.REACT_APP_pay_report_credits_live}`,{
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


    useEffect(() => {
        if(hasFetched.current.rate){
            return
        }
        hasFetched.current.rate = true
        const getRate = async() => {
            const response = await fetch(`${process.env.REACT_APP_environment === "development" ? process.env.REACT_APP_pull : process.env.REACT_APP_pull_live}`, {
                method: "POST",
                credentials: "include",
                body:JSON.stringify({
                    id
                }),
                headers: {
                    'Content-Type': 'application/json', // Indicates the body is JSON
                },
            });

            const {human, personal, all} = await response.json()
            console.log(human, personal, all)
            setRating(personal)
            setStars(all)
            setUsers(human)
        }
        getRate()
    },[id])

    // useEffect(() => {
    //     if(!paid){
    //         navigate(-1)
    //     }
    // },[paid,navigate])

    const ratingChanged = async(rating) => {
        const response = await fetch(`${process.env.REACT_APP_environment === "development" ? process.env.REACT_APP_rate_add : process.env.REACT_APP_rate_add_live}`, {
          method: "POST",
          credentials: "include",
          body:JSON.stringify({
            id,
            rate:rating
          }),
          headers: {
            'Content-Type': 'application/json', // Indicates the body is JSON
          },
        });

        const {status, error, message} = await response.json()

        if(error || !status){
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: error || message,
                showConfirmButton: false,
                timer: 2500
            })

            return null
        }
        Swal.fire({
            icon: 'success',
            title: 'I will find you...',
            text: "success",
            showConfirmButton: false,
            timer: 2500
        })
    }

    useEffect(() => {
        listVideos()
        .then(data => console.log(data))
        
    },[])

    const offlineDownload = async() => {
        const runDownload = async() => {
            try{

                
                    //check if already downloaded
                    setDownload(true);
                    const url = `${process.env.REACT_APP_environment === "development" ? process.env.REACT_APP_download + '/' + id : process.env.REACT_APP_download_live + '/' + id}`
                    const res = await fetch(url);
                    const blob = await res.blob();
                    // console.log(blob)

                    const subtitle_url = `${process.env.REACT_APP_environment === "development" ? process.env.REACT_APP_download_subtitle + '/' + id : process.env.REACT_APP_download_subtitle_live + '/' + id}`
                    const subtitle_res = await fetch(subtitle_url)
                    const subtitle_blob = await subtitle_res.blob();
                    
                    // console.log(subtitle_blob)
                    // const id = 
                    const fetched = await fetchSingleMovie({
                        variables : { id }})
                        // console.log(fetched)

                    const imageUrl = `${process.env.REACT_APP_img_poster + fetched.data.single?.poster_path}`
                    // const poster_res = await fetch(poster_url)
                    // const poster_blob = await poster_res.blob();
                    const proxyUrl = `${process.env.REACT_APP_environment === "development" ? process.env.REACT_APP_download_img : process.env.REACT_APP_download_img_live }?url=${encodeURIComponent(imageUrl)}`;
                    const poster_res = await fetch(proxyUrl);
                    const poster_blob = await poster_res.blob();
                    // console.log(poster_blob)
                    await saveVideo(blob, subtitle_blob, poster_blob, {...fetched.data.single}, id);
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
                const res = await fetch(process.env.REACT_APP_environment === "development" ? process.env.REACT_APP_api_url : process.env.REACT_APP_api_url_live,{credentials: "include"})
                return  await res.json()
            }
            authentication().then(async isLoggedIn => {
                // let hasCredits = false
                // let hasPaid = false
                if(isLoggedIn.status){

                    const res = await fetch(process.env.REACT_APP_environment === "development" ? process.env.REACT_APP_check_user_credits : process.env.REACT_APP_check_user_credits_live,{credentials: "include"})
                    const {sum} = await res.json()
                    //affordable for one movie | episode
                    if(sum && sum > 99){
                        const res = await fetch(`${process.env.REACT_APP_environment === "development" ? process.env.REACT_APP_pay_user_credits : process.env.REACT_APP_pay_user_credits_live}`,{
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
                    const response = await fetch(`${process.env.REACT_APP_environment === "development" ? process.env.REACT_APP_check_report_credits : process.env.REACT_APP_check_report_credits_live}`,{
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
                        const res = await fetch(`${process.env.REACT_APP_environment === "development" ? process.env.REACT_APP_pay_report_credits : process.env.REACT_APP_pay_report_credits_live}`,{
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
        <div className={`${windowWidth > 800 ? "w-[100%] min-h-[100%]  bg-cover bg-no-repeat bg-center text-white":"w-[100%] h-[100%] overflow-y-auto bg-cover bg-no-repeat bg-center text-white"}`} style={{backgroundImage:`linear-gradient(45deg, rgba(0,0,0,0.75), hsl(220, 70%, 10%)),url(${process.env.REACT_APP_img_poster + "/" + background + ".jpg"})`,backgroundPosition:"0% 40%"}}>
            <div className='w-[100%] text-[#ffd800] h-[500px] flex flex-row flex-wrap'>
                {
                   dash ? 
                        <DashPlayer src={process.env.REACT_APP_environment === "development" ? `${process.env.REACT_APP_dash_play}/${id}/${id}.mpd`:`${process.env.REACT_APP_dash_play_live}/${id}/${id}.mpd`} />
                    :
                        <>
                            {/* <video controls width="100%" height="100%">
                                <source
                                    src={process.env.REACT_APP_environment === "development"
                                    ? `${process.env.REACT_APP_speed_play}/${id}`
                                    : `${process.env.REACT_APP_speed_play_live}/${id}`}
                                    type="video/mp4"
                                />
                                <track
                                    label="English"
                                    kind="subtitles"
                                    srclang="en"
                                    src={
                                    process.env.REACT_APP_environment === "development"
                                        ? `${process.env.REACT_APP_host_sub}/${id}`
                                        : `${process.env.REACT_APP_host_sub_live}/${id}`
                                    }
                                    default
                                />
                            </video> */}
                            <PLYR 
                                videoUrl={process.env.REACT_APP_environment === "development"
                                    ? `${process.env.REACT_APP_speed_play}/${id}`
                                    : `${process.env.REACT_APP_speed_play_live}/${id}`}
                                subtitleUrl={process.env.REACT_APP_environment === "development"
                                        ? `${process.env.REACT_APP_host_sub}/${id}`
                                        : `${process.env.REACT_APP_host_sub_live}/${id}`} 
                            />
                        </>


                }
                <div className='w-[100%] text-[20px] flex flex-col'>
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
                </div>


                <Rating
                    onClick={ratingChanged}
                    initialValue={rating}
                    // onPointerEnter={onPointerEnter}
                    // onPointerLeave={onPointerLeave}
                    // onPointerMove={onPointerMove}
                    /* Available Props */
                />
                <div className='w-[20%] text-[20px] flex flex-col'>
                    <div className='w-[100%]'><FontAwesomeIcon icon={faStar} /> / {stars} <hr/></div>
                    <div className='w-[100%]'><FontAwesomeIcon icon={faUserCheck} />/ {users}</div>
                </div>

            </div>

        </div>
    )
}

export default SPEED;
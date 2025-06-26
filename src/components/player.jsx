// import Plyr from "plyr-react";
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';
// import Hls from 'hls.js'
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
// import ReactStars from 'react-rating-stars-component';
import { Rating } from 'react-simple-star-rating'
import Swal from "sweetalert2";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faUserCheck } from '@fortawesome/free-solid-svg-icons';
// import * as dashjs from 'dashjs';
// import '../node_modules/dashjs/dist/modern/esm/dash.mss.min.js';

const PLAYER = () => {
    const { host, index, id, type, background } = useParams();
    const [rating, setRating] = useState(3.2)
    const [stars,setStars] = useState(0)
    const [users, setUsers] = useState(0)
    const [user, setUser] = useState(null)
    const [paid, setPaid] = useState(false)
    // const videoRef = useRef(null)
    // const [mkv, setMKV] = useState(false)
    // const [playID,setPlayID] = useState(null)
    // const api_url = process.env.REACT_APP_api_url
    

    //pay with credits
    useEffect(() => {
        try{
            async function authentication(){
                const res = await fetch(process.env.REACT_APP_environment === "development" ? process.env.REACT_APP_api_url : process.env.REACT_APP_api_url_live,{credentials: "include"})
                return  await res.json()
                // console.log(message)
                // return status
            }
            authentication().then(async isLoggedIn => {
                console.log(isLoggedIn)
                //pay with credits from session | user
                if(isLoggedIn.status){
                    
                    setUser(isLoggedIn.user)
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
                        setPaid(success)
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
                            setPaid(status)
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

                    setUser(user)
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
                        setPaid(success)
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
                            setPaid(status)
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
            })
        }catch(error){
            console.log(error,"error")
        }

    },[setPaid,type,id])

    useEffect(() => {
        console.log("paid",paid)
        console.log("type",type)
        // if(paid && type === "mkv"){
        if(paid && type !== "mkv"){
            // let url = "https://playready.directtaps.net/smoothstreaming/SSWSS720H264/SuperSpeedway_720.ism/Manifest";
            // let player = dashjs.MediaPlayer().create();
            // player.initialize(document.querySelector('#plyr-video'), url, true);
        //     // setMKV(true)   
        //     // async function runVLC() { 
        //     //     const streamUrl = `${process.env.REACT_APP_player_env}${host}/${index}`

        //     //     const response = await fetch(`${process.env.REACT_APP_playing}`,{
        //     //         method:"POST",
        //     //         headers:{
        //     //             "Content-Type":"application/json",
        //     //             "Accept":"application/json"
        //     //         },
        //     //         body:JSON.stringify({
        //     //             url:streamUrl,
        //     //             id,
        //     //             index
        //     //         })
        //     //     })
        //     //     const {status, error, message, url} = await response.json()
        //     //     console.log(status,message,url,error)
        //     // }
        //     // runVLC()
        //     console.log("paid and type is mkv",`${process.env.REACT_APP_player_env}${host}/${index}`)
        //     // window.location.href = `${process.env.REACT_APP_player_env}${host}/${index}`;
        //     // Send a message from your page to the content script

            // const video = videoRef.current

            // if (Hls.isSupported()) {
            //     console.log("HLS supported")
            //     const hls = new Hls()
            //     hls.loadSource(`${process.env.REACT_APP_player_env}${host}/${index}`)
            //     hls.attachMedia(video)
            // } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            //     console.log("not HLS supported")
            //     video.src = `${process.env.REACT_APP_player_env}${host}/${index}`
            // }

            // const player = new Plyr("#plyr-video")
            const mkvCheck = document.querySelector("#plyr-video source");
            if(mkvCheck && mkvCheck.src){
                console.log("playing plyr")
                new Plyr('#plyr-video', {
                    autoplay: false,
                    muted: false,
                    controls: [
                        "play",
                        "volume",
                        "fullscreen",
                        'play-large',
                        'progress',
                        'duration',
                        'mute',
                        'captions'
                    ],
                    // settings: ['quality', 'speed', 'loop'],
                    // quality: {
                    //     default: 720,
                    //     options: [
                    //         { value: 1080, label: '1080p' },
                    //         { value: 720, label: '720p' },
                    //         { value: 480, label: '480p' },
                    //         { value: 360, label: '360p' },
                    //     ],
                    // },
                });
            }                
        }

    },[type,host,index,id,paid])

    // useEffect(() => {

    //     // return () => {
    //         // setPlayID(true)
    //     // }
    //     if(paid && host && index){

    //         if(type === "mkv"){
    //             window.location.href = `/vlc/${process.env.REACT_APP_player_env}${host}/${index}`;
    //             return
    //         }
    //         // console.log(("playID",`${process.env.REACT_APP_player_env}${host}/${index}`))

    //         // setPlayID(`${process.env.REACT_APP_player_env}${host}/${index}`)
    //     }
    // },[host,index,paid])

    useEffect(() => {
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

        const {status, error, message, results} = await response.json()

        console.log(results,"results")
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

    return (
        <div className="w-[100%] min-h-[100%]  bg-cover bg-no-repeat bg-center text-white" style={{backgroundImage:`linear-gradient(45deg, rgba(0,0,0,0.75), hsl(220, 70%, 10%)),url(${process.env.REACT_APP_img_poster + "/" + background + ".jpg"})`,backgroundPosition:"0% 40%"}}>
            <div className='w-[100%] text-[#ffd800] h-[60px] flex flex-row flex-wrap'>
                {
                    (type === "mkv") ? 
                        <div className='w-[100%]'>
                            <h1 className='text-[30px] font-bold'>mkv Player</h1>
                            <p className='text-[20px]'>This is a mkv player, you can use Chrome browser to play this file.</p>
                        </div> 
                    :
                        ""
                }
                {
                    // type === "mkv" ?
                    // (
                        <video controls className="w-[100%] h-[500px]" src={`${process.env.REACT_APP_environment === "development" ? process.env.REACT_APP_host_play : process.env.REACT_APP_host_play_live}/${id}/${index}/${user}`} />

                    // )
                    // :
                    // (
                    //     <video id="plyr-video" crossOrigin="true" className="w-[100%] h-[500px]">
                    //         <source src={`${process.env.REACT_APP_host_play}/${id}/${index}/${user}`} type="video/mp4" />
                    //         Your browser does not support the video tag.
                            
                    //     </video>
                    // )

                }

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

export default PLAYER;
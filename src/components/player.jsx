// import Plyr from "plyr-react";
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
// import ReactStars from 'react-rating-stars-component';
import { Rating } from 'react-simple-star-rating'
import Swal from "sweetalert2";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faUserCheck } from '@fortawesome/free-solid-svg-icons';

const PLAYER = () => {
    const { host, index, id, type, background } = useParams();
    const [rating, setRating] = useState(3.2)
    const [stars,setStars] = useState(0)
    const [users, setUsers] = useState(0)
    // const [mkv, setMKV] = useState(false)
    // const [playID,setPlayID] = useState(null)
    // const api_url = process.env.REACT_APP_api_url
    
    useEffect(() => {
        if(type === "mkv"){
            // setMKV(true)   
            async function runVLC() { 
                const streamUrl = `${process.env.REACT_APP_player_env}${host}/${index}`

                const response = await fetch(`${process.env.REACT_APP_playing}`,{
                    method:"POST",
                    headers:{
                        "Content-Type":"application/json",
                        "Accept":"application/json"
                    },
                    body:JSON.stringify({
                        url:streamUrl,
                        id

                    })
                })
                const {status, error, message, url} = await response.json()
                console.log(status,message,url,error)
            }
            runVLC()

                
        }
    },[type,host,index,id])

    useEffect(() => {

        // return () => {
            // setPlayID(true)
        // }
        if(host && index){
            // console.log(("playID",`${process.env.REACT_APP_player_env}${host}/${index}`))
            const mkvCheck = document.querySelector("#plyr-video source");
            if(mkvCheck && mkvCheck.src){
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
            // setPlayID(`${process.env.REACT_APP_player_env}${host}/${index}`)
        }
    },[host,index])

    useEffect(() => {
        const getRate = async() => {
            const response = await fetch(`${process.env.REACT_APP_pull}`, {
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
        // console.log(rating,"rating")
        const response = await fetch(`${process.env.REACT_APP_rate_add}`, {
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
        <div className="w-[100%] min-h-[100%]  bg-cover bg-no-repeat bg-center text-white" style={{backgroundImage:`linear-gradient(135deg, hsl(250, 70%, 15%), hsl(220, 70%, 10%)),url(${process.env.REACT_APP_img_poster + "/" + background + ".jpg"})`,backgroundPosition:"0% 40%"}}>
            <div className='w-[100%] text-[#ffd800] h-[60px] flex flex-row flex-wrap'>
                {
                    (type === "mkv") ? <h2>Check your VLC</h2> : ""
                }
                
                <video id="plyr-video" crossOrigin="true" className="w-[100%] h-[500px]">
                    <source src={`${process.env.REACT_APP_player_env}${host}/${index}`} type="video/mp4" />
                    Your browser does not support the video tag.
                    
                </video>
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

import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { Rating } from 'react-simple-star-rating'
import Swal from "sweetalert2";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faUserCheck } from '@fortawesome/free-solid-svg-icons';
import PLYR from "../midlleware/plyr";

const PLAYER = () => {
    
    const hasFetched = useRef({rate:false,authentication:false})
    const {state} = useLocation()
    const { host, index, id, type, background, many } = state
    console.log(host)
    const [rating, setRating] = useState(3.2)
    const [stars,setStars] = useState(0)
    const [users, setUsers] = useState(0)
    // const [user, setUser] = useState(null)
    // const [paid, setPaid] = useState(false)
    const [windowWidth, setWindowWidth] = useState(0)
    const navigate = useNavigate()
    

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
        if(hasFetched.current.authentication){
            return
        }
        hasFetched.current.authentication = true
        try{
            async function authentication(){
                const res = await fetch(process.env.REACT_APP_environment === "development" ? process.env.REACT_APP_api_url : process.env.REACT_APP_api_url_live,{credentials: "include"})
                return  await res.json()
                // console.log(message)
                // return status
            }
            authentication().then(async isLoggedIn => {
                console.log(isLoggedIn)
                let hasPaid = false
                //pay with credits from session | user
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
                        if(success)
                            hasPaid = true
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
                            hasPaid = true
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
                        if(success)
                            hasPaid = true
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
                            hasPaid = true
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

                if(!hasPaid){
                    navigate(-1)
                }
            })
        }catch(error){
            console.log(error,"error")
        }

    },[type,id, navigate])

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
        <div className={`${windowWidth > 800 ? "w-[100%] min-h-[100%]  bg-cover bg-no-repeat bg-center text-white":"w-[100%] h-[100%] overflow-y-auto bg-cover bg-no-repeat bg-center text-white"}`} style={{backgroundImage:`linear-gradient(45deg, rgba(0,0,0,0.75), hsl(220, 70%, 10%)),url(${typeof background === "object" ? process.env.REACT_APP_img_poster + background.path : process.env.REACT_APP_img_poster + "/" + background + ".jpg"})`,backgroundPosition:"0% 40%"}}>
            <div className='w-[100%] text-[#ffd800] h-[60px] flex flex-row flex-wrap'>
                {
                    (type === "mkv" && !/Chrome/.test(localStorage.getItem("device"))) ? 
                        <div className='w-[100%]'>
                            <h1 className='text-[30px] font-bold'>mkv Player</h1>
                            <p className='text-[20px]'>This is a mkv player, you can use Chrome browser to play this file.</p>
                        </div> 
                    :
                        ""
                }
                {
 
                    <>
                        <PLYR 
                            videoUrl={`${process.env.REACT_APP_environment === "development" ? 
                                process.env.REACT_APP_host_play : 
                                process.env.REACT_APP_host_play_live}/${id}/${index}/${many}`}
                            subtitleUrl={process.env.REACT_APP_environment === "development"
                                    ? `${process.env.REACT_APP_sub_playing}/${id}/${index}`
                                    : `${process.env.REACT_APP_sub_playing_live}/${id}/${index}`} 
                        />
                        {/* <video controls autoplay muted className="w-[100%] h-[500px]" src={`${process.env.REACT_APP_environment === "development" ? process.env.REACT_APP_host_play : process.env.REACT_APP_host_play_live}/${id}/${index}/${many}`} /> */}
                        {/* <track src={`${process.env.REACT_APP_environment === "development" ? process.env.REACT_APP_host_sub : process.env.REACT_APP_host_sub_live}/${id}/${index}/`} kind="subtitles" srclang="en" label="English" default />                     */}
                    </> 

                }
                {/* <div className='w-[100%] text-[20px] flex flex-col'>
                    <button 
                        onClick={() => offlineDownload()}
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
                </div> */}
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
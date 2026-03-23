"use client"
import { faStar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react'
import Swal from 'sweetalert2'
// import { useRouter } from "next/navigation";

const COLLECTIONS = ({anime, serieID, serie_name,index,seasons,episodes,title,season,episode,collect,stream,token,quality,id,background,maxRate,seeders,size,windowWidth}) => {

    const [loading, setLoading] = useState(false);
    const [rate,setRate] = useState(0);
    const navigate = useNavigate();
    // const router = useRouter()
    
    useEffect(() => {
        // Check if the rate is a number and set it
        const index = (Number(seeders)/Number(maxRate)) * 10
        setRate(index);
        localStorage.setItem("type",stream)
    }, [maxRate,seeders,stream]);

    // useEffect(() => {
    //     fetch(`${process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_DESTROY_TOKEN : process.env.REACT_APP_DESTROY_TOKEN_LIVE}`,{
    //         method:"POST",
    //         headers:{
    //             "Content-Type":"application/json",
    //             "Accept":"application/json"
    //         },
    //         body:JSON.stringify({
    //             id,
    //             index
    //         })
    //     }).then(responseDestroy => {
    //         console.log(responseDestroy,"response destroy")
    //     })
    //     // await responseDestroy.json()
    // },[id, index])

    const navRoute = ({url,state}) => {
        navigate(url, { state: { ...state } });
        
    }

    const runStream = async({token}) => { 
        const stream = localStorage.getItem("type")
        // console.log("inside",stream)
        //check for credits
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
                    id
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
                body:JSON.stringify({
                    user

                })
            })
            const {sum,message} = await response.json()
            console.log(sum,"sum",message)
            //affordable for one movie | episode
            if(sum && sum > 49){
                hasCredits = true
            }
        }

        if(!hasCredits && !hasPaid){
            Swal.fire({
                icon: 'error',
                title: 'NO CREDITS',
                text: "add more credits",
                showConfirmButton: false,
                timer: 1500
            })
            return 
        }
        if (token) {
            setLoading(true)
            index = index.toString()
            .replace("0","a")
            .replace("1","b")
            .replace("2","c")
            .replace("3","d")
            .replace("4","e")
            .replace("5","f")
            .replace("6","g")
            .replace("7","h")
            .replace("8","i")
            .replace("9","j")

            const response = await fetch(`${process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_PLAY : process.env.REACT_APP_PLAY_LIVE}`,{
                method:"POST",
                headers:{
                    "Content-Type":"application/json",
                    "Accept":"application/json"
                },
                
                body:JSON.stringify({
                    token,
                    id,
                    index,
                    user,
                    quality,
                    stream,
                    size,
                })
            })
            const {status, error, message, url, files} = await response.json()
            if(status){
                const video = files && files.find(({name}) => name.endsWith('.mp4') || name.endsWith('.mkv'));
                if(video){
                    const type = video && video.hasOwnProperty("name") && video.name.split(".").pop()
                    setLoading(false)
                    navRoute({url:`/play`,
                        state:{
                            id,
                            url,
                            index,
                            type,
                            background,
                            seasons,
                            episodes,
                            serieID,
                            anime,
                            serie_name,
                            season,
                            episode
                        }
                    })
                }else{
                    Swal.fire({
                        icon: 'error',
                        title: 'media not found',
                        text: error,
                        showConfirmButton: false,
                        timer: 1500
                    })
                }

            }else{
                setLoading(false)
                Swal.fire({
                    icon: 'error',
                    title: 'choose next collection',
                    text: "was not worth your time",
                    showConfirmButton: false,
                    timer: 1500
                })

            }
   
            setLoading(false)
        }
    }

    return (
        <>
            <button
                disabled={loading}
                onClick={() => runStream({token})}
                type="button"
                key={index}
                className={`bg-[transparent] m-[1%] border-[2px] text-white ${windowWidth > 800 ? "w-[48%]" : "w-[98%]"} h-[auto] text-[20px] font-bold`}
            >
                {
                    loading ? "loading..."
                    :
                    <>
                        {quality}
                        {rate > 0 && (
                            <span className="text-[#ffd800] ml-2">
                                <FontAwesomeIcon icon={faStar}/> {rate && rate.toFixed(1)}
                            </span>
                        )}
                        <span className="text-[italic] ml-2">
                            {`${size && size.replace("i","").toLowerCase()}`}
                        </span>                    
                    </>
                }        
            </button>
        </>
    )
}

export default COLLECTIONS

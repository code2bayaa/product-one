import { useState, useEffect } from "react";
import MOBILE from "./mobileBar";
import NAVBAR from "./nav"


const BLOGS = () => {
    const [data, setData] = useState({})
    const [windowWidth, setWindowWidth] = useState(0);

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
        async function runLikes(){
            const res = await fetch(process.env.REACT_APP_environment === "development" ? `${process.env.REACT_APP_outside}/Twitter/Tweets` : `${process.env.REACT_APP_outside_live}/Twitter/Tweets`)
              const {body, status} = await res.json()
              console.log(body)
              if(!status){
                alert("oops","could not fetch tweets","error")
              }
              setData(() => ({...body}))
        }
        runLikes()
        const handleResize = () => setWindowWidth(window.screen.width)
        handleResize()
    },[])

    const getDate = (date) => {
        const aDate = new Date(date)
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return aDate.toLocaleDateString(undefined, options)
    }
    return (
        <div className="w-[100%] duration-250 h-[100%] text-white flex flex-row flex-wrap" style={{background:"linear-gradient(65deg, #0d0d0d, rgba(0,0,0,0.75), #1c2a3b, #0f111a)"}}>
            {
                windowWidth > 800 ? 
                <div className="w-[20%] absolute h-[100%] border-r-[3px] border-[#2E2E3A]" style={{background:"linear-gradient(85deg, #0d0d0d, rgba(0,0,0,0.75), #000, #0f111a)"}}>
                    <NAVBAR/>
                </div>
                :
                <MOBILE/>
            }
            <div className={windowWidth > 800 ? "w-[80%] h-[100%] bg-background overflow-y-auto movie-scene ml-[20%] flex flex-col bg-[#fff]":"bg-[#fff] w-[100%] h-[92%] bg-background overflow-y-auto movie-scene flex flex-col"}>
                <div className="w-[100%]">
                    {
                        data.hasOwnProperty("data") ? 
                            <div className={windowWidth > 800 ? "w-[80%] mx-[10%]":"w-[95%] mx-[2.5%]"} style={{borderLeft:"1px solid #fff"}}>
                                {
                                    data?.data.map(({text, id, attachments, created_at, author_id},index) => (
                                        <div key={index} className={windowWidth > 800 ? "w-[100%] flex flex-row":"w-[100%] flex flex-col"} style={{borderBottom:"1px solid #fff"}}>
                                            <div className={windowWidth > 800 ? "w-[50%] m-[1%]":"w-[98%] m-[1%]"}>
                                                {
                                                    attachments ? 
                                                        <img src = {data.includes.media.find(({media_key}) => media_key === attachments?.media_keys[0])?.url} alt={id} width={200} height={200} className="w-[60%] object-contain"/>
                                                    :
                                                        <img src = "/image/social.svg" alt={id} width={200} height={200} className="w-[60%] object-contain"/>

                                                }
                                            </div>
                                            <div className={windowWidth > 800 ? "w-[48%]":"w-[98%] m-[1%]"}>
                                                {text}
                                                <p>{getDate(created_at)}</p>
                                                <a
                                                    href={`https://twitter.com/${author_id}/status/${id}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{ color: "blue", textDecoration: "underline" }}
                                                >
                                                    View Tweet on Twitter
                                                </a>
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        :
                        ""
                    }

                </div>
            </div>
        </div>
    )
}

export default BLOGS
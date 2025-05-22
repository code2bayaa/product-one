// import NAVBAR from "./nav"
import { useParams } from "react-router-dom";
import MuxPlayer from "@mux/mux-player-react"
import { useState, useEffect } from "react";
// import { useQuery, gql, useMutation } from '@apollo/client';
// import LOAD from "../midlleware/load";
// import Swal from "sweetalert2";

// type: "video/webm" // or "video/x-matroska"
const MUX = () => {
    const { host, index, background } = useParams();
    // const [play, setPlay] = useState([])
    // const [windowWidth, setWindowWidth] = useState(0);
    const [playID,setPlayID] = useState(null)

    // useEffect(() => {
    //     const handleResize = () => {
    //         setWindowWidth(window.innerWidth);
    //     };
    //     window.addEventListener("resize", handleResize);
    //     handleResize(); // Call it once to set the initial value
    //     return () => {
    //         window.removeEventListener("resize", handleResize);     
    //     };
    // },[])

    useEffect(() => {
        const idSession = sessionStorage.getItem("player");
        if(idSession){
            const {playback_ids,status} = JSON.parse(idSession);
            if(status === "ready"){
                console.log("Data fetched:", playback_ids);
                setPlayID(playback_ids[0].id);
            }
        }else{
            const auth = btoa(`${process.env.REACT_APP_mux_token_id}:${process.env.REACT_APP_mux_token_secret}`);

            console.log(`http://localhost:${host}/${index}`)
            fetch(`${process.env.REACT_APP_mux_host}/video/v1/assets`,{
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Basic ${auth}`,
                },                                                  
                body: JSON.stringify({
                    input: `http://localhost:${host}/${index}`, 
                    "playback_policy": ["public"], 
                    "video_quality": "basic"
                })
            })
            .then((response) => response.json())
            .then(({data}) => {
                sessionStorage.setItem("player", JSON.stringify(data));
                console.log("Data fetched:", data);
                // if(data.status === "ready"){
                    //"preparing""ready""errored"
                    setPlayID(data.playback_ids[0].id);
                // }
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
            });
        }
    },[host,index])

    return (
        
        <div className="w-[100%] min-h-[100%]  bg-cover bg-no-repeat bg-center text-white" style={{backgroundImage:`linear-gradient(105deg, #0d0d0d, rgba(0,0,0,0.75), #000, rgba(0,0,0,0.56)),url(${process.env.REACT_APP_img_poster + "/" + background + ".jpg"})`,backgroundPosition:"0% 40%"}}>
            {
                playID ?
                    <MuxPlayer
                        playbackId={playID}
                        accentColor="#ea580c"
                        metadata={{
                            videoTitle: "Test VOD",
                            ViewerUserId: "user-id-007" //session
                        }}
                    />
                    :
                    "loading..."
            }
        </div>

    )
}

export default MUX
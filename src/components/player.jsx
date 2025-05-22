// import Plyr from "plyr-react";
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';
import { useParams } from "react-router-dom";
import { useEffect } from "react";

const PLAYER = () => {
    const { host, index, background } = useParams();
    // const [playID,setPlayID] = useState(null)

    useEffect(() => {

        // return () => {
            // setPlayID(true)
        // }
        if(host && index){
            // console.log(("playID",`${process.env.REACT_APP_player_env}${host}/${index}`))
            new Plyr('#plyr-video', {
                autoplay: true,
                muted: true,
                controls: ["play", "volume", "fullscreen"],
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
            // setPlayID(`${process.env.REACT_APP_player_env}${host}/${index}`)
        }
    },[host,index])

    return (
        <div className="w-[100%] min-h-[100%]  bg-cover bg-no-repeat bg-center text-white" style={{backgroundImage:`linear-gradient(105deg, #0d0d0d, rgba(0,0,0,0.75), #000, rgba(0,0,0,0.56)),url(${process.env.REACT_APP_img_poster + "/" + background + ".jpg"})`,backgroundPosition:"0% 40%"}}>
            {/* {console.log("playID",playID)} */}
            {/* {
                playID && 
                    < Plyr
                        source={{
                            type:type === "mp4" ? "video/mp4" : type === "mkv" ? "video/webm" : "video" ,// or "video/x-matroska"
                            sources: [
                                {
                                    src: `${process.env.REACT_APP_player_env}${host}/${index}`, // YouTube video ID
                                    // provider: "youtube",
                                },
                            ],

                        }}
                        options= {{
                            autoplay: true,
                            muted: false,
                            controls: ["play", "volume", "fullscreen"],
                            }
                        }
                    />
            } */}
            
            <video id="plyr-video" crossOrigin="true" className="w-[100%] h-[500px]">
                <source src={`${process.env.REACT_APP_player_env}${host}/${index}`} type="video/mp4" />
                Your browser does not support the video tag.
                
            </video>
        </div>
    )
}

export default PLAYER;
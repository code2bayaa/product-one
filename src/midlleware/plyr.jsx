import Plyr from "plyr-react";
import "plyr-react/plyr.css";
import { useEffect, useState } from "react";

const PLYR = ({ videoUrl, subtitleUrl = false, offline = false, youtube = false }) => {
    const [url,setURL] = useState(null)
    const [from_the_source, setSource] = useState(null)

    useEffect(() => {
        if(offline){
            const blobUrl = URL.createObjectURL(subtitleUrl)
            setURL(blobUrl)
            const videoUrlBlobURL = URL.createObjectURL(videoUrl)
            setSource(videoUrlBlobURL)
        }else{

            if(subtitleUrl){
                fetch(subtitleUrl)
                .then(res => res.blob())
                .then(subtitle_res => {
                    // const subtitle_blob = subtitle_res.blob
                    const blobUrl = URL.createObjectURL(subtitle_res)
                    setURL(blobUrl)
                })
            }

            setSource(videoUrl)
        }


    },[offline,subtitleUrl,videoUrl])

    const sources = {
        type: "video",
        sources: [
            {
                src: from_the_source,
                type: "video/mp4", // or "video/webm" etc.
            },
        ],
        tracks: [
            {
                kind: "subtitles",
                label: "English",
                src: url,
                srcLang: "en",
                default: true,
            },
        ],
    };

    const youtubeSources = {
        // type: "youtube",
        type: 'video',
        sources: [{
            src: videoUrl,
            provider: 'youtube',
        }],
        tracks: [
            {
                kind: "subtitles",
                label: "English",
                src: url,
                srcLang: "en",
                default: true,
            },
        ],
    };

  return youtube ? 
    <Plyr source={youtubeSources} type={'youtube'}  options={{ controls: [], autoplay: true }}/>
    :
    <Plyr source={sources} type={'video'}/>

}

export default PLYR
import {Plyr} from "plyr-react";
import "plyr-react/plyr.css";
import { useEffect, useState, useRef } from "react";
// ...existing code...

// ensure we have a usable component reference (handles unexpected default/named export shapes)
const PlyrComponent = Plyr && (Plyr.default || Plyr);

const PLYR = ({ videoUrl, subtitleUrl = false, subFiles = [], offline = false, youtube = false }) => {
    const [url,setURL] = useState(null)
    const [from_the_source, setSource] = useState(null)
    const [loading, setLoading] = useState(true);
    const playerRef = useRef(null);
    const nativeVideoRef = useRef(null);

    useEffect(() => {
        if(offline){
            if(subtitleUrl){
                const blobUrl = URL.createObjectURL(subtitleUrl)
                setURL(blobUrl)
            }
            if(videoUrl){
                const videoUrlBlobURL = URL.createObjectURL(videoUrl)
                setSource(videoUrlBlobURL)
            }

        }else{

            // if(subtitleUrl){
            //     fetch(subtitleUrl)
            //     .then(res => res.blob())
            //     .then(subtitle_res => {
            //         // const subtitle_blob = subtitle_res.blob
            //         const blobUrl = URL.createObjectURL(subtitle_res)
            //         setURL(blobUrl)
            //     })
            // }

            setSource(videoUrl)
        }
        // ...existing source/subtitle setup...
    },[offline,subtitleUrl,videoUrl])
    // useEffect(() => {
    // if (playerRef.current) {
    //     const video = playerRef.current.plyr.media;
    //     video.setAttribute('crossorigin', 'anonymous');
    // }
    // }, []);
  // Attach native video events (robust for both plyr-react and native fallback)
  useEffect(() => {

    let checkLoad;
    function runLoad(){
        const plyr = playerRef.current?.plyr;
        // prefer plyr.media when available, otherwise try native <video> element
        const video = plyr?.media || nativeVideoRef.current || document.querySelector('video');

        if (!video){
            checkLoad = setTimeout(runLoad, 300);
            return;
        }

        // show spinner until we detect the player advancing or playing
        setLoading(true);

        let passedOneSecond = false;

        const onTimeUpdate = () => {
            if (!passedOneSecond && video.currentTime >= 1) {
                passedOneSecond = true;
                setLoading(false);
            }
        };

        const onPlaying = () => setLoading(false);
        const onWaiting = () => setLoading(true);
        const onSeeking = () => setLoading(true);
        const onSeeked = () => { if (video.currentTime < 1) passedOneSecond = false; setLoading(false); };
        const onCanPlay = () => setLoading(false);
        const onStalled = () => setLoading(true);
        const onProgress = () => {
            try {
                const buffered = video.buffered;
                const current = video.currentTime || 0;
                for (let i = 0; i < buffered.length; i++) {
                    if (current >= buffered.start(i) && current <= buffered.end(i)) {
                        if (!video.paused) setLoading(false);
                        return;
                    }
                }
            } catch (e) { /* ignore */ }
        };

        // Attach native events
        video.addEventListener("timeupdate", onTimeUpdate);
        video.addEventListener("playing", onPlaying);
        video.addEventListener("play", onPlaying);
        video.addEventListener("waiting", onWaiting);
        video.addEventListener("seeking", onSeeking);
        video.addEventListener("seeked", onSeeked);
        video.addEventListener("canplay", onCanPlay);
        video.addEventListener("stalled", onStalled);
        video.addEventListener("progress", onProgress);

        // If we have plyr instance, attach plyr-level events as well (some providers emit there)
        try {
            if (plyr) {
                plyr.on && plyr.on('playing', onPlaying);
                plyr.on && plyr.on('waiting', onWaiting);
                plyr.on && plyr.on('seeking', onSeeking);
                plyr.on && plyr.on('seeked', onSeeked);
                plyr.on && plyr.on('canplay', onCanPlay);
                plyr.on && plyr.on('stalled', onStalled);
                plyr.on && plyr.on('progress', onProgress);
            }
        } catch (e) {
            // ignore plyr attach errors
            console.warn("plyr attach error", e);
        }

        // Cleanup
        return () => {
            clearTimeout(checkLoad);
            try {
                video.removeEventListener("timeupdate", onTimeUpdate);
                video.removeEventListener("playing", onPlaying);
                video.removeEventListener("play", onPlaying);
                video.removeEventListener("waiting", onWaiting);
                video.removeEventListener("seeking", onSeeking);
                video.removeEventListener("seeked", onSeeked);
                video.removeEventListener("canplay", onCanPlay);
                video.removeEventListener("stalled", onStalled);
                video.removeEventListener("progress", onProgress);
            } catch (e) { /* ignore */ }

            try {
                if (plyr) {
                    plyr.off && plyr.off('playing', onPlaying);
                    plyr.off && plyr.off('waiting', onWaiting);
                    plyr.off && plyr.off('seeking', onSeeking);
                    plyr.off && plyr.off('seeked', onSeeked);
                    plyr.off && plyr.off('canplay', onCanPlay);
                    plyr.off && plyr.off('stalled', onStalled);
                    plyr.off && plyr.off('progress', onProgress);
                }
            } catch (e) { /* ignore */ }
        };
    }

    const cleanup = runLoad();
    // if cleanup is a function (from event attach) return it for effect cleanup
    return typeof cleanup === 'function' ? cleanup : () => { clearTimeout(checkLoad); };

  }, [from_the_source, url, playerRef]);
    useEffect(() => {
    const plyr = playerRef.current?.plyr;
    console.log("Tracks:", plyr?.media?.textTracks);
    }, [subFiles]);
  console.log(subFiles,subtitleUrl)
    const sources = {
        type: "video",
        sources: [
            {
                src: from_the_source,
                // src: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
                type: "video/mp4", // or "video/webm" etc.
            },
        ],
        // tracks: [{
        //     kind: "subtitles",
        //     label: "English",
        //     src: subtitleUrl + "/War.Machine.2026.720p.WEBRip.x264.AAC-LAMA.vtt",
        //     srclang: "en",
        //     default: true,                    
        // }]
        
        tracks: subFiles.map((file,len) => ({
            kind: "subtitles",
            label: file.split(".")[0],
            src: subtitleUrl + "/" + file,
            srclang: "en",
            default: len === subFiles.length - 1 ? true : false,
        }))
        // [
        //     {
        //         kind: "subtitles",
        //         label: "English",
        //         src: url,
        //         srcLang: "en",
        //         default: true,
        //     },
        // ],
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
                srclang: "en",
                default: true,
            },
        ],
    };

  return (
    <div className="relative w-full max-w-4xl mx-auto ">
        {
            // If Plyr component exists use it, otherwise fallback to native elements
            PlyrComponent ? (
                youtube ? 
                    <PlyrComponent 
                        source={youtubeSources} 
                        ref={playerRef}
                        crossorigin="anonymous"
                        type={'youtube'}  
                        options={{ controls: [], autoplay: true }}
                    />
                :
                    <PlyrComponent 
                        ref={playerRef}
                        source={sources} 
                        crossorigin="anonymous"
                        {...{ crossorigin: "anonymous" }}
                        type={'video'}
                        options={{ autoplay: true, muted: true, crossorigin:"anonymous" }}
                    />
            ) : (
                // fallback UI if plyr-react is not available / failed to load
                youtube ? (
                    <div className="w-full aspect-video">
                        <iframe
                            className="w-full h-full"
                            src={`https://www.youtube.com/embed/${videoUrl}`}
                            title="YouTube Video Player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                            allowFullScreen
                        />
                    </div>
                ) : (
                    <video
                        ref={nativeVideoRef}
                        className="w-full aspect-video bg-black"
                        controls
                        src={from_the_source}
                        autoPlay
                        muted
                        playsInline
                        crossorigin="anonymous"
                    />
                )
            )
        }
        {loading && (
            <div style={{ zIndex:10 }} className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mb-2"></div>
                <p className="text-sm font-medium">Loading video...</p>
            </div>
        )}
    </div>
  )

}

export default PLYR
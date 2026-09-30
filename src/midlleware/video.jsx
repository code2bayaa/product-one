import React, { useState, useRef, useEffect } from "react";
import { VideoPlayer } from "@videojs-player/react";
import "video.js/dist/video-js.css";
import { useKeys } from "../components/safe";
import Swal from "sweetalert2";
const Player = ({
  videoUrl,
  subtitleUrl,
  poster,
  subFiles,
  type = "video/mp4",
  player,
  autoNext,
  wireframe,
  details,
  setViewsFn,
  onPlayer
}) => {
  const [loading, setLoading] = useState(true);
  const playerRef = useRef(null);
  const playerInserted = useRef(null)
  const hasStartedRef = useRef(false);
  const [img, setImg] = useState(null)
  const {safeKeys} = useKeys()
  // console.log(picture,"picture")
  useEffect(() => {
    //a ready URL (an Eden poster loaded from Backblaze) is used as-is - only TMDB paths get the prefix
    if(typeof poster === "string" && /^(blob|data|https?):/.test(poster)){
      setImg(poster)
    }else if(!poster || !safeKeys.IMG_POSTER){
      setImg("/image/logo3.png")
    }else{
      setImg(safeKeys.IMG_POSTER + poster)
    }
  },[safeKeys,poster])

  useEffect(() => {
    
    setLoading(true);
    // hasStartedRef.current = false;
  }, [videoUrl]);

  useEffect(() => {
    const toPlay = sessionStorage.getItem("toPlay");
    let count = 0;
    if(toPlay){
      // console.log("already reloaded")
      if(hasStartedRef.current) return;
      // console.log("playing without reload..")
      hasStartedRef.current = true;
      const sendForm = async({url,options}) => {
        const response = await fetch(
            url,
            options,
        )
        return await response.json()
      }

      async function runLocale(){
        try {
          let user_location = localStorage.getItem("location") || null;
          if(!user_location){
            const urls = [
              "https://ipinfo.io/json",
              "https://ipapi.co/json/",
              safeKeys?.GEO ? "https://api.ipgeolocation.io/ipgeo?apiKey=" + safeKeys.GEO : null //no key yet: skip, it only answers 401
            ]

            const locations = await Promise.all(urls.map(async(url) => {
                if (!url) return null
                try{
                    return await sendForm({url, options : {
                        method:"GET",
                        headers : {'Content-type': 'application/json; charset=UTF-8'},
                    }})
                }catch(err){
                    if (err.name === 'AbortError') return null;
                    console.warn("location fetch failed", err);
                    return null;
                }
            }))
            user_location = locations
          }else{
            user_location = JSON.parse(user_location);
          }

          return user_location
        } catch(err){
          if (err.name === 'AbortError') return;
          console.error("runLocale error", err);
        } finally {
            // nothing
        }
      }
      const insertViews = async () => {

        const location = {}
        const raw_locations = await runLocale()
        if(raw_locations && raw_locations.length > 0){
          const [ipinfo, ipapi, ipgeolocation] = raw_locations
          location.city = ipinfo?.city || ipapi?.city || ipgeolocation?.city || null
          location.region = ipinfo?.region || ipapi?.region || ipgeolocation?.state_prov || null
          location.country = ipinfo?.country || ipapi?.country || ipgeolocation?.country_code2 || null
          location.loc = ipinfo?.loc || (ipapi ? `${ipapi.latitude},${ipapi.longitude}` : null) || (ipgeolocation ? `${ipgeolocation.latitude},${ipgeolocation.longitude}` : null) || null
          location.postal = ipinfo?.postal || ipapi?.postal || ipgeolocation?.zipcode || null
          location.continent_code = ipapi?.continent_code || ipgeolocation?.continent_code || null
          location.state = ipgeolocation?.state_prov
        }
        fetch(`${process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_INSERT_VIEWS : process.env.REACT_APP_INSERT_VIEWS_LIVE}`, {
          method: "POST",
          credentials: "include",
          headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
          },
          body: JSON.stringify({
            movies_id: player.id,
            platform: "web",
            wireframe,
            type:details,
            session:localStorage.getItem("session") || 0,
            location
          })
        })
        .then(res => {
          console.log(res)
          if (!res.ok) {
            throw new Error('Network response was not ok');
          }
          return res.json();
        })
        .then(({ status, count }) => {
          if (status) {
            console.log("check views")
            setViewsFn(count)
            // hasInsertedViews.current = true
          }
        })
      }

      insertViews()      
    }else{
      console.log("reloading to play..")
      sessionStorage.setItem("toPlay", "true");
      count++
      if(count < 5)
        window.location.reload()
      else{
        Swal.fire({
          icon: 'error',
          title: 'Network Error',
          showConfirmButton: false,
          timer: 1500
        })
      }
    }

    return () => {
      console.log("removing item to play")
      // sessionStorage.removeItem("toPlay");
      // window.removeEventListener("beforeunload", handleUnload);
    }
    // window.location.reload()
  //hasStartedRef makes this run once, so the extra deps can't insert views twice
  },[wireframe,player,details,safeKeys.GEO,setViewsFn])

  useEffect(() => {
  //defined here so it sees the current player (it used to keep the first render's)
  const handleUnload = () => {
    console.log("Page unloading → clearing session");
    sessionStorage.removeItem("toPlay");
    if(player){
      fetch(`${process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_DESTROY_TOKEN : process.env.REACT_APP_DESTROY_TOKEN_LIVE}`,{
        method:"POST",
        headers:{
          "Content-Type":"application/json",
          "Accept":"application/json"
        },
        body:JSON.stringify({
          id:player.id,
          index:player.index
        })
      }).then(responseDestroy => {
        console.log(responseDestroy,"response destroy")
      })
    }

  };

    window.addEventListener("beforeunload", handleUnload);

    return () => {
      window.removeEventListener("beforeunload", handleUnload); //was addEventListener, which stacked listeners
    }
  },[player])

  if (!videoUrl) {
    return (
      <div className="relative w-full max-w-4xl mx-auto bg-black aspect-video flex items-center justify-center">
        <div className="text-white">No video source</div>
      </div>
    );
  }

  // 🔥 EVENTS
  const handleReady = (player) => {
    playerRef.current = player;
    console.log("VideoJS Ready", "  Player instance:", player);

    // Auto-play when ready
    // if (player && typeof player.play === 'function') {
    //   player.play().catch(err => {
    //     console.warn('Autoplay failed:', err.message);
    //     // Fallback: user must click play (browser policy)
    //   });
    // }
  };

  const handleWaiting = () => {
    console.log("waiting...")
    // if (!hasStartedRef.current) 
    // setLoading(true);
  };

  const handlePlaying = () => {
    console.log("playing...")
    setLoading(false);
    // hasStartedRef.current = true;
    if(playerInserted.current) return;

    playerInserted.current = true;

    if(player.state) return;
    console.log("player",player)

    fetch(
      process.env.REACT_APP_ENVIRONMENT === "development"
        ? process.env.REACT_APP_UPDATE_PLAYER
        : process.env.REACT_APP_UPDATE_PLAYER_LIVE,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ id:player.id, player }),
      }
    )
    .then(res => res.json())
    .then(({success,error}) => {
      console.log("error",error)
      if(success){
        console.log("player updated")
      }
    })
    //add ID | Type | Index to database ID
  };

  const handleCanPlay = () => {
    console.log("can play...")
    setLoading(false);
    // hasStartedRef.current = true;
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <VideoPlayer
        key={videoUrl}
        ref={playerRef}
        onReady={handleReady}
        // onReady only gets the "ready" event; the video.js player itself comes here - the watch party
        // (components/party) follows / drives it
        onMounted={({ player: vjs }) => { if (onPlayer) onPlayer(vjs) }}
        onUnmounted={() => { if (onPlayer) onPlayer(null) }}
        controls
        autoplay={false}
        preload="auto"
        sources={[{
          type,
          src: videoUrl
        }]}
        poster={img}
        tracks={
          subFiles?.length
            ? subFiles.map((file, i) => ({
                kind: "subtitles",
                label: `English ${i + 1}`,
                src: `${subtitleUrl}/${file}`,
                srclang: "en",
                default: i === 0,
              }))
            : []
        }
        // tracks={
        //   [
        //     {
        //       kind:"subtitles",
        //       label: "English",
        //       src: subtitleUrl,
        //       srclang: "en",
        //       default: true,
        //     }
        //   ]

        // }
        onWaiting={handleWaiting}
        onPlaying={handlePlaying}
        onCanPlay={handleCanPlay}
        onStalled={() => {
          console.log("stalled...")
          // setLoading(true);
        }}
        onError={(err) => {
          console.error("VideoJS Error:", err);
          setLoading(false);
        }}
        onEnded={() => {
          console.log("ended...")
          if(autoNext.data){
            console.log("going to Next..")
            autoNext.fn({...autoNext.data[0]})
          }
        }}
      />

      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mb-2"></div>
          <p className="text-sm font-medium">Loading video...</p>
        </div>
      )}
    </div>
  );
};

export default Player;
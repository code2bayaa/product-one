import { shortRow } from "../midlleware/shortRow"
import { useLocation, useNavigate } from "react-router-dom";
import React, { useEffect, useState, useRef, useCallback } from "react";
import Swal from "sweetalert2";
// import PLYR from "../midlleware/plyr";
import Player from "../midlleware/video"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import PICTURE from "../midlleware/picture";
import { useMutation, useLazyQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { useKeys } from "./safe";
import { noCreditsAlert } from "../midlleware/noCredits";
import { useWindowWidth, DESKTOP_WIDTH } from "../hooks/useWindowWidth";
import { EDENIMAGE, useEdenImage } from "./eden/shared";
// import { COLLECT } from "../midlleware/report";

const PLAYER = () => {
  const hasFetched = useRef({ rate: false, authentication: false });
  const { state } = useLocation();
  const {safeKeys} = useKeys()
  const {
    index,
    id,
    // poster,
    type,
    background,
    // many,
    // seasons,
    serie_name,
    serieID,
    // episodes,
    player,
    eden,
    season,
    episode,
    anime,
    imdbId,
    date,
    year,
    token,
    quality,
    stream,
    size
  } = state;
  //an Eden title's picture is a Backblaze key read through VIEW_IMG (speed /secure-image), never TMDB
  const edenPoster = useEdenImage(eden ? background?.path : null)

  // console.log(season,"season check")

  const windowWidth = useWindowWidth()
  const [subFiles,setFiles] = useState([]);
  const [views, setViews] = useState(1000)
  const [seasons, setSeasons] = useState(null)
  const [activeSeason] = useState(null)
  const [selectedSeason, setSelectedSeason] = useState(null)
  const [episodesList, setEpisodes] = useState(null)
  const [info, setInfo] = useState(null)
  const navigate = useNavigate();
  const INSERT_MOVIE_MUTATION = gql`
    mutation AddSeason(
        $single:COLLECT_SEASON_INPUT
    ) {
        addSeason(
            single:$single
        ) {
            success
            message
        }
    }
  `;

  const [mutateInsertSeason] = useMutation(INSERT_MOVIE_MUTATION, {
      onCompleted: (data) => {
          if (data.addSeason.success) {
              if(data.addSeason.message === "already inserted")
                  console.log("season inserting already started...")
              console.log("Movie successfully inserted into MySQL:", data.addSeason.message);
              // fetchedMovieData.refetch()
              // .then(status => console.log(status,"status"))
          } else {
              console.error("Failed to insert movies into MySQL:", data.addSeason.message, data.addSeason.error);
          }
      },
      onError: (error) => {
          // Ignore abort-related network errors (they are expected when requests are cancelled)
          const isAbort = error && (
              error.name === 'AbortError' ||
              (error.networkError && error.networkError.name === 'AbortError') ||
              (typeof error.message === 'string' && /abort(ed)?/i.test(error.message))
          );
          if (isAbort) return;
          console.error("insert video Error:", error);
      },
  });
  const FETCH_SEASONS_QUERY = gql`
    query SingleTV (
      $id: Int!
    ){
      singleTV(
        id:$id
      ) {
        seasons {
          episode_count
          id
          name
          season_number
          vote_average
        },
        message
        success
      }
    }
  `
  const [fetchSeason] = useLazyQuery(FETCH_SEASONS_QUERY,{
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'cache-first',
  });

  const FETCH_EPISODES_QUERY = gql`
    query Season (
      $id: Int!
    ){
      season(
        id:$id
      ) {
        episodes {
          air_date
          episode_number
          episode_type
          imdb_id
          id
          name
          season_number,
          still_path
          vote_average
          vote_count
          player {
            type
            index
            token
            quality
            stream
            size          
          }
          url {
            fileName
            week
            quality
          }
        }
        name
        overview
        season_number
        success
      }
    }
  `
  const [fetchEpisodes] = useLazyQuery(FETCH_EPISODES_QUERY,{
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'cache-first',
  });

  useEffect(() => {
    if(!serieID) return 
    console.log(serieID,"serie ID")
    fetchSeason({
      variables : { id:serieID }})
      .then(({data:{singleTV:{seasons,success}}}) => {
        console.log("setting seasons",success)
        if(success)
          setSeasons(() => ([...seasons]))
      })
  },[serieID,fetchSeason])

  useEffect(() => {
    console.log(seasons,"seasons")
    let first_season = seasons && seasons.find(({season_number}) => season_number === season)
    if(first_season){
      console.log("setting first seasons",first_season.id)
      setSelectedSeason(first_season.id)
      activeSeasonfn(first_season.id,season)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- activeSeasonfn is declared below (TDZ in deps) and changes with safeKeys; only re-run when seasons/season change
  },[seasons,season])

  // useEffect(() => {
  //   if(!activeSeason) return

  // },[activeSeason])
  // let count = 0;
  // useEffect(() => {

  //   // console.log("not inserted..")
  //   // if(hasInsertedViews.current) return
  //   console.log("inserting...")
  //   const toPlay = sessionStorage.getItem("toPlay")

  //   if(toPlay) return

  // }, [])
  // useEffect(() => {
  //   let name = `
  //     ${serie_name}
  //     ${season && "||" + season}
  //     ${episode && "||" + episode}
  //   `;
  //   !count && COLLECT(name);
  //   count++;
  // }, [count, serie_name, season, episode]);


  useEffect(() => {
    if (hasFetched.current.authentication) return;
    hasFetched.current.authentication = true;

    // console.log(background,"check logio")

    try {
      async function authentication() {
        const res = await fetch(
          process.env.REACT_APP_ENVIRONMENT === "development"
            ? process.env.REACT_APP_API_URL
            : process.env.REACT_APP_API_URL_LIVE,
          { credentials: "include" }
        );
        return await res.json();
      }

      authentication().then(async (isLoggedIn) => {
        let hasPaid = false;

        if (isLoggedIn.status) {
          const response = await fetch(
            process.env.REACT_APP_ENVIRONMENT === "development"
              ? process.env.REACT_APP_USER_PAID
              : process.env.REACT_APP_USER_PAID_LIVE,
            {
              credentials: "include",
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              body: JSON.stringify({ id }),
            }
          );

          const response_data = await response.json();

          if (response_data.status) {
            const res = await fetch(
              process.env.REACT_APP_ENVIRONMENT === "development"
                ? process.env.REACT_APP_UPDATE_USER_CREDITS
                : process.env.REACT_APP_UPDATE_USER_CREDITS_LIVE,
              {
                credentials: "include",
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Accept: "application/json",
                },
                body: JSON.stringify({ type, id }),
              }
            );
            const { success } = await res.json();
            if (success) hasPaid = true;
          } else {
            const res = await fetch(
              process.env.REACT_APP_ENVIRONMENT === "development"
                ? process.env.REACT_APP_PAY_USER_CREDITS
                : process.env.REACT_APP_PAY_USER_CREDITS_LIVE,
              {
                credentials: "include",
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Accept: "application/json",
                },
                body: JSON.stringify({
                  credit: 50.0,
                  data: {
                    receipt: "player",
                    "player-type": [type],
                    title: id,
                    eden: !!eden,
                    //movie or episode, and the series an episode belongs to - producers are paid per series
                    content: serieID ? "tv" : "movie",
                    series: serieID || null,
                  },
                }),
              }
            );
            const { status, earning } = await res.json();
            if (status) {
              hasPaid = true;
              Swal.fire({
                icon: "success",
                title: "paid with credits",
                //PRD #27: which credits paid - subscription first, then ad, then free
                text: earning?.paid_with ? `Paid with ${earning.paid_with}` : undefined,
                showConfirmButton: false,
                timer: 2500,
              });
            }
          }
        } else {
          let user = localStorage.getItem("session");

          const res = await fetch(
            process.env.REACT_APP_ENVIRONMENT === "development"
              ? process.env.REACT_APP_PAID
              : process.env.REACT_APP_PAID_LIVE,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              body: JSON.stringify({ user, id }),
            }
          );

          const res_data = await res.json();

          if (res_data.status) {
            const res = await fetch(
              process.env.REACT_APP_ENVIRONMENT === "development"
                ? process.env.REACT_APP_UPDATE_REPORT_CREDITS
                : process.env.REACT_APP_UPDATE_REPORT_CREDITS_LIVE,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Accept: "application/json",
                },
                body: JSON.stringify({ user, type, id }),
              }
            );
            const { success } = await res.json();
            if (success) hasPaid = true;
          } else {
            const response = await fetch(
              process.env.REACT_APP_ENVIRONMENT === "development"
                ? process.env.REACT_APP_PAY_REPORT_CREDITS
                : process.env.REACT_APP_PAY_REPORT_CREDITS_LIVE,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Accept: "application/json",
                },
                body: JSON.stringify({
                  user,
                  credit: 50.0,
                  data: {
                    receipt: "player",
                    "player-type": [type],
                    title: id,
                    eden: !!eden,
                    //movie or episode, and the series an episode belongs to - producers are paid per series
                    content: serieID ? "tv" : "movie",
                    series: serieID || null,
                  },
                }),
              }
            );
            const { status, earning } = await response.json();
            if (status) {
              hasPaid = true;
              Swal.fire({
                icon: "success",
                title: "paid with credits",
                text: earning?.paid_with ? `Paid with ${earning.paid_with}` : undefined,
                showConfirmButton: false,
                timer: 2500,
              });
            }
          }
        }

        if (!hasPaid) navigate(-1);
      });
    } catch (error) {
      console.log(error);
    }
  }, [type, id, navigate, eden, serieID]);

  useEffect(() => {
    // console.log(background,"background check")
    async function getSubtitles() {
      try {
        const response = await fetch(
          process.env.REACT_APP_ENVIRONMENT === "development"
            // ? process.env.REACT_APP_SUBTITLES_FILES
            // : process.env.REACT_APP_SUBTITLES_FILES_LIVE,
            ? process.env.REACT_APP_SPEED_SUBTITLES_FILES
            :
            process.env.REACT_APP_SPEED_SUBTITLES_FILES_LIVE,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              id,
              index,
            }),
          }
        );
        const { status, files } = await response.json();
        console.log("gotten files: " + files)
        if(status) {
          setFiles([...files])
        }
      } catch (error) {
        console.log("Error fetching subtitles:", error);
      }
    }
    getSubtitles()
  },[index,id])

  const navRoute = ({url,state,ref}) => {
    sessionStorage.removeItem("toPlay");
    navigate(url,{
        state : {
            ...state
        }
    })
  }

  const activeSeasonfn = useCallback(async(seasonID,seasonNumber) => {
    async function freshFetch(){

      // console.log(safeKeys,serieID,seasonNumber,seasonID,"fetching season data")
      const response = await fetch(`${safeKeys.MOVIE_DB}tv/${serieID}/season/${seasonNumber}?api_key=${safeKeys.API_KEY}`);
      const data = await response.json();
      const newData = {...data }
      newData.episodes = newData?.episodes.map(({crew,guest_stars,cast, ...rest}) => rest) || []

      mutateInsertSeason({
        variables: {
          single : {...newData}
        },
      });
      return {...data}
    } 

    try{
      const fetched = await fetchEpisodes({
          variables : { id:seasonID }})
      if (fetched.data && fetched.data.season && !fetched.data.season.episodes) {
        console.log("first time...")
        const tv = await freshFetch()
        setEpisodes(() => ([...tv.episodes]))
        setInfo(() => ({name:tv.name,overview:tv.overview}))
      }else if(fetched.data && fetched.data.season.success){
        console.log("Using cached data:", fetched.data);
        setEpisodes(() => ([...fetched.data.season.episodes]))
        setInfo(() => ({name:fetched.data.season.name,overview:fetched.data.season.overview}))
      }else {
        const tv = await freshFetch()
        setEpisodes(() => ([...tv.episodes]))
        setInfo(() => ({name:tv.name,overview:tv.overview}))
      }
    }catch(error){
      console.log(error,"season error")
    }
  },[serieID,mutateInsertSeason,safeKeys,fetchEpisodes])

  const openPlay = async({url = null,player = null,id,name,episode_number,air_date,imdb_id}) => {

    async function goTOSPEED(){
      function getCurrentWeek() {
        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const pastDaysOfYear = (now - startOfYear) / 86400000;
        return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
      }

      // Usage:
      const currentWeek = getCurrentWeek();            
      if(url && url.quality && url.quality === "CAM" && currentWeek > url.week){
          navRoute({
            ref:"episode",
            url:`/video/episode`,
            state:{
              stream:"episode",
              id,
              serieID,
              name,
              season:activeSeason,
              episode:episode_number,
              background,
              date:air_date,
              imdbId:imdb_id,
              anime
          }})
      }else{
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
          console.log(response_data.message)

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
          console.log(message)
          //affordable for one movie | episode
          if(sum && sum > 49){
              hasCredits = true
          }
        }

        if(!hasCredits && !hasPaid){
          noCreditsAlert(isLoggedIn.status)
          return 
        }                                
        navRoute({
            ref:"speed",
            url:`/speed`,
            state:{
              stream:"tv",
              id,
              name,
              season:activeSeason,
              episode:episode_number,
              background,
              serieID,
              serie_name
        }}) 
      }
    }

    if(url){
      await goTOSPEED()
    }else{
      if(player){
        navRoute({
            url:`/play`,
            state:{
              id,
              background,
              player:true,
              index:player.index,
              type:player.type,
              token:player.token,
              stream:player.stream,
              size:player.size,
              serieID,
              serie_name,
              season:activeSeason,
              episode:episode_number,
            }})
      }else{
        navRoute({
            url:`/video/episode`,
            state:{
              stream:"episode",
              id,
              serieID,
              name,
              season:activeSeason,
              episode:episode_number,
              background,
              date:air_date,
              year:air_date.substring(0,4),
              imdbId:imdb_id,
              anime,
        }})
      }
    }
  }

  const setViewsCurrent = (count) => {
    setViews(prevCount => prevCount + count)
  }
  return (
    <div
      className={windowWidth >= DESKTOP_WIDTH ? "w-full h-full overflow-hidden text-white" : "w-full h-full overflow-y-auto text-white"}
      style={{
        backgroundImage: `linear-gradient(45deg, rgba(0,0,0,0.75), hsl(220, 70%, 10%))`,
      }}
    >
    <div className={windowWidth >= DESKTOP_WIDTH ? "w-full h-full flex flex-row items-stretch" : "w-full"}>
    {/* ---------- LEFT : player ---------- */}
    <div className={windowWidth >= DESKTOP_WIDTH ? "w-[68%] h-full overflow-y-auto overflow-x-hidden movie-scene" : "w-full"}>
    <div className="text-white">
      {
        background.hasOwnProperty("logo") && background.logo ?
        eden ?
        <EDENIMAGE path={background.logo} alt={serie_name} className={"object-contain h-[150px]"} />
        :
        <PICTURE picture={background.logo} classes={"object-contain h-[150px]"} />
        :
        <h1>{serie_name}</h1>
      }
      <h2>{season && "||" + season}</h2>
      <h2>{episode && "||" + episode}</h2>
    </div>
      <p className="text-white">
        {views} <FontAwesomeIcon icon={faEye} />
      </p>
      {/* <PLYR
        videoUrl={`${
          process.env.REACT_APP_ENVIRONMENT === "development"
            ? process.env.REACT_APP_HOST_PLAY
            : process.env.REACT_APP_HOST_PLAY_LIVE
        }/${id}/${index}/${serie_name.replace(/\s+/, '.').trim()}`}
        subtitleUrl={`${
          process.env.REACT_APP_ENVIRONMENT === "development"
            // ? process.env.REACT_APP_SUB_PLAYING
            // : process.env.REACT_APP_SUB_PLAYING_LIVE
            ? process.env.REACT_APP_HOST_SUB
            : process.env.REACT_APP_HOST_SUB_LIVE
        }/${id}`}
        subFiles={subFiles}
      /> */}
      <Player
        videoUrl={`${
          process.env.REACT_APP_ENVIRONMENT === "development"
            ? process.env.REACT_APP_HOST_PLAY
            : process.env.REACT_APP_HOST_PLAY_LIVE
        }/${id}/${index}/${serie_name.replace(/\s+/, '.').trim()}`}          
        subtitleUrl={`${
          process.env.REACT_APP_ENVIRONMENT === "development"
            // ? process.env.REACT_APP_SUB_PLAYING
            // : process.env.REACT_APP_SUB_PLAYING_LIVE
            ? process.env.REACT_APP_HOST_SUB
            : process.env.REACT_APP_HOST_SUB_LIVE
        }/${id}`}
        // videoUrl={"./test.mp4"}
        // subtitleUrl={"./test.vtt"}
        poster={eden ? edenPoster || null : background?.path}
        player={({
          index,
          type,
          id,
          token,
          quality,
          size,
          stream,
          state:player,
          mode:season?"episode":"movie"
        })}
        autoNext={({
          data:episodesList && episodesList.find(({episode_number}) => episode_number === (episode + 1)),
          fn:() => openPlay()
        })}
        details={{
          name:serie_name,
          season,
          episode,
          id,
          serieID,
          anime,
          background:background?.path,
          mode:season?"tv":"movie"
        }}
        subFiles={subFiles}
        wireframe={"player"}
        setViewsFn={setViewsCurrent}
      />
      <div className="w-[80%] mx-[10%] h-[100px] mt-[2%]">
        <button
          onClick={() => navRoute({
            url:season? `/video/episode`: `/video/movie`,
            state:{
              stream:season? "episode": "movie",
              id,
              serieID,
              name:serie_name,
              background,
              season,
              episode,
              year,
              date,
              anime,
              imdbId
            },
          })}
          className="h-[40px] min-w-[24%] m-[1%] border border-zinc-50"
        >
          <p className='text-[#fff]'>More Qualities</p>
        </button>
      </div>
    </div>
    {/* ---------- RIGHT : info -> season select -> episodes ---------- */}
    <aside className={windowWidth >= DESKTOP_WIDTH ? "w-[32%] h-full flex flex-col border-l border-white/10" : "w-full"}>
      <div className={windowWidth >= DESKTOP_WIDTH ? "w-[96%] mx-[2%] h-[auto] mt-[2%] shrink-0" : "w-[80%] mx-[10%] h-[auto] mt-[2%]"}>
        {
          info && (
            <div>
              <h1 className="text-[#fff]">{info.name}</h1>
              <article className={`text-[#fff] ${windowWidth >= DESKTOP_WIDTH ? "text-[13px] max-h-[110px] overflow-y-auto movie-scene" : "text-ellipsis"}`}>{info.overview}</article>
            </div>
          )
        }
      </div>
      {
        windowWidth >= DESKTOP_WIDTH ?
          seasons && (
            <div className="w-[96%] mx-[2%] my-[2%] shrink-0">
              <label htmlFor="season-select" className="block text-[12px] text-[#ffd800] mb-[4px]">Season</label>
              <select
                id="season-select"
                value={selectedSeason || ""}
                onChange={(e) => {
                  const picked = seasons.find(({id}) => String(id) === e.target.value)
                  if(!picked) return
                  setSelectedSeason(picked.id)
                  activeSeasonfn(picked.id, picked.season_number)
                }}
                className="w-[100%] h-[40px] bg-black/60 border border-zinc-50 text-[#fff] px-[8px] outline-none cursor-pointer"
              >
                {
                  seasons.map(({season_number,id,name},index) => (
                    <option key={index} value={id} className="text-black">{name || `season ${season_number}`}</option>
                  ))
                }
              </select>
            </div>
          )
        :
          <div className="w-[80%] mx-[10%] movie-scene h-[auto] flex flex-wrap">
            {
              seasons && (
                seasons.map(({season_number,id,name},index) => (
                  <button
                    key={index}
                    onClick={() => activeSeasonfn(id,season_number)}
                    className="h-[40px] min-w-[24%] m-[1%] border border-zinc-50"
                  >
                    <p className='text-[#fff]'>{name}</p>
                  </button>
                ))
              )
            }
          </div>
      }
      <div className={`duration-50 movie-scene ${windowWidth >= DESKTOP_WIDTH ? "w-[96%] mx-[2%] flex-1 min-h-0 flex flex-col overflow-y-auto overflow-x-hidden" : "w-[80%] mx-[10%] h-[150px] flex flex-col flex-wrap overflow-x-auto overflow-y-hidden"} my-[1%]${shortRow(episodesList)}`}>
        {
          episodesList && (
            episodesList.map(({episode_number,name,overview,still_path,player,url,id,imdb_id,air_date},index) => (
              <div
                key={index}
                onClick={() => openPlay({player,url,id,episode_number,name,air_date,imdb_id})}
                className={`${windowWidth >= DESKTOP_WIDTH ? "w-[96%] h-[110px] shrink-0 flex flex-row hover:contrast-125" : "w-[98%] h-[150px]"} m-[1%] cursor-pointer bg-gray-800`}
              >
                <PICTURE picture={still_path} classes={windowWidth >= DESKTOP_WIDTH ? "object-cover w-[45%] h-[100%]" : "object-cover w-full h-[90%]"} />
                <div className={windowWidth >= DESKTOP_WIDTH ? "w-[55%] px-[6px] py-[4px] overflow-hidden" : ""}>
                  <h2 className={`text-[#fff] ${windowWidth >= DESKTOP_WIDTH ? "text-[13px] font-bold" : ""}`}>{name}</h2>
                  <p className={windowWidth >= DESKTOP_WIDTH ? "text-[12px] text-[#ffd800]" : ""}>episode: {episode_number}</p>
                </div>
              </div>
            ))
          )
        }
      </div>
    </aside>
    </div>
    </div>
  );
};

export default React.memo(PLAYER);

import { shortRow } from "../midlleware/shortRow"
import { useLazyQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import Player from "../midlleware/video"
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useCallback,
    useRef
} from "react";
import PICTURE from "../midlleware/picture";
// import { Rating } from 'react-simple-star-rating'
import Swal from "sweetalert2";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faEye,
    //  faStar, faUserCheck
     } from '@fortawesome/free-solid-svg-icons';
import DashPlayer from '../midlleware/dash';
import { saveVideo, listVideoKeys, listVideos } from '../models/idb';
// import VIDEO from "../midlleware/plyr";
import axios from "axios"
import { COLLECT } from "../midlleware/report";
import { useKeys } from "./safe";
import { noCreditsAlert } from "../midlleware/noCredits";
import { useWindowWidth, DESKTOP_WIDTH } from "../hooks/useWindowWidth";
import WatchParty from "./party/WatchParty";
import { EDENIMAGE, useEdenImage, loadEdenImage } from "./eden/shared";
const SPEED = () => {
    // const hasFetched = useRef({paid:false,rate:false})
    const {state} = useLocation()
    const [subFiles,setFiles] = useState([]);
    const [seasons, setSeasons] = useState(null)
    const [activeSeason, setActiveSeason] = useState(null)
    const [episodesList, setEpisodes] = useState(null)
    const [info, setInfo] = useState(null)
    const {safeKeys} = useKeys()
    // const params = useSearchParams();
    // const state = JSON.parse(decodeURIComponent(params.get("state")));
    // const state = useStates("speed")
    const { name, background, id, type, dash,
        // seasons,
        serie_name,
        serieID,
        // episodes,
        season,
        episode,
        anime,
        imdbId,
        date,
        year,
        eden
    } = state;
    // PRD #11: the video.js player the watch party syncs, and the party a guest arrived for (party/join.jsx)
    const [videoPlayer, setVideoPlayer] = useState(null)
    // startParty: opened from a detail page's "Start a reaction" - the set-up shows straight away
    const { party: partyCode, startParty, ...partyLaunch } = state
    // console.log(name)
    // const [rating, setRating] = useState(3.2)
    // const [stars,setStars] = useState(0)
    // const [users, setUsers] = useState(0)
    // const [paid, setPaid] = useState(false)
    const windowWidth = useWindowWidth()
    //an Eden title's picture is a Backblaze key read through VIEW_IMG (speed /secure-image), never TMDB
    const edenPoster = useEdenImage(eden ? background?.path : null)
    const [views, setViews] = useState(1000)
    const [download, setDownload] = useState(false)
    const [progress, setProgress] = useState(0)
    const [subtitleProgress, setSubtitleProgress] = useState(0)
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

        //an Eden series is not in TMDB/singleTV - its page lists the episodes, the receipt still needs serieID
        if(!serieID || eden) return
        fetchSeason({
          variables : { id:serieID }})
          .then(({data:{singleTV:{seasons,success}}}) => {
            console.log("setting seasons",success)
            setSeasons(() => ([...seasons]))
          })
      },[serieID,eden,fetchSeason])
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
  useEffect(() => {
    let first_season = seasons && seasons.find(({season_number}) => season_number === season)
    if(first_season){
      setActiveSeason(first_season.id)
    }
  },[seasons,season])
    
      useEffect(() => {
        if(!activeSeason) return
        fetchEpisodes({
            variables : { id:activeSeason }})
            .then(({data:{season:{episodes,name,overview,success}}}) => {
              console.log("setting episodes",success)
              if(!success)return
              setEpisodes(() => ([...episodes]))
              setInfo(() => ({name,overview}))
            })
      },[activeSeason,fetchEpisodes])
    const navigate = useNavigate()
    const FETCH_MOVIE_QUERY = gql`
        query Single (
            $id: ID!
        ){
            single(
                id:$id
            ) {
                adult
                backdrop_path
                genre_ids
                genres {
                    id
                    name
                }
                id
                original_language
                original_title
                overview
                popularity
                poster_path
                release_date
                title
                video 
                runtime
                vote_average
                vote_count   
                url {
                    fileName
                }             
                success
            }
        }
    `
    const [fetchSingleMovie] = useLazyQuery(FETCH_MOVIE_QUERY,{
        // pollInterval: 500, // fetches new data at that interval
        notifyOnNetworkStatusChange: true,
        // variables,
        // skip: !variables.page, // Skip query execution if variables are not set
    });

    // useEffect(() => {

    //     if(hasInsertedViews.current) return
    //     const insertViews = async () => {         
    //         fetch(`${process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_INSERT_VIEWS : process.env.REACT_APP_INSERT_VIEWS_LIVE}`, {
    //             method: "POST",
    //             credentials: "include",
    //             headers: {
    //             "Content-Type": "application/json",
    //             "Accept": "application/json"
    //             },
    //             body: JSON.stringify({
    //                 movies_id: id,
    //                 platform: "web",
    //                 wireframe: "speed",
    //             })
    //         })
    //         .then(res => {
    //             console.log(res)
    //             if (!res.ok) {
    //                 throw new Error('Network response was not ok');
    //             }
    //             return res.json();
    //         })
    //         .then(({ status, count }) => {
    //             if (status) {
    //                 // console.log("check views")
    //                 setViews(prevView => (prevView + count))
    //                 hasInsertedViews.current = true
    //             }
    //         })
    //     }

    //     insertViews()
    // }, [id])
    //pay with credits
    useEffect(() => {
        try{
        // if(hasFetched.current.paid){
        //     return
        // }
        // hasFetched.current.paid = true
            async function authentication(){
                const res = await fetch(process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_API_URL : process.env.REACT_APP_API_URL_LIVE,{credentials: "include"})
                return  await res.json()
                // console.log(message)
                // return status
            }
            authentication().then(async isLoggedIn => {
                console.log(isLoggedIn)
                //pay with credits from session | user
                // let paid = false
                let hasCredits = false
                let hasPaid = false
                if(isLoggedIn.status){
                    
                    // setUser(isLoggedIn.user)
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
                    // console.log(response_data)

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

                    // if(response_data.status){
                    //     hasPaid = true
                    // }

                    const res = await fetch(process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_CHECK_USER_CREDITS : process.env.REACT_APP_CHECK_USER_CREDITS_LIVE,{credentials: "include"})
                    const {sum,message} = await res.json()
                    console.log(message)
                    //affordable for one movie | episode
                    if(sum && sum > 49){
                        hasCredits = true
                    }

                    if(!hasCredits && !hasPaid){
                        noCreditsAlert(isLoggedIn.status)
                        navigate(-1)
                        return 
                    }

                    if(response_data.status){
                        const res = await fetch(`${process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_UPDATE_USER_CREDITS : process.env.REACT_APP_UPDATE_USER_CREDITS_LIVE}`,{
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
                        // setPaid(success)
                        // paid = success
                    }else{
                        const res = await fetch(`${process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_PAY_USER_CREDITS : process.env.REACT_APP_PAY_USER_CREDITS_LIVE}`,{
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
                                    "title":id,
                                    "eden":!!eden,
                                    //movie or episode, and the series an episode belongs to - producers are paid per series
                                    "content":serieID ? "tv" : "movie",
                                    "series":serieID || null
                                }

                            })
                        })
                        const {status,message,earning} = await res.json()
                        console.log(message)
                        
                        //affordable for one movie | episode
                        if(status){
                            // setPaid(status)
                            // paid = status
                            Swal.fire({
                                icon: 'success',
                                title: 'paid with credits',
                                //PRD #27: which credits paid - subscription first, then ad, then free
                                text: earning?.paid_with ? `Paid with ${earning.paid_with}` : "success",
                                showConfirmButton: false,
                                timer: 2500
                            })
                        }
                        
                    }

                }else{
                    let user = localStorage.getItem("session")

                    // setUser(user)
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
                    console.log(res_data.message)
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
                    const {sum} = await response.json()
                    // console.log(message)
                    //affordable for one movie | episode
                    if(sum && sum > 49){
                        hasCredits = true
                    }

                    if(!hasCredits && !hasPaid){
                        noCreditsAlert(isLoggedIn.status)
                        navigate(-1)
                        return 
                    }

                    if(res_data.status){
                        const res = await fetch(`${process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_UPDATE_REPORT_CREDITS : process.env.REACT_APP_UPDATE_REPORT_CREDITS_LIVE}`,{
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
                        // setPaid(success)
                        // paid = success
                    }else{

                        const response = await fetch(`${process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_PAY_REPORT_CREDITS : process.env.REACT_APP_PAY_REPORT_CREDITS_LIVE}`,{
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
                                    "title":id,
                                    "eden":!!eden,
                                    //movie or episode, and the series an episode belongs to - producers are paid per series
                                    "content":serieID ? "tv" : "movie",
                                    "series":serieID || null
                                }

                            })
                        })
                        const {status,message,earning} = await response.json()
                        console.log(message)
                        
                        //affordable for one movie | episode
                        if(status){
                            // setPaid(status)
                            // paid = status
                            Swal.fire({
                                icon: 'success',
                                title: 'paid with credits',
                                text: earning?.paid_with ? `Paid with ${earning.paid_with}` : "success",
                                showConfirmButton: false,
                                timer: 2500
                            })
                        }
                    }

                }


                // if(!paid){
                //     navigate(-1)
                // }
            })
        }catch(error){
            console.log(error,"error")
        }

    // eslint-disable-next-line react-hooks/exhaustive-deps -- charges credits and has no run-once guard; must fire only on type/id change, eden/serieID are read for the receipt only
    },[type,id,navigate])
    const navRoute = ({url,state,ref}) => {
        
        navigate(url,{
            state : {
                ...state
            }
        })
    }

    // useEffect(() => {
    //     if(hasFetched.current.rate){
    //         return
    //     }
    //     hasFetched.current.rate = true
    //     const getRate = async() => {
    //         const response = await fetch(`${process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_PULL : process.env.REACT_APP_PULL_LIVE}`, {
    //             method: "POST",
    //             credentials: "include",
    //             body:JSON.stringify({
    //                 id
    //             }),
    //             headers: {
    //                 'Content-Type': 'application/json', // Indicates the body is JSON
    //             },
    //         });

    //         const {human, personal, all} = await response.json()
    //         console.log(human, personal, all)
    //         setRating(personal)
    //         setStars(all)
    //         setUsers(human)
    //     }
    //     getRate()
    // },[id])

    // useEffect(() => {
    //     if(!paid){
    //         navigate(-1)
    //     }
    // },[paid,navigate])

    // const ratingChanged = async(rating) => {
    //     const response = await fetch(`${process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_RATE_ADD : process.env.REACT_APP_RATE_ADD_LIVE}`, {
    //       method: "POST",
    //       credentials: "include",
    //       body:JSON.stringify({
    //         id,
    //         rate:rating
    //       }),
    //       headers: {
    //         'Content-Type': 'application/json', // Indicates the body is JSON
    //       },
    //     });

    //     const {status, error, message} = await response.json()

    //     if(error || !status){
    //         Swal.fire({
    //             icon: 'error',
    //             title: 'Oops...',
    //             text: error || message,
    //             showConfirmButton: false,
    //             timer: 2500
    //         })

    //         return null
    //     }
    //     Swal.fire({
    //         icon: 'success',
    //         title: 'I will find you...',
    //         text: "success",
    //         showConfirmButton: false,
    //         timer: 2500
    //     })
    // }
    useEffect(() => {
        async function getSubtitles() {
            try {
                const response = await fetch(
                process.env.REACT_APP_ENVIRONMENT === "development"
                    ? process.env.REACT_APP_SPEED_SUBTITLES_FILES
                    : process.env.REACT_APP_SPEED_SUBTITLES_FILES_LIVE,
                {
                    method: "POST",
                    headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    },
                    body: JSON.stringify({
                        id,
                        index:0,
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
    },[id])
    useEffect(() => {
        listVideos()
        .then(data => console.log(data))
    },[])

    let count = 0
    useEffect(() => {
        console.log("count",count)
        let nameStr = `
            ${
                name || serie_name
            }
            ${
                season && "||" + season
            }
            ${
                episode && "||" + episode
            }
        `
        !count && COLLECT(nameStr)
        count++
    },[count,name,season,episode,serie_name])

    //PRD #9: download to IndexedDB (models/idb.js) for /offline. The video is fetched BEFORE the
    //100 credits are taken, so a failed download costs nothing; a title already on this device is
    //opened instead of being bought again.
    const MAX_DOWNLOADS = 15
    const paidNotSaved = useRef(new Set())
    const offlineDownload = async() => {
        const openOffline = () => navigate(`/offline?id=${encodeURIComponent(id)}`)
        const savedKeys = await listVideoKeys().catch(() => [])
        if(savedKeys.map(String).includes(String(id))){
            const { isConfirmed } = await Swal.fire({
                icon: 'info',
                title: 'already downloaded',
                text: "This title is already saved on this device.",
                showCancelButton: true,
                confirmButtonText: 'watch offline',
            })
            if(isConfirmed) openOffline()
            return
        }
        if(savedKeys.length >= MAX_DOWNLOADS){
            Swal.fire({
                icon: 'error',
                title: 'storage is full',
                text: `You can keep ${MAX_DOWNLOADS} downloads. Delete one in Downloads first.`,
            })
            return
        }

        const receipt = {
            "receipt":"download",
            "player-type":[type],
            "title":id,
            "eden":!!eden,
            //movie or episode, and the series an episode belongs to - producers are paid per series
            "content":serieID ? "tv" : "movie",
            "series":serieID || null
        }
        //signed in: the account's credits; signed out: the guest's report credits
        const checkCredits = async() => {
            const res = await fetch(process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_API_URL : process.env.REACT_APP_API_URL_LIVE,{credentials: "include"})
            const isLoggedIn = await res.json().catch(() => ({}))
            if(isLoggedIn.status){
                const res = await fetch(process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_CHECK_USER_CREDITS : process.env.REACT_APP_CHECK_USER_CREDITS_LIVE,{credentials: "include"})
                const {sum} = await res.json()
                return { sum, pay: async() => {
                    const res = await fetch(process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_PAY_USER_CREDITS : process.env.REACT_APP_PAY_USER_CREDITS_LIVE,{
                        credentials: "include",
                        method:"POST",
                        headers:{ "Content-Type":"application/json", "Accept":"application/json" },
                        body:JSON.stringify({ credit:100.00, data:receipt })
                    })
                    return res.json()
                }}
            }
            const user = localStorage.getItem("session")
            const response = await fetch(process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_CHECK_REPORT_CREDITS : process.env.REACT_APP_CHECK_REPORT_CREDITS_LIVE,{
                method:"POST",
                headers:{ "Content-Type":"application/json", "Accept":"application/json" },
                body:JSON.stringify({ user })
            })
            const {sum} = await response.json()
            return { sum, pay: async() => {
                const res = await fetch(process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_PAY_REPORT_CREDITS : process.env.REACT_APP_PAY_REPORT_CREDITS_LIVE,{
                    credentials: "include",
                    method:"POST",
                    headers:{ "Content-Type":"application/json", "Accept":"application/json" },
                    body:JSON.stringify({ user, credit:100.00, data:receipt })
                })
                return res.json()
            }}
        }

        const getVideo = async() => {
            try{
                const url = `${process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_DOWNLOAD + '/' + id : process.env.REACT_APP_DOWNLOAD_LIVE + '/' + id}`
                const response = await axios.get(`${url}`, {
                    responseType: "blob",
                    onDownloadProgress: (event) => {
                        if (event.total) setProgress(Math.round((event.loaded * 100) / event.total))
                    },
                })
                //an error page or an empty body is not a video
                const blob = response.data
                if(!blob || !blob.size || /json|html|text/i.test(blob.type || "")) return null
                return new Blob([blob], { type: "video/mp4" })
            }catch(error){
                console.log(error)
                return null
            }
        }

        const getSubtitle = async() => {
            try{
                const subtitle_url = `${process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_DOWNLOAD_SUBTITLE + '/' + id : process.env.REACT_APP_DOWNLOAD_SUBTITLE_LIVE + '/' + id}`
                const subtitle_response = await axios.get(`${subtitle_url}`, {
                    responseType: "blob",
                    onDownloadProgress: (event) => {
                        if (event.total) setSubtitleProgress(Math.round((event.loaded * 100) / event.total))
                    },
                })
                if(!subtitle_response.data?.size) return null
                return new Blob([subtitle_response.data], { type: "text/vtt" })
            }catch(error){
                console.log(error)
                return null
            }
        }

        //title + poster for the Downloads list. Only blockbuster movies are looked up by id - an
        //episode id or an Eden id would match some other TMDB movie - the rest use what this page has.
        const getDetails = async() => {
            let data = {
                id,
                name: serie_name ? `${serie_name}${season ? ` S${season}` : ""}${episode ? `E${episode}` : ""}` : name,
                eden: !!eden,
                series: serieID || null,
            }
            let posterUrl = background?.path || null
            if(!eden && !serieID){
                try{
                    const fetched = await fetchSingleMovie({ variables : { id }})
                    const single = fetched?.data?.single
                    if(single){
                        data = { ...single, ...data, name: single.title || single.name || data.name }
                        if(single.poster_path) posterUrl = `${safeKeys.IMG_POSTER + single.poster_path}`
                    }
                }catch(error){
                    console.log(error)
                }
            }
            let poster = null
            if(eden){
                try{
                    const objectUrl = posterUrl && await loadEdenImage(String(posterUrl).replace(/^\/+/, ""))
                    if(objectUrl) poster = await fetch(objectUrl).then(res => res.blob())
                }catch(error){
                    console.log(error)
                }
            }else if(posterUrl){
                try{
                    const proxyUrl = `${process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_DOWNLOAD_IMG : process.env.REACT_APP_DOWNLOAD_IMG_LIVE }?url=${encodeURIComponent(posterUrl)}`
                    const poster_res = await fetch(proxyUrl)
                    if(poster_res.ok){
                        const blob = await poster_res.blob()
                        if(/^image\//.test(blob.type)) poster = blob
                    }
                }catch(error){
                    console.log(error)
                }
            }
            return { data, poster }
        }

        setDownload(true)
        setProgress(0)
        setSubtitleProgress(0)
        try{
            //paid on this page already, but the save failed: don't charge again
            const alreadyPaid = paidNotSaved.current.has(String(id))
            const credits = alreadyPaid ? null : await checkCredits()
            //affordable for one movie | episode
            if(!alreadyPaid && !(credits.sum > 99)){
                Swal.fire({
                    icon: 'error',
                    title: '100 CREDITS REQUIRED',
                    text: "add more credits",
                    showConfirmButton: false,
                    timer: 1500
                })
                return
            }
            const video_blob = await getVideo()
            if(!video_blob){
                Swal.fire({
                    icon: 'error',
                    title: 'download failed',
                    text: "The video could not be downloaded. No credits were taken - try again.",
                })
                return
            }
            let paidWith = null
            if(!alreadyPaid){
                const paid = await credits.pay()
                if(!paid?.status){
                    Swal.fire({
                        icon: 'error',
                        title: 'payment failed',
                        text: paid?.message || "Your credits could not be used. Try again.",
                    })
                    return
                }
                paidNotSaved.current.add(String(id))
                paidWith = paid.earning?.paid_with || null
            }
            const [subtitle, { data, poster }] = await Promise.all([getSubtitle(), getDetails()])
            try{
                await saveVideo(video_blob, subtitle, poster, data, id)
            }catch(error){
                const full = error?.name === "QuotaExceededError"
                Swal.fire({
                    icon: 'error',
                    title: full ? 'no space left' : 'could not save',
                    text: full
                        ? "This browser has no room for the video. Free some space (or delete a download), then press download again on this page - you won't be charged twice."
                        : "The video could not be saved on this device. Press download again on this page - you won't be charged twice.",
                })
                return
            }
            paidNotSaved.current.delete(String(id))
            const { isConfirmed } = await Swal.fire({
                icon: 'success',
                title: 'downloaded',
                text: "Saved on this device - it plays without internet from Downloads." + (paidWith ? ` Paid with ${paidWith}.` : ""),
                showCancelButton: true,
                confirmButtonText: 'watch offline',
                cancelButtonText: 'ok',
            })
            if(isConfirmed) openOffline()
        }catch(error){
            console.log(error)
            Swal.fire({
                icon: 'error',
                title: 'download failed',
                text: "Something went wrong. Try again.",
            })
        }finally{
            setDownload(false)
        }
    }

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
                // document.location.href = `/video/episode/${episodeID}/${name}/${serie.season_number}/${serie.episode_number}/${serie.air_date}/${imdb.imdb_id}${images}`;
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
                        anime,
                        // seasons:moveSeasons,
                        // episodes:moveEpisodes
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
                    serieID,
                    serie_name,
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
  const activeSeasonfn = useCallback(async(seasonID,seasonNumber) => {
    async function freshFetch(){
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
  },[serieID,mutateInsertSeason,fetchEpisodes,safeKeys.API_KEY,safeKeys.MOVIE_DB])
  const setViewsCurrent = (count) => {
    setViews(prevCount => prevCount + count)
  }
    return (
        <div className={`${windowWidth >= DESKTOP_WIDTH ? "w-[100%] min-h-[100%]  bg-cover bg-no-repeat bg-center text-white":"w-[100%] h-[100%] overflow-y-auto bg-cover bg-no-repeat bg-center text-white"}`} style={{backgroundImage:`linear-gradient(45deg, rgba(0,0,0,0.75), hsl(220, 70%, 10%)),url(${eden ? edenPoster || "/image/logo.png" : safeKeys.IMG_POSTER + "/" + background.path + ".jpg"})`,backgroundPosition:"0% 40%"}}>
            <div className={windowWidth >= DESKTOP_WIDTH ? "w-[100%] flex flex-row items-start" : "w-[100%]"}>
            {/* ---------- LEFT : player ---------- */}
            <div className={windowWidth >= DESKTOP_WIDTH ? "w-[68%] text-[#ffd800] min-h-[500px] flex flex-row flex-wrap" : "w-[100%] text-[#ffd800] h-[500px] flex flex-row flex-wrap"}>
                <div>
                    {
                        background.hasOwnProperty("logo") && background.logo ?
                        eden ?
                        <EDENIMAGE path={background.logo} alt={name || serie_name} className={"object-contain h-[150px]"} />
                        :
                        <PICTURE picture={background.logo} classes={"object-contain h-[150px]"} />
                        : 
                        <h1>{name || serie_name}</h1>
                    }
                </div>
                <h2>{
                    season && " || " + season
                }
                {
                    episode && " || " + episode
                }</h2>
                <p className="text-white">
                  {views} <FontAwesomeIcon icon={faEye} />
                </p>
                {
                   dash ? 
                        <DashPlayer src={process.env.REACT_APP_ENVIRONMENT === "development" ? `${process.env.REACT_APP_DASH_PLAY}/${id}/${id}.mpd`:`${process.env.REACT_APP_DASH_PLAY_LIVE}/${id}/${id}.mpd`} />
                    :
                        <>
                            {/* <VIDEO 
                                videoUrl={process.env.REACT_APP_ENVIRONMENT === "development"
                                    ? `${process.env.REACT_APP_SPEED_PLAY}/${id}`
                                    : `${process.env.REACT_APP_SPEED_PLAY_LIVE}/${id}`}
                                subtitleUrl={process.env.REACT_APP_ENVIRONMENT === "development"
                                        ? `${process.env.REACT_APP_HOST_SUB}/${id}`
                                        : `${process.env.REACT_APP_HOST_SUB_LIVE}/${id}`} 
                                subFiles={subFiles}
                            /> */}
                            <Player
                                videoUrl={`${
                                    process.env.REACT_APP_ENVIRONMENT === "development"
                                    ? process.env.REACT_APP_SPEED_PLAY
                                    : process.env.REACT_APP_SPEED_PLAY_LIVE
                                }/${id}`}          
                                subtitleUrl={`${
                                    process.env.REACT_APP_ENVIRONMENT === "development"
                                    ? process.env.REACT_APP_HOST_SUB
                                    : process.env.REACT_APP_HOST_SUB_LIVE
                                }/${id}`}
                                subFiles={subFiles}
                                poster={eden ? edenPoster || null : background?.path}
                                player={({
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
                                wireframe={"speed"}
                                setViewsFn={setViewsCurrent}
                                onPlayer={setVideoPlayer}
                            />
                            
                        </>

                }
                <WatchParty
                    launch={{ ...partyLaunch, content: season ? "tv" : "movie", series: serieID }}
                    player={videoPlayer}
                    initialCode={partyCode}
                    autoStart={Boolean(startParty) && !partyCode}
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
                <div className='w-[100%] text-[20px] flex flex-col mt-[7%]'>
                    <button
                        onClick={() => offlineDownload()}
                        disabled={download}
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
                    {
                        download && (
                            <div className="w-[100%]">
                                <p>Video Progress</p>
                                <div className="w-64 bg-gray-200 h-4 rounded mt-3">
                                    <div
                                        className="bg-green-500 h-4 rounded"
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                                <p>{progress}%</p>
                                <p>Subtitle Progress</p>
                                <div className="w-64 bg-gray-200 h-4 rounded mt-3">
                                    <div
                                        className="bg-green-500 h-4 rounded"
                                        style={{ width: `${subtitleProgress}%` }}
                                    ></div>
                                </div>
                                <p>{subtitleProgress}%</p>
                            </div>
                        )
                    }
                    
                </div>
                {/* {
                    seasons && episodes?
                    <div className="w-[80%] ml-[10%] mt-[2%] mb-[5%]">
                        <h2>Episodes</h2>
                        <div className={`w-[100%] duration-50 movie-scene ${windowWidth >= DESKTOP_WIDTH ? "h-[200px]" : "h-[150px]"} flex flex-col flex-wrap overflow-x-auto overflow-y-hidden my-[2%]${shortRow(episodes)}`}>
                            {
                                episodes.map(({
                                    air_date,
                                    episode_number,
                                    episode_type,
                                    id,
                                    name,
                                    overview,
                                    production_code,
                                    runtime,
                                    season_number,
                                    show_id,
                                    still_path,
                                    vote_average,
                                    vote_count       
                                },movie_key) => 
                                    <div 
                                        key={movie_key} 
                                        onClick={() => navRoute({
                                            url:`/series/episode`,
                                            state:{
                                                stream:"series",
                                                id:serieID,
                                                // anime,
                                                episodeID:id,
                                                season:season_number,
                                                episode:episode_number,
                                                name:serie_name,
                                                background:still_path,
                                                anime:seasons.find(season => season.season_number === season_number)?.genres 
                                                ? 
                                                    seasons.find(season => season.season_number === season_number)?.genres.find(({id}) => id === 16)
                                                :
                                                    seasons.find(season => season.season_number === season_number).genre_ids?seasons.find(season => season.season_number === season_number).genre_ids.includes(16)
                                                :
                                                    false,
                                                moveSeasons:seasons,
                                                moveEpisodes:episodes
                                            }})}   
                                        className={windowWidth >= DESKTOP_WIDTH ? "cursor-pointer w-[25%] h-[100%] hover:contrast-150":`w-[40%] h-[100%] hover:contrast-150`}
                                    >
                                        <div 
                                            className="w-[100%] h-[100%] background"
                                            style={{
                                                // boxShadow:windowWidth >= DESKTOP_WIDTH ? "rgba(0,0,0,0.8) -20px -150px 130px inset, rgba(0, 0, 0, 0.7) 0px 100px 10px, rgba(0, 0, 0, 0.8) 100px 50px 10px" : "",

                                                backgroundImage: `
                                                    linear-gradient(to bottom, rgba(0,0,0,0) 60%, rgba(0,0,0,0.85) 100%),
                                                    url(${safeKeys.IMG_POSTER + still_path})
                                                `
                                            }}
                                        >
                                            {/* <PICTURE key={id} classes={"object-cover h-[100%]"} picture={poster_path} /> 
                                            <div className={`relative ${windowWidth >= DESKTOP_WIDTH ? "top-[50%]" : "top-[50%]"} left-1/2 transform -translate-x-1/2 w-[100%] min-h-[60px] bg-opacity-60 text-white flex flex-col items-center justify-center z-10`}>
                                                <h1>episode: {episode_number}</h1>
                                                <h2 className={windowWidth >= DESKTOP_WIDTH ? "text-[15px]  font-bold":"text-[12px]"}>{name}</h2>
                                                {/* <p style={{color:"#ffd800"}}><FontAwesomeIcon icon={faStar} /> { parseFloat(vote_average).toFixed(1) || parseFloat(popularity).toFixed(1) || vote_count}</p> */}
                                                {/* <article className="text-[15px]">{overview}</article>
                                                <p className="text-[15px]">Release Date: {release_date}</p>
                                                <p className="text-[15px]">Vote Average: {vote_average}</p>
                                                <p className="text-[15px]">Vote Count: {vote_count}</p> 
                                            </div>
                                        </div>
                                    </div>
                                )
                            }
                        </div>
                         <h2>Seasons</h2>
                        <div className={`w-[100%] duration-50 movie-scene ${windowWidth >= DESKTOP_WIDTH ? "h-[200px]" : "h-[150px]"} flex flex-col flex-wrap overflow-x-auto overflow-y-hidden my-[1%]${shortRow(seasons)}`}>
                            {
                                seasons.map(({
                                    air_date,
                                    episode_count,
                                    id,
                                    name,
                                    overview,
                                    poster_path,
                                    season_number,
                                    vote_average    
                                },movie_key) => 
                                    <div 
                                        key={movie_key} 
                                        onClick={() => navRoute({
                                            url:`/series/season`,
                                            state:{
                                                stream:"series",
                                                id:serieID,
                                                seasonID:id,
                                                season:season_number,
                                                name:serie_name,
                                                // anime,
                                                seasons,
                                                background:poster_path,
                                                anime:seasons.find(season => season.season_number === season_number)?.genres 
                                                    ? 
                                                        seasons.find(season => season.season_number === season_number)?.genres.find(({id}) => id === 16)
                                                    :
                                                        seasons.find(season => season.season_number === season_number).genre_ids?seasons.find(season => season.season_number === season_number).genre_ids.includes(16)
                                                    :
                                                        false,
                                            }

                                        })}   
                                        className={windowWidth >= DESKTOP_WIDTH ? "cursor-pointer w-[25%] h-[100%] hover:contrast-150":`w-[40%] h-[100%] hover:contrast-150`}
                                    >
                                        <div 
                                            className="w-[100%] h-[100%] background"
                                            style={{
                                                backgroundImage: `
                                                    linear-gradient(to bottom, rgba(0,0,0,0) 60%, rgba(0,0,0,0.85) 100%),
                                                    url(${safeKeys.IMG_POSTER + poster_path})
                                                `
                                            }}
                                        >
                                            <div className={`relative ${windowWidth >= DESKTOP_WIDTH ? "top-[50%]" : "top-[50%]"} left-1/2 transform -translate-x-1/2 w-[100%] min-h-[60px] bg-opacity-60 text-white flex flex-col items-center justify-center z-10`}>
                                                <h2 className={windowWidth >= DESKTOP_WIDTH ? "text-[15px]  font-bold":"text-[12px]"}>{name}</h2>
                                            </div>
                                        </div>
                                    </div>
                                )
                            }
                        </div>                     
                    </div>
                    :
                    ""
                } */}
            </div>
            {/* ---------- RIGHT : info -> season select -> episodes ---------- */}
            <aside className={windowWidth >= DESKTOP_WIDTH ? "w-[32%] h-screen sticky top-0 flex flex-col border-l border-white/10" : "w-[100%]"}>
                <div className="w-[100%] mt-[2%] px-[2%] shrink-0">
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
                    seasons && (
                        <div className="w-[100%] px-[2%] my-[2%] shrink-0">
                            <label htmlFor="season-select" className="block text-[12px] text-[#ffd800] mb-[4px]">Season</label>
                            <select
                                id="season-select"
                                value={activeSeason || ""}
                                onChange={(e) => {
                                    const picked = seasons.find(({id}) => String(id) === e.target.value)
                                    if(!picked) return
                                    setActiveSeason(picked.id)
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
                }
                <div className={`w-[100%] duration-50 movie-scene ${windowWidth >= DESKTOP_WIDTH ? "flex-1 min-h-0 flex flex-col overflow-y-auto overflow-x-hidden" : "h-[150px] flex flex-col flex-wrap overflow-x-auto overflow-y-hidden"} my-[1%]${shortRow(episodesList)}`}>
                    {episodesList && (
                        episodesList.map(({episode_number,name,overview,still_path,player,url,id,air_date,imdb_id},index) => (
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
                    )}
                </div>
            </aside>
            </div>
        </div>
    )
}

export default SPEED;
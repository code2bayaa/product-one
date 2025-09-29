import NAVBAR from "./nav"
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback, useRef } from "react";
import PICTURE from "../midlleware/picture";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlayCircle, faStar, faBasketShopping, faCirclePlus } from "@fortawesome/free-solid-svg-icons";
import { useLazyQuery, gql, useMutation } from '@apollo/client';
import LOAD from "../midlleware/load";
import MOBILE from "./mobileBar";
import Swal from "sweetalert2";

const EPISODE = () => {
    // const { id, season, episodeID, episode, name, background } = useParams();
    const [layouts,setLayouts] = useState(false)
    // const [fetchedImageBackgrounds,setFetchedImageBackgrounds] = useState(null)
    const { state } = useLocation();
    const navigate = useNavigate();
    const hasFetched = useRef({id:false,credits:false,images:false,tv:false})
    const id = state.id
    const name = state.name
    const episodeID = state.episodeID
    const season = state.season
    const episode = state.episode
    const background = state.background
    const direct = state.direct
    const index = state.index
    const anime = state.anime

    useEffect(() => {
        const sendForm = async({url,options}) => {

            const response = await fetch(
                url,
                options,
                {credentials:"initial"}
            )

            
            return await response.json()

        }

        async function runLocale(){
            let user_location = localStorage.getItem("location") || null;
            if(!user_location){
                const urls = [
                    "https://ipinfo.io/json",
                    // "https://apiip.net/api/check?accessKey=13ad4095-2d84-41f6-be25-df331c9e4f01",
                    "https://ipapi.co/json/",
                    "https://api.ipgeolocation.io/ipgeo?apiKey=" + process.env.REACT_APP_geo
                ]

                const locations = await Promise.all(urls.map(async(url) => {
                    return await sendForm({url, options : {
                        method:"GET",
                        headers : {'Content-type': 'application/json; charset=UTF-8'},
                    }})
                }))

                user_location = locations
            }else{
                user_location = JSON.parse(user_location);
            }
            // return user_location;
            const continent = user_location && user_location.length > 1 && user_location[2].continent_name && user_location[2].continent_name
            // console.log(continent,"continent")
            const continents = ["Africa","Australia","Oceania"]
            if(continents.includes(continent)){
                setLayouts(true)
            } 
            console.log(user_location,"user location")
        }

        runLocale()
    },[])
    const [serie, setSerie] = useState(null);
    const [images,setImages] = useState(null)
    const [credits,setCredit] = useState(null)
    const [imdb,setIMDB] = useState(null)
    const [windowWidth, setWindowWidth] = useState(0);
    const [playlist,setPlaylist] = useState(null)

    const FETCH_IMAGE_QUERY = gql`
        query Image (
            $type: String!
            $season: Int!
            $episode: Int! 
            $id : ID! 
        ){
            image(
                type:$type,
                episode:$episode,
                season:$season,
                id:$id
            ) {
                data {
                    id
                    path
                }
                meta_data {
                    type
                    season
                    episode
                }
                success
                error
            }
        }
    `
    const [fetchImage] = useLazyQuery(FETCH_IMAGE_QUERY,{
        notifyOnNetworkStatusChange: true,
    })

    const [mutateInsertImage] = useMutation(gql`
        mutation AddImage(
            $meta_data: META_DATA_INPUT!
            $data: DATA_INPUT!          
        ) {
            addImage(
                meta_data: $meta_data
                data: $data               
            ){
                data {
                    id
                    path
                }
                meta_data {
                    id
                    type
                    season
                    episode
                }
                success
                error
            }
        }
    `,
    {
        onCompleted: (data) => {
            if (data && data.addImage.success) {
                // Refetch the query to get updated data
                // fetchImageData.refetch().then((refetched) => {
                //     console.log(refetched)
                //     if(refetched.data.image.success){
                //         const ref = refetched?.data?.image?.data
                //         const typeGetImageData = {...ref}
                //         setImages(() => typeGetImageData)
                //     }

                // })

            }
        },
        onError: (error) => {
            console.error("insert image Error:", error);
        },
    });


    const FETCH_MOVIE_QUERY = gql`
        query Episode (
            $id: ID!
        ){
            episode(
                id:$id
            ) {

                    air_date
                    episode_number
                    episode_type
                    id
                    name
                    overview
                    production_code
                    runtime
                    season_number,
                    url {
                        fileName
                        week
                        quality
                    }
                    still_path
                    vote_average
                    vote_count
                    success
            }
        }
    `
    const [fetchEpisode] = useLazyQuery(FETCH_MOVIE_QUERY,{
        // pollInterval: 500, // fetches new data at that interval
        notifyOnNetworkStatusChange: true,
        // variables,
        // skip: !variables.page, // Skip query execution if variables are not set
    });

    const INSERT_MOVIE_MUTATION = gql`
        mutation AddEpisode(
            $single:COLLECT_EPISODE_INPUT
        ) {
            addEpisode(
                single:$single
            ) {
                success
                message
            }
        }
    `;

    const [mutateInsertTV] = useMutation(INSERT_MOVIE_MUTATION, {
        onCompleted: (data) => {
            console.log(data.addEpisode,"checking insert...")
            if (data.addEpisode.success) {
                if(data.addEpisode.message === "already inserted")
                    console.log("episode inserting already started...")
                console.log("Movie successfully inserted into MySQL:", data.addEpisode.message);
                // fetchedMovieData.refetch()
                // .then(status => console.log(status,"status"))
                // fetchedMovieData.refetch().then((refetched) => {
                //     console.log(refetched)
                //     if(refetched.data.episode.success){
                //         const ref = refetched?.data?.episode
                //         const typeGetImageData = {...ref}
                //         setCredit(() => ({...typeGetImageData}))
                //     }

                // })                
            } else {
                console.error("Failed to insert movies into MySQL:", data.addEpisode.message, data.addEpisode.error);
            }
        },
        onError: (error) => {
            console.log(error,"error")
            console.error("Error inserting episode into MySQL:", error.message);
        },
    });

    const FETCH_CREDITS_QUERY = gql`
        query Credits (
            $id: Int!
        ){
            credits(
                id:$id
            ) {
                cast {
                    roles {
                        credit_id
                        character
                        episode_count
                    }
                    adult
                    gender
                    id
                    known_for_department
                    name
                    original_name
                    popularity
                    profile_path
                    cast_id
                    character
                    credit_id
                    total_episode_count
                    order
                }
                crew {
                    jobs {
                        credit_id
                        job
                        episode_count
                    }
                    adult
                    gender
                    id
                    known_for_department
                    name
                    original_name
                    popularity
                    profile_path
                    cast_id
                    character
                    credit_id
                    total_episode_count
                    order
                    department
                }    
                guest_stars {
                    character
                    credit_id
                    order
                    adult
                    gender
                    id
                    known_for_department
                    name
                    original_name
                    popularity
                    profile_path
                }
                success
                error
                message
            }
        }
    `
    const [fetchCreditsData] = useLazyQuery(FETCH_CREDITS_QUERY,{
    // pollInterval: 500, // fetches new data at that interval
        notifyOnNetworkStatusChange: true,
    });

    const INSERT_CREDITS_MUTATION = gql`
        mutation AddCredits(
            $id:Int!
            $cast:[CAST_INPUT]
            $crew:[CREW_INPUT]
            $chunking:Boolean!
            $chunking_index:Int!            
        ) {
            addCredits(
                id:$id
                cast:$cast
                crew:$crew
                chunking:$chunking
                chunking_index:$chunking_index                 
            ) {
                success
                message
            }
        }
    `;

    const [mutateInsertCredits] = useMutation(INSERT_CREDITS_MUTATION, {
        onCompleted: (data) => {
            if (data && data.addCredits.success) {
                // Refetch the query to get updated data
                // fetchedCredits.refetch().then((refetched) => {
                //     console.log(refetched)
                //     if(refetched.data.credits.success){
                //         const ref = refetched?.data?.credits
                //         const typeGetImageData = {...ref}
                //         setCredit(() => ({...typeGetImageData}))
                //     }

                // })

            } else {
                console.error("Failed to insert credits into MySQL:", data.addCredits.message, data.addCredits.error);
            }
        },
        onError: (error) => {
            console.log(error,"error")
            console.error("Error inserting credits into MySQL:", error.message);
        },
    });

    const FETCH_IMDB_QUERY = gql`
        query IMDB(
            $id: Int!
        ){
            imdb(
                id:$id
            ){
                id
                success
                error
                message
            }
        }
    `
    const [fetchIMDBData] = useLazyQuery(FETCH_IMDB_QUERY,{
    // pollInterval: 500, // fetches new data at that interval
        notifyOnNetworkStatusChange: true,
    });

    const UPDATE_IMDB_MUTATION = gql`
        mutation UpdateIMDB(
            $id:ID!
            $external_ids:EXTERNAL_INPUT
        ) {
            updateIMDB(
                id:$id
                external_ids:$external_ids
            ) {
                success
                message
            }
        }
    `;

    const [mutateUpdateIMDB] = useMutation(UPDATE_IMDB_MUTATION, {
        onCompleted: (data) => {
            if (data && data.updateIMDB.success) {
                // Refetch the query to get updated data
                // fetchedIMDB.refetch().then((refetched) => {
                //     console.log(refetched)
                //     if(refetched.data.imdb.success){
                //         const ref = refetched?.data?.imdb
                //         const typeGetImageData = {...ref}
                //         setCredit(() => ({...typeGetImageData}))
                //     }

                // })

            } else {
                console.error("Failed to insert credits into MySQL:", data.updateIMDB.message, data.updateIMDB.error);
            }
        },
        onError: (error) => {
            console.log(error,"error")
            console.error("Error inserting credits into MySQL:", error.message);
        },
    });

    const graphImages = useCallback(async() => {

        async function freshFetch(){
            const response = await fetch(`${process.env.REACT_APP_movie_db}tv/${id}/season/${season}/episode/${episode}/images?api_key=${process.env.REACT_APP_api_key}`);
            const getImageData = await response.json();
            console.log(getImageData,"images")
            let value = 0
            const {stills} = getImageData
            let path = ''
            if(stills && stills.length > 0){
                value = Math.max(...stills.map(({height}) => height))
                let key = stills.findIndex(({height}) => height === value)
                if(key > -1){
                    path = stills[key].file_path
                }
            } 

            mutateInsertImage({ variables: { meta_data : {
                    type:"tv",
                    season:season?parseInt(season):-1,
                    episode:episode?parseInt(episode):-1,
                    id:id?parseInt(id):-1
                }, data:{id:getImageData.id,path}                  
            } });
            return path
        }         
        try{
            const fetched = await fetchImage({
                variables : {
                type:"tv",
                episode:episode?parseInt(episode):-1,
                season:season?parseInt(season):-1,
                id:id?parseInt(id):-1
            }})
            console.log(fetched)
            if (fetched.data && fetched.data.image.success) {
                console.log("image cached data:", fetched.data);
                setImages(() => (fetched.data.image.data.path))

            }else {
                const path = await freshFetch()
                setImages(path)
            }
        
            
        }catch(error){
            console.log(error)
            const path = await freshFetch()
            setImages(path)            
        

        }
    },[fetchImage,mutateInsertImage,id,season,episode])

    const fetchTV = useCallback(async() => {

        async function freshFetch(){
            const response = await fetch(`${process.env.REACT_APP_movie_db}tv/${id}/season/${season}/episode/${episode}?api_key=${process.env.REACT_APP_api_key}`);
            const data = await response.json();
            const newData = {...data}
            delete newData.crew
            delete newData.guest_stars
            delete newData.cast
            // newData.episodes = newData.episodes.map(({crew,guest_stars,cast, ...rest}) => rest)
            // console.log(newData,"newData")
            mutateInsertTV({
                variables: {
                    single : {...newData}
                },
            });
            return {...data}
        } 

        const checkFeedback = (id) => {
            console.log(id,"id")
            //authentication
            fetch(process.env.REACT_APP_environment === "development" ? process.env.REACT_APP_api_url : process.env.REACT_APP_api_url_live,{credentials: "include"})
            .then(async res => {
                const {status, user} = await res.json()
                if(status){
                    fetch(`${process.env.REACT_APP_environment === "development" ? process.env.REACT_APP_playlist_select : process.env.REACT_APP_playlist_select_live}`,{
                        method:"POST",
                        headers:{
                            "Content-Type":"application/json"
                        },
                        body:JSON.stringify({id, episodeID, user, season, episode, type:"episode"})
                    })
                    .then(res => res.json())
                    .then(({status}) => {
                        if(status){
                            setPlaylist(() => true)
                        }
                    })
                }
            })
        }
        const fetched = await fetchEpisode({
            variables : { 
                id:episodeID
                // season:season ? parseInt(season):-1,
                // episode: episode? parseInt(episode):-1
            }})
            console.log(fetched)
        if (fetched.data && fetched.data.episode.air_date === null) {
            console.log("first time...")
            const tv = await freshFetch()
            setSerie(() => ({...fetched.data.episode,...tv}));
            checkFeedback(tv.id)
        }else if(fetched.data && fetched.data.episode.success){
            console.log("Using cached data:", fetched.data)
            setSerie(() => ({...fetched.data.episode}))
            checkFeedback(fetched.data.episode.id)
        }else {
            const tv = await freshFetch()
            setSerie(() => ({...tv}))
            checkFeedback(tv.id)
        }
        


    },[id, season, episode, episodeID, fetchEpisode, mutateInsertTV])

    const fetchCredits = useCallback(async() => {
        async function freshFetch(){
            const response = await fetch(`${process.env.REACT_APP_movie_db}tv/${id}/season/${season}/episode/${episode}/credits?api_key=${process.env.REACT_APP_api_key}`);
            const credits_data = await response.json();
            console.log(credits_data)
            function chunkArray(array, size) {
                const result = [];
                for (let i = 0; i < array.length; i += size) {
                    result.push(array.slice(i, i + size));
                }
                return result;
            }
            let cast_all_results = [...credits_data.cast]
            if(cast_all_results.length > 100){
                const chunks = chunkArray(cast_all_results, 100);
                for (let i = 0; i < chunks.length; i++) {
                    mutateInsertCredits({
                        variables: {
                            cast:chunks[i],
                            id:id?parseInt(id):0,
                            chunking:true,
                            chunking_index:i
                        },
                    });
                }
            }else{
                mutateInsertCredits({
                    variables: {
                        cast:cast_all_results,
                        id:id?parseInt(id):0,
                        chunking:false,
                        chunking_index:0
                    },
                });
            }
            let crew_all_results = [...credits_data.crew]
            if(crew_all_results.length > 100){
                const chunks = chunkArray(crew_all_results, 100);
                for (let i = 0; i < chunks.length; i++) {
                    mutateInsertCredits({
                        variables: {
                            crew:chunks[i],
                            id:id?parseInt(id):0,
                            chunking:true,
                            chunking_index:i                        
                        },
                    });
                }
            }else{
                mutateInsertCredits({
                    variables: {
                        crew:crew_all_results,
                        id:id?parseInt(id):0,
                        chunking:false,
                        chunking_index:0                    
                    },
                });
            }
            return {...credits_data}
        } 

        const current_date = new Date().toISOString().split("T")[0]
            const fetched = await fetchCreditsData({
                variables : { id:id?parseInt(id):0, date:current_date }})
            // console.log(fetched)
            if(fetched.data && fetched.data.credits.success){
                console.log("Using cached data:", fetched.data);
                setCredit(() => ({...fetched.data.credits}));
            }else {
                const credits = await freshFetch()
                setCredit(() => ({...credits}));
            }
        

    },[id, season, episode, fetchCreditsData, mutateInsertCredits])

    const fetchID = useCallback(async() => {
        async function freshFetch(){
            const response = await fetch(`${process.env.REACT_APP_movie_db}tv/${id}/season/${season}/episode/${episode}/external_ids?api_key=${process.env.REACT_APP_api_key}`);
            const imdb_data = await response.json();
            // console.log(imdb_data,"imdb")
            mutateUpdateIMDB({
                variables: {external_id:imdb_data,id:id?parseInt(id):0,type:"tv"},
            });
            return {...imdb_data}
        } 

        if(!imdb){
            const current_date = new Date().toISOString().split("T")[0]
            const fetched = await fetchIMDBData({
                variables : { id:id?parseInt(id):0, date:current_date }})
            console.log(fetched)
            if(fetched.data && fetched.data.imdb.success){
                console.log("Using cached data:", fetched.data);
                setIMDB(() => ({...fetched.data.imdb}));
            }else {
                const imdb = await freshFetch()
                setIMDB(() => ({...imdb}));
            }
        }

    },[id, season, episode, fetchIMDBData, mutateUpdateIMDB, imdb])

    useEffect(() => {
        if(hasFetched.current.id){
            return
        }
        hasFetched.current.id = true
        fetchID()
    },[fetchID])

    useEffect(() => {
        // if(hasFetched.current.images){
        //     return
        // }
        // hasFetched.current.images = true        
        graphImages()
    },[graphImages])

    useEffect(() => {
        if(hasFetched.current.tv){
            return
        }
        hasFetched.current.tv = true        
        fetchTV();
    }, [fetchTV]);

    useEffect(() => {
        if(hasFetched.current.credits){
            return
        }
        hasFetched.current.credits = true        
        fetchCredits();
    }, [fetchCredits]);

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };
        window.addEventListener("resize", handleResize);
        handleResize(); // Call it once to set the initial value
    },[])

    const addToPlayList = async() => {

        //authentication
        const res = await fetch(process.env.REACT_APP_environment === "development" ? process.env.REACT_APP_api_url : process.env.REACT_APP_api_url_live,{credentials: "include"})
        const {status, user} = await res.json()
        if(status){
            fetch(`${process.env.REACT_APP_environment === "development" ? process.env.REACT_APP_playlist : process.env.REACT_APP_playlist_live}`,{
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify({id, episodeID, season:parseInt(season), episode:parseInt(episode), user, type:"episode"})
            })
            .then(res => res.json())
            .then(({status, message}) => {
                if(status){
                    Swal.fire({
                        icon: 'success',
                        title: 'Added to playlist',
                        showConfirmButton: false,
                        timer: 1500
                    })

                    setPlaylist(() => true)
                }else if(message === "Playlist already exists for this user"){
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: "Already in playlist",
                        showConfirmButton: false,
                        timer: 1500
                    })
                    setPlaylist(() => true)
                }
                
            })
        }else{
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: "Sign in to add to playlist",
                showConfirmButton: false,
                timer: 1500
            })
        }

    }

    // useEffect(() => {
    //             if(!images)
    //         return null
    //     let value = 0
    //     // console.log(images)
    //     const {backdrops, posters, logos, stills} = images
    //     let path = ''
    //     if(backdrops && backdrops.length > 0){
    //         const heights = backdrops.map(({ height }) => height);
    //         const uniqueHeights = Array.from(new Set(heights)).sort((a, b) => b - a);
    //         value = uniqueHeights.length > episode ? uniqueHeights[episode] : uniqueHeights.length > 1 ? uniqueHeights[1] :  uniqueHeights[0];
    //         let key = backdrops.findIndex(({height}) => height === value)
    //         if(key > -1){
    //             path = backdrops[key].file_path
    //         }
    //     } 
    //     if(posters && posters.length > 0){
    //         const heights = posters.map(({ height }) => height);
    //         const uniqueHeights = Array.from(new Set(heights)).sort((a, b) => b - a);
    //         let posters_value = uniqueHeights.length > episode ? uniqueHeights[episode] : uniqueHeights.length > 1 ? uniqueHeights[1] :  uniqueHeights[0];
    //         if(posters_value > value){
    //             let key = posters.findIndex(({height}) => height === posters_value)
    //             if(key > -1){
    //                 path = posters[key].file_path
    //             }
    //             value = posters_value
    //         }
    //     }
    //     if(stills && stills.length > 0){
    //         const heights = stills.map(({ height }) => height);
    //         const uniqueHeights = Array.from(new Set(heights)).sort((a, b) => b - a);
    //         let stills_value = uniqueHeights.length > episode ? uniqueHeights[episode] : uniqueHeights.length > 1 ? uniqueHeights[1] :  uniqueHeights[0];
    //         if(stills_value > value){
    //             let key = stills.findIndex(({height}) => height === stills_value)
    //             if(key > -1){
    //                 path = stills[key].file_path
    //             }
    //             value = stills_value
    //         }
    //     }        
    //     if(logos && logos.length > 0){
    //         const heights = logos.map(({ height }) => height);
    //         const uniqueHeights = Array.from(new Set(heights)).sort((a, b) => b - a);
    //         let logos_value = uniqueHeights.length > episode ? uniqueHeights[episode] : uniqueHeights.length > 1 ? uniqueHeights[1] : uniqueHeights[0];
    //         if(logos_value > value){
    //             let key = logos.findIndex(({height}) => height === logos_value)
    //             if(key > -1){
    //                 path = logos[key].file_path
    //             }
    //         }
    //     }
    //     setFetchedImageBackgrounds(path.substring(1).substring(0,path.substring(1).length - 4))
    // },[images,episode])

    // const getBackground = useMemo(() => {

    //     if(fetchedImageBackgrounds)
    //         return process.env.REACT_APP_img_poster + "/" + fetchedImageBackgrounds + ".jpg"
    //     if(!images)
    //         return null
    //     let value = 0
    //     const {backdrops, posters, logos, stills} = images
    //     let path = ''
    //     if(backdrops && backdrops.length > 0){
    //         const heights = backdrops.map(({ height }) => height);
    //         const uniqueHeights = Array.from(new Set(heights)).sort((a, b) => b - a);
    //         value = uniqueHeights.length > episode ? uniqueHeights[episode] : uniqueHeights.length > 1 ? uniqueHeights[1] :  uniqueHeights[0];
    //         let key = backdrops.findIndex(({height}) => height === value)
    //         if(key > -1){
    //             path = backdrops[key].file_path
    //         }
    //     } 
    //     if(posters && posters.length > 0){
    //         const heights = posters.map(({ height }) => height);
    //         const uniqueHeights = Array.from(new Set(heights)).sort((a, b) => b - a);
    //         let posters_value = uniqueHeights.length > episode ? uniqueHeights[episode] : uniqueHeights.length > 1 ? uniqueHeights[1] :  uniqueHeights[0];
    //         if(posters_value > value){
    //             let key = posters.findIndex(({height}) => height === posters_value)
    //             if(key > -1){
    //                 path = posters[key].file_path
    //             }
    //             value = posters_value
    //         }
    //     }
    //     if(stills && stills.length > 0){
    //         const heights = stills.map(({ height }) => height);
    //         const uniqueHeights = Array.from(new Set(heights)).sort((a, b) => b - a);
    //         let stills_value = uniqueHeights.length > episode ? uniqueHeights[episode] : uniqueHeights.length > 1 ? uniqueHeights[1] :  uniqueHeights[0];
    //         if(stills_value > value){
    //             let key = stills.findIndex(({height}) => height === stills_value)
    //             if(key > -1){
    //                 path = stills[key].file_path
    //             }
    //             value = stills_value
    //         }
    //     }        
    //     if(logos && logos.length > 0){
    //         const heights = logos.map(({ height }) => height);
    //         const uniqueHeights = Array.from(new Set(heights)).sort((a, b) => b - a);
    //         let logos_value = uniqueHeights.length > episode ? uniqueHeights[episode] : uniqueHeights.length > 1 ? uniqueHeights[1] : uniqueHeights[0];
    //         if(logos_value > value){
    //             let key = logos.findIndex(({height}) => height === logos_value)
    //             if(key > -1){
    //                 path = logos[key].file_path
    //             }
    //         }
    //     }
    //     if(path)
    //         setFetchedImageBackgrounds(path.substring(1).substring(0,path.substring(1).length - 4))
    //     else
    //         setFetchedImageBackgrounds("null")
    //     return process.env.REACT_APP_img_poster + path
    // },[fetchedImageBackgrounds,episode,images]);

    const openPlay = async() => {

        if(serie && serie.hasOwnProperty("url") && serie.url){
            function getCurrentWeek() {
                const now = new Date();
                const startOfYear = new Date(now.getFullYear(), 0, 1);
                const pastDaysOfYear = (now - startOfYear) / 86400000;
                return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
            }

            // Usage:
            const currentWeek = getCurrentWeek();            
            if(serie && serie.url && serie.url.quality && serie.url.quality === "CAM" && currentWeek > serie.url.week){
                // document.location.href = `/video/episode/${episodeID}/${name}/${serie.season_number}/${serie.episode_number}/${serie.air_date}/${imdb.imdb_id}${images}`;
                navRoute({
                url:`/video/episode`,
                state:{
                    stream:"episode",
                    id:episodeID,
                    name,
                    season:serie.season_number,
                    episode:serie.episode_number,
                    background:images,
                    date:serie.air_date,
                    imdbId:imdb?.imdb_id,
                    anime
                }})
            }else{
                async function authentication(){
                    const res = await fetch(process.env.REACT_APP_environment === "development" ? process.env.REACT_APP_api_url : process.env.REACT_APP_api_url_live,{credentials: "include"})
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

                    const response = await fetch(`${process.env.REACT_APP_environment === "development" ? process.env.REACT_APP_user_paid : process.env.REACT_APP_user_paid_live}`,{
                        credentials: "include",
                        method:"POST",
                        headers:{
                            "Content-Type":"application/json",
                            "Accept":"application/json"
                        },
                        body:JSON.stringify({
                            id:episodeID
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

                    const res = await fetch(process.env.REACT_APP_environment === "development" ? process.env.REACT_APP_check_user_credits : process.env.REACT_APP_check_user_credits_live,{credentials: "include"})
                    const {sum,message} = await res.json()
                    console.log(message)
                    //affordable for one movie | episode
                    if(sum && sum > 49){
                        hasCredits = true
                    }
                }else{
                    user = localStorage.getItem("session")
                    console.log("id",episodeID)
                    const res = await fetch(`${process.env.REACT_APP_environment === "development" ? process.env.REACT_APP_paid : process.env.REACT_APP_paid_live}`,{
                        method:"POST",
                        headers:{
                            "Content-Type":"application/json",
                            "Accept":"application/json"
                        },
                        body:JSON.stringify({
                            user,
                            id:episodeID
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

                    const response = await fetch(`${process.env.REACT_APP_environment === "development" ? process.env.REACT_APP_check_report_credits : process.env.REACT_APP_check_report_credits_live}`,{
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
                    Swal.fire({
                        icon: 'error',
                        title: 'NO CREDITS',
                        text: "add more credits",
                        showConfirmButton: false,
                        timer: 1500
                    })
                    return 
                }                
                // document.location.href = `/speed/${serie.url.fileName}${images}/${episodeID}/tv`
                
                navRoute({
                url:`/speed`,
                state:{
                    stream:"tv",
                    id:episodeID,
                    name:serie.url.fileName,
                    background:images,
                    dash:serie.url.hasOwnProperty("dash")?true:false
                }}) 
            }
            
        }else{
            console.log(images,background,index)
            // document.location.href = `/video/episode/${episodeID}/${name}/${serie.season_number}/${serie.episode_number}/${serie.air_date}/${imdb.imdb_id}${images}`
            if(direct){
                navRoute({
                    url:`/play`,
                    state:{
                        id:direct,
                        index,
                        background,
                        many:serie.episode_number
                    }})
            }else{
                navRoute({
                url:`/video/episode`,
                state:{
                    stream:"episode",
                    id:episodeID,
                    name,
                    season:serie.season_number,
                    episode:serie.episode_number,
                    background:images,
                    date:serie.air_date,
                    year:serie.air_date.substring(0,4),
                    imdbId:imdb?.imdb_id,
                    anime
                }})
            }
        }
    }
    const navRoute = ({url,state}) => {
        navigate(url,{
            state : {
                ...state
            }
        })
    }
    return (
credits && serie ? 
        <div className="w-[100%] h-[100%]  bg-cover bg-no-repeat bg-center text-white" style={{backgroundImage:`linear-gradient(105deg, #0d0d0d, rgba(0,0,0,0.75), #000, rgba(0,0,0,0.56)),url(${images ? process.env.REACT_APP_img_poster + images : process.env.REACT_APP_img_poster + background})`,backgroundPosition:"0% 40%"}}>
            {
                windowWidth > 800 ? 
                <div className="w-[20%] h-[100%] absolute border-r-[3px] border-[#2E2E3A]" style={{background:"linear-gradient(85deg, #0d0d0d, rgba(0,0,0,0.75), #000, #0f111a)"}}>
                    <NAVBAR/>
                </div>
                :
                <MOBILE/>
            }
            <div className={windowWidth > 800 ? "w-[80%] overflow-y-auto movie-scene h-[100%] ml-[20%] flex flex-col":"w-[98%] mx-[1%]  h-[92%] overflow-y-auto movie-scene flex flex-col"}>
                
                    
                        <>
                        <div className={windowWidth > 800 ? "w-[100%] flex flex-row flex-wrap":"w-[100%] flex flex-col flex-wrap"}>
                            <div 
                                className={windowWidth > 800 ? "w-[37%] min-h-[100%] shadow background":"w-[100%] h-[auto]"} 
                                style={{
                                    backgroundImage:"url(" + (serie && serie.hasOwnProperty("still_path") && serie.still_path ? process.env.REACT_APP_img_poster + serie.still_path : images ?  process.env.REACT_APP_img_poster + images :  process.env.REACT_APP_img_poster + "/" + background + ".jpg") + ")",
                                    boxShadow:"rgba(0, 0, 0, 0.97) -70px -100px 120px inset, rgba(0, 0, 0, 0.9) 0px 100px 10px, rgba(0, 0, 0, 0.9) 100px 50px 10px"
                                }}
                            >
                                {
                                    windowWidth < 800 && <PICTURE picture={`${serie && serie.hasOwnProperty("still_path") && serie.still_path ? serie.still_path : images}`} classes={windowWidth > 800 ? "shadow-lg h-[70%] shadow-blue-500/50" : "shadow-lg h-[200px] shadow-blue-500/50 object-contain"} />

                                }
                            </div>
                            <div className={windowWidth > 800 ? "w-[61%] m-[1%] h-[60%] justify-center items-center":"w-[100%] h-auto"}>
                                <h1 className="text-[30px] text-[#ffd800]">{serie.name}</h1>
                                {/* <p style={{fontStyle:"italic",color:"#ffd800"}}>"{serie.tagline}"</p> */}
                                <h3>{serie.air_date}</h3>
                                <h3>season {serie.season_number} || episode {serie.episode_number}</h3>
                                {
                                    serie.hasOwnProperty("url") && serie.url && serie.url.hasOwnProperty("quality") && serie.url.quality && <h3 className="text-[#ffd800]">{serie.url.quality}</h3>
                                }
                                {/* <h3 style={{color:"#ffd800"}}>genre</h3>
                                {
                                    serie.genres.map(({name}) => `${name}`).join(" || ")

                                } */}
                                {/* <h3 style={{color:"#ffd800"}}>{serie.in_production ? "airing" : "ended"}</h3> */}
                                {/* <h3 style={{color:"#ffd800"}}>current episode</h3> */}
                                {/* <span>{serie.last_episode_to_air.name} || {serie.last_episode_to_air.air_date} || {serie.last_episode_to_air.season_number} || {serie.last_episode_to_air.episode_number}</span> */}
                                {/* <h3>seasons || {serie.number_of_seasons}</h3>
                                <h3>episodes || {serie.number_of_episodes}</h3> */}
                                {/* <h3>{serie.video ? "available":"not available"}</h3> */}
                                {/* <h4>{ (serie.episode_run_time[0] > 60) ? Math.floor(serie.episode_run_time[0] / 60) + "h" + " " + serie.episode_run_time[0] % 60 + "min" : serie.episode_run_time[0] + "min" }</h4> */}
                                <article>
                                    {serie.overview}
                                </article>
                                <div className="w-[100%] flex flex-row flex-wrap border-b-[#fff] border-b-[2px]">
                                    <button
                                        // to={`/series/video/series/${id}/${serie.season_number}/${serie.episode_number}/${background}`}
                                        onClick={() => navRoute({
                                            url:`/series/episode/trailer`,
                                            state:{
                                                stream:"series",
                                                id:id,
                                                season:serie.season_number,
                                                episode:serie.episode_number,
                                                background
                                            }})}                                           
                                        className={windowWidth > 800 ? "w-[23%] flex flex-row flex-nowrap text-center underline h-[80px] ":" shadow-md shadow-[#ffd800] w-[48%] mt-[1%] ml-[1%] text-center min-h-[40px] underline"}
                                    >
                                        <img src="/image/2503508.png" alt="UKOapp" className="w-[50%]"/>
                                        <h2>trailors</h2>
                                    </button>
                                    {
                                        layouts && 
                                        (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => openPlay()}
                                                    className={windowWidth > 800 ? "text-[#ffd800] text-[30px] w-[15%] underline text-center min-h-[40px] m-[1%]":"text-[#ffd800] w-[48%] mt-[1%] ml-[1%] text-center justify-center h-[40px] rounded-full"}
                                                >
                                                    <h3>play</h3> <FontAwesomeIcon icon={faPlayCircle} />
                                                </button>
                                            </>                                            
                                        )
                                    }
                                    
                                    <button
                                        onClick={() => navRoute({
                                            url:`/series/similar`,
                                            state:{
                                                stream:"series",
                                                id,
                                                background:images
                                            }})}  
                                        className={windowWidth > 800 ? "w-[23%] flex flex-row text-center underline  min-h-[40px] m-[1%]":"w-[48%] mt-[1%] ml-[1%] text-center min-h-[40px] underline"}
                                    >
                                        <img src="/image/2798007.png" alt="UKOapp" className="w-[50%]"/>
                                        <h2>similar tv</h2>
                                    </button>
                                    
                                    <button
                                        onClick={() => navRoute({
                                            url:`/series/recommendations`,
                                            state:{
                                                stream:"series",
                                                id,
                                                background:images
                                            }})}   
                                        className={windowWidth > 800 ? "w-[23%] flex flex-row text-center min-h-[40px] underline m-[1%]":"w-[48%] mt-[1%] ml-[1%] text-center min-h-[40px] underline"}
                                    >
                                        <img src="/image/11327060.png" alt="UKOapp" className="w-[50%]"/>
                                        <h2>recommended tv</h2>
                                    </button>                                    
                                </div>
                                {/* <div className="w-[100%] h-[100px] movie-scene overflow-x-auto flex flex-col flex-wrap">
                                    {
                                        serie?.episodes.map(({vote_average,name,episode_number},node) => 
                                            <NavLink
                                                to={`/series/season/${id}`}
                                                key={node}
                                                className={windowWidth > 800 ? "text-[#ffd800] w-[23%] text-center min-h-[40px] m-[1%] bg-[#000] border-[2px]" : "text-[#ffd800] w-[98%] text-center min-h-[40px] m-[1%] bg-[#000] border-[2px]"}
                                            >
                                                <p>{name}</p>
                                                <p>episode {episode_number}</p>
                                                <p style={{color:"#ffd800"}}><FontAwesomeIcon icon={faStar} /> {vote_average}</p>
                                            </NavLink>
                                        )
                                    }
                                </div> */}
                                <div className="w-[100%]">
                                    <button
                                        type="button"
                                        className="w-[100%] h-[50px] bg-[#ffd800] text-black font-bold hover:bg-[#ffd800]/80 duration-200"
                                        onClick={() => addToPlayList()}
                                    >
                                        {
                                            playlist ? 
                                                <>
                                                    <FontAwesomeIcon icon={faBasketShopping} /> <span>Added to Playlist</span>
                                                </>
                                            :
                                                <>
                                                    <FontAwesomeIcon icon={faCirclePlus} /> Add to Playlist
                                                </>
                                                
                                        }
                                        
                                    </button>
                                </div>
                            </div>
                        </div>
                        {
                            credits.cast && credits.cast.length > 0 &&
                            <div className={windowWidth > 800 ? "w-[90%] h-[420px] mx-[5%] my-[2%]":"w-[100%] h-[420px] my-[2%]"}>

                                <h1 style={{textAlign:"left",textDecoration:"underline"}}>CASTS</h1>
                                <div className={`w-[100%] movie-scene ${windowWidth > 800 ? "h-[400px]" : "h-[300px]"} flex flex-col flex-wrap overflow-x-auto overflow-y-hidden my-[1%]`}>
                                    
                                    {
                                        credits.cast.map(({roles,profile_path,popularity,original_name,name,media_type,known_for_department,id,gender,adult},serie_key) => 
                                            <div 
                                                key={serie_key} 
                                                onClick={() => navRoute({
                                                    url:`/series/person`,
                                                    state:{
                                                        id
                                                    }})} 
                                                className={windowWidth > 800 ? "cursor-pointer w-[25%] h-[100%] hover:contrast-150":"cursor-pointer w-[48%] h-[100%] mx-[0.5%] hover:contrast-150"}>
                                                <div className="w-[100%] h-[100%]">
                                                    <PICTURE key={id} classes={"object-cover h-[100%]"} picture={profile_path} />
                                                    <div className="w-[100%] relative min-h-[60px] top-[-50%] bg-[#000000] bg-opacity-60 text-white flex flex-col items-center justify-center">
                                                        <h2 className="text-[15px] font-bold">{original_name || name}</h2>
                                                        <p style={{color:"#ffd800"}}><FontAwesomeIcon icon={faStar} /> {parseFloat(popularity).toFixed(1)}</p>
                                                        <h3 style={{fontStyle:"italic"}}>{roles && roles.length > 0 && roles[0].character}</h3>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    }
                                </div>
                            </div>
                        }
                        {
                            credits.crew && credits.crew.length > 0 &&
                            <div className={windowWidth > 800 ? "w-[90%] h-[420px] mx-[5%] my-[2%]":"cursor-pointerw-[100%] h-[420px] my-[2%]"}>

                                <h1 style={{textAlign:"left",textDecoration:"underline"}}>CREW</h1>
                                <div className={`w-[100%] movie-scene ${windowWidth > 800 ? "h-[400px]" : "h-[300px]"} flex flex-col flex-wrap overflow-x-auto overflow-y-hidden my-[1%]`}>
                                    
                                    {
                                        credits.crew.map(({profile_path,popularity,jobs,original_name,name,media_type,known_for_department,id,gender,adult},serie_key) => 
                                            <div 
                                                key={serie_key} 
                                                onClick={() => navRoute({
                                                    url:`/series/person`,
                                                    state:{
                                                        id
                                                    }})} 
                                                className={windowWidth > 800 ? "w-[25%] h-[100%] hover:contrast-150 cursor-pointer":"cursor-pointer w-[48%] h-[100%] mx-[0.5%] hover:contrast-150"}>
                                                <div className="w-[100%] h-[100%]">
                                                    <PICTURE key={id} classes={"object-cover h-[100%]"} picture={profile_path} />
                                                    <div className="w-[100%] relative min-h-[60px] top-[-50%] bg-[#000000] bg-opacity-60 text-white flex flex-col items-center justify-center">
                                                        <h2 className="text-[15px] font-bold">{original_name || name}</h2>
                                                        <p style={{color:"#ffd800"}}><FontAwesomeIcon icon={faStar} /> {parseFloat(popularity).toFixed(1)}</p>
                                                        <h3>{jobs && jobs.length > 0 && jobs[0].job}</h3>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    }
                                </div>
                            </div>
                        }
                        {
                            credits.guest_stars && credits.guest_stars.length > 0 &&
                            <div className={windowWidth > 800 ? "w-[90%] h-[420px] mx-[5%] my-[2%]":"w-[100%] h-[420px] my-[2%]"}>

                                <h1 style={{textAlign:"left",textDecoration:"underline"}}>GUEST STARS</h1>
                                <div className={`w-[100%] movie-scene ${windowWidth > 800 ? "h-[400px]" : "h-[300px]"} flex flex-col flex-wrap overflow-x-auto overflow-y-hidden my-[1%]`}>
                                    
                                    {
                                        credits.guest_stars.map(({profile_path,popularity,character,original_name,name,media_type,known_for_department,id,gender,adult},serie_key) => 
                                            <div 
                                                key={serie_key} 
                                                onClick={() => navRoute({
                                                    url:`/series/person`,
                                                    state:{
                                                        id
                                                    }})}  
                                                className={windowWidth > 800 ? "w-[25%] h-[100%] cursor-pointer hover:contrast-150":"cursor-pointer w-[48%] h-[100%] mx-[0.5%] hover:contrast-150"}>
                                                <div className="w-[100%] h-[100%]">
                                                    <PICTURE key={id} classes={"object-cover h-[100%]"} picture={profile_path} />
                                                    <div className="w-[100%] relative min-h-[60px] top-[-50%] bg-[#000000] bg-opacity-60 text-white flex flex-col items-center justify-center">
                                                        <h2 className="text-[15px] font-bold">{original_name || name}</h2>
                                                        <p style={{color:"#ffd800"}}><FontAwesomeIcon icon={faStar} /> {parseFloat(popularity).toFixed(1)}</p>
                                                        <h3>{character}</h3>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    }
                                </div>
                            </div>
                        }
                        {/* <div className="w-[90%] duration-50 mx-[5%] mt-[1%] movie-scene flex flex-row min-h-[100%] flex-wrap">
                            {
                                Object.entries(images).map(([key,value],node) => 
                                    value && typeof(value) === "object" && value.map(({file_path},index) => 
                                        <div className="m-[0.5%] w-[48%] h-[50%]" key={node + index}>
                                            <PICTURE picture={file_path} classes={"object-contain h-[100%]"} />
                                        </div>
                                    )
                                )
                            }

                        </div> */}
                        </>

                </div>
            </div>
                    :
                        <LOAD/>
                    
    )
}

export default EPISODE
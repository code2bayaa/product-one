import NAVBAR from "./nav"
import { useLocation, useNavigate  } from "react-router-dom";
import { useState, useEffect, useCallback, useRef } from "react";
import PICTURE from "../midlleware/picture";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlayCircle, faStar, faBasketShopping, faCirclePlus, } from "@fortawesome/free-solid-svg-icons";
import { gql, useMutation, useLazyQuery } from '@apollo/client';
import LOAD from "../midlleware/load";
import MOBILE from "./mobileBar";
// import { Rating } from 'react-simple-star-rating'
import Swal from "sweetalert2";

const MOVIE = () => {
    // const { id } = useParams();
    const hasFetched = useRef({credits:false,images:false,feedback:false,movie:false})
    const [movie, setMovie] = useState(null);
    const [images,setImages] = useState(null)
    const [credits,setCredit] = useState(null)
    const [windowWidth, setWindowWidth] = useState(0);
    const [playlist,setPlaylist] = useState(null)
    const [generateGenre, setGenerateGenre] = useState([])
    const [layouts, setLayouts] = useState(false)
    const { state } = useLocation();
    const navigate = useNavigate();
    const id = state.id
    // const [fetchedImage, setFetchedImage] = useState(null)
    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };
        window.addEventListener("resize", handleResize);
        handleResize(); // Call it once to set the initial value
    },[])

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
                    "https://api.ipgeolocation.io/ipgeo?apiKey=02be68312fd5432fa07048f4b27b6542"
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

    const FETCH_GENRE_QUERY = gql`
        query Genre {
            genre {
                success
                date
                data {
                    id
                    name
                    mode
                }
            }
        }
    `
    const [fetchGenre] = useLazyQuery(FETCH_GENRE_QUERY,{
        // pollInterval: 500, // fetches new data at that interval
        notifyOnNetworkStatusChange: true,
        // variables,
        // skip: !variables.page, // Skip query execution if variables are not set
    });

    // const [fetchedImageBackgrounds,setFetchedImageBackgrounds] = useState(null)

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
        // ,{
        //     // pollInterval: 500, // fetches new data at that interval
        //     notifyOnNetworkStatusChange: true,
        //     variables : {
        //         type:"movie",
        //         episode:-1,
        //         season:-1,
        //         id:id?parseInt(id):-1
        //     }
        // });
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
                // console.log(data)
                if (data && data.addImage.success) {
                    // Refetch the query to get updated data
                    // console.log(fetchImage)
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
                    error
                    message
                }
            }
        `
        const [fetchSingleMovie] = useLazyQuery(FETCH_MOVIE_QUERY,{
            // pollInterval: 500, // fetches new data at that interval
            notifyOnNetworkStatusChange: true,
            // variables,
            // skip: !variables.page, // Skip query execution if variables are not set
        });

        const INSERT_MOVIE_MUTATION = gql`
            mutation AddMovie(
                $adult:Boolean!
                $backdrop_path:String
                $id:ID!
                $original_language:String!
                $original_title:String!
                $overview:String!
                $popularity:Float!
                $poster_path:String
                $release_date:String!
                $title:String!
                $video :Boolean!
                $vote_average:Float!
                $vote_count:Float!
                $belongs_to_collection:COLLECTION_INPUT
                $production_companies:[PRODUCTION_COMPANIES_INPUT]
                $production_countries:[PRODUCTION_COUNTRIES_INPUT]
                $spoken_languages:[SPOKEN_LANGUAGES_INPUT]
                $runtime:Int!
                $genres:[GENRES_IDS_INPUT]
            ) {
                addMovie(
                    adult:$adult
                    backdrop_path:$backdrop_path
                    genres:$genres
                    id:$id
                    original_language:$original_language
                    original_title:$original_title
                    overview:$overview
                    popularity:$popularity
                    poster_path:$poster_path
                    release_date:$release_date
                    title:$title
                    video:$video 
                    vote_average:$vote_average
                    vote_count:$vote_count
                    belongs_to_collection:$belongs_to_collection
                    production_companies:$production_companies
                    production_countries:$production_countries
                    runtime:$runtime
                    spoken_languages:$spoken_languages
                ) {
                    success
                    message
                }
            }
        `;

        const [mutateInsertMovie] = useMutation(INSERT_MOVIE_MUTATION, {
            onCompleted: (data) => {
                console.log(data)
                if (data.addMovie.success) {
                    if(data.addMovie.message === "already inserted")
                        console.log("movie inserting already started...")
                    console.log("Movie successfully inserted into MySQL:", data.addMovie.message);
                    // fetchedMovieData.refetch()
                    // .then(status => console.log(status,"status"))
                } else {
                    console.error("Failed to insert movies into MySQL:", data.addMovie.message, data.addMovie.error);
                }
            },
            onError: (error) => {
                console.error("Error inserting movies into MySQL:", error.message);
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
                        order
                    }
                    crew {
                        adult
                        gender
                        id
                        known_for_department
                        name
                        original_name
                        popularity
                        profile_path
                        credit_id
                        department
                        job
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
        // variables,
        // skip: !variables.page, // Skip query execution if variables are not set
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
            console.log(data)
            if (data && data.addCredits.success) {
                // Refetch the query to get updated data
                // console.log(fetchImage)
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
            console.error("Error inserting credits into MySQL:", error.message);
        },
    });

    const graphImages = useCallback(async() => {

        async function freshFetch(){
            const response = await fetch(`${process.env.REACT_APP_movie_db}movie/${id}/images?api_key=${process.env.REACT_APP_api_key}`);
            const getImageData = await response.json();
            console.log(getImageData,"images")
            let value = 0
            const {backdrops, posters, logos} = getImageData
            let path = ''
            if(backdrops && backdrops.length > 0){
                value = Math.max(...backdrops.map(({height}) => height))
                let key = backdrops.findIndex(({height}) => height === value)
                if(key > -1){
                    path = backdrops[key].file_path
                }
            } 
            if(posters && posters.length > 0){
                let posters_value = Math.max(...posters.map(({height}) => height))
                if(posters_value > value){
                    let key = posters.findIndex(({height}) => height === posters_value)
                    if(key > -1){
                        path = posters[key].file_path
                    }
                    value = posters_value
                }
            }
            if(logos && logos.length > 0){
                let logos_value = Math.max(...logos.map(({height}) => height))
                if(logos_value > value){
                    let key = logos.findIndex(({height}) => height === logos_value)
                    if(key > -1){
                        path = logos[key].file_path
                    }
                }
            }

            mutateInsertImage({ variables: { meta_data : {
                    type:"movie",
                    season:-1,
                    episode:-1,
                    id:id?parseInt(id):-1
                }, data:{id:getImageData.id,path}                  
            } });
            return path
        }         
        try{
            const fetched = await fetchImage({
                variables : {
                type:"movie",
                episode:-1,
                season:-1,
                id:id?parseInt(id):-1
            }})
            console.log(fetched)
            if (fetched.data && fetched.data.image.success) {
                console.log("image cached data:", fetched.data);
                setImages(() => (fetched.data.image.data.path))

            }else {
                const path = await freshFetch()
                console.log(path,"path")
                setImages(path)
            }
        
            
        }catch(error){
            console.log(error)
            const path = await freshFetch()
            setImages(path)            
        

        }
    },[fetchImage,id,mutateInsertImage])

    const fetchMovie = useCallback(async() => {    
        
        async function freshFetch(){
            const response = await fetch(`${process.env.REACT_APP_movie_db}movie/${id}?api_key=${process.env.REACT_APP_api_key}`);
            const data = await response.json();
            console.log(data)
            mutateInsertMovie({
                variables: {...data},
            });
            return {...data}
        }            

        const fetched = await fetchSingleMovie({
        variables : { id }})
        console.log(fetched)
        if(fetched.data && fetched.data.single && !fetched.data.single.runtime){
            //first time
            console.log("first time...")
            const movie = await freshFetch()
            setMovie(() => ({...fetched.data.single,...movie}));
        }else if(fetched.data && fetched.data.single.success){
            console.log("Using cached data:", fetched.data);
            setMovie(() => ({...fetched.data.single}));
            // checkFeedback(fetched.data.single.id)
            // setGenreIDS(fetched.data.single.genre_ids)
        }else {
            const movie = await freshFetch()
            setMovie(() => ({...movie}));
            // checkFeedback(movie.id)
            // setGenreIDS(movie.genre_ids)
        }

        return true
        
    },[fetchSingleMovie,id, mutateInsertMovie])

    const checkFeedback = (id) => {
        // console.log(id,"id")
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
                    body:JSON.stringify({id, user, type:"movie"})
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
    const setGenreIDS = useCallback(async(genre = []) => {
        const {data} = await fetchGenre()
        if(data && data.genre && data.genre.success){
            // console.log(genre)
            // console.log(data.genre?.data)
            const genreData = data.genre?.data.filter(({id,mode}) => genre && genre.includes(Number(id)) && mode === "movie")
            // console.log(genreData)
            setGenerateGenre(() => [...genreData])
        }else{
            setGenerateGenre(() => [])
        }
        
    },[fetchGenre]
)
    useEffect(() => {
        if(hasFetched.current.feedback){
            return
        }
        hasFetched.current.feedback = true        
        if (movie && movie.id) {
            checkFeedback(movie.id);
        }
        if(movie && movie.genre_ids){
            setGenreIDS(movie.genre_ids)
        }
    }, [movie,setGenreIDS]);

    const fetchCredits = useCallback(async() => {
        // const credits_response = await fetch(`${process.env.REACT_APP_movie_db}movie/${id}/credits?api_key=${process.env.REACT_APP_api_key}`);
        // const credits_data = await credits_response.json();
        // setCredit(() => ({...credits_data})); 
        // console.log(credits_data)
        async function freshFetch(){
            const response = await fetch(`${process.env.REACT_APP_movie_db}movie/${id}/credits?api_key=${process.env.REACT_APP_api_key}`);
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
        console.log(fetched)
        if(fetched.data && fetched.data.credits.success){
            console.log("Using cached data:", fetched.data);
            return setCredit(() => ({...fetched.data.credits}));
        }else {
            const credits = await freshFetch()
            return setCredit(() => ({...credits}));
        }
    
    },[fetchCreditsData,id,mutateInsertCredits])

    useEffect(() => {
        // if(hasFetched.current.images){
        //     return
        // }
        // hasFetched.current.images = true        
        graphImages()
    },[graphImages])

    useEffect(() => {
        if(hasFetched.current.movie){
            return
        }
        hasFetched.current.movie = true        
      fetchMovie();
    }, [fetchMovie]);

    useEffect(() => {
        if(hasFetched.current.credits){
            return
        }
        hasFetched.current.credits = true        
        fetchCredits();
    }, [fetchCredits]);

    useEffect(() => {
        async function addRecommendations(){
            const user = localStorage.getItem("session")
            const response = await fetch(`${process.env.REACT_APP_environment === "development" ? process.env.REACT_APP_add_recommendations : process.env.REACT_APP_add_recommendations_live}`, {
                method: "POST",
                credentials: "include",
                body:JSON.stringify({
                    title:movie.original_title || movie.title,
                    overview:movie.overview,
                    type:"movie",
                    user
                }),
                headers: {
                    'Content-Type': 'application/json', // Indicates the body is JSON
                },
            });

            const {status,message} = await response.json()

            console.log(status,message)
        }
        if(movie)
            addRecommendations()
    },[movie])

    // const getBackground = () => {
    //     if(fetchedImageBackgrounds)
    //         return process.env.REACT_APP_img_poster + "/" + fetchedImageBackgrounds + ".jpg"
    //     if(!images)
    //         return null
    //     let value = 0
    //     const {backdrops, posters, logos} = images
    //     let path = ''
    //     if(backdrops && backdrops.length > 0){
    //         value = Math.max(...backdrops.map(({height}) => height))
    //         let key = backdrops.findIndex(({height}) => height === value)
    //         if(key > -1){
    //             path = backdrops[key].file_path
    //         }
    //     } 
    //     if(posters && posters.length > 0){
    //         let posters_value = Math.max(...posters.map(({height}) => height))
    //         if(posters_value > value){
    //             let key = posters.findIndex(({height}) => height === posters_value)
    //             if(key > -1){
    //                 path = posters[key].file_path
    //             }
    //             value = posters_value
    //         }
    //     }
    //     if(logos && logos.length > 0){
    //         let logos_value = Math.max(...logos.map(({height}) => height))
    //         if(logos_value > value){
    //             let key = logos.findIndex(({height}) => height === logos_value)
    //             if(key > -1){
    //                 path = logos[key].file_path
    //             }
    //         }
    //     }
    //     setFetchedImageBackgrounds(path.substring(1).substring(0,path.substring(1).length - 4))
    //     return process.env.REACT_APP_img_poster + path
    // }

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
                body:JSON.stringify({id:movie.id, user, type:"movie"})
            })
            .then(res => res.json())
            .then(({status}) => {
                if(status){
                    Swal.fire({
                        icon: 'success',
                        title: 'Added to playlist',
                        showConfirmButton: false,
                        timer: 1500
                    })

                    
                }else{
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: "Already in playlist",
                        showConfirmButton: false,
                        timer: 1500
                    })
                }
                setPlaylist(() => true)
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

    const openPlay = async() => {
            // navRoute({
            //     url:`/speed`,
            //     state:{
            //         stream:"movie",
            //         id:"389",
            //         name:"",
            //         background:images,
            //         // dash:true
            //     }})  
            //     return
            // console.log(movie)
        if(movie && movie.hasOwnProperty("url") && movie.url){
            function getCurrentWeek() {
                const now = new Date();
                const startOfYear = new Date(now.getFullYear(), 0, 1);
                const pastDaysOfYear = (now - startOfYear) / 86400000;
                return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
            }

            // Usage:
            const currentWeek = getCurrentWeek();            
            if(movie && movie.url && movie.url.quality === "CAM" && currentWeek > movie.url.week){
                // document.location.href = `/video/movie/${movie.id}/${movie.title || movie.original_title}/${movie.release_date.substring(0,4)}/${movie.release_date}/${movie.imdb_id}${images}`;
                navRoute({
                url:`/video/movie`,
                state:{
                    stream:"movie",
                    id:movie.id,
                    name:movie.title || movie.original_title,
                    background:images,
                    date:movie.release_date,
                    year:movie.release_date.substring(0,4),
                    imdbId:movie.imdb_id,
                    anime:movie.genres ? movie.genres.find(({id}) => id === 16):movie.genre_ids?movie.genre_ids.includes(16):false,
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

                    const res = await fetch(process.env.REACT_APP_environment === "development" ? process.env.REACT_APP_check_user_credits : process.env.REACT_APP_check_user_credits_live,{credentials: "include"})
                    const {sum,message} = await res.json()
                    console.log(message)
                    //affordable for one movie | episode
                    if(sum && sum > 49){
                        hasCredits = true
                    }
                }else{
                    user = localStorage.getItem("session")
                    const res = await fetch(`${process.env.REACT_APP_environment === "development" ? process.env.REACT_APP_paid : process.env.REACT_APP_paid_live}`,{
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
                // document.location.href = `/speed/${movie.url.fileName}${images}/${movie.id}/movie`
                navRoute({
                url:`/speed`,
                state:{
                    stream:"movie",
                    id:movie.id,
                    name:movie.url.fileName,
                    background:images,
                    dash:movie.url.hasOwnProperty("dash")?true:false
                }})                
            }
            
        }else{
            // document.location.href = `/video/movie/${movie.id}/${movie.title || movie.original_title}/${movie.release_date.substring(0,4)}/${movie.release_date}/${movie.imdb_id}${images}`
            // console.log("year",)
            // console.log(movie)
            navRoute({
                url:`/video/movie`,
                state:{
                    stream:"movie",
                    id:movie.id,
                    name:movie.title || movie.original_title,
                    background:images,
                    year:movie.release_date.substring(0,4),
                    date:movie.release_date,
                    anime:movie.genres ? movie.genres.find(({id}) => id === 16):movie.genre_ids?movie.genre_ids.includes(16):false,
                    imdbId:movie.imdb_id
                }})        
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
        <>
        {
            credits && movie  ?
        
            <div className="w-[100%] duration-150 h-[100%] text-white  bg-cover bg-no-repeat bg-center" style={{backgroundImage:`linear-gradient(105deg, #0d0d0d, rgba(0,0,0,0.75), #000, rgba(0,0,0,0.56)),url(${images ? process.env.REACT_APP_img_poster + images : "/image/logo.png"})`,backgroundPosition:"0% 40%"}}>
                {
                    windowWidth > 800 ? 
                    <div className="w-[20%] absolute h-[100%] border-r-[3px] border-[#2E2E3A]" style={{background:"linear-gradient(85deg, rgba(13, 13, 13, 0.75), rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.56), rgba(0, 0, 0, 0.45))"}}>
                        <NAVBAR/>
                    </div>
                    :
                    <MOBILE/>
                }
        
                    <div className={windowWidth > 800 ? "w-[80%] h-[100%] ml-[20%] flex flex-col overflow-y-auto movie-scene":"w-[98%] mx-[1%] h-[100%] flex flex-col overflow-y-auto movie-scene"}>
                        <div className={windowWidth > 800 ? "w-[100%] min-h-[90%] flex flex-row flex-wrap":"w-[100%] h-[auto]"}>
                            <div 
                                className={windowWidth > 800 ? "w-[37%] min-h-[100%] shadow background":"w-[40%] h-[auto] float-left m-[0.5%] shadow-lg"} 
                                style={{
                                    backgroundImage:"url(" + process.env.REACT_APP_img_poster + movie.poster_path + ")",
                                    boxShadow:"rgba(0, 0, 0, 0.97) -180px -200px 130px inset, rgba(0, 0, 0, 0.9) 0px 100px 10px, rgba(0, 0, 0, 0.9) 100px 50px 10px"
                                }}
                            >
                                {
                                    windowWidth < 800 && <PICTURE picture={movie.poster_path} classes={windowWidth > 800 ? "shadow-lg h-[70%] shadow-[#ffd800]" : "shadow-lg h-[200px] shadow-[#ffd800] object-contain"} />

                                }
                            </div>
                            <div 
                                style={{
                                    boxShadow:"inset 0 0 30px rgba(0,0,0,0.6),0 10px 30px rgba(0,0,0,0.7),0 0 60px rgba(0,0,0,0.5)",
                                    //   overflow: "hidden",
                                }}
                                className={windowWidth > 800 ? "w-[61%] m-[1%] h-[60%] justify-center items-center shadow":"w-[100%] h-[auto]"}>
                                <h1 className="text-[30px] text-[#ffd800]">{movie.original_title || movie.title}</h1>
                                <p style={{fontStyle:"italic",color:"#ffd800"}}>"{movie.tagline}"</p>
                                <div className={windowWidth > 800 ? "" : "w-[50%] gap-2 flex flex-row flex-wrap"}>
                                    <h3>{movie.release_date}</h3>
                                    <h3>{movie.revenue}</h3>
                                    <p style={{fontStyle:"italic"}}>{movie.status}</p>
                                    {/* <h3>{movie.video ? "available":"CAM"}</h3> */}
                                    <p className="text-[#ffd800]"><FontAwesomeIcon icon={faStar} /> {movie.vote_average.toFixed(1)}</p>
                                    <h4>{ (movie.runtime > 60) ? (Math.floor(movie.runtime / 60)) + " h " + (movie.runtime % 60) + " min" : movie.runtime + " min" }</h4>
                                    {
                                        generateGenre.map(({name}) => name).join(" || ")
                                    }
                                    {
                                        movie.hasOwnProperty("url") && movie.url && movie.url.hasOwnProperty("quality") && movie.url.quality && <h3 className="text-[#ffd800]">{movie.url.quality}</h3>
                                    }
                                </div>
                                <article>
                                    {movie.overview || "waiting for more content"}
                                </article>
                                <div className="w-[100%] flex flex-row flex-wrap border-b-[#fff] border-b-[2px]">
                                    
                                    <button
                                        onClick={() => navRoute({
                                            url:`/movies/trailer/`,
                                            state:{
                                                stream:"movie",
                                                id:movie.id,
                                                background:images
                                            }})}
                                        className={windowWidth > 800 ? "w-[23%] flex flex-row flex-nowrap text-center underline h-[80px] ":"w-[48%] mt-[1%] ml-[1%] text-center min-h-[40px] underline"}
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
                                                    className={windowWidth > 800 ? "text-[#ffd800] text-[30px] w-[15%] underline text-center min-h-[40px] m-[1%]":"text-[#ffd800] text-[30px] w-[48%] mt-[1%] ml-[1%] text-center justify-center h-[40px] rounded-full"}
                                                >
                                                    <h3>play</h3> <FontAwesomeIcon icon={faPlayCircle} />
                                                </button>
                                            </>                                            
                                        )
                                    }
                                    
                                    <button
                                        onClick={() => navRoute({
                                            url:`/movies/similar`,
                                            state:{
                                                stream:"movies",
                                                id:movie.id,
                                                background:images
                                            }})}
                                        className={windowWidth > 800 ? "w-[23%] flex flex-row text-center underline  min-h-[40px] m-[1%]":"w-[48%] mt-[1%] ml-[1%] text-center min-h-[40px] underline"}
                                    >
                                        <img src="/image/2798007.png" alt="UKOapp" className="w-[50%]"/>
                                        <h2>similar movies</h2>
                                    </button>
                                    
                                    <button
                                        onClick={() => navRoute({
                                            url:`/movies/recommendations`,
                                            state:{
                                                stream:"movies",
                                                id:movie.id,
                                                background:images
                                            }})}
                                        className={windowWidth > 800 ? "w-[23%] flex flex-row text-center min-h-[40px] underline m-[1%]":"w-[48%] mt-[1%] ml-[1%] text-center min-h-[40px] underline"}
                                    >
                                        <img src="/image/11327060.png" alt="UKOapp" className="w-[50%]"/>
                                        <h2>recommended movies</h2>
                                    </button>
                                    <div className="w-[100%]">
                                        <button
                                            type="button"
                                            className="w-[98%] rounded-md mt-[1%] ml-[1%] h-[50px] bg-[#ffd800] text-black font-bold hover:bg-[#ffd800]/80 duration-200"
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
                        </div>
                        {
                            credits.cast && credits.cast.length > 0 &&
                            <div className={windowWidth > 800 ? "w-[90%] h-[420px] mx-[5%] my-[2%]":"w-[100%] h-[auto] my-[2%]"}>

                                <h1 style={{textAlign:"left",textDecoration:"underline"}}>CASTS</h1>
                                {/* <SWEETPAGE intitializeMovies={intitializeMovies} page={page} index={{index,api,page}} total_pages={total_pages}/> */}

                                <div className={`w-[100%] duration-50 movie-scene ${windowWidth > 800 ? "h-[400px]" : "h-[200px]"} flex flex-col flex-wrap overflow-x-auto overflow-y-hidden my-[1%]`}>
                                    
                                    {
                                        credits.cast.map(({character,profile_path,popularity,original_name,name,media_type,known_for_department,id,gender,adult},people_key) => 
                                            <div 
                                                key={people_key} 
                                                onClick={() => navRoute({
                                                    url:`/movies/person`,
                                                    state:{
                                                        id
                                                    }})}  
                                                className={windowWidth > 800 ? "cursor-pointer w-[25%] h-[100%] hover:skew-4 hover:contrast-150":"cursor-pointer w-[40%] hover:skew-4 h-[100%] m-[0.5%] hover:contrast-150"}>
                                                <div className="w-[100%] h-[100%]">
                                                    <PICTURE picture={profile_path} classes={windowWidth > 800 ? "object-cover h-[100%]":"object-cover h-[100%] rounded-xl"} />
                                                    <div className="w-[100%] relative min-h-[60px] top-[-50%] bg-[#000000] bg-opacity-60 text-white flex flex-col items-center justify-center">
                                                        <h2 className={windowWidth > 800 ? "text-[15px] font-bold":"text-[12px] font-bold"}>{name ? name : original_name ? original_name : name}</h2>
                                                        <p style={{color:"#ffd800"}}><FontAwesomeIcon icon={faStar} /> {popularity && parseFloat(popularity).toFixed(2)}</p>
                                                        <h3 style={{fontStyle:"italic"}}>{character}</h3>
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
                            <div className={windowWidth > 800 ? "w-[90%] h-[420px] mx-[5%] my-[2%]":"w-[100%] h-[220px] my-[2%]"}>

                                <h1 style={{textAlign:"left",textDecoration:"underline"}}>CREW</h1>

                                <div className={`w-[100%] duration-50 movie-scene ${windowWidth > 800 ? "h-[400px]" : "h-[200px]"} flex flex-col flex-wrap overflow-x-auto overflow-y-hidden my-[1%]`}>
                                    
                                    {
                                        credits.crew.map(({job,profile_path,popularity,original_name,name,media_type,known_for_department,id,gender,adult},people_key) => 
                                            <div 
                                                key={people_key} 
                                                onClick={() => navRoute({
                                                    url:`/movies/person`,
                                                    state:{
                                                        id
                                                    }})} 
                                                className={windowWidth > 800 ? "cursor-pointer w-[25%] h-[100%] hover:skew-4 hover:contrast-150":"cursor-pointer w-[40%] hover:skew-4 h-[100%] m-[0.5%] hover:contrast-150"}>
                                                <div className="w-[100%] h-[100%]">
                                                    <PICTURE picture={profile_path} classes={windowWidth > 800 ? "object-cover h-[100%]":"object-cover h-[100%] rounded-xl"} />
                                                    <div className="w-[100%] relative min-h-[60px] top-[-50%] bg-[#000000] bg-opacity-60 text-white flex flex-col items-center justify-center">
                                                        <h2 className="text-[15px] font-bold">{name ? name : original_name ? original_name : name}</h2>
                                                        <p style={{color:"#ffd800"}}><FontAwesomeIcon icon={faStar} /> {popularity && parseFloat(popularity).toFixed(2)}</p>
                                                        <h3>{job}</h3>
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
                    </div>

        </div>
            :
        <LOAD/>
        }       
        </>

    )
}

export default MOVIE
import NAVBAR from "./nav"
import { NavLink, useParams } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import PICTURE from "../midlleware/picture";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlayCircle, faStar, faBasketShopping, faCirclePlus, } from "@fortawesome/free-solid-svg-icons";
import { gql, useMutation, useLazyQuery } from '@apollo/client';
import LOAD from "../midlleware/load";
import MOBILE from "./mobileBar";
import Swal from "sweetalert2";

const MOVIE = () => {
    const { id } = useParams();
    const [movie, setMovie] = useState(null);
    const [images,setImages] = useState(null)
    const [credits,setCredit] = useState(null)
    const [windowWidth, setWindowWidth] = useState(0);
    const [playlist,setPlaylist] = useState(null)
    const [generateGenre, setGenerateGenre] = useState([])
    const [layouts, setLayouts] = useState(false)
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
            console.log(continent,"continent")
            const continents = ["Africa","Australia"]
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

    const [fetchedImageBackgrounds,setFetchedImageBackgrounds] = useState(null)

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
                        posters {
                            aspect_ratio
                            height
                            iso_639_1
                            file_path
                            vote_average
                            vote_count
                            width 
                        }
                        backdrops {
                            aspect_ratio
                            height
                            iso_639_1
                            file_path
                            vote_average
                            vote_count
                            width 
                        }
                        profiles {
                            aspect_ratio
                            height
                            iso_639_1
                            file_path
                            vote_average
                            vote_count
                            width 
                        }
                        logos {
                            aspect_ratio
                            height
                            iso_639_1
                            file_path
                            vote_average
                            vote_count
                            width 
                        }
                        stills {
                            aspect_ratio
                            height
                            iso_639_1
                            file_path
                            vote_average
                            vote_count
                            width 
                        }
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
        const [fetchImage,fetchImageData] = useLazyQuery(FETCH_IMAGE_QUERY,{
            notifyOnNetworkStatusChange: true,
        })
    
        const [mutateInsertImage] = useMutation(gql`
            mutation AddImage(
                $meta_data: META_DATA_INPUT!
                $data: DATA_INPUT!
                $chunking:Boolean!
                $chunking_index:Int!
            ) {
                addImage(
                 meta_data: $meta_data
                 data: $data
                 chunking:$chunking
                 chunking_index:$chunking_index
                ){
                    data {
                        id
                        posters {
                            aspect_ratio
                            height
                            iso_639_1
                            file_path
                            vote_average
                            vote_count
                            width 
                        }
                        backdrops {
                            aspect_ratio
                            height
                            iso_639_1
                            file_path
                            vote_average
                            vote_count
                            width 
                        }
                        profiles {
                            aspect_ratio
                            height
                            iso_639_1
                            file_path
                            vote_average
                            vote_count
                            width 
                        }
                        logos {
                            aspect_ratio
                            height
                            iso_639_1
                            file_path
                            vote_average
                            vote_count
                            width 
                        }
                        stills {
                            aspect_ratio
                            height
                            iso_639_1
                            file_path
                            vote_average
                            vote_count
                            width 
                        }
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
                    fetchImageData.refetch().then((refetched) => {
                        console.log(refetched)
                        if(refetched.data.image.success){
                            const ref = refetched?.data?.image?.data
                            const typeGetImageData = {...ref}
                            setImages(() => typeGetImageData)
                        }

                    })
    
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
                    success
                    error
                    message
                }
            }
        `
        const [fetchSingleMovie,fetchedMovieData] = useLazyQuery(FETCH_MOVIE_QUERY,{
            // pollInterval: 500, // fetches new data at that interval
            notifyOnNetworkStatusChange: true,
            // variables,
            // skip: !variables.page, // Skip query execution if variables are not set
        });

        const INSERT_MOVIE_MUTATION = gql`
            mutation AddMovie(
                $adult:Boolean!
                $backdrop_path:String!
                $id:ID!
                $original_language:String!
                $original_title:String!
                $overview:String!
                $popularity:Float!
                $poster_path:String!
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
            ) {
                addMovie(
                    adult:$adult
                    backdrop_path:$backdrop_path
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
                    fetchedMovieData.refetch()
                    .then(status => console.log(status,"status"))
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
    const [fetchCreditsData,fetchedCredits] = useLazyQuery(FETCH_CREDITS_QUERY,{
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
                fetchedCredits.refetch().then((refetched) => {
                    console.log(refetched)
                    if(refetched.data.credits.success){
                        const ref = refetched?.data?.credits
                        const typeGetImageData = {...ref}
                        setCredit(() => ({...typeGetImageData}))
                    }

                })

            } else {
                console.error("Failed to insert credits into MySQL:", data.addCredits.message, data.addCredits.error);
            }
        },
        onError: (error) => {
            console.error("Error inserting credits into MySQL:", error.message);
        },
    });

        const graphImages = useCallback(async() => {
            try{

            async function freshFetch(){
                const response = await fetch(`${process.env.REACT_APP_movie_db}movie/${id}/images?api_key=${process.env.REACT_APP_api_key}`);
                const getImageData = await response.json();
                console.log(getImageData)
                function chunkArray(array, size) {
                    const result = [];
                    for (let i = 0; i < array.length; i += size) {
                        result.push(array.slice(i, i + size));
                    }
                    return result;
                }
                let backdrops_all_results = [...getImageData.backdrops]
                if(backdrops_all_results.length > 100){
                    const chunks = chunkArray(backdrops_all_results, 100);
                    for (let i = 0; i < chunks.length; i++) {
                        mutateInsertImage({
                            variables: {
                                meta_data : {
                                    type:"movie",
                                    season:-1,
                                    episode:-1,
                                    id:id?parseInt(id):-1
                                },
                                data:{id:getImageData.id,backdrops:chunks[i]},
                                chunking:true,
                                chunking_index:i
                            } 
                        });
                    }
                }else{
                    mutateInsertImage({ 
                        variables: { 
                            meta_data : {
                                type:"movie",
                                season:-1,
                                episode:-1,
                                id:id?parseInt(id):-1
                            },
                            data:{id:getImageData.id,backdrops:getImageData.backdrops},
                            chunking:false,
                            chunking_index:0
                        } });
                }
                let logos_all_results = [...getImageData.logos]
                if(logos_all_results.length > 100){
                    const chunks = chunkArray(logos_all_results, 100);
                    for (let i = 0; i < chunks.length; i++) {
                        mutateInsertImage({ variables: { meta_data : {
                            type:"movie",
                            season:-1,
                            episode:-1,
                            id:id?parseInt(id):-1
                        }, data:{id:getImageData.id,logos:chunks[i]},
                        chunking:true,
                        chunking_index:i                    
                    } });
                    }
                }else{
                    mutateInsertImage({ 
                        variables: { 
                            meta_data : {
                                type:"movie",
                                season:-1,
                                episode:-1,
                                id:id?parseInt(id):-1
                            },
                            data:{id:getImageData.id,logos:getImageData.logos},
                            chunking:false,
                            chunking_index:0
                        } });
                }
                let posters_all_results = [...getImageData.posters]
                if(posters_all_results.length > 100){
                    const chunks = chunkArray(posters_all_results, 100);
                    for (let i = 0; i < chunks.length; i++) {
                        mutateInsertImage({ variables: { meta_data : {
                            type:"movie",
                            season:-1,
                            episode:-1,
                            id:id?parseInt(id):-1
                        }, data:{id:getImageData.id,posters:chunks[i]},
                            chunking:true,
                            chunking_index:i                    
                    } });
                    }
                }else{
                    mutateInsertImage({ 
                        variables: { 
                            meta_data : {
                                type:"movie",
                                season:-1,
                                episode:-1,
                                id:id?parseInt(id):-1
                            },
                            data:{id:getImageData.id,posters:getImageData.posters},
                            chunking:false,
                            chunking_index:0
                        } });
                }
                return {...getImageData}
            } 
    
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
                    setImages(() => ({...fetched.data.image.data}))
        
                }else {
                    const getImageData = await freshFetch()
                    setImages(() => ({...getImageData}))
                }
            

        }catch(error){
            console.log(error)
                fetch(`${process.env.REACT_APP_movie_db}movie/${id}/images?api_key=${process.env.REACT_APP_api_key}`)
                .then(data => data.json())
                .then(data => setImages(() => ({...data})))
            

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
        const checkFeedback = (id) => {
            console.log(id,"id")
            //authentication
            fetch(process.env.REACT_APP_environment === "development" ? process.env.REACT_APP_api_url : process.env.REACT_APP_api_url_live,{credentials: "include"})
            .then(async res => {
                const {status, user} = await res.json()
                if(status){
                    console.log(`${process.env.REACT_APP_environment === "development" ? process.env.REACT_APP_playlist_select : process.env.REACT_APP_playlist_select_live}`)
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
        const setGenreIDS = async(genre = []) => {
            const {data} = await fetchGenre()
            if(data && data.genre && data.genre.success){
                console.log(genre)
                console.log(data.genre?.data)
                const genreData = data.genre?.data.filter(({id,mode}) => genre && genre.includes(Number(id)) && mode === "movie")
                console.log(genreData)
                setGenerateGenre(() => [...genreData])
            }else{
                setGenerateGenre(() => [])
            }
            
        }
        const fetched = await fetchSingleMovie({
        variables : { id }})
        console.log(fetched)
        if(fetched.data && fetched.data.single.success){
            console.log("Using cached data:", fetched.data);
            setMovie(() => ({...fetched.data.single}));
            checkFeedback(fetched.data.single.id)
            setGenreIDS(fetched.data.single.genre_ids)
        }else {
            const movie = await freshFetch()
            setMovie(() => ({...movie}));
            checkFeedback(movie.id)
            setGenreIDS(movie.genre_ids)
        }

        return true
        
    },[fetchSingleMovie,id,mutateInsertMovie,fetchGenre])

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
        graphImages()
    },[graphImages])

    useEffect(() => {
      fetchMovie();
    }, [fetchMovie]);

    useEffect(() => {
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

    const getBackground = () => {
        if(fetchedImageBackgrounds)
            return process.env.REACT_APP_img_poster + "/" + fetchedImageBackgrounds + ".jpg"
        if(!images)
            return null
        let value = 0
        const {backdrops, posters, logos} = images
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
        setFetchedImageBackgrounds(path.substring(1).substring(0,path.substring(1).length - 4))
        return process.env.REACT_APP_img_poster + path
    }

    const addToPlayList = async() => {

        //authentication
        const res = await fetch(process.env.REACT_APP_environment === "development" ? process.env.REACT_APP_api_url : process.env.REACT_APP_api_url_live,{credentials: "include"})
        const {status, user} = await res.json()
        if(status){
            console.log(`${process.env.REACT_APP_environment === "development" ? process.env.REACT_APP_playlist : process.env.REACT_APP_playlist_live}`)
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

    return (
        <>
            <div className="w-[100%] duration-150 h-[100%] text-white  bg-cover bg-no-repeat bg-center" style={{backgroundImage:`linear-gradient(105deg, #0d0d0d, rgba(0,0,0,0.75), #000, rgba(0,0,0,0.56)),url(${getBackground()})`,backgroundPosition:"0% 40%"}}>
                {
                    windowWidth > 800 ? 
                    <div className="w-[20%] absolute h-[100%] border-r-[3px] border-[#2E2E3A]" style={{background:"linear-gradient(85deg, rgba(13, 13, 13, 0.75), rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.56), rgba(0, 0, 0, 0.45))"}}>
                        <NAVBAR/>
                    </div>
                    :
                    <MOBILE/>
                }
        {
            credits && movie && images ? 
                    <div className={windowWidth > 800 ? "w-[80%] h-[100%] ml-[20%] flex flex-col overflow-y-auto movie-scene":"w-[98%] mx-[1%] h-[100%] flex flex-col overflow-y-auto movie-scene"}>
                        <div className={windowWidth > 800 ? "w-[100%] h-[67%] flex flex-row flex-wrap":"w-[100%] h-[auto]"}>
                            <div className={windowWidth > 800 ? "w-[37%] min-h-[100%]":"w-[100%] h-[auto]"}>
                                <PICTURE picture={movie.poster_path} classes={windowWidth > 800 ? "shadow-lg h-[70%] shadow-blue-500/50" : "shadow-lg h-[200px] shadow-blue-500/50 object-contain"} />
                            </div>
                            <div className={windowWidth > 800 ? "w-[61%] m-[1%] h-[60%] justify-center items-center":"w-[100%] h-[auto]"}>
                                <h1 className="text-[30px] text-[#ffd800]">{movie.original_title || movie.title}</h1>
                                <p style={{fontStyle:"italic",color:"#ffd800"}}>"{movie.tagline}"</p>
                                <div className={windowWidth > 800 ? "" : "w-[100%] gap-2 flex flex-row flex-wrap"}>
                                    <h3>{movie.release_date}</h3>
                                    <h3>{movie.revenue}</h3>
                                    <p style={{fontStyle:"italic"}}>{movie.status}</p>
                                    {/* <h3>{movie.video ? "available":"CAM"}</h3> */}
                                    <p className="text-[#ffd800]"><FontAwesomeIcon icon={faStar} /> {movie.vote_average.toFixed(1)}</p>
                                    <h4>{ (movie.runtime > 60) ? (Math.floor(movie.runtime / 60)) + " h " + (movie.runtime % 60) + " min" : movie.runtime + " min" }</h4>
                                    {
                                        generateGenre.map(({name}) => name).join(" || ")
                                    }
                                </div>
                                <article>
                                    {movie.overview}
                                </article>
                                <div className="w-[100%] flex flex-row flex-wrap">
                                    <NavLink
                                        to={`/movies/video/movies/${movie.id}/${fetchedImageBackgrounds}`}
                                        className={windowWidth > 800 ? "w-[23%] text-center min-h-[40px] rounded-md m-[1%] bg-[#000] border-[2px]":"w-[80%] rounded-md mt-[1%] ml-[10%] text-center min-h-[40px] bg-[#000] border-[2px]"}
                                    >
                                        trailors
                                    </NavLink>
                                    {
                                        layouts && 
                                        (
                                            <NavLink
                                                to={`/video/movie/${movie.id}/${movie.title || movie.original_title}/${movie.release_date.substring(0,4)}/${movie.release_date}/${movie.imdb_id}/${fetchedImageBackgrounds}`}
                                                className={windowWidth > 800 ? "text-[#ffd800] w-[23%] rounded-md text-center min-h-[40px] m-[1%] bg-[#000] border-[2px]":"text-[#ffd800] w-[80%] rounded-md mt-[1%] ml-[10%] text-center min-h-[40px] bg-[#000] border-[2px]"}
                                            >
                                                play <FontAwesomeIcon icon={faPlayCircle} />
                                            </NavLink>                                            
                                        )
                                    }

                                    <NavLink
                                        to={`/movies/similar/movies/${movie.id}/${fetchedImageBackgrounds}`}
                                        className={windowWidth > 800 ? "w-[23%] text-center min-h-[40px] rounded-md m-[1%] bg-[#000] border-[2px]":"w-[80%] rounded-md mt-[1%] ml-[10%] text-center min-h-[40px] bg-[#000] border-[2px]"}
                                    >
                                        similar movies
                                    </NavLink>
                                    <NavLink
                                        to={`/movies/recommendations/movies/${movie.id}/${fetchedImageBackgrounds}`}
                                        className={windowWidth > 800 ? "w-[23%] text-center min-h-[40px] rounded-md m-[1%] bg-[#000] border-[2px]":"w-[80%] rounded-md mt-[1%] ml-[10%] text-center min-h-[40px] bg-[#000] border-[2px]"}
                                    >
                                        recommended movies
                                    </NavLink>
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
                                            <NavLink key={people_key} to={`/people/${id}`} className={windowWidth > 800 ? "w-[25%] h-[100%] hover:skew-4 hover:contrast-150":"w-[40%] hover:skew-4 h-[100%] m-[0.5%] hover:contrast-150"}>
                                                <div className="w-[100%] h-[100%]">
                                                    <PICTURE picture={profile_path} classes={"object-cover h-[100%] rounded-xl"} />
                                                    <div className="w-[100%] relative min-h-[60px] top-[-50%] bg-[#000000] bg-opacity-60 text-white flex flex-col items-center justify-center">
                                                        <h2 className={windowWidth > 800 ? "text-[15px] font-bold":"font-bold"}>{name ? name : original_name ? original_name : name}</h2>
                                                        <p style={{color:"#ffd800"}}><FontAwesomeIcon icon={faStar} /> {popularity && parseFloat(popularity).toFixed(2)}</p>
                                                        <h3 style={{fontStyle:"italic"}}>{character}</h3>
                                                    </div>
                                                </div>
                                            </NavLink>
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
                                            <NavLink key={people_key} to={`/people/${id}`} className={windowWidth > 800 ? "w-[25%] h-[100%] hover:skew-4 hover:contrast-150":"w-[40%] hover:skew-4 h-[100%] m-[0.5%] hover:contrast-150"}>
                                                <div className="w-[100%] h-[100%]">
                                                    <PICTURE picture={profile_path} classes={"object-cover h-[100%] rounded-xl"} />
                                                    <div className="w-[100%] relative min-h-[60px] top-[-50%] bg-[#000000] bg-opacity-60 text-white flex flex-col items-center justify-center">
                                                        <h2 className="text-[15px] font-bold">{name ? name : original_name ? original_name : name}</h2>
                                                        <p style={{color:"#ffd800"}}><FontAwesomeIcon icon={faStar} /> {popularity && parseFloat(popularity).toFixed(2)}</p>
                                                        <h3>{job}</h3>
                                                    </div>
                                                </div>
                                            </NavLink>
                                        )
                                    }
                                </div>
                            </div>
                        }
                        <div className="w-[90%] duration-50 mx-[5%] mt-[1%] movie-scene flex flex-row min-h-[100%] flex-wrap">
                            {
                                Object.entries(images).map(([key,value],node) => 
                                    value && typeof(value) === "object" && value.map(({file_path},index) => 
                                        <div className="m-[0.5%] w-[48%] h-[50%]" key={node + index}>
                                            <PICTURE picture={file_path} classes={"object-contain h-[100%]"} />
                                        </div>
                                    )
                                )
                            }

                        </div>
                    </div>
            :
            <LOAD/>
            }
        </div>
        
        </>

    )
}

export default MOVIE
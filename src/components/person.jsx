import { useMutation, useLazyQuery, useApolloClient } from '@apollo/client/react';
import { gql } from '@apollo/client';
import NAVBAR from "./nav"
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback, useRef } from "react";
import PICTURE from "../midlleware/picture";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faAngleDoubleRight, faBasketShopping, faCirclePlus } from "@fortawesome/free-solid-svg-icons";
import LOAD from "../midlleware/load";
import MOBILE from "./mobileBar";
import Swal from "sweetalert2";
import CryptoJS from "crypto-js";
import { useKeys } from './safe';
const PERSON = () => {

    const hasFetched= useRef({images:false,tv:false,movies:false,person:false,feedback:false})
    const [person, setPerson] = useState(null)
    const [movies, setMovies] = useState(null)
    const [series, setSeries] = useState(null)
    const [images, setImages] = useState(null)
    const [windowWidth, setWindowWidth] = useState(0);
    const [following,setFollowing] = useState(null)
    const {safeKeys} = useKeys()
    // const { state } = useLocation();
    const navigate = useNavigate();
    const {state} = useLocation()
    const id = state.id
    const client = useApolloClient();

    useEffect(() => {
        // Create the inline script
        const inlineScript = document.createElement("script");
        inlineScript.type = "text/javascript";
        inlineScript.text = "var infolinks_pid = 3436935; var infolinks_wsid = 0;";

        // Create the external script
        const externalScript = document.createElement("script");
        externalScript.type = "text/javascript";
        externalScript.src = "//resources.infolinks.com/js/infolinks_main.js";

        // Append both to the body
        document.body.appendChild(inlineScript);
        document.body.appendChild(externalScript);

        // Cleanup on unmount
        return () => {
            document.body.removeChild(inlineScript);
            document.body.removeChild(externalScript);
        };
    }, []);

    useEffect(() => {
        // Create the inline script
        const inlineScript = document.createElement("script");
        inlineScript.type = "text/javascript";
        inlineScript.crossorigin = "anonymous";
        inlineScript.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8036256488117651"
        inlineScript.async = true
        // Create the external script
        // const externalScript = document.createElement("script");
        // externalScript.type = "text/javascript";
        // externalScript.src = "//resources.infolinks.com/js/infolinks_main.js";

        // Append both to the body
        document.body.appendChild(inlineScript);
        // document.body.appendChild(externalScript);

        // Cleanup on unmount
        return () => {
            document.body.removeChild(inlineScript);
            // document.body.removeChild(externalScript);
        };
    }, []);

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.screen.width);
        };
        window.addEventListener("resize", handleResize);
        handleResize(); // Call it once to set the initial value
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    },[])

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
        fetchPolicy: 'cache-first',
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

    const graphImages = useCallback(async() => {

        async function freshFetch(){
            const response = await fetch(`${safeKeys.MOVIE_DB}person/${id}/images?api_key=${safeKeys.API_KEY}`);
            const getImageData = await response.json();
            console.log(getImageData,"images")
            let value = 0
            const {profiles} = getImageData
            let path = ''
            if(profiles && profiles.length > 0){
                value = Math.max(...profiles.map(({height}) => height))
                let key = profiles.findIndex(({height}) => height === value)
                if(key > -1){
                    path = profiles[key].file_path
                }
            } 

            mutateInsertImage({ variables: { meta_data : {
                    type:"person",
                    season:-1,
                    episode:-1,
                    id:id?parseInt(id):-1
                }, data:{id:getImageData.id,path}                  
            } });
            console.log(path,"path" )
            return path
        }         
        try{
            const fetched = await fetchImage({
                variables : {
                type:"person",
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
                setImages(path)
            }
        
            
        }catch(error){
            console.log(error)
            const path = await freshFetch()
            setImages(path)            
        

        }
    },[fetchImage,id, mutateInsertImage])

    const FETCH_PERSON_QUERY = gql`
        query Person (
            $id: ID!
        ){
            person(
                id:$id
            ) {
                adult
                also_known_as
                biography 
                birthday 
                deathday
                gender
                homepage
                id 
                imdb_id 
                known_for_department
                name 
                place_of_birth
                popularity 
                profile_path 
                success
                message
                error
            }
        }
    `
    const [fetchPersonData] = useLazyQuery(FETCH_PERSON_QUERY,{
        notifyOnNetworkStatusChange: true,
        fetchPolicy: 'cache-first',
    });
    useEffect(() => {
        const invalidateCache = () => {
            console.log("Invalidating Apollo Client cache");
            client.refetchQueries({
                include: [FETCH_PERSON_QUERY] // Refetch all queries using this query
            });
            // client.resetStore(); // Alternative: Clears the entire cache (more aggressive)
        };

        // Set up the timer to invalidate the cache after 24 hours
        const timerId = setTimeout(invalidateCache, 86400000); // 24 hours in milliseconds

        // Clear the timer when the component unmounts to prevent memory leaks
        return () => clearTimeout(timerId);
    }, [client,FETCH_PERSON_QUERY]); // 
    const INSERT_PERSON_MUTATION = gql`
        mutation AddPersonID(
            $single:PERSON_ID
        ) {
            addPersonID(
                single:$single
            ) {
                success
                message
            }
        }
    `;

    const [mutateInsertPerson] = useMutation(INSERT_PERSON_MUTATION, {
        onCompleted: (data) => {
            console.log(data)
            if (data.addPersonID.success) {
                if(data.addPersonID.message === "already inserted")
                    console.log("person inserting already started...")
                console.log("person successfully inserted into MySQL:", data.addPersonID.message);
                // fetchedPersonData.refetch()
                // .then(status => console.log(status,"status"))
                // fetchedPersonData.refetch().then((refetched) => {
                //     console.log(refetched)
                //     if(refetched.data.person.success){
                //         const ref = refetched?.data?.person
                //         const typeGetImageData = {...ref}
                //         setPerson(() => ({...typeGetImageData}))
                //     }

                // })                  
            } else {
                console.error("Failed to insert person into MySQL:", data.addPersonID.message, data.addPersonID.error);
            }
        },
        onError: (error) => {
            console.error("Error inserting person into MySQL:", error.message);
        },
    });

    const fetchPerson = useCallback(async() => {

        async function freshFetch(){
            const response = await fetch(`${safeKeys.MOVIE_DB}person/${id}?api_key=${safeKeys.API_KEY}`);
            const data = await response.json();
            console.log(data)
            mutateInsertPerson({
                variables: {
                    single : {...data}
                }
            });
            return {...data}
        } 

        const fetched = await fetchPersonData({
            variables : { id }})
        console.log(fetched)
        if(fetched.data && fetched.data.person && !fetched.data.person.biography){
            //first check person
            console.log("first time")
            const personData = await freshFetch()
            
            return setPerson(() => ({...personData}));
        }else if(fetched.data && fetched.data.person.success){
            // console.log("Using cached data:", fetched.data);
            
            return setPerson(() => ({...fetched.data.person}));
        }else {
            const personData = await freshFetch()
            return setPerson(() => ({...personData}));
        }
    
        
    },[fetchPersonData, id, mutateInsertPerson])

    useEffect(() => {
        if(hasFetched.current.feedback){
            return
        }
        hasFetched.current.feedback = true        
        const checkFeedback = (id) => {
            fetch(process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_API_URL : process.env.REACT_APP_API_URL_LIVE,{credentials: "include"})
            .then(async res => {
                const {status, user} = await res.json()
                if(status){
                    fetch(`${process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_FOLLOWERS_SELECT : process.env.REACT_APP_FOLLOWERS_SELECT_LIVE}`,{
                        method:"POST",
                        headers:{
                            "Content-Type":"application/json"
                        },
                        body:JSON.stringify({id, user})
                    })
                    .then(res => res.json())
                    .then(({status}) => {
                        if(status){
                            setFollowing(() => true)
                        }
                    })
                }
            })
        } 
        if(person && person.id)
            checkFeedback(person.id)
    },[person])

    const FETCH_MOVIE_QUERY = gql`
        query Played(
            $id:ID!
            $type:String!
            $hashedKey:String!
        ){
            played(
                id:$id
                type:$type
                hashedKey:$hashedKey
            ){

                cast {
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
                    vote_average
                    vote_count
                    character
                    credit_id
                    order
                }
                crew {
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
                    vote_average
                    vote_count
                    character
                    credit_id
                    order
                }
                success
                error
                message
            }
        }
    `
    const [fetchMovie] = useLazyQuery(FETCH_MOVIE_QUERY,{
        notifyOnNetworkStatusChange: true,
        // fetchPolicy: 'cache-first',
    });
    useEffect(() => {
        const invalidateCache = () => {
            console.log("Invalidating Apollo Client cache");
            client.refetchQueries({
                include: [FETCH_MOVIE_QUERY] // Refetch all queries using this query
            });
            // client.resetStore(); // Alternative: Clears the entire cache (more aggressive)
        };

        // Set up the timer to invalidate the cache after 24 hours
        const timerId = setTimeout(invalidateCache, 86400000); // 24 hours in milliseconds

        // Clear the timer when the component unmounts to prevent memory leaks
        return () => clearTimeout(timerId);
    }, [client,FETCH_MOVIE_QUERY]); // 

    const INSERT_MOVIE_MUTATION = gql`
        mutation AddPlayed(
            $id:ID!
            $cast:[ADD_CAST_PLAYED_RESULTS_INPUT]
            $crew:[ADD_CREW_PLAYED_RESULTS_INPUT]
            $hashedKey:String!
        ){
            addPlayed(
                id:$id
                cast:$cast
                crew:$crew
                hashedKey:$hashedKey
            ){
                success
                message
                error
            }
        }
    `;

    const [mutateInsertMovie] = useMutation(INSERT_MOVIE_MUTATION, {
        onCompleted: (data) => {
            if (data.addPlayed.success) {
                if(data.addPlayed.message === "already inserted")
                    console.log("movie inserting already started...")
                console.log("Movie successfully inserted into MySQL:", data.addPlayed.message);
                // fetchedMovieData.refetch()
                // .then(status => console.log(status,"status"))
            } else {
                console.error("Failed to insert movies into MySQL:", data.addPlayed.message, data.addPlayed.error);
            }
        },
        onError: (error) => {
            console.error("Error inserting movies into MySQL:", error.message);
        },
    });

    
    const INSERT_TV_MUTATION = gql`
        mutation AddPlayedTV(
            $id:ID!
            $cast:[ADD_CAST_PLAYED_TV_RESULTS_INPUT]
            $crew:[ADD_CREW_PLAYED_TV_RESULTS_INPUT]
            $hashedKey:String!
        ){
            addPlayedTV(
                id:$id
                cast:$cast
                crew:$crew
                hashedKey:$hashedKey
            ){
                success
                message
                error
            }
        }
    `;

    const [mutateInsertTV] = useMutation(INSERT_TV_MUTATION, {
        onCompleted: (data) => {
            if (data.addPlayedTV.success) {
                if(data.addPlayedTV.message === "already inserted")
                    console.log("movie inserting already started...")
                console.log("Movie successfully inserted into MySQL:", data.addPlayedTV.message);
                // fetchedMovieData.refetch()
                // .then(status => console.log(status,"status"))
            } else {
                console.error("Failed to insert movies into MySQL:", data.addPlayedTV.message, data.addPlayedTV.error);
            }
        },
        onError: (error) => {
            console.error("Error inserting movies into MySQL:", error.message);
        },
    });

    const fetchMovies = useCallback(async() => {
        try{
            
            const hashed = id + "movie"
            const hashedKey = CryptoJS.SHA256(hashed).toString();
            async function freshFetch(){
                const api = `${safeKeys.MOVIE_DB}person/${id}/movie_credits?api_key=${safeKeys.API_KEY}`
                const response = await fetch(`${api}`);
                const movies_data = await response.json();
                console.log(movies_data,"movie")
                setMovies(() => ({...movies_data})); 
                mutateInsertMovie({ variables: {
                    ...movies_data,
                    type:"movie",
                    hashedKey
                }} );
                return {...movies_data}
            } 
    
            const fetched = await fetchMovie({
                variables : {
                    type:"movie",
                    id:id?parseInt(id):-1,
                    hashedKey
            }})
            console.log(fetched)
            if (fetched.data && fetched.data.played.success) {
                console.log("movies cached data:", fetched.data);
                return setMovies(() => ({...fetched.data.played}))
    
            }else {
                const movies_data = await freshFetch()
                return setMovies(() => ({...movies_data}))
            }
        
        }catch(error){
            console.log(error,"error")
                const api = `${safeKeys.MOVIE_DB}person/${id}/movie_credits?api_key=${safeKeys.API_KEY}`
                fetch(`${api}`)
                .then(data => data.json())
                .then(data => setMovies(() => ({...data})))
            
        }
    },[mutateInsertMovie, id, fetchMovie])

    const fetchTV = useCallback(async() => {
        try{

            const hashed = id + "tv"
            const hashedKey = CryptoJS.SHA256(hashed).toString();

            
            async function freshFetch(){
                const api = `${safeKeys.MOVIE_DB}person/${id}/tv_credits?api_key=${safeKeys.API_KEY}`
                const response = await fetch(`${api}`);
                const movies_data = await response.json();
                console.log(movies_data)
                setSeries(() => ({...movies_data})); 
                mutateInsertTV({ variables: {
                    ...movies_data,
                    type:"tv",
                    hashedKey
                }} );
                return {...movies_data}
            } 
    
            const fetched = await fetchMovie({
                variables : {
                    type:"tv",
                    id:id?parseInt(id):-1,
                    hashedKey
            }})
            console.log(fetched)
            if (fetched.data && fetched.data.played.success) {
                console.log("tv cached data:", fetched.data);
                return setSeries(() => ({...fetched.data.played}))
    
            }else {
                const movies_data = await freshFetch()
                return setSeries(() => ({...movies_data}))
            }
        
        }catch(error){
            console.log(error,"error")
                const api = `${safeKeys.MOVIE_DB}person/${id}/tv_credits?api_key=${safeKeys.API_KEY}`
                fetch(`${api}`)
                .then(data => data.json())
                .then(data => setSeries(() => ({...data})))
            

        }
    },[mutateInsertTV, id, fetchMovie])

    useEffect(() => {
        // if(hasFetched.current.images){
        //     return
        // }
        // hasFetched.current.images = true
        // graphImages()
        const controller = new AbortController();
        graphImages(controller.signal).catch(err => {
            if (err && err.name === 'AbortError') return;
            console.error("graphImages outer error", err);
        });
        return () => {
            controller.abort();
        };
    },[graphImages])

    useEffect(() => {
        // if(hasFetched.current.person){
        //     return
        // }
        // hasFetched.current.person = true
        // fetchPerson();
        const controller = new AbortController();
        fetchPerson(controller.signal).catch(err => {
            if (err && err.name === 'AbortError') return;
            console.error("fetchPerson outer error", err);
        });
        return () => {
            controller.abort();
        };
    }, [fetchPerson]);

    useEffect(() => {
        // if(hasFetched.current.movies){
        //     return
        // }
        // hasFetched.current.movies = true
        // fetchMovies();
        const controller = new AbortController();
        fetchMovies(controller.signal).catch(err => {
            if (err && err.name === 'AbortError') return;
            console.error("fetchMovies outer error", err);
        });
        return () => {
            controller.abort();
        };
    }, [fetchMovies]);

    useEffect(() => {
        // if(hasFetched.current.tv){
        //     return
        // }
        // hasFetched.current.tv = true
        // fetchTV();
        const controller = new AbortController();
        fetchTV(controller.signal).catch(err => {
            if (err && err.name === 'AbortError') return;
            console.error("fetchTV outer error", err);
        });
        return () => {
            controller.abort();
        };
    }, [fetchTV]);

    // const getBackground = () => {
    //     if(!images)
    //         return null
    //     const {profiles} = images
    //     if(!profiles)
    //         return null
    //     let value = Math.max(...profiles.map(({height}) => height))
    //     let key = profiles.findIndex(({height}) => height === value)
    //     let path = (key > -1) ? profiles[key].file_path : ""
            

    //     return safeKeys.IMG_POSTER + path
    // }

    const addToFollowers = async() => {

        //authentication
        const res = await fetch(process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_API_URL :process.env.REACT_APP_API_URL_LIVE ,{credentials: "include"})
        const {status, user} = await res.json()
        if(status){
            fetch(`${process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_FOLLOWERS : process.env.REACT_APP_FOLLOWERS_LIVE}`,{
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify({id:person.id, user})
            })
            .then(res => res.json())
            .then(({status}) => {
                if(status){
                    Swal.fire({
                        icon: 'success',
                        title: 'Added to following',
                        showConfirmButton: false,
                        timer: 1500
                    })

                    
                }else{
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: "Already following",
                        showConfirmButton: false,
                        timer: 1500
                    })
                }
                setFollowing(() => true)
            })
        }else{
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: "Sign in to follow " + person.name,
                showConfirmButton: false,
                timer: 1500
            })
        }

    }
    const navMovie = (id,url) => {
        navigate(url,{
            state : {
                id
            }
        })
    } 
    return (
        
        series && movies && person ?
        <div className="w-[100%] h-[100%]  bg-cover bg-no-repeat bg-center text-white" style={{backgroundImage:`linear-gradient(105deg, #0d0d0d, rgba(0,0,0,0.75), #000, rgba(0,0,0,0.56)),url(${images ? safeKeys.IMG_POSTER + images : "/image/logo.png"})`,backgroundPosition:"0% 40%"}}>
            {
                windowWidth > 800 ? 
                <div className="w-[20%] absolute h-[100%]" style={{background:"linear-gradient(85deg, rgba(13, 13, 13, 0.75), rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.56), rgba(0, 0, 0, 0.45))"}}>
                    <NAVBAR/>
                </div>
                :
                <MOBILE/>
            }
            <div className={windowWidth > 800 ? "w-[80%] duration-100 h-[100%] overflow-y-auto movie-scene ml-[20%] text-justify justify-center items-center":"w-[98%] mx-[1%] duration-100 h-[92%] overflow-y-auto movie-scene flex flex-col"}>
            
                
                <>
                    {/* <div className="w-[100%] h-[60%]"> */}
                        {/* <div className={`w-[90%] ml-[5%] ${windowWidth > 800 ? "min-h-[60%] h-auto" : "h-[auto]"} text-justify justify-center items-center`}> */}
                            <div className={windowWidth > 800 ? "w-[40%] h-[auto] m-[1%] float-left backdrop-blur-md":"w-[98%] h-[auto] m-[1%] backdrop-blur-md"}>
                                <PICTURE picture={person.profile_path} classes={"object-contain h-[200px] shadow-lg shadow-[#ffd800]"} />
                            </div>

                            <h1 className="text-[30px]">{person.name}</h1>
                            <p style={{fontStyle:"italic",color:"#ffd800"}}>{person.also_known_as && person?.also_known_as.map((name) => `${name}`).join(" || ")}</p>
                            <h3>{person.birthday} <FontAwesomeIcon icon={faAngleDoubleRight} /> {person.deathdate}</h3>
                            <h3>{person.gender === 2 ? "male" : "female"}</h3>
                            <h3 style={{color:"#ffd800"}}>konwn for</h3>
                            <span>{person.known_for_department}</span>
                            <h4>{ person.place_of_birth }</h4>
                            <article>
                                {person.biography}
                            </article>
                            <div style={{overflow:"hidden",margin:"5px"}}>
                                <ins
                                    className="adsbygoogle"
                                    style={{display:"block",width:"100%",height:"auto"}}
                                    data-ad-client="ca-pub-8036256488117651"
                                    data-ad-slot="1234567890"
                                    data-ad-format="auto"
                                    data-full-width-responsive="true"
                                ></ins>
                            </div>
                            <div className={windowWidth > 800 ? "w-[56%] float-right":"w-[100%]"}>
                                <button
                                    type="button"
                                    className="w-[100%] h-[50px] bg-[#ffd800] text-black font-bold hover:bg-[#ffd800]/80 duration-200"
                                    onClick={() => addToFollowers()}
                                >
                                    {
                                        following ? 
                                            <>
                                                <FontAwesomeIcon icon={faBasketShopping} /> <span>following</span>
                                            </>
                                        :
                                            <>
                                                <FontAwesomeIcon icon={faCirclePlus} /> follow
                                            </>
                                            
                                    }
                                    
                                </button>
                            </div>                            
                        {/* </div> */}
                                <div className={windowWidth > 800 ? "w-[90%] min-h-[100%] ml-[5%] mt-[1%] flex flex-col":"w-[100%] h-[auto] flex flex-col"}>
                                    {

                                        ((series.cast && series.cast.length > 0) || (series.crew && series.crew.length > 0)) &&
                                            <div className="w-[100%] h-[auto] text-left flex flex-wrap flex-col">
                                                <h1 className="my-t-[5%] text-[20px] text-[#ffd800]">TV</h1>
                                                {
                                                    series.cast && series.cast.length > 0 && 
                                                    <>
                                                        <h2>PLAYED AS CAST</h2> 
                                                        <div className={`w-[100%] duration-50 movie-scene ${windowWidth > 800 ? "h-[300px]" : "h-[200px]"} flex flex-col flex-wrap overflow-x-auto overflow-y-hidden my-[1%]`}>
                                                        {
                                                            series.cast && series.cast.map(({character,adult,backdrop_path,genre_ids,id,original_name,name,original_language,original_title,overview,popularity,poster_path,release_date,title,video,vote_average,vote_count},movie_key) => 
                                                                <div key={movie_key} 
                                                                    // to={`/series/${id}`} 
                                                                    onClick={() => navMovie(id,`/people/serie`,"tv")}
                                                                    className={windowWidth > 800 ? "cursor-pointer w-[25%] h-[100%] hover:scale-115  duration-700 hover:contrast-150":"cursor-pointer w-[45%] hover:scale-115  duration-700 h-[100%] m-[1%] hover:contrast-150"}>
                                                                    <div className="w-[100%] h-[100%]">
                                                                        <PICTURE key={id} classes={`object-cover h-[100%] ${windowWidth > 800 ? "" : "rounded-xl"}`} picture={poster_path} />
                                                                        <div className="w-[100%] relative min-h-[60px] top-[-50%] bg-[rgba(0,0,0,0.75)] bg-opacity-60 text-white flex flex-col items-center justify-center">
                                                                            <h2 className={windowWidth > 800 ? "text-[15px] font-bold":""}>{name || original_name || title || original_title}</h2>
                                                                            <p style={{color:"#ffd800"}}><FontAwesomeIcon icon={faStar} /> { parseFloat(vote_average).toFixed(1) || parseFloat(popularity).toFixed(1) || vote_count}</p>
                                                                            <h2 style={{fontStyle:"italic"}}>{character}</h2>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )
                                                        }
                                                        </div>
                                                    </>
                                                }

                                                {
                                                    series.crew && series.crew.length > 0 &&  
                                                    <>
                                                        <h2>PLAYED AS CREW</h2>
                                                        <div className={`w-[100%] duration-50 movie-scene ${windowWidth > 800 ? "h-[300px]" : "h-[200px]"} flex flex-col flex-wrap overflow-x-auto overflow-y-hidden my-[1%]`}>
                                                            {
                                                                series.crew && series.crew.map(({job,adult,backdrop_path,genre_ids,id,original_name,name,original_language,original_title,overview,popularity,poster_path,release_date,title,video,vote_average,vote_count},movie_key) => 
                                                                    <div 
                                                                        key={movie_key} 
                                                                        // to={`/series/${id}`}
                                                                        onClick={() => navMovie(id,`/people/serie`,"tv")} 
                                                                        className={windowWidth > 800 ? "w-[25%] h-[100%] hover:scale-115 duration-700 m-[0.5%] hover:contrast-150":"w-[45%] hover:scale-115  duration-700 h-[100%] m-[1%] hover:contrast-150"}>
                                                                        <div className="w-[100%] h-[100%]">
                                                                            <PICTURE key={id} classes={`object-cover h-[100%] ${windowWidth > 800 ? "" : "rounded-xl"}`} picture={poster_path} />
                                                                            <div className="w-[100%] relative min-h-[60px] top-[-50%] bg-[rgba(0,0,0,0.75)] bg-opacity-60 text-white flex flex-col items-center justify-center">
                                                                                <h2 className={windowWidth > 800 ? "text-[15px] font-bold":""}>{name || original_name || title || original_title}</h2>
                                                                                <p style={{color:"#ffd800"}}><FontAwesomeIcon icon={faStar} /> { parseFloat(vote_average).toFixed(1) || parseFloat(popularity).toFixed(1) || vote_count}</p>
                                                                                <h2 style={{fontStyle:"italic"}}>{job}</h2>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )
                                                            }
                                                        </div>
                                                    </>
                                                }

                                            </div>
                                    }
                                    {
                                        ((movies.cast && movies.cast.length > 0) ||( movies.crew && movies.crew.length > 0)) &&

                                        <div className="w-[100%] h-[auto] flex flex-wrap flex-col">
                                            <h1 className="my-t-[5%] text-[20px] text-[#ffd800]">movies</h1>
                                            {
                                                movies.cast && movies.cast.length > 0 && 
                                                <>
                                                    <h2>PLAYED AS CAST</h2>
                                                    <div className={`w-[100%] duration-50 movie-scene ${windowWidth > 800 ? "h-[300px]" : "h-[200px]"} flex flex-col flex-wrap overflow-x-auto overflow-y-hidden my-[1%]`}>
                                                        {
                                                            movies.cast && movies.cast.map(({character,adult,backdrop_path,genre_ids,name,id,original_name,original_language,original_title,overview,popularity,poster_path,release_date,title,video,vote_average,vote_count},movie_key) => 
                                                                <div 
                                                                    key={movie_key} 
                                                                    // to={`/movies/${id}`}
                                                                    onClick={() => navMovie(id,`/people/movie`,"movies")} 
                                                                    className={windowWidth > 800 ? "w-[25%] h-[100%] hover:scale-115  duration-700 m-[0.5%] hover:contrast-150":"w-[45%] hover:scale-115  duration-700 h-[100%] m-[1%] hover:contrast-150"}>
                                                                    <div className="w-[100%] h-[100%]">
                                                                        <PICTURE key={id} classes={`object-cover h-[100%] ${windowWidth > 800 ? "" : "rounded-xl"}`} picture={poster_path} />
                                                                        <div className="w-[100%] relative min-h-[60px] top-[-50%] bg-[rgba(0,0,0,0.75)] bg-opacity-60 text-white flex flex-col items-center justify-center">
                                                                            <h2 className={windowWidth > 800 ? "text-[15px] font-bold":""}>{original_name || name || title || original_title}</h2>
                                                                            <p style={{color:"#ffd800"}}><FontAwesomeIcon icon={faStar} /> { parseFloat(vote_average).toFixed(1) || parseFloat(popularity).toFixed(1) || vote_count}</p>
                                                                            <h2 style={{fontStyle:"italic"}}>{character}</h2>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )
                                                        }
                                                    </div>
                                                </>
                                            }
                                            {
                                                movies.crew && movies.crew.length > 0 && 
                                                <>
                                                    <h2>PLAYED AS CREW</h2>
                                                    <div className={`w-[100%] duration-50 movie-scene ${windowWidth > 800 ? "h-[300px]" : "h-[200px]"} flex flex-col flex-wrap overflow-x-auto overflow-y-hidden my-[1%]`}>
                                                        {
                                                            movies.crew && movies.crew.map(({job,adult,backdrop_path,genre_ids,id,original_language,name,original_name,original_title,overview,popularity,poster_path,release_date,title,video,vote_average,vote_count},movie_key) => 
                                                                <div 
                                                                    key={movie_key} 
                                                                    // to={`/movies/${id}`} 
                                                                    onClick={() => navMovie(id,`/people/movie`,"movies")}
                                                                    className={
                                                                        windowWidth > 800 ? "cursor-pointer w-[25%] h-[100%] hover:scale-115  duration-700 hover:contrast-150":
                                                                        "cursor-pointer w-[45%] hover:scale-115  duration-700 h-[100%] m-[1%] hover:contrast-150"}>
                                                                    <div className="w-[100%] h-[100%]">
                                                                        <PICTURE key={id} classes={`object-cover h-[100%] ${windowWidth > 800 ? "" : "rounded-xl"}`} picture={poster_path} />
                                                                        <div className="w-[100%] relative min-h-[60px] top-[-50%] bg-[rgba(0,0,0,0.75)] bg-opacity-60 text-white flex flex-col items-center justify-center">
                                                                            <h2 className={windowWidth > 800 ? "text-[15px] font-bold":""}>{original_name || name || title || original_title}</h2>
                                                                            <p style={{color:"#ffd800"}}><FontAwesomeIcon icon={faStar} /> { parseFloat(vote_average).toFixed(1) || parseFloat(popularity).toFixed(1) || vote_count}</p>
                                                                            <h2 style={{fontStyle:"italic"}}>{job}</h2>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )
                                                        }
                                                    </div>
                                                </>
                                            }

                                        </div>
                                    }
                                </div>
                            </>

            
                    </div>
                </div>
            :
                <LOAD/>
    )
}

export default PERSON
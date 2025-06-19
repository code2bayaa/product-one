import NAVBAR from "./nav"
import { NavLink, useParams } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import PICTURE from "../midlleware/picture";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faAngleDoubleRight, faBasketShopping, faCirclePlus } from "@fortawesome/free-solid-svg-icons";
import { gql, useMutation, useLazyQuery } from '@apollo/client';
import LOAD from "../midlleware/load";
import MOBILE from "./mobileBar";
import Swal from "sweetalert2";
import CryptoJS from "crypto-js";
const PERSON = () => {

    const { id } = useParams();
    const [person, setPerson] = useState(null)
    const [movies, setMovies] = useState(null)
    const [series, setSeries] = useState(null)
    const [images, setImages] = useState(null)
    const [windowWidth, setWindowWidth] = useState(0);
    const [following,setFollowing] = useState(null)

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
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
    const [fetchImage,fetchImageData] = useLazyQuery(FETCH_IMAGE_QUERY,{
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
            if (data && data.addImage.success) {
                // Refetch the query to get updated data
                fetchImageData.refetch().then((refetched) => {
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

    const graphImages = useCallback(async() => {
        try{
            async function freshFetch(){
                const response = await fetch(`${process.env.REACT_APP_movie_db}person/${id}/images?api_key=${process.env.REACT_APP_api_key}`);
                const getImageData = await response.json();
                // console.log(getImageData)
                mutateInsertImage({ variables: { meta_data : {
                    type:"person",
                    season:-1,
                    episode:-1,
                    id:id?parseInt(id):-1
                }, data:{...getImageData} } });
                return {...getImageData}
            } 
            if(!images){

                const fetched = await fetchImage({
                    variables : {
                    type:"person",
                    episode:-1,
                    season:-1,
                    id:id?parseInt(id):-1
                }})
                if (fetched.data && fetched.data.image.success) {
                    // console.log("image cached data:", fetched.data);
                    setImages(() => ({...fetched.data.image.data}))

                }else {
                    const getImageData = await freshFetch()
                    setImages(() => ({...getImageData}))
                }
            }
        }catch(error){
            console.log(error)
            if(!images){
                fetch(`${process.env.REACT_APP_movie_db}person/${id}/images?api_key=${process.env.REACT_APP_api_key}`)
                .then(data => data.json())
                .then(data => setImages(() => ({...data})))
            }

        }
    },[fetchImage, id, mutateInsertImage, images])

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
    const [fetchPersonData,fetchedPersonData] = useLazyQuery(FETCH_PERSON_QUERY,{
        notifyOnNetworkStatusChange: true,
    });

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
                fetchedPersonData.refetch()
                .then(status => console.log(status,"status"))
            } else {
                console.error("Failed to insert person into MySQL:", data.addPersonID.message, data.addPersonID.error);
            }
        },
        onError: (error) => {
            console.error("Error inserting person into MySQL:", error.message);
        },
    });

    const fetchPerson = useCallback(async() => {

        const checkFeedback = (id) => {
            fetch(process.env.REACT_APP_api_url,{credentials: "include"})
            .then(async res => {
                const {status, user} = await res.json()
                if(status){
                    fetch(`${process.env.REACT_APP_followers_select}`,{
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

        async function freshFetch(){
            const response = await fetch(`${process.env.REACT_APP_movie_db}person/${id}?api_key=${process.env.REACT_APP_api_key}`);
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
        if(fetched.data && fetched.data.person.success){
            console.log("Using cached data:", fetched.data);
            checkFeedback(fetched.data.person.id)
            return setPerson(() => ({...fetched.data.person}));
        }else {
            const personData = await freshFetch()
            checkFeedback(personData.id)
            return setPerson(() => ({...personData}));
        }
    
        
    },[fetchPersonData, id, mutateInsertPerson])

    const FETCH_MOVIE_QUERY = gql`
        query Played(
            $id:ID!
            $type:String!
        ){
            played(
                id:$id
                type:$type
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
    const [fetchMovie,fetchedMovieData] = useLazyQuery(FETCH_MOVIE_QUERY,{
        notifyOnNetworkStatusChange: true,
    });

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
                fetchedMovieData.refetch()
                .then(status => console.log(status,"status"))
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
                fetchedMovieData.refetch()
                .then(status => console.log(status,"status"))
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
            const api = `${process.env.REACT_APP_movie_db}person/${id}/movie_credits?api_key=${process.env.REACT_APP_api_key}`
            async function freshFetch(){
                const response = await fetch(`${api}`);
                const movies_data = await response.json();
                
                setMovies(() => ({...movies_data})); 
                mutateInsertMovie({ variables: {
                    ...movies_data,
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
                const api = `${process.env.REACT_APP_movie_db}person/${id}/movie_credits?api_key=${process.env.REACT_APP_api_key}`
                fetch(`${api}`)
                .then(data => data.json())
                .then(data => setMovies(() => ({...data})))
            
        }
    },[mutateInsertMovie, id, fetchMovie])

    const fetchTV = useCallback(async() => {
        try{

            const hashed = id + "tv"
            const hashedKey = CryptoJS.SHA256(hashed).toString();

            const api = `${process.env.REACT_APP_movie_db}person/${id}/tv_credits?api_key=${process.env.REACT_APP_api_key}`
            async function freshFetch(){
                const response = await fetch(`${api}`);
                const movies_data = await response.json();
                console.log(movies_data)
                setSeries(() => ({...movies_data})); 
                mutateInsertTV({ variables: {
                    ...movies_data,
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
                const api = `${process.env.REACT_APP_movie_db}person/${id}/tv_credits?api_key=${process.env.REACT_APP_api_key}`
                fetch(`${api}`)
                .then(data => data.json())
                .then(data => setSeries(() => ({...data})))
            

        }
    },[mutateInsertTV, id, fetchMovie])

    useEffect(() => {
        graphImages()
    },[graphImages])

    useEffect(() => {
        fetchPerson();
    }, [fetchPerson]);

    useEffect(() => {
        fetchMovies();
    }, [fetchMovies]);

    useEffect(() => {
        fetchTV();
    }, [fetchTV]);

    const getBackground = () => {
        if(!images)
            return null
        const {profiles} = images
        if(!profiles)
            return null
        let value = Math.max(...profiles.map(({height}) => height))
        let key = profiles.findIndex(({height}) => height === value)
        let path = (key > -1) ? profiles[key].file_path : ""
            

        return process.env.REACT_APP_img_poster + path
    }

    const addToFollowers = async() => {

        //authentication
        const res = await fetch(process.env.REACT_APP_api_url,{credentials: "include"})
        const {status, user} = await res.json()
        if(status){
            fetch(`${process.env.REACT_APP_followers}`,{
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
    return (

        <div className="w-[100%] min-h-[100%]  bg-cover bg-no-repeat bg-center text-white" style={{backgroundImage:`linear-gradient(105deg, #0d0d0d, rgba(0,0,0,0.75), #000, rgba(0,0,0,0.56)),url(${getBackground()})`,backgroundPosition:"0% 40%"}}>
            {
                windowWidth > 800 ? 
                <div className="w-[20%] absolute h-[100%] border-r-[3px] border-[#2E2E3A]" style={{background:"linear-gradient(85deg, rgba(13, 13, 13, 0.75), rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.56), rgba(0, 0, 0, 0.45))"}}>
                    <NAVBAR/>
                </div>
                :
                <MOBILE/>
            }
            <div className={windowWidth > 800 ? "w-[80%] duration-100 min-h-[100%] ml-[20%] flex flex-col":"w-[98%] mx-[1%] duration-100 min-h-[100%] flex flex-col"}>
            {
                series && movies && person && images ?
                <>
                    <div className="w-[100%]">
                        <div className="w-[90%] ml-[5%] h-[60%] text-justify justify-center items-center">
                            <div className="w-[40%] min-h-[300px] m-[1%] float-left">
                                <PICTURE picture={person.profile_path} classes={"object-contain h-[100%] shadow-lg shadow-blue-500/50"} />
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
                        </div>
                                <div className={windowWidth > 800 ? "w-[90%] min-h-[100%] ml-[5%] flex flex-col":"w-[100%] min-h-[100%] flex flex-col"}>
                                    {

                                        ((series.cast && series.cast.length > 0) || (series.crew && series.crew.length > 0)) &&
                                            <div className="w-[100%] h-[auto] text-left flex flex-wrap flex-col">
                                                <h1 className="my-t-[5%] text-[20px] text-[#ffd800]">TV</h1>
                                                {
                                                    series.cast && series.cast.length > 0 && 
                                                    <>
                                                        <h2>PLAYED AS CAST</h2> 
                                                        <div className={`w-[100%] duration-50 movie-scene ${windowWidth > 800 ? "h-[400px]" : "h-[300px]"} flex flex-col flex-wrap overflow-x-auto overflow-y-hidden my-[1%]`}>
                                                        {
                                                            series.cast && series.cast.map(({character,adult,backdrop_path,genre_ids,id,original_name,name,original_language,original_title,overview,popularity,poster_path,release_date,title,video,vote_average,vote_count},movie_key) => 
                                                                <NavLink key={movie_key} to={`/series/${id}`} className={windowWidth > 800 ? "w-[25%] h-[100%] hover:skew-4 hover:contrast-150":"w-[48%] hover:skew-4 h-[100%] m-[0.5%] hover:contrast-150"}>
                                                                    <div className="w-[100%] h-[100%]">
                                                                        <PICTURE key={id} classes={"object-cover h-[100%]"} picture={poster_path} />
                                                                        <div className="w-[100%] relative min-h-[60px] top-[-50%] bg-[#000000] bg-opacity-60 text-white flex flex-col items-center justify-center">
                                                                            <h2 className="text-[15px] font-bold">{name || original_name || title || original_title}</h2>
                                                                            <p style={{color:"#ffd800"}}><FontAwesomeIcon icon={faStar} /> { parseFloat(vote_average).toFixed(1) || parseFloat(popularity).toFixed(1) || vote_count}</p>
                                                                            <h2 style={{fontStyle:"italic"}}>{character}</h2>
                                                                        </div>
                                                                    </div>
                                                                </NavLink>
                                                            )
                                                        }
                                                        </div>
                                                    </>
                                                }

                                                {
                                                    series.crew && series.crew.length > 0 &&  
                                                    <>
                                                        <h2>PLAYED AS CREW</h2>
                                                        <div className={`w-[100%] duration-50 movie-scene ${windowWidth > 800 ? "h-[400px]" : "h-[300px]"} flex flex-col flex-wrap overflow-x-auto overflow-y-hidden my-[1%]`}>
                                                            {
                                                                series.crew && series.crew.map(({job,adult,backdrop_path,genre_ids,id,original_name,name,original_language,original_title,overview,popularity,poster_path,release_date,title,video,vote_average,vote_count},movie_key) => 
                                                                    <NavLink key={movie_key} to={`/series/${id}`} className={windowWidth > 800 ? "w-[25%] h-[100%] hover:skew-4 m-[0.5%] hover:contrast-150":"w-[48%] hover:skew-4 h-[100%] m-[0.5%] hover:contrast-150"}>
                                                                        <div className="w-[100%] h-[100%]">
                                                                            <PICTURE key={id} classes={"object-cover h-[100%]"} picture={poster_path} />
                                                                            <div className="w-[100%] relative min-h-[60px] top-[-50%] bg-[#000000] bg-opacity-60 text-white flex flex-col items-center justify-center">
                                                                                <h2 className="text-[15px] font-bold">{name || original_name || title || original_title}</h2>
                                                                                <p style={{color:"#ffd800"}}><FontAwesomeIcon icon={faStar} /> { parseFloat(vote_average).toFixed(1) || parseFloat(popularity).toFixed(1) || vote_count}</p>
                                                                                <h2 style={{fontStyle:"italic"}}>{job}</h2>
                                                                            </div>
                                                                        </div>
                                                                    </NavLink>
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
                                                    <div className={`w-[100%] duration-50 movie-scene ${windowWidth > 800 ? "h-[400px]" : "h-[300px]"} flex flex-col flex-wrap overflow-x-auto overflow-y-hidden my-[1%]`}>
                                                        {
                                                            movies.cast && movies.cast.map(({character,adult,backdrop_path,genre_ids,name,id,original_name,original_language,original_title,overview,popularity,poster_path,release_date,title,video,vote_average,vote_count},movie_key) => 
                                                                <NavLink key={movie_key} to={`/movies/${id}`} className={windowWidth > 800 ? "w-[25%] h-[100%] hover:skew-4 m-[0.5%] hover:contrast-150":"w-[48%] hover:skew-4 h-[100%] m-[0.5%] hover:contrast-150"}>
                                                                    <div className="w-[100%] h-[100%]">
                                                                        <PICTURE key={id} classes={"object-cover h-[100%]"} picture={poster_path} />
                                                                        <div className="w-[100%] relative min-h-[60px] top-[-50%] bg-[#000000] bg-opacity-60 text-white flex flex-col items-center justify-center">
                                                                            <h2 className="text-[15px] font-bold">{original_name || name || title || original_title}</h2>
                                                                            <p style={{color:"#ffd800"}}><FontAwesomeIcon icon={faStar} /> { parseFloat(vote_average).toFixed(1) || parseFloat(popularity).toFixed(1) || vote_count}</p>
                                                                            <h2 style={{fontStyle:"italic"}}>{character}</h2>
                                                                        </div>
                                                                    </div>
                                                                </NavLink>
                                                            )
                                                        }
                                                    </div>
                                                </>
                                            }
                                            {
                                                movies.crew && movies.crew.length > 0 && 
                                                <>
                                                    <h2>PLAYED AS CREW</h2>
                                                    <div className={`w-[100%] duration-50 movie-scene ${windowWidth > 800 ? "h-[400px]" : "h-[300px]"} flex flex-col flex-wrap overflow-x-auto overflow-y-hidden my-[1%]`}>
                                                        {
                                                            movies.crew && movies.crew.map(({job,adult,backdrop_path,genre_ids,id,original_language,name,original_name,original_title,overview,popularity,poster_path,release_date,title,video,vote_average,vote_count},movie_key) => 
                                                                <NavLink key={movie_key} to={`/movies/${id}`} className={windowWidth > 800 ? "w-[25%] h-[100%] hover:skew-4 hover:contrast-150":"w-[48%] hover:skew-4 h-[100%] m-[0.5%] hover:contrast-150"}>
                                                                    <div className="w-[100%] h-[100%]">
                                                                        <PICTURE key={id} classes={"object-cover h-[100%]"} picture={poster_path} />
                                                                        <div className="w-[100%] relative min-h-[60px] top-[-50%] bg-[#000000] bg-opacity-60 text-white flex flex-col items-center justify-center">
                                                                            <h2 className="text-[15px] font-bold">{original_name || name || title || original_title}</h2>
                                                                            <p style={{color:"#ffd800"}}><FontAwesomeIcon icon={faStar} /> { parseFloat(vote_average).toFixed(1) || parseFloat(popularity).toFixed(1) || vote_count}</p>
                                                                            <h2 style={{fontStyle:"italic"}}>{job}</h2>
                                                                        </div>
                                                                    </div>
                                                                </NavLink>
                                                            )
                                                        }
                                                    </div>
                                                </>
                                            }

                                        </div>
                                    }
                                </div>
                            </div>
                            </>
                        :
                <LOAD/>
            }
        </div>
    </div>
    )
}

export default PERSON
import NAVBAR from "./nav"
import { NavLink, useParams } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import PICTURE from "../midlleware/picture";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlayCircle, faStar } from "@fortawesome/free-solid-svg-icons";
import { useLazyQuery, gql, useMutation } from '@apollo/client';
import LOAD from "../midlleware/load";
import MOBILE from "./mobileBar";
const EPISODE = () => {
    const { id, season, episode, background } = useParams();
    const [serie, setSerie] = useState(null);
    const [images,setImages] = useState(null)
    const [credits,setCredit] = useState(null)
    const [windowWidth, setWindowWidth] = useState(0);

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
        query Episode (
            $id: ID!
        ){
            episode(
                id:$id
            ) {

                adult
                backdrop_path
                episodes {
                    air_date
                    episode_number
                    episode_type
                    id
                    name
                    overview
                    production_code
                    runtime
                    season_number,
                    show_id
                    still_path
                    vote_average
                    vote_count

                }
                air_date
                id
                name
                overview
                popularity
                poster_path
                vote_average
                vote_count
                season_number
            }
        }
    `
    const [fetchEpisode,fetchedMovieData] = useLazyQuery(FETCH_MOVIE_QUERY,{
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
            if (data.addEpisode.success) {
                if(data.addEpisode.message === "already inserted")
                    console.log("episode inserting already started...")
                console.log("Movie successfully inserted into MySQL:", data.addEpisode.message);
                fetchedMovieData.refetch()
                .then(status => console.log(status,"status"))
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
    const [fetchCreditsData,fetchedCredits] = useLazyQuery(FETCH_CREDITS_QUERY,{
    // pollInterval: 500, // fetches new data at that interval
        notifyOnNetworkStatusChange: true,
    });

    const INSERT_CREDITS_MUTATION = gql`
        mutation AddCredits(
            $id:Int!
            $cast:[CAST_INPUT]
            $crew:[CREW_INPUT]
        ) {
            addCredits(
                id:$id
                cast:$cast
                crew:$crew
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
            console.log(error,"error")
            console.error("Error inserting credits into MySQL:", error.message);
        },
    });

    const graphImages = useCallback(async() => {
        try{

            async function freshFetch(){
                const response = await fetch(`${process.env.REACT_APP_movie_db}tv/${id}/season/${season}/episode/${episode}/images?api_key=${process.env.REACT_APP_api_key}`);
                const getImageData = await response.json();
                console.log(getImageData)
                mutateInsertImage({ variables: { meta_data : {
                    type:"tv",
                    season:season?parseInt(season):-1,
                    episode:episode?parseInt(episode):-1,
                    id:id?parseInt(id):-1
                }, data:{...getImageData} } });
                return {...getImageData}
            } 

            

            const fetched = await fetchImage({
                variables : {
                type:"tv",
                episode:episode?parseInt(episode):-1,
                season:season?parseInt(season):-1,
                id:id?parseInt(id):-1
            }})
            // console.log(fetched)
            if (fetched.data && fetched.data.image.success) {
                console.log("image cached data:", fetched.data);
                setImages(() => ({...fetched.data.image.data}))

            }else {
                const getImageData = await freshFetch()
                setImages(() => ({...getImageData}))
            }
        }catch(error){
            console.log(error)
            fetch(`${process.env.REACT_APP_movie_db}tv/${id}/season/${season}/episode/${episode}/images?api_key=${process.env.REACT_APP_api_key}`)
            .then(data => data.json())
            .then(data => setImages(() => ({...data})))
        }
    },[id, season, episode, fetchImage, mutateInsertImage])

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

        const fetched = await fetchEpisode({
            variables : { id, season, episode }})
        if (fetched.data && fetched.data.episode.air_date === null) {
            console.log("first time...")
            const tv = await freshFetch()
            setSerie(() => ({...tv}));
        }else if(fetched.data && fetched.data.episode.success){
            console.log("Using cached data:", fetched.data)
            setSerie(() => ({...fetched.data.episode}))
        }else {
            const tv = await freshFetch()
            setSerie(() => ({...tv}))
        }

    },[id, season, episode, fetchEpisode, mutateInsertTV])

    const fetchCredits = useCallback(async() => {
        async function freshFetch(){
            const response = await fetch(`${process.env.REACT_APP_movie_db}tv/${id}/season/${season}/episode/${episode}/aggregate_credits?api_key=${process.env.REACT_APP_api_key}`);
            const credits_data = await response.json();
            mutateInsertCredits({
                variables: {...credits_data,id:id?parseInt(id):0},
            });
            return {...credits_data}
        } 

        const current_date = new Date().toISOString().split("T")[0]
        const fetched = await fetchCreditsData({
            variables : { id:id?parseInt(id):0, date:current_date }})
        console.log(fetched)
        if(fetched.data && fetched.data.credits.success){
            console.log("Using cached data:", fetched.data);
            setCredit(() => ({...fetched.data.credits}));
        }else {
            const credits = await freshFetch()
            setCredit(() => ({...credits}));
        }
    },[id, season, episode, fetchCreditsData, mutateInsertCredits])

    useEffect(() => {
        graphImages()
    },[graphImages])

    useEffect(() => {
        fetchTV();
    }, [fetchTV]);

    useEffect(() => {
        fetchCredits();
    }, [fetchCredits]);

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };
        window.addEventListener("resize", handleResize);
        handleResize(); // Call it once to set the initial value
    },[])

    return (

        <div className="w-[100%] min-h-[100%]  bg-cover bg-no-repeat bg-center text-white" style={{backgroundImage:`linear-gradient(105deg, #0d0d0d, rgba(0,0,0,0.75), #000, rgba(0,0,0,0.56)),url(${process.env.REACT_APP_img_poster + "/" + background + ".jpg"})`,backgroundPosition:"0% 40%"}}>
            {
                windowWidth > 800 ? 
                <div className="w-[20%] h-[100%] absolute border-r-[3px] border-[#2E2E3A]" style={{background:"linear-gradient(85deg, #0d0d0d, rgba(0,0,0,0.75), #000, #0f111a)"}}>
                    <NAVBAR/>
                </div>
                :
                <MOBILE/>
            }
            <div className={windowWidth > 800 ? "w-[80%] min-h-[100%] ml-[20%] flex flex-col":"w-[98%] mx-[1%] min-h-[100%] flex flex-col"}>
                {
                    credits && serie && images ? 
                        <>
                        <div className={windowWidth > 800 ? "w-[100%] flex flex-row flex-wrap":"w-[100%] flex flex-col flex-wrap"}>
                            <div className={windowWidth > 800 ? "w-[37%] h-[auto]":"w-[100%] h-[300px]"}>
                                <PICTURE picture={serie.still_path} classes={"shadow-lg shadow-blue-500/50"} />
                            </div>
                            <div className={windowWidth > 800 ? "w-[61%] m-[1%] h-[60%] justify-center items-center":"w-[100%] h-auto"}>
                                <h1 className="text-[30px] text-[#ffd800]">{serie.name}</h1>
                                {/* <p style={{fontStyle:"italic",color:"#ffd800"}}>"{serie.tagline}"</p> */}
                                <h3>{serie.air_date}</h3>
                                <h3>season {serie.season_number} || episode {serie.episode_number}</h3>
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
                                <div className="w-[100%] flex flex-row flex-wrap">
                                    <NavLink
                                        to={`/series/video/series/${id}/${serie.season_number}/${serie.episode_number}/${background}`}
                                        className={windowWidth > 800 ? "text-[20px] w-[23%] text-center min-h-[40px] m-[1%] bg-[#000] border-[2px]" : "text-[20px] w-[98%] text-center min-h-[40px] m-[1%] bg-[#000] border-[2px]"}
                                    >
                                        trailors
                                    </NavLink>
                                    <NavLink
                                        to={`/series/stream/${serie.title || serie.original_title}`}
                                        className={windowWidth > 800 ? "text-[#ffd800] text-[20px] w-[23%] text-center min-h-[40px] m-[1%] bg-[#000] border-[2px]" : "text-[#ffd800] text-[20px] w-[98%] text-center min-h-[40px] m-[1%] bg-[#000] border-[2px]"}
                                    >
                                        play <FontAwesomeIcon icon={faPlayCircle} />
                                    </NavLink>
                                    <NavLink
                                        to={`/series/similar/series/${id}/${background}`}
                                        className={windowWidth > 800 ? "text-[20px] w-[23%] text-center min-h-[40px] m-[1%] bg-[#000] border-[2px]" : "text-[20px] w-[98%] text-center min-h-[40px] m-[1%] bg-[#000] border-[2px]"}
                                    >
                                        similar series
                                    </NavLink>
                                    <NavLink
                                        to={`/series/recommendations/series/${id}/${background}`}
                                        className={windowWidth > 800 ? "text-[20px] w-[23%] text-center min-h-[40px] m-[1%] bg-[#000] border-[2px]" : "text-[20px] w-[98%] text-center min-h-[40px] m-[1%] bg-[#000] border-[2px]"}
                                    >
                                        recommended series
                                    </NavLink>
                                </div>
                                {/* <div className="w-[100%] h-[100px] movie-scene overflow-x-auto flex flex-col flex-wrap">
                                    {
                                        serie?.episodes.map(({vote_average,name,episode_number},node) => 
                                            <NavLink
                                                to={`/series/season/${id}`}
                                                key={node}
                                                className={windowWidth > 800 ? "text-[#ffd800] text-[20px] w-[23%] text-center min-h-[40px] m-[1%] bg-[#000] border-[2px]" : "text-[#ffd800] text-[20px] w-[98%] text-center min-h-[40px] m-[1%] bg-[#000] border-[2px]"}
                                            >
                                                <p>{name}</p>
                                                <p>episode {episode_number}</p>
                                                <p style={{color:"#ffd800"}}><FontAwesomeIcon icon={faStar} /> {vote_average}</p>
                                            </NavLink>
                                        )
                                    }
                                </div> */}
                                <div className="w-[90%] ml-[1%] movie-scene flex flex-col h-[180px] overflow-x-auto overflow-y-hidden flex-wrap">
                                    {
                                        Object.entries(images).map(([key,value],node) => 
                                            value && typeof(value) === "object" && value.map(({file_path},index) => 
                                                <div className="m-[0.5%] min-w-[18%] h-[100%]" key={node + index}>
                                                    <PICTURE picture={file_path} classes={"object-cover"} />
                                                </div>
                                            )
                                        )
                                    }

                                </div>
                            </div>
                        </div>
                        {
                            credits.cast && credits.cast.length > 0 &&
                            <div className="w-[80%] h-[320px] mx-[10%] my-[2%]">

                                <h1 style={{textAlign:"left",textDecoration:"underline"}}>CASTS</h1>
                                <div className="w-[100%] movie-scene h-[300px] flex flex-col flex-wrap overflow-x-auto overflow-y-hidden">
                                    
                                    {
                                        credits.cast.map(({character,profile_path,popularity,original_name,name,media_type,known_for_department,id,gender,adult},serie_key) => 
                                            <NavLink key={serie_key} to={`/people/${id}`} className="w-[24%] h-[100%] m-[0.5%] hover:contrast-150">
                                                <div className="w-[100%] h-[100%]">
                                                    <PICTURE key={id} classes={"object-cover"} picture={profile_path} />
                                                    <div className="w-[100%] relative min-h-[60px] top-[-50%] bg-[#000000] bg-opacity-60 text-white flex flex-col items-center justify-center">
                                                        <h2 className="text-[15px] font-bold">{original_name || name}</h2>
                                                        <p style={{color:"#ffd800"}}><FontAwesomeIcon icon={faStar} /> {parseFloat(popularity).toFixed(2)}</p>
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
                            <div className="w-[80%] h-[320px] mx-[10%] my-[2%]">

                                <h1 style={{textAlign:"left",textDecoration:"underline"}}>CREW</h1>
                                <div className="w-[100%] movie-scene h-[300px] flex flex-col flex-wrap overflow-x-auto overflow-y-hidden">
                                    
                                    {
                                        credits.crew.map(({profile_path,popularity,job,original_name,name,media_type,known_for_department,id,gender,adult},serie_key) => 
                                            <NavLink key={serie_key} to={`/people/${id}`} className="max-w-[24%] h-[100%] m-[0.5%] hover:contrast-150">
                                                <div className="w-[100%] h-[100%]">
                                                    <PICTURE key={id} classes={"object-cover"} picture={profile_path} />
                                                    <div className="w-[100%] relative min-h-[60px] top-[-50%] bg-[#000000] bg-opacity-60 text-white flex flex-col items-center justify-center">
                                                        <h2 className="text-[15px] font-bold">{original_name || name}</h2>
                                                        <p style={{color:"#ffd800"}}><FontAwesomeIcon icon={faStar} /> {parseFloat(popularity).toFixed(2)}</p>
                                                        <h3>{job}</h3>
                                                    </div>
                                                </div>
                                            </NavLink>
                                        )
                                    }
                                </div>
                            </div>
                        }
                        {
                            credits.guest_stars && credits.guest_stars.length > 0 &&
                            <div className="w-[80%] h-[320px] mx-[10%] my-[2%]">

                                <h1 style={{textAlign:"left",textDecoration:"underline"}}>GUEST STARS</h1>
                                <div className="w-[100%] movie-scene h-[300px] flex flex-col flex-wrap overflow-x-auto overflow-y-hidden">
                                    
                                    {
                                        credits.guest_stars.map(({profile_path,popularity,character,original_name,name,media_type,known_for_department,id,gender,adult},serie_key) => 
                                            <NavLink key={serie_key} to={`/people/${id}`} className="max-w-[24%] h-[100%] m-[0.5%] hover:contrast-150">
                                                <div className="w-[100%] h-[100%]">
                                                    <PICTURE key={id} classes={"object-cover"} picture={profile_path} />
                                                    <div className="w-[100%] relative min-h-[60px] top-[-50%] bg-[#000000] bg-opacity-60 text-white flex flex-col items-center justify-center">
                                                        <h2 className="text-[15px] font-bold">{original_name || name}</h2>
                                                        <p style={{color:"#ffd800"}}><FontAwesomeIcon icon={faStar} /> {parseFloat(popularity).toFixed(2)}</p>
                                                        <h3>{character}</h3>
                                                    </div>
                                                </div>
                                            </NavLink>
                                        )
                                    }
                                </div>
                            </div>
                        }
                        </>
                    :
                        <LOAD/>
                    }
                </div>
            </div>

    )
}

export default EPISODE
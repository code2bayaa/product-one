import NAVBAR from "./nav"
import { NavLink, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import PICTURE from "../midlleware/picture";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDoubleRight, faEyeSlash, faStar } from "@fortawesome/free-solid-svg-icons";
import { useLazyQuery, gql, useMutation } from '@apollo/client';
import LOAD from "../midlleware/load";
import MOBILE from "./mobileBar";
const SEASON = () => {
    const { id, season, background } = useParams();
    const [serie, setSerie] = useState(null);
    const [images,setImages] = useState(null)
    const [credits,setCredit] = useState(null)
    const [windowWidth, setWindowWidth] = useState(0);

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

    const [mutateInsertImage, insertImage] = useMutation(gql`
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
        query Season (
            $id: ID!
        ){
            season(
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
    const [fetchSeason,fetchedMovieData] = useLazyQuery(FETCH_MOVIE_QUERY,{
        // pollInterval: 500, // fetches new data at that interval
        notifyOnNetworkStatusChange: true,
        // variables,
        // skip: !variables.page, // Skip query execution if variables are not set
    });

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

    const [mutateInsertTV] = useMutation(INSERT_MOVIE_MUTATION, {
        onCompleted: (data) => {
            if (data.addSeason.success) {
                if(data.addSeason.message === "already inserted")
                    console.log("season inserting already started...")
                console.log("Movie successfully inserted into MySQL:", data.addSeason.message);
                fetchedMovieData.refetch()
                .then(status => console.log(status,"status"))
            } else {
                console.error("Failed to insert movies into MySQL:", data.addSeason.message, data.addSeason.error);
            }
        },
        onError: (error) => {
            console.log(error,"error")
            console.error("Error inserting season into MySQL:", error.message);
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
            console.log(error,"error")
            console.error("Error inserting credits into MySQL:", error.message);
        },
    });

    const graphImages = async() => {
        try{

        async function freshFetch(){
            const response = await fetch(`${process.env.REACT_APP_movie_db}tv/${id}/season/${season}/images?api_key=${process.env.REACT_APP_api_key}`);
            const getImageData = await response.json();
            console.log(getImageData)
            mutateInsertImage({ variables: { meta_data : {
                type:"tv",
                season:season?parseInt(season):-1,
                episode:-1,
                id:id?parseInt(id):-1
            }, data:{...getImageData} } });
            return {...getImageData}
        } 

        

        const fetched = await fetchImage({
            variables : {
            type:"tv",
            episode:-1,
            season:season?parseInt(season):-1,
            id:id?parseInt(id):-1
        }})
        // console.log(fetched)
        if (fetched.data && fetched.data.image.success) {
            console.log("image cached data:", fetched.data);
            return setImages(() => ({...fetched.data.image.data}))

        }else {
            const getImageData = await freshFetch()
            return setImages(() => ({...getImageData}))
        }
    }catch(error){
        console.log(error)
        fetch(`${process.env.REACT_APP_movie_db}tv/${id}/season/${season}/images?api_key=${process.env.REACT_APP_api_key}`)
        .then(data => data.json())
        .then(data => setImages(() => ({...data})))
    }
    }

    const fetchTV = async() => {

        async function freshFetch(){
            const response = await fetch(`${process.env.REACT_APP_movie_db}tv/${id}/season/${season}?api_key=${process.env.REACT_APP_api_key}`);
            const data = await response.json();
            const newData = {...data }
            newData.episodes = newData.episodes.map(({crew,guest_stars,cast, ...rest}) => rest)

            console.log(newData,"new data")
            mutateInsertTV({
                variables: {
                    single : {...newData}
                },
            });
            return {...data}
        } 

        const fetched = await fetchSeason({
            variables : { id, season }})
        if (fetched.data && fetched.data.season.air_date === null) {
            console.log("first time...")
            const tv = await freshFetch()
            return setSerie(() => ({...tv}));
        }else if(fetched.data && fetched.data.season.success){
            console.log("Using cached data:", fetched.data);
            return setSerie(() => ({...fetched.data.season}));
        }else {
            const tv = await freshFetch()
            return setSerie(() => ({...tv}));
        }

    }

    const fetchCredits = async() => {
        async function freshFetch(){
            const response = await fetch(`${process.env.REACT_APP_movie_db}tv/${id}/season/${season}/aggregate_credits?api_key=${process.env.REACT_APP_api_key}`);
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
            return setCredit(() => ({...fetched.data.credits}));
        }else {
            const credits = await freshFetch()
            return setCredit(() => ({...credits}));
        }
    }

    useEffect(() => {
        graphImages()
    },[])

    useEffect(() => {
        fetchTV();
    }, []);

    useEffect(() => {
        fetchCredits();
    }, []);

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
        {
            credits && serie && images ? 
                    <div className={windowWidth > 800 ? "w-[80%] min-h-[100%] ml-[20%] flex flex-col":"w-[98%] mx-[1%] min-h-[100%] flex flex-col"}>
                        <div className={windowWidth > 800 ? "w-[100%] flex flex-row flex-wrap":"w-[100%] flex flex-col flex-wrap"}>
                            <div className={windowWidth > 800 ? "w-[37%] h-[auto]":"w-[100%] h-[300px]"}>
                                <PICTURE picture={serie.poster_path} classes={"shadow-lg shadow-blue-500/50"} />
                            </div>
                            <div className={windowWidth > 800 ? "w-[61%] m-[1%] h-[60%] justify-center items-center":"w-[100%] h-auto"}>
                                <h1 className="text-[30px] text-[#ffd800]">{serie.name}</h1>
                                {/* <p style={{fontStyle:"italic",color:"#ffd800"}}>"{serie.tagline}"</p> */}
                                <h3>{serie.air_date}</h3>
                                <h3>season {serie.season_number}</h3>
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
                                <div className={windowWidth > 800 ? "w-[100%] flex flex-row flex-wrap":"w-[100%] flex flex-col flex-wrap"}>
                                    <NavLink
                                        to={`/series/video/series/${id}/${serie.season_number}/${background}`}
                                        className={windowWidth > 800 ? "w-[23%] text-center min-h-[40px] m-[1%] bg-[#000] border-[2px]":"min-w-[23%] text-center min-h-[40px] m-[1%] bg-[#000] border-[2px]"}
                                    >
                                        trailors
                                    </NavLink>
                                    <NavLink
                                        to={`/series/similar/series/${id}/${background}`}
                                        className={windowWidth > 800 ? "w-[23%] text-center min-h-[40px] m-[1%] bg-[#000] border-[2px]":"min-w-[23%] text-center min-h-[40px] m-[1%] bg-[#000] border-[2px]"}
                                    >
                                        similar series
                                    </NavLink>
                                    <NavLink
                                        to={`/series/recommendations/series/${id}/${background}`}
                                        className={windowWidth > 800 ? "w-[23%] text-center min-h-[40px] m-[1%] bg-[#000] border-[2px]":"min-w-[23%] text-center min-h-[40px] m-[1%] bg-[#000] border-[2px]"}
                                    >
                                        recommended series
                                    </NavLink>
                                </div>
                                <div className="w-[100%] h-[100px] movie-scene overflow-x-auto flex flex-col flex-wrap">
                                    {
                                        serie?.episodes.map(({vote_average,name,episode_number,season_number},node) => 
                                            <NavLink
                                                to={`/series/${id}/${season_number}/${episode_number}/${background}`}
                                                key={node}
                                                className={windowWidth > 800 ? "w-[24%] h-[100%] m-[0.5%] hover:contrast-150":"w-[48%] h-[100%] m-[0.5%] hover:contrast-150"}
                                            >
                                                <p>{name}</p>
                                                <p>episode {episode_number}</p>
                                                <p style={{color:"#ffd800"}}><FontAwesomeIcon icon={faStar} /> {vote_average}</p>
                                            </NavLink>
                                        )
                                    }
                                </div>
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
                                        credits.cast.map(({roles,profile_path,popularity,original_name,name,media_type,known_for_department,id,gender,adult},serie_key) => 
                                            <NavLink key={serie_key} to={`/people/${id}`} className={windowWidth > 800 ? "w-[24%] h-[100%] m-[0.5%] hover:contrast-150":"w-[48%] h-[100%] m-[0.5%] hover:contrast-150"}>
                                                <div className="w-[100%] h-[100%]">
                                                    <PICTURE key={id} classes={"object-cover"} picture={profile_path} />
                                                    <div className="w-[100%] relative min-h-[60px] top-[-50%] bg-[#000000] bg-opacity-60 text-white flex flex-col items-center justify-center">
                                                        <h2 className="text-[15px] font-bold">{original_name || name}</h2>
                                                        <p style={{color:"#ffd800"}}><FontAwesomeIcon icon={faStar} /> {parseFloat(popularity).toFixed(2)}</p>
                                                        {
                                                            roles.map(({character,episode_count},node) => 
                                                                <div className="" key={node}>
                                                                    <h3 style={{fontStyle:"italic"}}>{character}</h3>
                                                                    <p>{episode_count} episodes</p>
                                                                </div>
                                                            )
                                                        }
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
                                        credits.crew.map(({profile_path,popularity,jobs,original_name,name,media_type,known_for_department,id,gender,adult},serie_key) => 
                                            <NavLink key={serie_key} to={`/people/${id}`} className={windowWidth > 800 ? "w-[24%] h-[100%] m-[0.5%] hover:contrast-150":"w-[48%] h-[100%] m-[0.5%] hover:contrast-150"}>
                                                <div className="w-[100%] h-[100%]">
                                                    <PICTURE key={id} classes={"object-cover"} picture={profile_path} />
                                                    <div className="w-[100%] relative min-h-[60px] top-[-50%] bg-[#000000] bg-opacity-60 text-white flex flex-col items-center justify-center">
                                                        <h2 className="text-[15px] font-bold">{original_name || name}</h2>
                                                        <p style={{color:"#ffd800"}}><FontAwesomeIcon icon={faStar} /> {parseFloat(popularity).toFixed(2)}</p>
                                                        {
                                                            jobs.map(({job,episode_count},node) => 
                                                                <div className="" key={node}>
                                                                    <h3>{job}</h3>
                                                                    <p>{episode_count} episodes</p>
                                                                </div>
                                                            )
                                                        }
                                                    </div>
                                                </div>
                                            </NavLink>
                                        )
                                    }
                                </div>
                            </div>
                        }
                        

                    </div>
                    :
                    <LOAD/>
                }
                </div>

    )
}

export default SEASON
import NAVBAR from "./nav"
import { NavLink, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import PICTURE from "../midlleware/picture";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlayCircle, faStar } from "@fortawesome/free-solid-svg-icons";
import { gql, useMutation, useLazyQuery } from '@apollo/client';
import LOAD from "../midlleware/load";
import MOBILE from "./mobileBar";

const MOVIE = () => {
    const { id } = useParams();
    const [movie, setMovie] = useState(null);
    const [images,setImages] = useState(null)
    const [credits,setCredit] = useState(null)
    const [windowWidth, setWindowWidth] = useState(0);
    // const [fetchedImage, setFetchedImage] = useState(null)
    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };
        window.addEventListener("resize", handleResize);
        handleResize(); // Call it once to set the initial value
    },[])
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
                $belongs_to_collection:MOVIE_COLLECTION_INPUT
                $production_companies:[MOVIE_PRODUCTION_COMPANIES_INPUT]
                $production_countries:[MOVIE_PRODUCTION_COUNTRIES_INPUT]
                $spoken_languages:[MOVIE_SPOKEN_LANGUAGES_INPUT]
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

        const graphImages = async() => {
            try{
                
            //     const fetchFresh = async() => {
            //         console.log("fetching fresh...")
            //         const response = await fetch(`${process.env.REACT_APP_movie_db}movie/${id}/images?api_key=${process.env.REACT_APP_api_key}`)
            //         const data = await response.json()
            //         return data
            //     }
            //     console.log(fetchImage)

            //     if (fetchImage.loading) console.log("fetching image Loading...");
            //     if (fetchImage.error){
            //         // console.log(fetchImage.error.message)
            //         const getImageData = await fetchFresh()
            //         setImages(() => ({...getImageData}))
            //     }else if(fetchImage.hasOwnProperty("data") && fetchImage.data){

            //         if(fetchImage.data.image.error === "no records found"){
            //             const getImageData = await fetchFresh()    
            //             console.log(getImageData)
                        
            //             mutateInsertImage({ variables: { meta_data : {
            //                 type:"movie",
            //                 season:-1,
            //                 episode:-1,
            //                 id:id?parseInt(id):-1
            //             }, data:{...getImageData} } })

            //         }else{
            //             //every other user --- most fetch
            //             console.log("ordinarily...")
            //             setImages(() => ({...fetchImage.data?.image?.data}))
            //         } 
            //     }else if(!fetchedImage){
            //         const getImageData = await fetchFresh()
            //         setImages(() => ({...getImageData}))
            //         console.log("first time fetching graph")
            //     }

            // }catch(err){
            //     console.log(err)
            //     fetch(`${process.env.REACT_APP_movie_db}movie/${id}/images?api_key=${process.env.REACT_APP_api_key}`)
            //     .then(data => data.json())
            //     .then(data => setImages(() => ({...data})))
            // }
            // setFetchedImage(true)

            async function freshFetch(){
                const response = await fetch(`${process.env.REACT_APP_movie_db}movie/${id}/images?api_key=${process.env.REACT_APP_api_key}`);
                const getImageData = await response.json();
                console.log(getImageData)
                mutateInsertImage({ variables: { meta_data : {
                    type:"movie",
                    season:-1,
                    episode:-1,
                    id:id?parseInt(id):-1
                }, data:{...getImageData} } });
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
                return setImages(() => ({...fetched.data.image.data}))
    
            }else {
                const getImageData = await freshFetch()
                return setImages(() => ({...getImageData}))
            }
        }catch(error){
            console.log(error)
            fetch(`${process.env.REACT_APP_movie_db}movie/${id}/images?api_key=${process.env.REACT_APP_api_key}`)
            .then(data => data.json())
            .then(data => setImages(() => ({...data})))
        }
    }

    const fetchMovie = async() => {

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
        if (fetched.data && fetched.data.single.runtime === null) {
            console.log("first time...")
            const movie = await freshFetch()
            return setMovie(() => ({...movie}));
        }else if(fetched.data && fetched.data.single.success){
            console.log("Using cached data:", fetched.data);
            return setMovie(() => ({...fetched.data.single}));
        }else {
            const movie = await freshFetch()
            return setMovie(() => ({...movie}));
        }
        
    }

    const fetchCredits = async() => {
        // const credits_response = await fetch(`${process.env.REACT_APP_movie_db}movie/${id}/credits?api_key=${process.env.REACT_APP_api_key}`);
        // const credits_data = await credits_response.json();
        // setCredit(() => ({...credits_data})); 
        // console.log(credits_data)
        async function freshFetch(){
            const response = await fetch(`${process.env.REACT_APP_movie_db}movie/${id}/credits?api_key=${process.env.REACT_APP_api_key}`);
            const credits_data = await response.json();
            console.log(credits_data)
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
      fetchMovie();
    }, []);

    useEffect(() => {
        fetchCredits();
    }, []);

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
            // console.log(value,"value")
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
        // console.log(path,path.substring(1),path.substring(1).substring(0,path.substring(1).length - 4))
        setFetchedImageBackgrounds(path.substring(1).substring(0,path.substring(1).length - 4))
        return process.env.REACT_APP_img_poster + path
    }
    return (
        <>
        {
            credits && movie && images ? 
                <div className="w-[100%] min-h-[100%]  bg-cover bg-no-repeat bg-center text-white" style={{backgroundImage:`linear-gradient(105deg, #0d0d0d, rgba(0,0,0,0.75), #000, rgba(0,0,0,0.56)),url(${getBackground()})`,backgroundPosition:"0% 40%"}}>
                {
                    windowWidth > 800 ? 
                    <div className="w-[20%] absolute h-[100%] border-r-[3px] border-[#2E2E3A]" style={{background:"linear-gradient(85deg, #0d0d0d, rgba(0,0,0,0.75), #000, #0f111a)"}}>
                        <NAVBAR/>
                    </div>
                    :
                    <MOBILE/>
                }
                    <div className={windowWidth > 800 ? "w-[80%] min-h-[100%] ml-[20%] flex flex-col":"w-[98%] mx-[1%] min-h-[100%] flex flex-col"}>
                        <div className={windowWidth > 800 ? "w-[100%] flex flex-row flex-wrap":"w-[100%] flex flex-col flex-wrap"}>
                            <div className={windowWidth > 800 ? "w-[37%] h-[auto]":"w-[100%] h-[300px]"}>
                                <PICTURE picture={movie.poster_path} classes={"shadow-lg shadow-blue-500/50"} />
                            </div>
                            <div className={windowWidth > 800 ? "w-[61%] m-[1%] h-[60%] justify-center items-center":"w-[100%] h-auto"}>
                                <h1 className="text-[30px]">{movie.original_title || movie.title}</h1>
                                <p style={{fontStyle:"italic",color:"#ffd800"}}>"{movie.tagline}"</p>
                                <h3>{movie.release_date}</h3>
                                <h3>{movie.revenue}</h3>
                                <p style={{fontStyle:"italic"}}>{movie.status}</p>
                                {/* <h3>{movie.video ? "available":"not available"}</h3> */}
                                <h4>{ (movie.runtime > 60) ? Math.floor(movie.runtime / 60) + "h" + " " + movie.runtime % 60 + "min" : movie.runtime + "min" }</h4>
                                <article>
                                    {movie.overview}
                                </article>
                                <div className="w-[100%] flex flex-row flex-wrap">
                                    <NavLink
                                        to={`/movies/video/movies/${movie.id}/${fetchedImageBackgrounds}`}
                                        className={windowWidth > 800 ? "w-[23%] text-center min-h-[40px] m-[1%] bg-[#000] border-[2px]":"min-w-[23%] text-center min-h-[40px] m-[1%] bg-[#000] border-[2px]"}
                                    >
                                        trailors
                                    </NavLink>
                                    <NavLink
                                        to={`/movies/stream/${movie.title || movie.original_title}`}
                                        className={windowWidth > 800 ? "w-[23%] text-center min-h-[40px] m-[1%] bg-[#000] border-[2px]":"min-w-[23%] text-center min-h-[40px] m-[1%] bg-[#000] border-[2px]"}
                                    >
                                        play <FontAwesomeIcon icon={faPlayCircle} />
                                    </NavLink>
                                    <NavLink
                                        to={`/movies/similar/movies/${movie.id}/${fetchedImageBackgrounds}`}
                                        className={windowWidth > 800 ? "w-[23%] text-center min-h-[40px] m-[1%] bg-[#000] border-[2px]":"min-w-[23%] text-center min-h-[40px] m-[1%] bg-[#000] border-[2px]"}
                                    >
                                        similar movies
                                    </NavLink>
                                    <NavLink
                                        to={`/movies/recommendations/movies/${movie.id}/${fetchedImageBackgrounds}`}
                                        className={windowWidth > 800 ? "w-[23%] text-center min-h-[40px] m-[1%] bg-[#000] border-[2px]":"min-w-[23%] text-center min-h-[40px] m-[1%] bg-[#000] border-[2px]"}
                                    >
                                        recommended movies
                                    </NavLink>
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
                                {/* <SWEETPAGE intitializeMovies={intitializeMovies} page={page} index={{index,api,page}} total_pages={total_pages}/> */}

                                <div className="w-[100%] movie-scene h-[300px] flex flex-col flex-wrap overflow-x-auto overflow-y-hidden">
                                    
                                    {
                                        credits.cast.map(({character,profile_path,popularity,original_name,name,media_type,known_for_department,id,gender,adult},movie_key) => 
                                            <NavLink key={movie_key} to={`/people/${id}`} className={windowWidth > 800 ? "w-[24%] h-[100%] m-[0.5%] hover:contrast-150":"w-[48%] h-[100%] m-[0.5%] hover:contrast-150"}>
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
                                        credits.crew.map(({job,profile_path,popularity,original_name,name,media_type,known_for_department,id,gender,adult},movie_key) => 
                                            <NavLink key={movie_key} to={`/people/${id}`} className={windowWidth > 800 ? "w-[24%] h-[100%] m-[0.5%] hover:contrast-150":"w-[48%] h-[100%] m-[0.5%] hover:contrast-150"}>
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

                    </div>
                </div>
            :
            <LOAD/>
        }
        </>

    )
}

export default MOVIE
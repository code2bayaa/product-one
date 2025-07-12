import { useEffect, useState, useCallback } from "react"
import NAVBAR from "./nav"
import PICTURE from "../midlleware/picture"
import { faArrowAltCircleDown, faArrowAltCircleUp, faStar, faEye } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
// import CONTROLLERS from "../midlleware/controllers"
import Carousel from "../midlleware/carousel";
import { NavLink } from "react-router-dom"
import SWEETPAGE from "../midlleware/pages"
import { gql, useMutation, useLazyQuery } from '@apollo/client';
import LOAD from "../midlleware/load"
import MOBILE from "./mobileBar";
import CryptoJS from "crypto-js";
import Slider from "react-slick";

const SERIES = () => {

    const [movies, setMovies] = useState(null)
    const [windowWidth, setWindowWidth] = useState(0);
    const [countries, setCountries] = useState(null)
    const [country, setCountry] = useState(null)
    const [reveal, setReveal] = useState(false)
    const [themes, setThemes] = useState(null)    
    const FETCH_COUNTRIES = gql`
        query Region {
            region {
                date
                data {
                    iso_3166_1
                    english_name
                }
            }
        }

    `
    const [fetch_countries] = useLazyQuery(FETCH_COUNTRIES,{
        // pollInterval: 500, // fetches new data at that interval
        notifyOnNetworkStatusChange: true,
        // variables,
        // skip: !variables.page, // Skip query execution if variables are not set
    });

    useEffect(() => {
        const runCountries = async() => {
            const fetched = await fetch_countries()
            // console.log(fetched.data?.region?.data)
            const countries_data = fetched?.data?.region?.data || []
            setCountries(() => [...countries_data])
            
        }
       runCountries() 
    },[fetch_countries])

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
    useEffect(() => {
        const runLocale = async() => {
            const sendForm = async({url,options}) => {

                const response = await fetch(
                    url,
                    options,
                    {credentials:"initial"}
                )

                
                return await response.json()

            }            
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
            const country_code = user_location && user_location.length > 1 && user_location[2].country_code2 && user_location[2].country_code2
            setCountry(country_code)
        }

        runLocale()
    },[])    
    const FETCH_MOVIES_QUERY = gql`
        query Tv(
            $page: Int!,
            $genre : String!,
            $year : Int!,
            $region : String!,
            $language : String!,
            $index : String!,
            $date:String!,
            $hashedKey:String!
        ){
            tv(
                page:$page,
                genre:$genre,
                year:$year,
                region:$region,
                language:$language,
                index:$index,
                date:$date,
                hashedKey:$hashedKey
            ) {
                results {
                    adult
                    backdrop_path
                    genre_ids
                    id
                    origin_country
                    original_language
                    original_name
                    first_air_date
                    overview
                    popularity
                    poster_path
                    name 
                    vote_average
                    vote_count
                }
                page
                total_pages
                total_results                
                success
                error
                message
            }
        }
    `
    const [fetchMovies] = useLazyQuery(FETCH_MOVIES_QUERY,{
        // pollInterval: 500, // fetches new data at that interval
        notifyOnNetworkStatusChange: true,
        // variables,
        // skip: !variables.page, // Skip query execution if variables are not set
    });

    const INSERT_MOVIES_MUTATION = gql`
        mutation AddTVS(
            $page:Int!,
            $results:[ADD_TV_RESULTS_INPUT],
            $total_pages:Int!,
            $total_results:Int!,
            $data :TRACK_TV_DATA_INPUT,
            $type:String!,
            $hashedKey:String!
        ) {
            addTVS(
                page:$page,
                results:$results,
                total_pages:$total_pages,
                total_results:$total_results,
                data:$data,
                type:$type,
                hashedKey:$hashedKey
            ) {
                success
                message
            }
        }
    `;

    const [mutateInsertMovies] = useMutation(INSERT_MOVIES_MUTATION, {
        onCompleted: (data) => {
            if (data.addTVS.success) {
                if(data.addTVS.message === "already inserted")
                    console.log("tv inserting already started...")
                // fetchedMoviesData.refetch()
                // .then(status => console.log(status,"status"))
            } else {
                console.error("Failed to insert tv into MySQL:", data.addTVS.message, data.addTVS.error);
            }
        },
        onError: (error) => {
            console.error("Error inserting tv into MySQL:", error.message);
        },
    });

    const intitializeMovies = useCallback(async ({
        runContent,
        page,
        adjustable = false,
        genreId = '',
        regionId = '',
        languageId='',
        yearId=0
    }) => {
        
        const fetchMoviesFromAPI = async (actual_index) => {

            const current_date = new Date().toISOString().split("T")[0]
            const temp_movies = [
                // {"index":"discover","results":[],"api":"discover/tv",page:1,total_pages:0},
                {"index":"airing","results":[],"api":"tv/airing_today",page:1,total_pages:0},
                {"index":"trending","results":[],"api":"trending/tv/day",page:1,total_pages:0},
                {"index":"popular","results":[],"api":"tv/popular",page:1,total_pages:0},
                {"index":"top rated","results":[],"api":"tv/top_rated",page:1,total_pages:0},                
                {"index":"on air","results":[],"api":"tv/on_the_air",page:1,total_pages:0}
            ];
            const key = temp_movies.findIndex(({ index }) => index === actual_index);

            if (page) {
                temp_movies[key].page = page;
            }

            const hashed = temp_movies[key].page + genreId + regionId + languageId + yearId + actual_index + "tv"
            const hashedKey = CryptoJS.SHA256(hashed).toString();

            async function freshFetch(){
                // Fetch data from the API if not found in the cache
                const response = await fetch(
                    `${process.env.REACT_APP_movie_db}${temp_movies[key].api}?api_key=${process.env.REACT_APP_api_key}&language=en-US&page=${temp_movies[key].page}&with_genres=${genreId}&with_origin_country=${regionId}&sort_by=popularity.desc&with_original_language=${languageId}&primary_release_year=${yearId}`
                );
                const data = await response.json();

                // console.log(data)
                if (data.results.length > 0) {
                    temp_movies[key].results = [
                        ...temp_movies[key].results,
                        ...data.results,
                    ];
                    temp_movies[key].total_pages = data.total_pages;
                    temp_movies[key].total_results = data.total_results;

                    // Update the movies state
                    setMovies((prevMovies) => {
                        prevMovies = prevMovies || [];
                        const updatedMovies = [...prevMovies];
                        const existingIndex = updatedMovies.findIndex(
                            (movie) => movie.index === actual_index
                        );

                        if (existingIndex > -1) {
                            updatedMovies[existingIndex].results = [
                                // ...updatedMovies[existingIndex].results,
                                ...data.results,
                            ];
                        } else {
                            updatedMovies.push(temp_movies[key]);
                        }

                        return updatedMovies;
                    });


                    // Insert the fetched data into MySQL using the mutation
                    mutateInsertMovies({
                        variables: {
                            page:temp_movies[key].page,
                            results:data.results,
                            total_pages:data.total_pages,
                            total_results:data.total_results,
                            data :{
                                genre: genreId,
                                region: regionId,
                                language: languageId,
                                year: yearId,
                                index:actual_index,
                                date:current_date,
                            },
                            hashedKey,
                            type:"tv",
                        },
                    });

                    return true
                }
                return false
            }

            if(adjustable || genreId || regionId || languageId || yearId){
                const fetched = await fetchMovies({
                    variables : {
                    page: temp_movies[key].page,
                    genre: genreId,
                    region: regionId,
                    language: languageId,
                    year: yearId,
                    index: actual_index,
                    date: current_date,
                    hashedKey  
                }})
                console.log(fetched)

                if (fetched.data) {
                    console.log("Using cached data:", fetched.data);
                    if(fetched.data.tv.success && fetched.data.tv.results &&  fetched.data.tv.results.length < 20){
                        console.log("less items")
                        return await freshFetch()
                    }else if(fetched.data.tv.error === "insert tv" || fetched.data.tv.error === "no records found"){
                        console.log("no records found")
                        return await freshFetch()
                    }else{
                        console.log("finally using cached data")
                        setMovies((prevMovies) => {
                            prevMovies = prevMovies || [];
                            const updatedMovies = [...prevMovies]
                            const existingIndex = updatedMovies.findIndex(
                                (tv) => tv.index === actual_index
                            );

                            if (existingIndex > -1) {
                                updatedMovies[existingIndex].results = [
                                    // ...updatedMovies[existingIndex].results,
                                    ...fetched.data.tv.results,
                                ];
                            } else {
                                updatedMovies.push({
                                    index: actual_index,
                                    results: fetched.data.tv.results,
                                    page: fetched.data.tv.page,
                                    total_pages: fetched.data.tv.total_pages,
                                    total_results:fetched.data.tv.total_results
                                });
                            }

                            return updatedMovies;
                        });
                        return true
                    }

                } else {
                    return await freshFetch()
                }
            }

        };
        runContent.forEach((index) => {
            fetchMoviesFromAPI(index)
            .then(status => {
                if(!status){

                }
            })
        })
    },[fetchMovies,mutateInsertMovies])

    const intitializeMoviesInit = useCallback(async({
        runContent,
        page,
        adjustable = false,
        genreId = '',
        regionId = '',
        languageId='',
        yearId=0
    }) => {
        
        const fetchMoviesFromAPI = async (actual_index) => {

            const current_date = new Date().toISOString().split("T")[0]
            const temp_movies = [
                // {"index":"discover","results":[],"api":"discover/tv",page:1,total_pages:0},
                {"index":"airing","results":[],"api":"tv/airing_today",page:1,total_pages:0},
                {"index":"trending","results":[],"api":"trending/tv/day",page:1,total_pages:0},
                {"index":"popular","results":[],"api":"tv/popular",page:1,total_pages:0},
                {"index":"top rated","results":[],"api":"tv/top_rated",page:1,total_pages:0},                
                {"index":"on air","results":[],"api":"tv/on_the_air",page:1,total_pages:0}
            ];
            const key = temp_movies.findIndex(({ index }) => index === actual_index);

            if (page) {
                temp_movies[key].page = page;
            }

            const hashed = temp_movies[key].page + genreId + regionId + languageId + yearId + actual_index + "tv"
            const hashedKey = CryptoJS.SHA256(hashed).toString();

            async function freshFetch(){
                // Fetch data from the API if not found in the cache
                const response = await fetch(
                    `${process.env.REACT_APP_movie_db}${temp_movies[key].api}?api_key=${process.env.REACT_APP_api_key}&language=en-US&page=${temp_movies[key].page}&with_genres=${genreId}&with_origin_country=${regionId}&sort_by=popularity.desc&with_original_language=${languageId}&primary_release_year=${yearId}`
                );
                const data = await response.json();

                // console.log(data)
                if (data.results.length > 0) {
                    temp_movies[key].results = [
                        ...temp_movies[key].results,
                        ...data.results,
                    ];
                    temp_movies[key].total_pages = data.total_pages;
                    temp_movies[key].total_results = data.total_results;

                    // Update the movies state
                    setMovies((prevMovies) => {
                        prevMovies = prevMovies || [];
                        const updatedMovies = [...prevMovies];
                        const existingIndex = updatedMovies.findIndex(
                            (movie) => movie.index === actual_index
                        );

                        if (existingIndex > -1) {
                            updatedMovies[existingIndex].results = [
                                // ...updatedMovies[existingIndex].results,
                                ...data.results,
                            ];
                        } else {
                            updatedMovies.push(temp_movies[key]);
                        }

                        return updatedMovies;
                    });


                    // Insert the fetched data into MySQL using the mutation
                    mutateInsertMovies({
                        variables: {
                            page:temp_movies[key].page,
                            results:data.results,
                            total_pages:data.total_pages,
                            total_results:data.total_results,
                            data :{
                                genre: genreId,
                                region: regionId,
                                language: languageId,
                                year: yearId,
                                index:actual_index,
                                date:current_date,
                            },
                            hashedKey,
                            type:"tv",
                        },
                    });

                    return true
                }
                return false
            }

            if(adjustable || genreId || regionId || languageId || yearId){
                const fetched = await fetchMovies({
                    variables : {
                    page: temp_movies[key].page,
                    genre: genreId,
                    region: regionId,
                    language: languageId,
                    year: yearId,
                    index: actual_index,
                    date: current_date,
                    hashedKey  
                }})
                console.log(fetched)

                if (fetched.data) {
                    console.log("Using cached data:", fetched.data);
                    if(fetched.data.tv.success && fetched.data.tv.results &&  fetched.data.tv.results.length < 20){
                        console.log("less items")
                        return await freshFetch()
                    }else if(fetched.data.tv.error === "insert tv" || fetched.data.tv.error === "no records found"){
                        console.log("no records found")
                        return await freshFetch()
                    }else{
                        console.log("finally using cached data")
                        setMovies((prevMovies) => {
                            prevMovies = prevMovies || [];
                            const updatedMovies = [...prevMovies]
                            const existingIndex = updatedMovies.findIndex(
                                (tv) => tv.index === actual_index
                            );

                            if (existingIndex > -1) {
                                updatedMovies[existingIndex].results = [
                                    // ...updatedMovies[existingIndex].results,
                                    ...fetched.data.tv.results,
                                ];
                            } else {
                                updatedMovies.push({
                                    index: actual_index,
                                    results: fetched.data.tv.results,
                                    page: fetched.data.tv.page,
                                    total_pages: fetched.data.tv.total_pages,
                                    total_results:fetched.data.tv.total_results
                                });
                            }

                            return updatedMovies;
                        });
                        return true
                    }

                } else {
                    return await freshFetch()
                }
            }

        };
        runContent.forEach((index) => {
            fetchMoviesFromAPI(index)
            .then(status => {
                if(!status){

                }
            })
        })
    },[fetchMovies,mutateInsertMovies])     
    useEffect(() => {       
        intitializeMoviesInit(
            {runContent:[
            // "latest",
                "airing","trending",
                "popular",
                "top rated",
                "on air"
            ],
            adjustable:true
        })

    },[intitializeMoviesInit])

    useEffect(() => {
        const intitializeMoviesCountry = async() => {
            
            const current_date = new Date().toISOString().split("T")[0]
            const countryCode = country
            console.log(countryCode,"country")

            let setIndex = "uko_tv" + countryCode

            const hashed = setIndex + "movie"
            const hashedKey = CryptoJS.SHA256(hashed).toString();

            // console.log(current_date,"date")
            async function freshFetch(){
                // Fetch data from the API if not found in the cache
                const response = await fetch(
                    `${process.env.REACT_APP_movie_db}discover/tv?api_key=${process.env.REACT_APP_api_key}&with_origin_country=${countryCode}&sort_by=release_date.desc`
                );
                const data = await response.json();
                
                const themeResults = data?.results || []

                if (themeResults.length > 0) {

                    setThemes(() => [...themeResults.filter(({poster_path,backdrop_path}) => backdrop_path || poster_path)])

                    mutateInsertMovies({
                        variables: {
                            page:1,
                            results:data.results,
                            total_pages:data.total_pages,
                            total_results:data.total_results,
                            hashedKey,
                            data :{
                                genre: '',
                                region: '',
                                language: '',
                                year: 0,
                                index:setIndex,
                                date:current_date,
                                
                            },
                            type:"tv",
                                                
                        },
                    });

                    return true
                }
                return false
            }


            console.log(setIndex,"setIndex")
            const fetched = await fetchMovies({
                variables : {
                page: 1,
                data : {
                    genre: '',
                    year: '',
                    region: '',
                    language: '',  
                    index: setIndex,
                    date: current_date,
                    
                },
                hashedKey,
                type:"tv"
            }})
            console.log(fetched)
            
            if (fetched.data) {
                if(fetched.data.movie.success && fetched.data.movie.results &&  fetched.data.movie.results.length < 20){
                    console.log("less items")
                        return await freshFetch()
                }else if(fetched.data.movie.error === "insert movies" || fetched.data.movie.error === "no records found"){
                    console.log("no records found")
                        return await freshFetch()
                }else{
                    console.log("finally using cached data")
                        setThemes(() => [...fetched.data.movie.results.filter(({poster_path,backdrop_path}) => backdrop_path || poster_path)])

                    return true
                }

            } else {
                console.log("nothing")
                return await freshFetch()
            }
            
        }        
        console.log("country changed:" + country)
        intitializeMoviesCountry()
    },[country,fetchMovies,mutateInsertMovies])

    const settings = {
        // dots: true,
        infinite: true,
        autoplaySpeed: 5,
        speed:5000,
        swipeToSlide:true,
        draggable:true,
        slidesToShow: 5,
        slidesToScroll: 5,
        autoplay:true,
        arrows:false,
        pauseOnHover:true,
        dots:false,
        cssEase:"ease",
        responsive: [{

            breakpoint: 1024,
            settings: {
            slidesToShow: 5,
            infinite: true
            }
    
        }, {
    
            breakpoint: 600,
            settings: {
            slidesToShow: 1,
            dots: false
            }
    
        }, {
    
            breakpoint: 300,
            settings: "unslick" // destroys slick
    
        }]
    };


    const loadComponent = () => {

        if(themes && movies){
            return (
                <>
                    {
                        windowWidth > 800 ? 
                                
                        <div className="w-[100%] h-[80%] shadow" style={{boxShadow:"0 10px 30px rgba(0,0,0,0.7),0 0 60px rgba(0,0,0,0.5)"}}>
                            <Slider {...settings}>
                            {
                                themes && themes.map(({adult,backdrop_path,genre_ids,id,original_language,original_name,overview,popularity,poster_path,release_date,name,video,vote_average,vote_count},movie_key) => 
                                    
                                    <div className="w-[25%] h-[100%] hover:skew-4 contrast-150">
                                        <PICTURE key={id} classes={"object-cover float-left h-[100%]"} picture={poster_path || backdrop_path} />
                                        <div style={{boxShadow:"0 10px 30px rgba(0,0,0,0.7),0 0 60px rgba(0,0,0,0.5)"}} className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[90%] h-[60px] bg-[#000000] bg-opacity-60 text-white flex flex-col items-center justify-center z-10">
                                            <h2 className={windowWidth > 800 ? "text-[15px] font-bold":"text-[12px]"}>{name || original_name}</h2>
                                            <NavLink key={movie_key} to={`/series/${id}`} >
                                                <FontAwesomeIcon icon={faEye} /> read
                                            </NavLink>                                        
                                        </div>

                                    </div>
                                )
                            }
                            </Slider>                    
                        </div>
                    :
                    <div className="w-[100%] h-[80%] shadow" style={{
                    boxShadow:"inset 0 0 30px rgba(0,0,0,0.6),0 10px 30px rgba(0,0,0,0.7),0 0 60px rgba(0,0,0,0.5)",
                    //   overflow: "hidden",
                  }}>
                        {
                            themes.length > 0 && <Carousel type="series" mode="init" images={[...themes].sort((a,b) => b.vote_average > a.vote_average)}/>                       
                        }
                    </div>                 
                }
                <div className="w-[100%] mt-[1%]">
                    <button
                        type="button"
                        onClick={() => setReveal(!reveal)}
                        className={windowWidth > 800 ? "w-[40%] border-[#ffd800] border-[2px] m-[1%] rounded-xl" : "w-[100%] border-[#ffd800] border-[2px] rounded-xl"}
                    >
                        UKO: 
                        {country} 
                        {
                            reveal ? 
                                <FontAwesomeIcon icon={faArrowAltCircleUp}/>
                            :
                            <FontAwesomeIcon icon={faArrowAltCircleDown}/>
                        }
                    </button>
                    <NavLink
                        to="/discover/tv"
                        className={windowWidth > 800 ? "w-[60%] h-[60px] text-red-200 underline m-[1%] rounded-md" : "w-[100%] h-[60px] text-red-200 underline rounded-md"}
                    >
                        discover more tv shows
                    </NavLink>
                        <div className={`w-[100%] ${reveal ? "flex" : "hidden"} movie-scene h-[60px] overflow-x-auto text-white flex-col flex-wrap`}>
                            {
                                countries && countries.map(({english_name,iso_3166_1},index) => 
                                    <button
                                    type="button"
                                    className="border-[2px] h-[100%] mr-[1%] min-w-[15%]"
                                    onClick={() => setCountry(iso_3166_1)}
                                    key={index}
                                    >
                                        {english_name}
                                    </button>

                                )
                            }
                        </div>
                    </div>
                    {
                        movies && movies.map(({index,results,page,total_pages},node) =>
                            <div className={windowWidth > 800 ? "w-[90%] h-[auto] flex flex-wrap flex-col mx-[5%]" : "w-[100%] h-[auto] flex flex-wrap flex-col my-t-[5%]"} key={node}>
                                <h1 className="my-t-[5%]">{index}</h1>
                                <div className="w-[15%] h-[10px] border-r-[4px] bg-[#5A5A68]"></div>
                                <SWEETPAGE intitializeMovies={intitializeMovies} page={page} index={index} total_pages={total_pages}/>
                                <div className={`w-[100%] duration-50 movie-scene ${windowWidth > 800 ? "h-[400px]" : `${index === "popular" || index === "airing" ? "h-[100px]" : "h-[200px]"}`} flex flex-col flex-wrap overflow-x-auto overflow-y-hidden my-[1%]`}>
                                    {
                                        results.map(({adult,backdrop_path,genre_ids,id,name,original_name,original_language,original_title,overview,popularity,poster_path,release_date,title,video,vote_average,vote_count},movie_key) => 
                                            <NavLink key={movie_key} to={`/series/${id}`} className={windowWidth > 800 ? "w-[25%] h-[100%] hover:skew-4 hover:contrast-150":`${index === "popular" || index === "airing" ? "w-[50%]" :"w-[45%]"} hover:skew-4 h-[100%] hover:contrast-150`}>
                                                <div className="w-[100%] h-[100%]">
                                                    <PICTURE key={id} classes={"object-cover h-[100%]"} picture={poster_path} />
                                                    <div className="w-[100%] relative min-h-[60px] top-[-50%] bg-[#000000] bg-opacity-60 text-white flex flex-col items-center justify-center">
                                                        <h2 className={windowWidth > 800 ? "text-[15px] font-bold":"text-[11px]"}>{name || original_name}</h2>
                                                        <p style={{color:"#ffd800"}}><FontAwesomeIcon icon={faStar} /> { parseFloat(vote_average).toFixed(1) || parseFloat(popularity).toFixed(1) || vote_count}</p>
                                                        {/* <article className="text-[15px]">{overview}</article>
                                                        <p className="text-[15px]">Release Date: {release_date}</p>
                                                        <p className="text-[15px]">Vote Average: {vote_average}</p>
                                                        <p className="text-[15px]">Vote Count: {vote_count}</p> */}
                                                    </div>
                                                </div>
                                            </NavLink>
                                        )
                                    }
                                </div>
                            </div>

                        )  
                    }                              
                </>

            )
        }else{
        console.log("loading...")
            return (
            <>
                <LOAD/>
            </>
            )
        }
    }    
    return (
        <div className={`w-[100%] ${windowWidth > 800 ? "h-[100%]" : "h-[85%]"}  bg-cover bg-no-repeat bg-center text-white`} style={{background:"linear-gradient(65deg, #0d0d0d, rgba(0,0,0,0.75), #1c2a3b, #0f111a)"}}>
            {
                windowWidth > 800 ? 
                <div className="w-[20%] h-[100%] absolute border-r-[3px] border-[#2E2E3A]">
                    <NAVBAR/>
                </div>
                :
                <MOBILE/>
            }
            <div className={windowWidth > 800 ? "w-[80%] duration-100 h-[100%] overflow-y-auto movie-scene ml-[20%] flex flex-col":"w-[100%] overflow-y-auto movie-scene duration-150 h-[100%] flex flex-col"}>
                {/* <div className="w-[100%]">
                    <CONTROLLERS intitializeMovies={intitializeMovies} type={"tv"}/>
                </div> */}
                {loadComponent()}
            </div>
        </div>
    )
}
export default SERIES
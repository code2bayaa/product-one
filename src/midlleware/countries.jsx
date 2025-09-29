import { gql, useLazyQuery } from '@apollo/client';
import { useEffect, useState } from "react"
import Slider from "react-slick";
import Carousel from "../midlleware/carousel";
import PICTURE from "../midlleware/picture"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useNavigate } from "react-router-dom"
import { faArrowAltCircleDown, faArrowAltCircleUp, faEye } from "@fortawesome/free-solid-svg-icons"
import CryptoJS from "crypto-js";

const COUNTRIES = ({fetchMovies,mutateInsertMovies,mode}) => {
    const [windowWidth, setWindowWidth] = useState(0);
    const [country, setCountry] = useState(null)
    const [reveal, setReveal] = useState(false)
    const [themes, setThemes] = useState(null)
    const [countries, setCountries] = useState(null)
    const navigate = useNavigate();
  const navRoute = ({state,url}) => {
        navigate(url,{
            state : {
                ...state
            }
        })
    } 
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
            const country_code = user_location && user_location.length > 1 && user_location[2].country_code2 && user_location[2].country_code2
            setCountry(country_code)
        }

        runLocale()
    },[])
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
        // console.log(hasFetched)
        // if(hasFetchedCountries.current){
        //     return
        // } 
        // hasFetchedCountries.current = true
        // setFetched((prevFetched) => ({...prevFetched,countries:true}))  
        console.log("run countries")
        const runCountries = async() => {
            const fetched = await fetch_countries()
            // console.log(fetched.data?.region?.data)
            const countries_data = fetched?.data?.region?.data || []
            setCountries(() => [...countries_data])
            
        }
       runCountries() 
    },[fetch_countries])

    useEffect(() => { 
        console.log("country changed:" + country)
        const intitializeMoviesCountry = async() => {
            
            const current_date = new Date().toISOString().split("T")[0]
            const countryCode = country
            console.log(countryCode,"country")

            let setIndex = mode === "movie" ? "uko_movie" : "uko_tv" + countryCode

            const hashed = setIndex + "movie"
            const hashedKey = CryptoJS.SHA256(hashed).toString();

            // console.log(current_date,"date")
            async function freshFetch(){
                // Fetch data from the API if not found in the cache
                const response = await fetch(
                    `${process.env.REACT_APP_movie_db}discover/${mode}?api_key=${process.env.REACT_APP_api_key}&with_origin_country=${countryCode}&sort_by=release_date.desc`
                );
                const data = await response.json();
                
                const themeResults = data?.results || []

                if (themeResults.length > 0) {

                    setThemes(() => [...themeResults.filter(({poster_path,backdrop_path}) => poster_path || backdrop_path)])

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
                                type:mode,
                            },
                            type:mode,
                                                
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
                    year: 0,
                    region: '',
                    language: '',  
                    index: setIndex,
                    date: current_date,
                    type:mode
                },
                hashedKey
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
                        setThemes(() => [...fetched.data.movie.results.filter(({backdrop_path,poster_path}) => poster_path || backdrop_path)])

                    return true
                }

            } else {
                console.log("nothing")
                return await freshFetch()
            }
            
        } 
        intitializeMoviesCountry()
    },[country,fetchMovies,mutateInsertMovies,mode])

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
    return (
        <>
            {
                windowWidth > 800 ? 
                        
                    <div className="w-[100%] h-[80%] shadow" style={{boxShadow:"0 10px 30px rgba(0,0,0,0.7),0 0 60px rgba(0,0,0,0.5)"}}>
                        <Slider {...settings}>
                        {
                            themes && themes.map(({adult,backdrop_path,genre_ids,id,original_language,original_title,overview,popularity,poster_path,release_date,title,video,vote_average,vote_count,name,original_name},movie_key) => 
                                
                                <div className="w-[25%] h-[100%] hover:skew-4 contrast-150">
                                    <PICTURE key={id} classes={"object-cover float-left h-[100%]"} picture={poster_path || backdrop_path} />
                                    <div style={{boxShadow:"0 10px 30px rgba(0,0,0,0.7),0 0 60px rgba(0,0,0,0.5)"}} className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[90%] h-[60px] bg-[#000000] bg-opacity-60 text-white flex flex-col items-center justify-center z-10">
                                        <h2 className={windowWidth > 800 ? "text-[15px] font-bold":"text-[12px]"}>{title || original_title || name || original_name}</h2>
                                        <button key={movie_key} onClick={() => navRoute({
                                            url:mode === "tv" ? '/series/id' : '/movies/id',
                                            state:{
                                                id
                                            }
                                        })} >
                                            <FontAwesomeIcon icon={faEye} /> read
                                        </button>                                        
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
                        themes && themes.length > 0 && <Carousel type="movies" mode="init" images={[...themes].sort((a,b) => b.vote_average > a.vote_average)}/>                       
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
                <button
                    onClick={() => navRoute({
                        url:"/discover",
                        state:{
                            mode
                        }
                    })}
                    className={windowWidth > 800 ? "w-[60%] h-[60px] text-red-200 underline m-[1%] rounded-md" : "w-[100%] h-[60px] text-red-200 underline rounded-md"}
                >
                    discover more {mode==="movie"?"movies":"tv shows"}
                </button>
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
        </>
    )
}

export default COUNTRIES
import { useEffect, useState, useCallback, useRef } from "react"
import NAVBAR from "./nav"
// import PICTURE from "../midlleware/picture"
import { faStar } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
// import CONTROLLERS from "../midlleware/controllers"
import { NavLink, useNavigate } from "react-router-dom"
import SWEETPAGE from "../midlleware/pages"
import { gql, useMutation, useLazyQuery } from '@apollo/client';
import LOAD from "../midlleware/load"
import MOBILE from "./mobileBar";
import CryptoJS from "crypto-js";

const DISNEY = () => {

    // const [people, setPeople] = useState(null)
    const [movies, setMovies] = useState(null)
    const [windowWidth, setWindowWidth] = useState(0);
    const navigate = useNavigate();
    const hasFetched = useRef(false)

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

    const FETCH_MOVIES_QUERY = gql`
        query Movie (
            $page: Int!,
            $data:TRACK_DATA_OUTPUT,
            $hashedKey:String!
        ){
            movie(
                page:$page,
                data:$data,
                hashedKey:$hashedKey
            ) {
                results {
                    adult
                    backdrop_path
                    genre_ids
                    id
                    original_language
                    original_title
                    title
                    name
                    original_name
                    overview
                    popularity
                    poster_path
                    release_date
                    title
                    video 
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
        mutation AddMovies(
            $page:Int!,
            $results:[ADD_MOVIE_RESULTS_INPUT],
            $total_pages:Int!,
            $total_results:Int!,
            $data :TRACK_DATA_INPUT,
            $hashedKey:String!,
        ) {
            addMovies(
                page:$page,
                results:$results,
                total_pages:$total_pages,
                total_results:$total_results,
                data:$data,
                hashedKey:$hashedKey,
            ) {
                success
                message
            }
        }
    `;

    const [mutateInsertMovies] = useMutation(INSERT_MOVIES_MUTATION, {
        onCompleted: (data) => {
            console.log(data)
            if (data.addMovies.success) {
                if(data.addMovies.message === "already inserted")
                    console.log("movie inserting already started...")
                console.log("Movies successfully inserted into MySQL:", data.addMovies.message);
                // fetchedMoviesData.refetch()
            } else {
                console.error("Failed to insert movies into MySQL:", data.addMovies.message, data.addMovies.error);
            }
        },
        onError: (error) => {
            console.error("Error inserting movies into MySQL:", error.message);
        },
    });

    const intitializeMovies = useCallback(async({
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
                { index: "discover disney movie", results: [], api: "discover/movie", page: 1, total_pages: 0, type:"movie" },
                { index: "discover disney tv", results: [], api: "discover/tv", page: 1, total_pages: 0, type:"tv" },
                // { index: "discover disney person", results: [], api: "discover/person", page: 1, total_pages: 0 },
            ];
            const key = temp_movies.findIndex(({ index }) => index === actual_index);
            if (page) {
                temp_movies[key].page = page;
            }

            const hashed = temp_movies[key].page + actual_index
            const hashedKey = CryptoJS.SHA256(hashed).toString();
            // console.log(current_date,"date")
            async function freshFetch(){
                // Fetch data from the API if not found in the cache
                //8 is for disney
                const response = await fetch(
                    `${process.env.REACT_APP_movie_db}${temp_movies[key].api}?api_key=${process.env.REACT_APP_api_key}&language=en-US&page=${temp_movies[key].page}&with_genres=${genreId}&with_origin_country=${regionId}&sort_by=popularity.desc&with_original_language=${languageId}&primary_release_year=${yearId}&with_watch_providers=337&watch_region=US`
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
                                type:temp_movies[key].type,
                            },
                            hashedKey 
                        },
                    });

                    return true
                }
                return false
            }



            if(adjustable){
                const fetched = await fetchMovies({
                    variables : {
                    page: temp_movies[key].page,
                    data : {
                        genre: genreId,
                        year: yearId,
                        region: regionId,
                        language: languageId,  
                        index: actual_index,
                        date: current_date,
                        type:temp_movies[key].type
                    }, 
                    hashedKey 
                }})
                console.log(fetched)
                if (fetched.data) {
                    // console.log("Using cached data:", fetched.data);
                    if(fetched.data.movie.success && fetched.data.movie.results &&  fetched.data.movie.results.length < 20){
                        // console.log("less items")
                        return await freshFetch()
                    }else if(fetched.data.movie.error === "insert movies" || fetched.data.movie.error === "no records found"){
                        // console.log("no records found")
                        return await freshFetch()
                    }else{
                        // console.log("finally using cached data")
                        setMovies((prevMovies) => {
                            prevMovies = prevMovies || [];
                            const updatedMovies = [...prevMovies]
                            const existingIndex = updatedMovies.findIndex(
                                (movie) => movie.index === actual_index
                            );
        
                            if (existingIndex > -1) {
                                updatedMovies[existingIndex].results = [
                                    // ...updatedMovies[existingIndex].results,
                                    ...fetched.data.movie.results,
                                ];
                            } else {
                                updatedMovies.push({
                                    index: actual_index,
                                    results: fetched.data.movie.results,
                                    page: fetched.data.movie.page,
                                    total_pages: fetched.data.movie.total_pages,
                                    total_results:fetched.data.movie.total_results
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

            })
        })
    },[fetchMovies,mutateInsertMovies]);

    useEffect(() => {
        if(hasFetched.current){
            return
        }
        hasFetched.current = true        
        intitializeMovies(
            {runContent:[
            "discover disney movie",
            "discover disney tv"],
            adjustable:true
        })

    },[intitializeMovies])
  const navMovie = (id,url) => {
        navigate(url,{
            state : {
                id
            }
        })
    } 
    return (
        <div className="w-[100%] duration-250 h-[100%] text-white flex flex-row flex-wrap" style={{background:"linear-gradient(65deg, #0d0d0d, rgba(0,0,0,0.75), #1c2a3b, #0f111a)"}}>
            {
                windowWidth > 800 ? 
                <div className="w-[20%] absolute h-[100%] border-r-[3px] border-[#2E2E3A]">
                    <NAVBAR/>
                </div>
                :
                <MOBILE/>
            }
            <div className={windowWidth > 800 ? "w-[80%] movie-scene h-[100%] ml-[20%] overflow-y-auto flex flex-col":"w-[100%] movie-scene overflow-y-auto h-[92%] flex flex-col"}>
                {/* <div className="w-[100%]">
                    <CONTROLLERS intitializeMovies={intitializeMovies} type={"movie"}/>
                </div> */}
                {
                    movies ? movies.map(({index,results,page,total_pages},node) =>
                        <div className={windowWidth > 800 ? "w-[90%] h-[auto] flex flex-wrap flex-col mx-[5%]":"w-[100%] h-[auto] flex flex-wrap flex-col"} key={node}>
                            <h1 className="my-t-[5%]">{index}</h1>
                            <div className="w-[15%] h-[10px] border-r-[4px] bg-[#5A5A68]"></div>
                            <SWEETPAGE intitializeMovies={intitializeMovies} page={page} index={index} total_pages={total_pages}/>
                            <div className={`w-[100%] duration-50 movie-scene ${windowWidth > 800 ? "h-[400px]" : "h-[200px]"} flex flex-col flex-wrap overflow-x-auto overflow-y-hidden my-[1%]`}>
                                {
                                    results.map(({adult,backdrop_path,genre_ids,id,original_language,original_title,original_name,name,overview,popularity,poster_path,release_date,title,video,vote_average,vote_count},movie_key) => 
                                        <div 
                                            key={movie_key} 
                                            onClick={() => navMovie(id,name || original_name ? `/disney/serie` : `/disney/movie`)} 
                                            className={windowWidth > 800 ? "cursor-pointer w-[25%] h-[100%] hover:contrast-150":`${index === "popular" || index === "airing" ? "w-[50%]" :"cursor-pointer w-[45%]"} h-[100%] hover:contrast-150`}
                                        >
                                            <div 
                                                className="w-[100%] h-[100%] background"
                                                style={{
                                                    boxShadow:windowWidth > 800 ? "rgba(0,0,0,0.8) -20px -150px 130px inset, rgba(0, 0, 0, 0.7) 0px 100px 10px, rgba(0, 0, 0, 0.8) 100px 50px 10px" : "rgba(0, 0, 0, 0.9) -50px -70px 180px inset, rgba(0, 0, 0, 0.7) 0px 100px 10px, rgba(0, 0, 0, 0.8) 100px 50px 10px",

                                                    backgroundImage: `
                                                        linear-gradient(to bottom, rgba(0,0,0,0) 60%, rgba(0,0,0,0.85) 100%),
                                                        url(${process.env.REACT_APP_img_poster + poster_path})
                                                    `
                                                }}
                                            >
                                                <div className="relative top-[50%] left-1/2 transform -translate-x-1/2 w-[100%] min-h-[60px] bg-opacity-60 text-white flex flex-col items-center justify-center z-10">
                                                    <h2 className={windowWidth > 800 ? "text-[15px] font-bold":"text-[12px]"}>{title || original_title || name || original_name }</h2>
                                                    <p style={{color:"#ffd800"}}><FontAwesomeIcon icon={faStar} /> { parseFloat(vote_average).toFixed(1) || parseFloat(popularity).toFixed(1) || vote_count}</p>
                                                </div>
                                            </div>
                                        </div> 
                                    )
                                }
                            </div>
                        </div>

                    )
                    :
                    <LOAD/>
                }
            </div>
            <div className="w-[100%] h-[5%] flex flex-row bg-[#000]">
                <NavLink
                    to="/privacy"
                    className={"w-[25% m-[1%]"}
                >
                    Privacy
                </NavLink>
                <NavLink
                    to="/terms"
                    className={"w-[25% m-[1%]"}
                >
                    Terms
                </NavLink>
            </div>
        </div>
    )
}

export default DISNEY
import { useEffect, useState } from "react"
import NAVBAR from "./nav"
import PICTURE from "../midlleware/picture"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faStar } from "@fortawesome/free-solid-svg-icons"
import CONTROLLERS from "../midlleware/controllers"
import { NavLink } from "react-router-dom"
import SWEETPAGE from "../midlleware/pages"
import { useQuery, gql, useMutation, useLazyQuery, useApolloClient } from '@apollo/client';
import Swal from "sweetalert2"
import LOAD from "../midlleware/load"
import MOBILE from "./mobileBar";

const SERIES = () => {

    const [movies, setMovies] = useState([])
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
    const FETCH_MOVIES_QUERY = gql`
        query Tv(
            $page: Int!,
            $genre : String!,
            $year : Int!,
            $region : String!,
            $language : String!,
            $index : String!,
            $date:String!,
        ){
            tv(
                page:$page,
                genre:$genre,
                year:$year,
                region:$region,
                language:$language,
                index:$index,
                date:$date,
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
    const [fetchMovies,fetchedMoviesData] = useLazyQuery(FETCH_MOVIES_QUERY,{
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
        ) {
            addTVS(
                page:$page,
                results:$results,
                total_pages:$total_pages,
                total_results:$total_results,
                data:$data,
                type:$type,
            ) {
                success
                message
            }
        }
    `;

    const [mutateInsertMovies] = useMutation(INSERT_MOVIES_MUTATION, {
        onCompleted: (data) => {
            if (data.addTVS.success) {
                if(data.addTVS.message == "already inserted")
                    console.log("movie inserting already started...")
                fetchedMoviesData.refetch()
                .then(status => console.log(status,"status"))
            } else {
                console.error("Failed to insert movies into MySQL:", data.addTVS.message, data.addTVS.error);
            }
        },
        onError: (error) => {
            console.error("Error inserting movies into MySQL:", error.message);
        },
    });

    useEffect(() => {
        intitializeMovies(
            {runContent:[
            // "latest",
                "airing","trending","popular","top rated","discover","on air"
            ]
        })

    },[])

    const intitializeMovies = async ({
        runContent,
        page,
        genreId = '',
        regionId = '',
        languageId='',
        yearId=0
    }) => {
        
        const fetchMoviesFromAPI = async (actual_index) => {

            const current_date = new Date().toISOString().split("T")[0]
            async function freshFetch(){
                // Fetch data from the API if not found in the cache
                const response = await fetch(
                    `${process.env.REACT_APP_movie_db}${temp_movies[key].api}?api_key=${process.env.REACT_APP_api_key}&language=en-US&page=${temp_movies[key].page}&with_genres=${genreId}&with_origin_country=${regionId}&sort_by=popularity.desc&with_original_language=${languageId}&primary_release_year=${yearId}`
                );
                const data = await response.json();

                console.log(data)
                if (data.results.length > 0) {
                    temp_movies[key].results = [
                        ...temp_movies[key].results,
                        ...data.results,
                    ];
                    temp_movies[key].total_pages = data.total_pages;
                    temp_movies[key].total_results = data.total_results;

                    // Update the movies state
                    setMovies((prevMovies) => {
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
                            
                            type:"tv",
                        },
                    });

                    return true
                }
                return false
            }

            const temp_movies = [
                {"index":"discover","results":[],"api":"discover/tv",page:1,total_pages:0},
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

            const fetched = await fetchMovies({
                variables : {
                page: temp_movies[key].page,
                genre: genreId,
                region: regionId,
                language: languageId,
                year: yearId,
                index: actual_index,
                date: current_date,  
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
        };
        runContent.forEach((index) => {
            fetchMoviesFromAPI(index)
            .then(status => {
                if(!status){
                    Swal.fire({
                        title:"internet connection error",
                        text: "Please try again.",
                        icon: "error", // Set the icon to "error"
                        confirmButtonText: "OK",
                        
                    })
                }
            })
        })
    }

    return (
        <div className="w-[100%] h-[auto] text-white flex flex-row flex-wrap" style={{background:"linear-gradient(65deg, #0d0d0d, rgba(0,0,0,0.75), #000, #0f111a)"}}>
            {
                windowWidth > 800 ? 
                <div className="w-[20%] h-[100%] absolute border-r-[3px] border-[#2E2E3A]" style={{background:"linear-gradient(85deg, #0d0d0d, rgba(0,0,0,0.75), #000, #0f111a)"}}>
                    <NAVBAR/>
                </div>
                :
                <MOBILE/>
            }
            <div className={windowWidth > 800 ? "w-[80%] min-h-[100%] ml-[20%] flex flex-col":"w-[98%] mx-[1%] min-h-[100%] flex flex-col"}>
                <div className="w-[100%]">
                    <CONTROLLERS intitializeMovies={intitializeMovies} type={"tv"}/>
                </div>
                {
                    movies && movies.length > 0 ? movies.map(({index,results,page,total_pages},node) =>
                        <div className="w-[90%] h-[auto] flex flex-wrap flex-col mx-[5%]" key={node}>
                            <h1 className="my-t-[5%]">{index}</h1>
                            <div className="w-[15%] h-[10px] border-r-[4px] bg-[#5A5A68]"></div>
                            <SWEETPAGE intitializeMovies={intitializeMovies} page={page} index={index} total_pages={total_pages}/>
                            <div className="w-[100%] movie-scene h-[300px] flex flex-col flex-wrap overflow-x-auto overflow-y-hidden my-[1%]">
                                {
                                    results.map(({adult,backdrop_path,genre_ids,id,name,original_name,original_language,original_title,overview,popularity,poster_path,release_date,title,video,vote_average,vote_count},movie_key) => 
                                        <NavLink key={movie_key} to={`/series/${id}`} className={windowWidth > 800 ? "w-[24%] h-[100%] m-[0.5%] hover:contrast-150":"w-[48%] h-[100%] m-[0.5%] hover:contrast-150"}>
                                            <div className="w-[100%] h-[100%]">
                                                <PICTURE key={id} classes={"object-cover"} picture={poster_path} />
                                                <div className="w-[100%] relative min-h-[60px] top-[-50%] bg-[#000000] bg-opacity-60 text-white flex flex-col items-center justify-center">
                                                    <h2 className="text-[15px] font-bold">{name || original_name}</h2>
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
                    :
                    <LOAD/>
                }
            </div>
        </div>
    )
}
export default SERIES
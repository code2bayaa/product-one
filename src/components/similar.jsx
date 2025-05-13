import NAVBAR from "./nav"
import { NavLink, useParams } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import PICTURE from "../midlleware/picture";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Carousel from "../midlleware/carousel";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import SWEETPAGE from "../midlleware/pages";
import { gql, useMutation, useLazyQuery } from '@apollo/client';
import LOAD from "../midlleware/load";
import MOBILE from "./mobileBar";

const SIMILAR = () => {
    const { id, stream, background } = useParams();
    const [similar, setSimilar] = useState(null)
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

    const FETCH_MOVIE_QUERY = gql`
        query SimilarMovies(
            $id:ID!
            $page:Int!
            $type:String!
        ){
            similarMovies(
                id:$id
                page:$page
                type:$type
            ){
                page
                results {
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
                }
                total_pages
                total_results
                success
                error
                message
            }
        }
    `
    const [fetchMovie,fetchedMovieData] = useLazyQuery(FETCH_MOVIE_QUERY,{
        // pollInterval: 500, // fetches new data at that interval
        notifyOnNetworkStatusChange: true,
        // variables,
        // skip: !variables.page, // Skip query execution if variables are not set
    });

    const INSERT_MOVIE_MUTATION = gql`
        mutation addSimilarMovies(
            $page:Int!
            $id:ID!
            $results:[ADD_SIMILAR_MOVIE_RESULTS_INPUT]
            $total_results:Int!
            $total_pages:Int!
            $type:String!
        ){
            addSimilarMovies(
                page:$page
                id:$id
                results:$results
                total_pages:$total_pages
                total_results:$total_results
                type:$type
            ){
                success
                message
                error
            }
        }
    `;

    const [mutateInsertMovie] = useMutation(INSERT_MOVIE_MUTATION, {
        onCompleted: (data) => {
            if (data.addSimilarMovies.success) {
                if(data.addSimilarMovies.message === "already inserted")
                    console.log("movie inserting already started...")
                console.log("Movie successfully inserted into MySQL:", data.addSimilarMovies.message);
                fetchedMovieData.refetch()
                .then(status => console.log(status,"status"))
            } else {
                console.error("Failed to insert movies into MySQL:", data.addSimilarMovies.message, data.addSimilarMovies.error);
            }
        },
        onError: (error) => {
            console.error("Error inserting movies into MySQL:", error.message);
        },
    });

    const fetchMain = useCallback(async(page) => {
        try{

            const type = stream === "movies" ? "movie" : "tv"
            
            const api = `${process.env.REACT_APP_movie_db}${type}/${id}/similar?api_key=${process.env.REACT_APP_api_key}&page=${page || similar.page}`
            async function freshFetch(){
                const response = await fetch(`${api}`);
                const similar_data = await response.json();
                setSimilar(() => ({...similar_data})); 
                mutateInsertMovie({ variables: {
                    ...similar_data,
                    type,
                    page,
                    id:id?parseInt(id):-1
                }} );
                return {...similar_data}
            } 
    
            const fetched = await fetchMovie({
                variables : {
                    page,
                    type,
                    id:id?parseInt(id):-1
            }})
            console.log(fetched)
            if (fetched.data && fetched.data.similarMovies.success) {
                console.log("movies cached data:", fetched.data);
                setSimilar(() => ({...fetched.data.similarMovies}))
    
            }else {
                const similar_data = await freshFetch()
                setSimilar(() => ({...similar_data}))
            }
        }catch(error){
            console.log(error,"error")
            const api = `${process.env.REACT_APP_movie_db}${stream === "movies" ? "movie" : "tv"}/${id}/similar?api_key=${process.env.REACT_APP_api_key}&page=${page || similar.page}`
            fetch(`${api}`)
            .then(data => data.json())
            .then(data => setSimilar(() => ({...data})))
        }
    },[fetchMovie, similar.page, id, mutateInsertMovie, stream])

    useEffect(() => {
        fetchMain(1)
    },[fetchMain])

    const intitializeMovies = async({page}) => {
        fetchMain(page)
    }


    const getPoster = (n) => {
        let received = null
        while(!received){
            
            received = similar.results.length > 0 && similar.results[similar.results.length - n]?.poster_path
            n++
            if(n > 5)
                break
            // console.log(received,"received")
        }

        return received
    }

    return (
        
        <div className="w-[100%] min-h-[100%]  bg-cover bg-no-repeat bg-center text-white" style={{backgroundImage:`linear-gradient(105deg, #0d0d0d, rgba(0,0,0,0.75), #000, rgba(0,0,0,0.56)),url(${process.env.REACT_APP_img_poster + "/" + background + ".jpg"})`,backgroundPosition:"0% 40%"}}>
                {
                    windowWidth > 800 ? 
                    <div className="w-[20%] absolute h-[100%] border-r-[3px] border-[#2E2E3A]" style={{background:"linear-gradient(85deg, #0d0d0d, rgba(0,0,0,0.75), #000, #0f111a)"}}>
                        <NAVBAR/>
                    </div>
                    :
                    <MOBILE/>
                }
        {
            similar ? 
                <div className={windowWidth > 800 ? "w-[80%] min-h-[100%] ml-[20%] flex flex-col":"w-[98%] mx-[1%] min-h-[100%] flex flex-col"}>
                    <div className={windowWidth > 800 ? "w-[100%] h-[600px] flex flex-wrap flex-row":"w-[100%] h-[auto] flex flex-wrap flex-row"} style={{boxShadow:"0px 4px 10px #fff"}}>
                        <div className={windowWidth > 800 ? "w-[70%] h-[60%]": "w-[100%] h-[60%]"}>
                        {
                            similar.results.length > 2  &&<Carousel images={[...similar.results].sort((a,b) => b.vote_average > a.vote_average)}/>                       
                        }
                        </div>
                        <div className={windowWidth > 800 ? "w-[60%] h-[60%]": "w-[100%] h-[60%]"}>
                            <NavLink to={`/${stream}/${similar.results.length > 0 && similar.results[similar.results.length - 1].id}`} className="w-[100%] h-[100%] hover:contrast-150">
                                <PICTURE picture={getPoster(1)} classes={""} />
                            </NavLink>
                        </div>
                        <div className={windowWidth > 800 ? "w-[60%] h-[60%]": "w-[100%] h-[60%]"}>
                            <NavLink to={`/${stream}/${similar.results.length > 0 && similar.results[similar.results.length - 2].id}`} className="w-[100%] h-[100%] hover:contrast-150">
                                <PICTURE picture={getPoster(2)} classes={"object-cover bg-top"} />
                            </NavLink>
                        </div>
                        <div className={windowWidth > 800 ? "w-[60%] h-[60%]": "w-[100%] h-[60%]"}>
                            <NavLink to={`/${stream}/${similar.results.length > 0 && similar.results[similar.results.length - 3].id}`} className="w-[100%] h-[100%] hover:contrast-150">
                                <PICTURE picture={getPoster(3)} classes={"object-cover bg-top"} />
                            </NavLink>
                        </div>
                    </div>
                    <div className="w-[90%] movie-scene min-h-[320px] mx-[5%] my-[2%]">

                        <h1 style={{textAlign:"center",textDecoration:"underline"}}>SIMILAR {stream === "movies" ? "MOVIES" : "TV"}</h1>
                        <SWEETPAGE intitializeMovies={intitializeMovies} page={similar?.page} index={""} total_pages={similar?.total_pages}/>

                        <div className="w-[100%] movie-scene h-[300px] flex flex-col flex-wrap overflow-x-auto overflow-y-hidden">
                            
                            {
                                similar.results.map(({adult,backdrop_path,genre_ids,id,name,original_name,original_language,original_title,overview,popularity,poster_path,release_date,title,video,vote_average,vote_count},movie_key) => 
                                    <NavLink key={movie_key} to={`/${stream}/${id}`} className={windowWidth > 800 ? "w-[24%] h-[100%] m-[0.5%] hover:contrast-150":"w-[48%] h-[100%] m-[0.5%] hover:contrast-150"}>
                                        <div className="w-[100%] h-[100%]">
                                            <PICTURE key={id} classes={"object-cover"} picture={poster_path} />
                                            <div className="w-[100%] relative min-h-[60px] top-[-50%] bg-[#000000] bg-opacity-60 text-white flex flex-col items-center justify-center">
                                                <h2 className="text-[15px] font-bold">{name || original_name || title || original_title}</h2>
                                                <p style={{color:"#ffd800"}}><FontAwesomeIcon icon={faStar} /> { parseFloat(vote_average).toFixed(1) || parseFloat(popularity).toFixed(1) || vote_count}</p>
                                            </div>
                                        </div>
                                    </NavLink>
                                )
                            }
                        </div>
                    </div>
                </div>
                :
                <LOAD/>
                }
            </div>            
                
            

    )
}

export default SIMILAR
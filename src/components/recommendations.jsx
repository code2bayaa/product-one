import NAVBAR from "./nav"
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useCallback, useRef } from "react";
import PICTURE from "../midlleware/picture";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Carousel from "../midlleware/carousel";
import { faStar, faEye } from "@fortawesome/free-solid-svg-icons";
import SWEETPAGE from "../midlleware/pages";
import { gql, useMutation, useLazyQuery } from '@apollo/client';
import LOAD from "../midlleware/load";
import MOBILE from "./mobileBar";

const RECOMMENDATIONS = () => {
    // const { id, stream, background } = useParams();
    const hasFetched = useRef(false)
    const [recommendations, setRecommendations] = useState(null)
    const [windowWidth, setWindowWidth] = useState(0);
    const {state} = useLocation()
    const navigate = useNavigate()
    const id = state.id
    const stream = state.stream
    const background = state.background
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
        query recommendedMovies(
            $id:ID!
            $page:Int!
            $type:String!
        ){
            recommendedMovies(
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
    const [fetchMovie] = useLazyQuery(FETCH_MOVIE_QUERY,{
        notifyOnNetworkStatusChange: true,
    });

    const INSERT_MOVIE_MUTATION = gql`
        mutation addRecommendedMovies(
            $page:Int!
            $id:ID!
            $results:[ADD_RECOMMENDED_MOVIE_RESULTS_INPUT]
            $total_results:Int!
            $total_pages:Int!
            $type:String!
        ){
            addRecommendedMovies(
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
            if (data.addRecommendedMovies.success) {
                if(data.addRecommendedMovies.message === "already inserted")
                    console.log("movie inserting already started...")
                console.log("Movie successfully inserted into MySQL:", data.addRecommendedMovies.message);
                // fetchedMovieData.refetch()
                // .then(status => console.log(status,"status"))
            } else {
                console.error("Failed to insert movies into MySQL:", data.addRecommendedMovies.message, data.addRecommendedMovies.error);
            }
        },
        onError: (error) => {
            console.error("Error inserting movies into MySQL:", error.message);
        },
    });

    
    const fetchMain = useCallback(async(page,adjustable = false) => {
        try{
            
            const type = stream === "movies" ? "movie" : "tv"
            const api = `${process.env.REACT_APP_movie_db}${type}/${id}/recommendations?api_key=${process.env.REACT_APP_api_key}&page=${page}`
            async function freshFetch(){
                const response = await fetch(`${api}`);
                const recommendations_data = await response.json();
                setRecommendations(() => ({...recommendations_data})); 
                mutateInsertMovie({ variables: {
                    ...recommendations_data,
                    page,
                    type,
                    id:id?parseInt(id):-1
                }} );
                return {...recommendations_data}
            } 
            if(!recommendations || adjustable){
                const fetched = await fetchMovie({
                    variables : {
                        type,
                        page,
                        id:id?parseInt(id):-1
                }})
                // console.log(fetched)
                if (fetched.data && fetched.data.recommendedMovies.success) {
                    // console.log("movies cached data:", fetched.data);
                    setRecommendations(() => ({...fetched.data.recommendedMovies}))
        
                }else {
                    const recommendations_data = await freshFetch()
                    setRecommendations(() => ({...recommendations_data}))
                }
            }
        }catch(error){
            // console.log(error,"error")
            if(!recommendations){
                const api = `${process.env.REACT_APP_movie_db}${stream === "movies" ? "movie" : "tv"}/${id}/recommendations?api_key=${process.env.REACT_APP_api_key}&page=${page}`
                fetch(`${api}`)
                .then(data => data.json())
                .then(data => setRecommendations(() => ({...data})))
            }

        }
    },[fetchMovie, id, mutateInsertMovie, stream, recommendations])

    useEffect(() => {
        if(hasFetched.current){
            return
        }
        hasFetched.current = true
        fetchMain(1)
    },[fetchMain])

    const intitializeMovies = async({page}) => {
        console.log("clicked page",page)
        fetchMain(page)
    }

    const getPoster = (n) => {
        let received = null
        while(!received){
            
            received = recommendations.results.length > 0 && recommendations.results[recommendations.results.length - n]?.poster_path
            n++
            if(n > 5)
                break
            // console.log(received,"received")
        }

        return received
    }
    const navRoute = ({url,state}) => {
        navigate(url,{
            state : {
                ...state
            }
        })
    }
    return (
        <>

            <div className={`w-[100%] ${windowWidth > 800 ? "h-[100%]" : "h-[92%]"}  bg-cover bg-no-repeat bg-center text-white`} style={{backgroundImage:`linear-gradient(105deg, #0d0d0d, rgba(0,0,0,0.75), #000, rgba(0,0,0,0.56)),url(${process.env.REACT_APP_img_poster + "/" + background + ".jpg" || "/image/logo.png"})`,backgroundPosition:"0% 40%"}}>
            {
                windowWidth > 800 ? 
                <div className="w-[20%] absolute h-[100%] border-r-[3px] border-[#2E2E3A]" style={{background:"linear-gradient(85deg, rgba(13, 13, 13, 0.75), rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.56), rgba(0, 0, 0, 0.45))"}}>
                    <NAVBAR/>
                </div>
                :
                <MOBILE/>
            }
            <div className={windowWidth > 800 ? "w-[90%] duration-100 h-[100%] overflow-y-auto movie-scene ml-[10%] flex flex-col":"w-[98%] mx-[1%] h-[100%] overflow-y-auto movie-scene duration-100"}>
                {
                    recommendations ?
                    <> 
                    <div className={windowWidth > 800 ? "w-[100%] h-[auto] flex flex-wrap flex-row":"w-[100%] h-[auto]"} style={{boxShadow:"0px 4px 10px #fff"}}>
                        <div className={windowWidth > 800 ? "w-[60%] h-[50%]": "w-[100%] h-[25%]"}>
                            {
                                recommendations.results.length > 2  &&<Carousel type={stream} images={[...recommendations.results].sort((a,b) => b.vote_average > a.vote_average)}/>                       
                            }                        
                        </div>
                        <div className={windowWidth > 800 ? "w-[40%] h-[50%]": "w-[100%] h-[auto]"}>
                            <div 
                                onClick={() => navRoute({
                                    url:`/${stream}/id`,
                                    state:{
                                        id:recommendations.results.length > 0 && recommendations.results[recommendations.results.length - 1].id,
                                    }})} 
                                className="w-[100%] h-[100%] hover:contrast-150">
                                <PICTURE picture={getPoster(1)} classes={"h-[400px]"} />
                            </div>
                        </div>                        
                        <div className={windowWidth > 800 ? "w-[50%] h-[50%] flex flex-row": "w-[100%] h-[20%] flex flex-row"} style={{backgroundImage:"url(" + process.env.REACT_APP_img_poster + getPoster(2) + ")"}}>                            
                            <div
                                className="w-[40%] backdrop-blur-md h-[100%] hover:contrast-150">
                                <PICTURE picture={getPoster(2)} classes={"h-[65%] mt-[10%] w-[100%] object-contain"} />
                            </div>
                            <div
                                className="w-[59%] h-[100%] bg-gradient-to-b from-[rgba(0,0,0,0.75)] via-[rgba(0,0,0,0.65)] to-[rgba(0,0,0,0.80)]"
                            >
                                <article className="m-[1%]">
                                    {recommendations.results.length > 0 && recommendations.results[recommendations.results.length - 2].overview.substr(0,200)}...
                                </article>
                                <h2 className="m-[1%] text-[30px] text-[#ffd800]">{(recommendations.results.length > 0 && recommendations.results[recommendations.results.length - 2].name) || (recommendations.results.length > 0 && recommendations.results[recommendations.results.length - 2].title)}</h2>
                                <button
                                    onClick={() => navRoute({
                                        url:`/${stream}/id`,
                                        state:{
                                            id:recommendations.results.length > 0 && recommendations.results[recommendations.results.length - 2].id,
                                        }})} 
                                >
                                    <FontAwesomeIcon icon={faEye} /> watch
                                </button>
                            </div>
                        </div>
                        <div className={windowWidth > 800 ? "w-[50%] h-[50%] flex flex-row": "w-[100%] h-[20%] flex flex-row"} style={{backgroundImage:"url(" + process.env.REACT_APP_img_poster + getPoster(3) + ")"}}>                            
                            <div
                                className="w-[40%] backdrop-blur-md h-[100%] hover:contrast-150">
                                <PICTURE picture={getPoster(3)} classes={"h-[65%] mt-[10%] w-[100%] object-contain"} />
                            </div>
                            <div
                                className="w-[59%] h-[100%] bg-gradient-to-b from-[rgba(0,0,0,0.75)] via-[rgba(0,0,0,0.65)] to-[rgba(0,0,0,0.80)]"
                            >
                                <article className="m-[1%]">
                                    {recommendations.results.length > 0 && recommendations.results[recommendations.results.length - 3].overview.substr(0,200)}...
                                </article>
                                <h2 className="m-[1%] text-[30px] text-[#ffd800]">{(recommendations.results.length > 0 && recommendations.results[recommendations.results.length - 3].name) || (recommendations.results.length > 0 && recommendations.results[recommendations.results.length - 3].title)}</h2>
                                <button
                                    onClick={() => navRoute({
                                        url:`/${stream}/id`,
                                        state:{
                                            id:recommendations.results.length > 0 && recommendations.results[recommendations.results.length - 3].id,
                                        }})} 
                                >
                                    <FontAwesomeIcon icon={faEye} /> watch
                                </button>
                            </div>
                        </div>
                    </div>
                        <div className={windowWidth > 800 ? "w-[90%] movie-scene min-h-[320px] mx-[5%] my-[2%]":"w-[100%] movie-scene min-h-[220px] my-[2%]"}>

                            <h1 style={{textAlign:"center",textDecoration:"underline"}}>RECOMMENDED { stream === "movies" ? "MOVIES" : "TV"}</h1>
                            <SWEETPAGE intitializeMovies={intitializeMovies} page={recommendations?.page} index={"recommendation"} total_pages={recommendations?.total_pages}/>

                            <div className={`w-[100%] duration-50 movie-scene ${windowWidth > 800 ? "h-[400px]" : "h-[200px]"} flex flex-col flex-wrap overflow-x-auto overflow-y-hidden my-[1%]`}>
                                
                                {
                                    recommendations.results.map(({adult,backdrop_path,genre_ids,id,name,original_name,original_language,original_title,overview,popularity,poster_path,release_date,title,video,vote_average,vote_count},movie_key) => 
                                        <div 
                                            key={movie_key} 
                                            onClick={() => navRoute({
                                                url:`/${stream}/id`,
                                                state:{
                                                    id
                                                }})}  
                                            className={windowWidth > 800 ? "cursor-pointer w-[25%] h-[100%] hover:skew-4 hover:contrast-150":"cursor-pointer w-[45%] m-[1%] hover:skew-4 h-[100%] hover:contrast-150"}>
                                            <div className="w-[100%] h-[100%]">
                                                <PICTURE key={id} classes={"object-cover h-[100%]"} picture={poster_path} />
                                                <div className="w-[100%] relative min-h-[60px] top-[-50%] bg-[#000000] bg-opacity-60 text-white flex flex-col items-center justify-center">
                                                    <h2 className={windowWidth > 800 ? "text-[15px] font-bold":""}>{name || original_name || title || original_title}</h2>
                                                    <p style={{color:"#ffd800"}}><FontAwesomeIcon icon={faStar} /> { parseFloat(vote_average).toFixed(1) || parseFloat(popularity).toFixed(1) || vote_count}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }
                            </div>
                        </div>
                        </>
                        :
                        <LOAD/>
                    }

                </div>
            </div>            
                
            
        </>

    )
}

export default RECOMMENDATIONS
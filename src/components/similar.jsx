import { useMutation, useLazyQuery, useApolloClient } from '@apollo/client/react';
import { gql } from '@apollo/client';
import NAVBAR from "./nav"
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback, useRef } from "react";
import PICTURE from "../midlleware/picture";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Carousel from "../midlleware/carousel";
import { faStar, faEye, faPlay, faTvAlt } from "@fortawesome/free-solid-svg-icons";
import SWEETPAGE from "../midlleware/pages";
import LOAD from "../midlleware/load";
import MOBILE from "./mobileBar";
import { useKeys } from './safe';
const SIMILAR = () => {
    // const { id, stream, background } = useParams();
    const hasFetched = useRef(false)
    const [similar, setSimilar] = useState(null)
    const [windowWidth, setWindowWidth] = useState(0);
    const {state} = useLocation()
    const {safeKeys} = useKeys()
    const navigate = useNavigate()
    // const params = useSearchParams();
    // const state = JSON.parse(decodeURIComponent(params.get("state")));
    // const state = useStates("similar")
    const id = state.id
    const stream = state.stream
    const background = state.background
    // const router = useRouter();
    

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.screen.width);
        };
        window.addEventListener("resize", handleResize);
        handleResize(); // Call it once to set the initial value
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    },[])

    useEffect(() => {
        // Create the inline script
        const inlineScript = document.createElement("script");
        inlineScript.type = "text/javascript";
        inlineScript.text = "var infolinks_pid = 3436935; var infolinks_wsid = 0;";

        // Create the external script
        const externalScript = document.createElement("script");
        externalScript.type = "text/javascript";
        externalScript.src = "//resources.infolinks.com/js/infolinks_main.js";

        // Append both to the body
        document.body.appendChild(inlineScript);
        document.body.appendChild(externalScript);

        // Cleanup on unmount
        return () => {
            document.body.removeChild(inlineScript);
            document.body.removeChild(externalScript);
        };
    }, []);

    useEffect(() => {
        // Create the inline script
        const inlineScript = document.createElement("script");
        inlineScript.type = "text/javascript";
        inlineScript.crossorigin = "anonymous";
        inlineScript.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8036256488117651"
        inlineScript.async = true
        // Create the external script
        // const externalScript = document.createElement("script");
        // externalScript.type = "text/javascript";
        // externalScript.src = "//resources.infolinks.com/js/infolinks_main.js";

        // Append both to the body
        document.body.appendChild(inlineScript);
        // document.body.appendChild(externalScript);

        // Cleanup on unmount
        return () => {
            document.body.removeChild(inlineScript);
            // document.body.removeChild(externalScript);
        };
    }, []);

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
    const [fetchMovie] = useLazyQuery(FETCH_MOVIE_QUERY,{
        // pollInterval: 500, // fetches new data at that interval
        notifyOnNetworkStatusChange: true,
        fetchPolicy: 'cache-first',
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
                // fetchedMovieData.refetch()
                // .then(status => console.log(status,"status"))
            } else {
                console.error("Failed to insert movies into MySQL:", data.addSimilarMovies.message, data.addSimilarMovies.error);
            }
        },
        onError: (error) => {
            // Ignore abort-related network errors (they are expected when requests are cancelled)
            const isAbort = error && (
                error.name === 'AbortError' ||
                (error.networkError && error.networkError.name === 'AbortError') ||
                (typeof error.message === 'string' && /abort(ed)?/i.test(error.message))
            );
            if (isAbort) return;
            console.error("insert video Error:", error);
        },
    });

    const fetchMain = useCallback(async(page,adjustable = false) => {
        const type = stream === "movies" ? "movie" : "tv"
        try{
            const api = `${safeKeys.MOVIE_DB}${type}/${id}/similar?api_key=${safeKeys.API_KEY}&page=${page}`
            async function freshFetch(){
                const response = await fetch(`${api}`);
                const similar_data = await response.json();
                setSimilar(() => ({...similar_data})); 

                if(similar_data.total_results < 2){
                    mutateInsertMovie({ variables: {
                        ...similar_data,
                        type,
                        page,
                        id:id?parseInt(id):-1
                    }} );
                }

                return {...similar_data}
            } 
    
            if(!similar || adjustable){
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
            }

        }catch(error){
            console.log(error,"error")
            if(!similar){
                const api = `${safeKeys.MOVIE_DB}${type}/${id}/similar?api_key=${safeKeys.API_KEY}&page=${page}`
                fetch(`${api}`)
                .then(data => data.json())
                .then(data => setSimilar(() => ({...data})))
            }

        }
    },[fetchMovie, id, mutateInsertMovie, stream, similar])

    useEffect(() => {
        if(hasFetched.current){
            return
        }
        hasFetched.current = true
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
    const navRoute = ({url,state,ref}) => {
        navigate(url,{
            state : {
                ...state
            }
        })
    }
    return (
        
        <div className={`w-[100%] ${windowWidth > 800 ? "h-[100%]" : "h-[92%]"}  bg-cover bg-no-repeat bg-center text-white`} style={{backgroundImage:`linear-gradient(105deg, #0d0d0d, rgba(0,0,0,0.75), #000, rgba(0,0,0,0.56)),url(${safeKeys.IMG_POSTER + "/" + background + ".jpg" || "/image/logo.png"})`,backgroundPosition:"0% 40%"}}>
                {
                    windowWidth > 800 ? 
                    <div className="w-[20%] absolute h-[100%]" style={{background:"linear-gradient(85deg, rgba(13, 13, 13, 0.75), rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.56), rgba(0, 0, 0, 0.45))"}}>
                        <NAVBAR/>
                    </div>
                    :
                    <MOBILE/>
                }
        {
            similar && similar.total_results.length < 2 ? 
                <h1 className="ml-[15%]">No Similar Movies</h1>
            : similar ? 
                <div className={windowWidth > 800 ? "w-[90%] duration-100 h-[100%] overflow-y-auto movie-scene ml-[10%] flex flex-col":"w-[98%] overflow-y-auto movie-scene duration-150 mx-[1%] h-[100%] flex flex-col"}>
                    <div className={windowWidth > 800 ? "w-[100%] z-2 h-[auto] flex flex-wrap flex-row":"w-[100%] h-[auto] gap-1"} style={{boxShadow:"0px 4px 10px #fff"}}>
                        <div className={windowWidth > 800 ? "w-[60%] h-[50%]": "w-[100%] h-[25%]"}>
                            {
                                similar && similar.results && similar.results.length > 2  &&<Carousel type={stream} images={[...similar.results].sort((a,b) => b.vote_average > a.vote_average)}/>                       
                            }
                        </div>
                        <div className={windowWidth > 800 ? "w-[40%] h-[50%]": "w-[100%] h-[auto]"}>
                            <div 
                                onClick={() => navRoute({
                                    url:`/${stream}/id`,
                                    state:{
                                        id:similar && similar.results.length > 0 && similar.results[similar.results.length - 1].id,
                                    }})} 
                                className="w-[100%] h-[100%] hover:contrast-150">
                                <PICTURE picture={getPoster(1)} classes={"h-[400px]"} />
                            </div>
                        </div>
                        <div className={windowWidth > 800 ? "w-[50%] h-[50%] flex flex-row": "w-[100%] h-[20%] flex flex-row"} style={{backgroundImage:"url(" + safeKeys.IMG_POSTER + getPoster(2) + ")"}}>                            
                            <div
                                className="w-[40%] backdrop-blur-md h-[100%] hover:contrast-150">
                                <PICTURE picture={getPoster(2)} classes={"h-[65%] mt-[10%] w-[100%] object-contain"} />
                            </div>
                            <div
                                className="w-[59%] h-[100%] bg-gradient-to-b from-[rgba(0,0,0,0.75)] via-[rgba(0,0,0,0.65)] to-[rgba(0,0,0,0.80)]"
                            >
                                <article className="m-[1%]">
                                    {similar.results.length > 0 && similar.results[similar.results.length - 2].overview.substr(0,200)}...
                                </article>
                                <h2 className="m-[1%] text-[30px] text-[#ffd800]">{(similar.results.length > 0 && similar.results[similar.results.length - 2].name) || (similar.results.length > 0 && similar.results[similar.results.length - 2].title)}</h2>
                                <button
                                    onClick={() => navRoute({
                                        url:`/${stream}/id`,
                                        state:{
                                            id:similar.results.length > 0 && similar.results[similar.results.length - 2].id,
                                        }})} 
                                >
                                    <FontAwesomeIcon icon={faEye} /> watch
                                </button>
                            </div>
                        </div>
                        <div className={windowWidth > 800 ? "w-[50%] h-[50%] flex flex-row": "w-[100%] h-[20%] flex flex-row"} style={{backgroundImage:"url(" + safeKeys.IMG_POSTER + getPoster(3) + ")"}}>                            
                            <div
                                className="w-[40%] backdrop-blur-md h-[100%] hover:contrast-150">
                                <PICTURE picture={getPoster(3)} classes={"h-[65%] mt-[10%] w-[100%] object-contain"} />
                            </div>
                            <div
                                className="w-[59%] h-[100%] bg-gradient-to-b from-[rgba(0,0,0,0.75)] via-[rgba(0,0,0,0.65)] to-[rgba(0,0,0,0.80)]"
                            >
                                <article className="m-[1%]">
                                    {similar.results.length > 0 && similar.results[similar.results.length - 3].overview.substr(0,200)}...
                                    <div style={{overflow:"hidden",margin:"5px"}}>
                                        <ins
                                            className="adsbygoogle"
                                            style={{display:"block",width:"100%",height:"auto"}}
                                            data-ad-client="ca-pub-8036256488117651"
                                            data-ad-slot="1234567890"
                                            data-ad-format="auto"
                                            data-full-width-responsive="true"
                                        ></ins>
                                    </div>             
                                </article>
                                <h2 className="m-[1%] text-[30px] text-[#ffd800]">{(similar.results.length > 0 && similar.results[similar.results.length - 3].name) || (similar.results.length > 0 && similar.results[similar.results.length - 3].title)}</h2>
                                <button
                                    onClick={() => navRoute({
                                        url:`/${stream}/id`,
                                        state:{
                                            id:similar.results.length > 0 && similar.results[similar.results.length - 3].id,
                                        }})} 
                                >
                                    <FontAwesomeIcon icon={faEye} /> watch
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className={windowWidth > 800 ? "w-[90%] mx-[5%] my-[2%]":"w-[100%] my-[9%]"}>

                        <h1 style={{textAlign:"center",textDecoration:"underline"}}>SIMILAR {stream.toUpperCase()}</h1>
                        <SWEETPAGE intitializeMovies={intitializeMovies} page={similar?.page} index={""} total_pages={similar?.total_pages}/>

                        <div className={`w-[100%] my-[1%]`}>
                            
                            {
                            <div className={windowWidth > 800 ? `w-[100%] h-auto flex flex-row flex-wrap`: "w-[90%] flex flex-row flex-wrap mx-[5%]"}>
                                {
                                    similar.results.map(({adult,first_air_date,backdrop_path,genres,id,original_language,original_name,name,original_title,overview,popularity,poster_path,release_date,title,video,vote_average,vote_count},movie_key) => 
                                        <div 
                                            key={movie_key} 
                                            className={windowWidth > 800 ? "w-[31%] m-[0.5%] h-[250px] hover:skew-4 hover:contrast-150 flex flex-row":"w-[30%] m-[0.5%] hover:skew-4 h-[200px] hover:contrast-150"}
                                        >
                                            <div className={
                                                windowWidth > 800 ? "w-[45%] m-[1%]" 
                                                : "w-[100%] h-[160px] p-0"
                                                }
                                            >
                                                <PICTURE 
                                                    key={id} 
                                                    classes={`object-cover rounded-lg h-[100%] ${windowWidth > 800 ? "" : "rounded-xl"}`} 
                                                    picture={poster_path || backdrop_path} 
                                                />
                                            </div>
                                            {
                                                windowWidth > 800 ?
                                                    <div className="w-[50%] h-[100%]">
                                                        <h2 className={windowWidth > 800 ? "text-[18px] h-[10%] gradient-text font-bold":""}>{title || original_title || name || original_name }</h2>

                                                        <div className="w-[100%] h-[10%] flex">
                                                            <FontAwesomeIcon icon={faTvAlt}/>

                                                            |

                                                            <span style={{color:"#ffd800"}} className="text-[15px]" ><FontAwesomeIcon icon={faStar} /> { parseFloat(vote_average).toFixed(1) || parseFloat(popularity).toFixed(1) || vote_count}</span>

                                                            |
                                                            {(release_date && release_date.split("-")[0]) || (first_air_date && first_air_date.split("-")[0])}
                                                            {/* {console.log(genres)} */}
                                                        
                                                            {/* {genres && genres.length > 0 ? genres[0].name : "N/A"} */}
                                                        </div>
                                                        <article className="w-[100%] overflow-hidden h-[70%] text-[15px] relative bg-opacity-60 text-white flex flex-col items-center justify-center">
                                                            {overview.length > 150 ? overview.slice(0,150) + "..." : overview}
                                                        </article>
                                                        <button
                                                            onClick={() => navRoute({
                                                                url:name || original_name ? `/series/id` : `/movies/id`,
                                                                state:{
                                                                    id
                                                                }
                                                            })}
                                                            className="h-[10%] w-[70%] text-[#fff] bg-[#808C8C] rounded-md cursor-pointer"
                                                        >
                                                            <FontAwesomeIcon icon={faPlay} /> <span>play</span>
                                                        </button>
                                                    </div> 
                                                :
                                                    <div className="w-[100%] h-[40px]">
                                                        <button
                                                            onClick={() => navRoute({
                                                                url:name || original_name ? `/series/id` : `/movies/id`,
                                                                state:{
                                                                    id
                                                                }
                                                            })}
                                                            className="h-[100%] w-[100%] text-[#fff] bg-[#808C8C] rounded-md cursor-pointer"
                                                        >
                                                            <FontAwesomeIcon icon={faPlay} /> <span>play</span>
                                                        </button>                                                        
                                                    </div>
                                            }

                                        </div>
                                    )
                                }
                            </div> 
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
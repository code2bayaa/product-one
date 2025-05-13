import NAVBAR from "./nav"
import { useParams } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import Plyr from "plyr-react";
import { useQuery, gql, useMutation } from '@apollo/client';
import LOAD from "../midlleware/load";
import MOBILE from "./mobileBar";

const TRAILER = () => {
    const { id, stream, season, episode, background } = useParams();
    const [trailor, setTrailor] = useState(null)
    // const [videos,setTrailor] = useState(null)
    // const [player,setPlayer] = useState(null)
    // const [backgroundImg,setBackgroundImg] = useState(background)
    // const [fetchedVideoBackgrounds,setFetchedVideoBackgrounds] = useState(null)
    const [fetchedVideo, setFetchedVideo] = useState(null)
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
    const fetchVideo = useQuery(gql`
        query Video (
            $type: String!
            $season: Int!
            $episode: Int! 
            $id : Int! 
        ){
            video(
                type:$type,
                episode:$episode,
                season:$season,
                id:$id
            ) {
                data {
                    id
                    results {
                        key
                    }
                }
                success
                error
            }
        }
    `,{
        // pollInterval: 500, // fetches new data at that interval
        notifyOnNetworkStatusChange: true,
        variables : {
            type:stream === "series" ? "tv" : "movie",
            episode:episode ? parseInt(episode) : -1,
            season:season ? parseInt(season) : -1,
            id:id?parseInt(id):0
        }
    });

    const [mutateInsertVideo] = useMutation(gql`
        mutation AddVideo(
            $meta_data: VIDEO_META_DATA_INPUT!
            $data: VIDEO_DATA_INPUT!
        ) {
            addVideo(
                meta_data: $meta_data
                data: $data
            ){
                data {
                    id
                    results {
                        iso_639_1
                        iso_3166_1
                        name
                        key
                        site
                        size
                        type
                        official
                        published_at
                        id
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
            if (data && data.addVideo.success) {
                // Refetch the query to get updated data
                // console.log(fetchVideo)
                fetchVideo.refetch().then((refetched) => {
                    console.log(refetched)
                    const ref = refetched?.data?.video?.data || []
                    const typeGetVideoData = {...ref}
                    setTrailor(() => typeGetVideoData)
                })

            }
        },
        onError: (error) => {
            console.error("insert video Error:", error);
        },
    });

    const graphVideos = useCallback(async() => {
        if(fetchedVideo)
            return null
        try{
            
            const fetchFresh = async() => {
                const response = await fetch(`${process.env.REACT_APP_movie_db}${stream === "movies" ? "movie" : "tv"}/${id}${season && `/season/${season}`}${episode && `/episode/${episode}`}/videos?api_key=${process.env.REACT_APP_api_key}`)
                const data = await response.json()
                console.log("fresh trailors")
                return data
                
            }
            console.log(fetchVideo)

            if (fetchVideo.loading) console.log("fetching video Loading...");
            if (fetchVideo.error){
                console.log(fetchVideo.error.message)
                const getVideoData = await fetchFresh()
                setTrailor(() => ({...getVideoData}))
            }else{
                if(fetchVideo.hasOwnProperty("data") && fetchVideo.data){

                    if(fetchVideo.data.video.error === "no records found"){
                        const getVideoData = await fetchFresh()    
                        // console.log(getVideoData)
                        console.log("inserting...")
                        mutateInsertVideo({ variables: { meta_data : {
                            type:stream === "series" ? "tv" : "movie",
                            season:season ? parseInt(season) : -1,
                            episode:episode ? parseInt(episode) : -1,
                            id:id?parseInt(id):0
                        }, data:{...getVideoData} } })

                    }else{
                        //every other user --- most fetch
                        console.log("ordinarily...")
                        setTrailor(() => ({...fetchVideo.data?.video?.data}))
                    } 
                }else{
                    const getVideoData = await fetchFresh()
                    setTrailor(() => ({...getVideoData}))
                    console.log("error fetching graph")
                }
            }

        }catch(err){
            console.log(err)
            fetch(`${process.env.REACT_APP_movie_db}${stream === "movies" ? "movie" : "tv"}/${id}${season && `/season/${season}`}${episode && `/episode/${episode}`}/videos?api_key=${process.env.REACT_APP_api_key}`)
            .then(data => data.json())
            .then(data => setTrailor(() => ({...data})))
        }
        setFetchedVideo(true)
    },[mutateInsertVideo,fetchVideo,fetchedVideo,stream,id,season,episode])

    // const getBackground = () => {
    //     console.log(process.env.REACT_APP_img_poster + "/" + backgroundImg + ".jpg")
    //     return process.env.REACT_APP_img_poster + "/" + backgroundImg + ".jpg"
    // }

    useEffect(() => {

        // console.log(background,"background")
        graphVideos()

    },[fetchVideo,mutateInsertVideo,graphVideos])

    // useEffect(() => {
    //     // setPlayer(true)
    //     return () => setPlayer(true)
    // },[player])
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
            trailor ? 
                <div className={windowWidth > 800 ? "w-[80%] min-h-[100%] ml-[20%] flex flex-col":"w-[98%] mx-[1%] min-h-[100%] flex flex-col"}>
                    <div className="w-[100%] h-[500px]">
                        {
                            <Plyr
                                source={{
                                    type:"video",
                                    sources: [
                                    {
                                        src: trailor.hasOwnProperty("results") && trailor.results && trailor.results.length > 0 && trailor.results[0].key, // YouTube video ID
                                        provider: "youtube",
                                    },
                                    ],

                                }}
                                options= {{
                                    autoplay: true,
                                    muted: false,
                                    controls: ["play", "volume", "fullscreen"],
                                }}
                            />
                        }     
                    </div>
                    <div className="w-[90%] min-h-[320px] mx-[5%] my-[2%]">

                        <h1 style={{textAlign:"center",textDecoration:"underline"}}>{stream === "movies" ? "MOVIES" : "TV"} TRAILOR</h1>

                        <div className="w-[100%] movie-scene h-[300px] flex flex-col flex-wrap overflow-x-auto overflow-y-visible">
                            
                            {
                                trailor.results.length > 0 && trailor.results.map(({iso_639_1,iso_3166_1,name,key,site,size,integer,type,officialpublished_at,id},movie_key) => 
                                    <div className={windowWidth > 800 ? "w-[23%] h-[100%] m-[0.5%]":"w-[49%] h-[100%] m-[0.5%]"} key={movie_key}>
                                        {/* {console.log(key,"key")} */}
                                        {
                                            
                                            <Plyr
                                                source={{
                                                    type:"video",
                                                    sources: [
                                                    {
                                                        src: key, // YouTube video ID
                                                        provider: "youtube",
                                                    },
                                                    ],

                                                }}
                                                options= {{
                                                    autoplay: false,
                                                    muted: true,
                                                    controls: ["play", "volume", "fullscreen"],
                                                }}
                                            />
                                        }
                                    </div>
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

export default TRAILER
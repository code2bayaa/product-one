import { useQuery, gql, useMutation } from '@apollo/client';
import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Thumbs } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/thumbs";

const CLIPS = ({id,many=false,stream,season=false,episode=false,firstClip = false,node,random = false,updateClip}) => {
    const [trailor, setTrailor] = useState(null)
    // const [count, setCount] = useState(0)
    // const fetchedVideo = useRef(null)
    // const [fetchedVideo, setFetchedVideo] = useState(null)
    // const [windowWidth, setWindowWidth] = useState(0);

    // useEffect(() => {
    //     const handleResize = () => {
    //         setWindowWidth(window.innerWidth);
    //     };
    //     window.addEventListener("resize", handleResize);
    //     handleResize(); // Call it once to set the initial value
    //     return () => {
    //         window.removeEventListener("resize", handleResize);
    //     };
    // },[])

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
            type:stream,
            episode: episode?parseInt(episode):-1,
            season: season ? parseInt(season):-1,
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
            console.log(data)
            if (data && data.addVideo.success) {
            if (data.addVideo.success) {
                if(data.addVideo.error === "query error")
                    console.log("trailer inserting already started...")
                console.log("trailer successfully inserted into MySQL:", data.addVideo.message);

            } else {
                console.error("Failed to insert trailer into MySQL:", data.addVideo.message, data.addMovies.error);
            }

            }
        },
        onError: (error) => {
            console.error("insert video Error:", error);
        },
    });

    useEffect(() => {
        console.log("using effect")
        const fetchAndInsert = async () => {
            try {
                // fetchedVideo.current = true;
                // setCount((prev) => prev + 1)
                
                const fetchFresh = async () => {
                    const response = await fetch(`${process.env.REACT_APP_movie_db}${stream}/${id}${season && `/season/${season}`}${episode && `/episode/${episode}`}/videos?api_key=${process.env.REACT_APP_api_key}`);
                    const data = await response.json();
                    console.log("fresh trailors");
                    return data;
                };

                if (fetchVideo.loading) console.log("fetching video Loading...");

                let getVideoData;

                if (fetchVideo.error) {
                    console.log(fetchVideo.error.message);
                    getVideoData = await fetchFresh();
                } else if (fetchVideo.data && fetchVideo.data.video) {
                    if (fetchVideo.data.video.error === "no records found") {
                        getVideoData = await fetchFresh();
                        console.log("inserting...");
                    } else {
                        console.log("ordinarily...");
                        setTrailor(() => ({ ...fetchVideo.data?.video?.data }));
                        sessionStorage.setItem("trailer",true)
                        return; // Exit early, no need to insert
                    }
                }//remember **** it reloads multiple times - when data is blank do nothing
                //  else {
                //     getVideoData = await fetchFresh();
                //     console.log("error fetching graph");
                // }

                if (getVideoData) {
                    setTrailor(() => ({ ...getVideoData }));
                    mutateInsertVideo({
                        variables: {
                            meta_data: {
                                type: stream,
                                episode: episode ? parseInt(episode) : -1,
                                season: season ? parseInt(season) : -1,
                                id: id ? parseInt(id) : 0,
                            },
                            data: { ...getVideoData },
                        },
                    });
                    sessionStorage.setItem("trailer",true)
                }
            } catch (err) {
                console.log(err);
                try {
                    const response = await fetch(`${process.env.REACT_APP_movie_db}${stream}/${id}${season && `/season/${season}`}${episode && `/episode/${episode}`}/videos?api_key=${process.env.REACT_APP_api_key}`);
                    const data = await response.json();
                    setTrailor(() => ({ ...data }));
                    mutateInsertVideo({
                        variables: {
                            meta_data: {
                                type: stream,
                                episode: episode ? parseInt(episode) : -1,
                                season: season ? parseInt(season) : -1,
                                id: id ? parseInt(id) : 0,
                            },
                            data: { ...data },
                        },
                    });
                    sessionStorage.setItem("trailer",true)
                } catch (innerErr) {
                    console.error("Double fetch failed:", innerErr);
                }
            }
        };

        // if (!sessionStorage.getItem("trailer")) {
            fetchAndInsert();
        // }

    },[mutateInsertVideo,fetchVideo, stream, id, episode, season])

    // useEffect(() => {
    //     console.log(count)
    // },[count])

    useEffect(() => {
        if(firstClip && node === random && trailor && trailor.hasOwnProperty("results") && trailor.results && trailor.results.length > 0){
            console.log("first clip set")
            firstClip(`https://www.youtube.com/embed/${trailor.results[0].key}`)
        }
    },[trailor,firstClip, random, node,stream])

    const clipUpdate = (key) => {
        console.log("updating clip")
        updateClip(key)
        
    }

    return (
        <div className="w-[100%] h-[100%]">
            {
                many ? 
                    <Swiper
                        // onSwiper={setThumbsSwiper}
                        modules={[FreeMode, Thumbs]}
                        spaceBetween={10}
                        slidesPerView={4}
                        freeMode={true}
                        watchSlidesProgress={true}
                        className="cursor-pointer"
                    >
                        
                        {
                            trailor && trailor.hasOwnProperty("results") && trailor.results && trailor.results.length > 0 && trailor.results.map((vid, index) =>  
                                <SwiperSlide>
                                    <div className="w-[100%] h-[100%] cursor-pointer" style={{zIndex:40}} onClick={() => clipUpdate(`https://www.youtube.com/embed/${vid.key}`)} key={index}>
                                        <img
                                            width="100%"
                                            height="100%"
                                            src={`https://img.youtube.com/vi/${trailor.vid.key}/maxresdefault.jpg`} // Use a thumbnail instead of the iframe
                                            alt={trailor.vid.name}
                                            style={{ borderRadius: "3px", background: "#000", objectFit: "cover" }}
                                        />
                                    </div>
                                </SwiperSlide>
                            )                            
                        }
                        
                    </Swiper>
                :

                trailor && trailor.hasOwnProperty("results") && trailor.results && trailor.results.length > 0 &&    
                    <div className="w-[100%] h-[100%] cursor-pointer" style={{zIndex:40}} onClick={() => clipUpdate(`https://www.youtube.com/embed/${trailor.results[0].key}`)}>
                        <img
                            width="100%"
                            height="100%"
                            src={`https://img.youtube.com/vi/${trailor.results[0].key}/maxresdefault.jpg`} // Use a thumbnail instead of the iframe
                            alt={trailor.results[0].name}
                            style={{ borderRadius: "3px", background: "#000", objectFit: "cover" }}
                        />
                    </div>
                
            }     
        </div>
    )
}
export default CLIPS;
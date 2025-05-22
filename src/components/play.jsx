import NAVBAR from "./nav"
import { useParams } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { useQuery, gql, useMutation } from '@apollo/client';
import LOAD from "../midlleware/load";
import MOBILE from "./mobileBar";
import Swal from "sweetalert2";

const PLAY = () => {
    const { id, stream,  name, year, imdbId, season, episode, background } = useParams();
    // console.log("play",id,stream,name,year,imdbId,season,episode)
    const [play, setPlay] = useState([])
    const [fetchedPlay, setFetchedPlay] = useState(null)
    const [windowWidth, setWindowWidth] = useState(0)

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

    const fetchPlay = useQuery(gql`
        query Play (
            $type: String!
            $season: Int!
            $episode: Int! 
            $id : Int! 
        ){
            play(
                type:$type,
                episode:$episode,
                season:$season,
                id:$id
            ) {
                tokens {
                    title
                    link
                    seeders
                    leechers
                    size
                    dateUploaded
                    quality
                    imdbId
                    imdbLink
                    token
                }
                success
                error
            }
        }
    `,{
        // pollInterval: 500, // fetches new data at that interval
        notifyOnNetworkStatusChange: true,
        variables : {
            type:stream === "series" ? "tv" : stream === "season" ? "season" : stream === "episode" ? "episode" : "movie",
            episode:episode ? parseInt(episode) : -1,
            season:season ? parseInt(season) : -1,
            id:id?parseInt(id):-1
        }
    });

    const [mutateUpdatePlay] = useMutation(gql`
        mutation UpdatePlay(
            $tokens: [PLAY_DATA_INPUT!]
            $type: String!
            $season: Int!
            $episode: Int!
            $id : Int!
        ) {
            updatePlay(
                tokens: $tokens
                type: $type
                season: $season
                episode: $episode
                id: $id
            ){
                success
                error
            }
        }
    `,
    {
        onCompleted: (data) => {
            console.log(data.updatePlay,"before")
            if (data && data.updatePlay.success) {
                console.log(data.updatePlay,"after")
                fetchPlay.refetch().then((refetched) => {
                    const ref = refetched?.data?.play?.tokens || []
                    const typeGetPlayData = [...ref]
                    setPlay(() => typeGetPlayData)
                })
            }
        },
        onError: error => {
            console.error("insert video Error:", error);
        },
    });

    const fetchToken = useCallback(async() => {

        try{
            console.log(fetchedPlay,"fetchedPlay...")
            if(fetchedPlay){
                console.log(fetchedPlay,"fetchedPlay...")

            }else{
                const fetchFresh = async() => {
                    console.log({
                            name,
                            imdbId,
                            year,
                            season,
                            episode,
                            message:"fresh fetch"
                    })
                    const response = await fetch(`${process.env.REACT_APP_stream}`,{
                        method:"POST",
                        headers:{
                            "Content-Type":"application/json",
                            "Accept":"application/json"
                        },
                        body:JSON.stringify({
                            name,
                            imdbId,
                            year,
                            season,
                            episode
                        })
                    })
                    const {status, error, movies} = await response.json()
                    if(status){
                        console.log("fresh play")
                        return movies
                    }
                    Swal.fire({
                        icon: 'error',
                        title: 'fesh fetch Oops...',
                        text: error,
                        showConfirmButton: false,
                        timer: 3000
                    })
                    
                }
                console.log(fetchPlay)

                if (fetchPlay.loading) console.log("fetching token Loading...");
                if((!fetchPlay) || (fetchPlay && fetchPlay.error) || !fetchPlay.data || (fetchPlay && fetchPlay.hasOwnProperty("data") && fetchPlay.data && (fetchPlay.data.play.error === "no records found" || fetchPlay.data.play.error === "no token found"))){
                    const getToken = await fetchFresh()    
                    console.log("inserting...")
                    mutateUpdatePlay({ variables: {
                        type:stream === "series" ? "tv" : stream === "season" ? "season" : stream === "episode" ? "episode" : "movie",
                        season:season ? parseInt(season) : -1,
                        episode:episode ? parseInt(episode) : -1,
                        id:id?parseInt(id):-1,
                        tokens:getToken
                    }})

                }else{
                    //every other user --- most fetch
                    console.log("ordinarily...")
                    setPlay(() => ([...fetchPlay.data?.play?.tokens]))
                    
                } 
            }

        }catch(err){
            console.log(err)
            fetch(`${process.env.REACT_APP_stream}`,{
                method:"POST",
                headers:{
                    "Content-Type":"application/json",
                    "Accept":"application/json"
                },
                body:JSON.stringify({
                    name,
                    imdbId,
                    year
                })
            })
            .then(data => data.json())
            .then(data => {
                const {status, error, movies} = data
                if(status){
                    mutateUpdatePlay({ variables: {
                        type:stream === "series" ? "tv" : stream === "season" ? "season" : stream === "episode" ? "episode" : "movie",
                        season:season ? parseInt(season) : -1,
                        episode:episode ? parseInt(episode) : -1,
                        id:id?parseInt(id):-1,
                        tokens:movies
                    }})
                    return null
                }
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: error,
                    showConfirmButton: false,
                    timer: 1500
                })
            })
        }
        
    },[mutateUpdatePlay,fetchPlay,fetchedPlay,stream,id,season,episode,year,name,imdbId])

    useEffect(() => {
        //fetch token -- db > token
        //create server
        fetchToken()

    },[fetchToken])

    const runStream = async token => { 
        if (token) {
            const response = await fetch(`${process.env.REACT_APP_play}`,{
                method:"POST",
                headers:{
                    "Content-Type":"application/json",
                    "Accept":"application/json"
                },
                body:JSON.stringify({
                    token,
                    id,

                })
            })
            const {status, error, message, url, files} = await response.json()
            // /series/video/series/${id}/${serie.title || serie.original_title}/${serie.season_number}/${serie.episode_number}/${imdb.imdb_id}/${background}
            console.log(message)
            if(status){
                const video = files.find(({name}) => name.endsWith('.mp4') || name.endsWith('.mkv'));
                const type = video.name.split(".").pop()
                // console.log("type",type)
                // console.log(`playing...${url}/${video.index}`)
                setPlay(null)
                // setPlaying(`${url}/${video.index}`)
                // router(`/play/${url}/${video.index}/${type}/${background}`)
                window.location.href = `/play/${url}/${video.index}/${type}/${background}`
                setFetchedPlay(() => true)
                
            }else{
                Swal.fire({
                    icon: 'error',
                    title: 'Run Stream Oops...',
                    text: error,
                    showConfirmButton: false,
                    timer: 1500
                })
            }
        }
    }

    // useEffect(() => {
    //     if (playing) {
    //         new Plyr('#plyr-video');
    //     }
    // }, [playing]);

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
            <div className={windowWidth > 800 ? "w-[80%] min-h-[100%] ml-[20%] flex flex-col":"w-[98%] mx-[1%] min-h-[100%] flex flex-col"}>
                <h2 style={{fontSize:"180%",textAlign:"center"}}>COLLECTION</h2>
            {
                play && play.length > 0 ? 
                    <div className="w-[100%] h-[auto] flex flex-wrap flex-row justify-center items-center">
                        {
                            play.map(({quality,title,token},index) => 
                                    <button
                                    onClick={() => runStream(token)}
                                    key={index}
                                    className="bg-[transparent] m-[1%] border-[2px] text-white w-[48%] h-[auto] text-[20px] font-bold"
                                    >{quality}</button>

                            )
                        }
                    </div>
                :
                    <LOAD/>
            }
            </div>       
        </div>

    )
}

export default PLAY
import NAVBAR from "./nav"
import { useParams } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { useLazyQuery, gql, useMutation } from '@apollo/client';
import LOAD from "../midlleware/load";
import MOBILE from "./mobileBar";
import Swal from "sweetalert2";
import COLLECTIONS from "../midlleware/collection";

const PLAY = () => {
    const { id, stream,  name, year,  date, imdbId, season, episode, background } = useParams();
    const [play, setPlay] = useState(null)
    const [windowWidth, setWindowWidth] = useState(0)
    const [maxRate, setMaxRate] = useState(0)
    const [bests, setBests] = useState(null)

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

    const FETCH_PLAY_QUERY = gql`
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
    `
    const [fetchPlaying,fetchedPlayData] = useLazyQuery(FETCH_PLAY_QUERY,{
        // pollInterval: 500, // fetches new data at that interval
        notifyOnNetworkStatusChange: true,
        // variables,
        // skip: !variables.page, // Skip query execution if variables are not set
    })

    const [mutateUpdatePlay] = useMutation(gql`
        mutation UpdatePlay(
            $tokens: [PLAY_DATA_INPUT!]
            $type: String!
            $season: Int!
            $episode: Int!
            $id : Int!
            $token_expire: String
        ) {
            updatePlay(
                tokens: $tokens
                type: $type
                season: $season
                episode: $episode
                id: $id
                token_expire: $token_expire
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
                fetchedPlayData.refetch()
            }
        },
        onError: error => {
            console.error("insert video Error:", error);
        },
    });

    const cleanTokens = (tokens) => {
        if(!tokens || tokens.length === 0) return []

        const sorted = [...tokens].sort((a, b) => b.seeders - a.seeders);

        // const all = [...smallest,...largest];
        // Sort tokens by seeders descending, but do NOT try to set state inside sort!
        // let best = sorted[smallest];
        // if(largestIndex < smallest){
        //     let minimum = 20
        //     largest.forEach((data) => {
        //         const no = data.size.match(/[\d.]+/);
        //         if(no < minimum){
        //             minimum = no
        //             best = data
        //         }
                    
        //     })
        // }
        const maxRate = sorted[0].seeders
        let newSorted = sorted.filter(({seeders}) => {
            const limit = (Number(seeders)/Number(maxRate)) * 10

            return limit > 9.5
        })
        const smallest = newSorted.filter(({size}) => size.match(/mib/i))
        // const largestIndex = newSorted.findIndex(({size}) => size.match(/gib/i))
        const largest = newSorted.filter(({size}) => size.match(/gib/i))

        if(smallest.length > 0)
            newSorted = [...smallest,...largest]
        else
            newSorted = [...largest]

        let minimum = newSorted[0].size.match(/[\d.]+/)[0];
        let best = newSorted[0]
        console.log(best)
        newSorted.forEach((data,index) => {
            if(index > 0){
                const no = data.size.match(/[\d.]+/)[0];
                console.log(no,"no")
                if((Number(no) < Number(minimum))){
                    minimum = no
                    if(data.quality && /CAM/i.test(data.quality)){
                        return
                    }
                    console.log("here...")
                    best = data
                        
                }
            }
                
        })
        setBests(() => ({...best}))
        if (sorted.length > 0) {
            setMaxRate(maxRate);
        }


        return sorted;
    }

    const fetchToken = useCallback(async() => {

        try{
                const fetchFresh = async() => {

                    const response = await fetch(`${process.env.REACT_APP_environment === "development" ? process.env.REACT_APP_stream : process.env.REACT_APP_stream_live}`,{
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

                    if(error && error === "No movies found matching the criteria"){
                        Swal.fire({
                            icon: 'error',
                            title: 'Oops...',
                            text: error,
                            showConfirmButton: false,
                            timer: 1500
                        })
                        setPlay("no movies found")
                        return null
                    }
                    if(status){
                        console.log("fresh play")
                        return movies
                    }
                    console.log(error,status)
                    // Swal.fire({
                    //     icon: 'error',
                    //     title: 'fesh fetch Oops...',
                    //     text: error,
                    //     showConfirmButton: false,
                    //     timer: 3000
                    // })
                    return null
                    
                }

                if(!play){

                    // Utility function
                    function checkTokenDates(tokenExpire) {
                        if (!tokenExpire) return false

                        const insertedDate = new Date(tokenExpire);
                        const now = new Date(date);
                        console.log(now,"now")

                        // Calculate difference in milliseconds
                        const diffMs = now - insertedDate;

                        // 2 weeks and 4 months in ms
                        const twoWeeksMs = 14 * 24 * 60 * 60 * 1000;
                        const fourMonthsMs = 4 * 30 * 24 * 60 * 60 * 1000; // Approximate 4 months as 120 days

                        let response = true
                        if(diffMs < twoWeeksMs)
                            response = false
                        if(diffMs > fourMonthsMs)
                            response = false
                        return response
                    }


                    const fetchPlay = await fetchPlaying({
                        variables : { 
                            type:stream === "series" ? "tv" : stream === "season" ? "season" : stream === "episode" ? "episode" : "movie",
                            episode:episode ? parseInt(episode) : -1,
                            season:season ? parseInt(season) : -1,
                            id:id?parseInt(id):-1
                         }})

                         console.log(fetchPlay,"fetchPlay")
                    if (fetchPlay.loading) console.log("fetching token Loading...");
                    if((!fetchPlay) || (fetchPlay && fetchPlay.error) || !fetchPlay.data || (fetchPlay && fetchPlay.hasOwnProperty("data") && fetchPlay.data && (fetchPlay.data.play.error === "no records found" || fetchPlay.data.play.error === "no token found" || !fetchPlay.data.play.tokens || checkTokenDates(fetchPlay.data.play.token_expire)))){
                        const getToken = await fetchFresh()    
                        console.log("inserting...",getToken)
                        if(getToken && getToken.length > 0){
                            const cleanedTokens = cleanTokens(getToken)
                            console.log("cleaned tokens",cleanedTokens)
                            setPlay(() => [...cleanedTokens])
                            mutateUpdatePlay({ variables: {
                                type:stream === "series" ? "tv" : stream === "season" ? "season" : stream === "episode" ? "episode" : "movie",
                                season:season ? parseInt(season) : -1,
                                episode:episode ? parseInt(episode) : -1,
                                id:id?parseInt(id):-1,
                                tokens:getToken,
                                token_expire: new Date().toISOString()
                            }})
                        }


                    }else{
                        //every other user --- most fetch
                        console.log("ordinarily...")
                        const cleanedTokens = cleanTokens(fetchPlay.data?.play?.tokens)
                        console.log(cleanedTokens)
                        setPlay(() => ([...cleanedTokens]))
                        
                    }

                } 
            // }

        }catch(err){
            console.log(err)
            // if(!play){
            //     fetch(`${process.env.REACT_APP_stream}`,{
            //         method:"POST",
            //         headers:{
            //             "Content-Type":"application/json",
            //             "Accept":"application/json"
            //         },
            //         body:JSON.stringify({
            //             name,
            //             imdbId,
            //             year
            //         })
            //     })
            //     .then(data => data.json())
            //     .then(data => {
            //         const {status, error, movies} = data
            //         if(status){
            //             mutateUpdatePlay({ variables: {
            //                 type:stream === "series" ? "tv" : stream === "season" ? "season" : stream === "episode" ? "episode" : "movie",
            //                 season:season ? parseInt(season) : -1,
            //                 episode:episode ? parseInt(episode) : -1,
            //                 id:id?parseInt(id):-1,
            //                 tokens:movies
            //             }})
            //             return null
            //         }
            //         Swal.fire({
            //             icon: 'error',
            //             title: 'Oops...',
            //             text: error,
            //             showConfirmButton: false,
            //             timer: 1500
            //         })
            //     })
            // }
        }
        
    },[mutateUpdatePlay,fetchPlaying,stream,id,season,episode,year,name,imdbId,play,date])

    useEffect(() => {
        //fetch token -- db > token
        //create server
        fetchToken()

    },[fetchToken])

    // useEffect(() => {
    //     if (playing) {
    //         new Plyr('#plyr-video');
    //     }
    // }, [playing]);

    return (
        
        <div className={windowWidth > 800 ? "w-[100%] h-[100%]  bg-cover bg-no-repeat bg-center text-white" : "w-[100%] h-[85%] overflow-y-auto movie-scene  bg-cover bg-no-repeat bg-center text-white"} style={{backgroundImage:`linear-gradient(105deg, #0d0d0d, rgba(0,0,0,0.75), #000, rgba(0,0,0,0.56)),url(${process.env.REACT_APP_img_poster + "/" + background + ".jpg"})`,backgroundPosition:"0% 40%"}}>
            {
                windowWidth > 800 ? 
                    <div className="w-[20%] h-[100%] absolute border-r-[3px] border-[#2E2E3A]" style={{background:"linear-gradient(85deg, rgba(13, 13, 13, 0.75), rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.56), rgba(0, 0, 0, 0.45))"}}>
                        <NAVBAR/>
                    </div>
                :
                    <MOBILE/>
            }
            <div className={windowWidth > 800 ? "w-[80%] h-[100%] ml-[20%] flex flex-col overflow-y-auto":"w-[100%] h-[auto] flex flex-col"}>
                <h2 style={{fontSize:"180%",textAlign:"center"}}>COLLECTION</h2>
                {
                    bests ? 
                    <>
                        <h2 style={{fontSize:"130%",textAlign:"center",color:"#ffd800"}}>Best Quality</h2>
                        <COLLECTIONS key={play.length} windowWidth={windowWidth} size={bests.size} seeders={bests.seeders} maxRate={maxRate} title={bests.title} token={bests.token} index={play.length} quality={bests.quality} id={id} background={background}/>

                        <h2 style={{fontSize:"100%",textAlign:"center",color:"#ffd800"}}>Other Qualities</h2>
                    </>
                    :
                    ""
                }
                
           {
                play && play.length > 0 ? 
                    <div className="w-[100%] h-[auto] flex flex-wrap flex-row justify-center items-center">
                        {
                            play.map(({quality,title,token,seeders,size},index) => 
                                <COLLECTIONS key={index} windowWidth={windowWidth} size={size} seeders={seeders} maxRate={maxRate} title={title} token={token} index={index} quality={quality} id={id} background={background}/>
                            )
                        }
                    </div>
                :
                    play && play === "no movies found" ?
                        <>
                            <h2 className="text-[#ffd800]">Not Found</h2>
                        </>
                    :
                    <LOAD/>
            }
            </div>       
        </div>

    )
}

export default PLAY
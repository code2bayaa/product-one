import NAVBAR from "./nav"
import { useLocation } from "react-router-dom";
import { useState, useEffect, useCallback, useRef } from "react";
import { useLazyQuery, gql, useMutation } from '@apollo/client';
import LOAD from "../midlleware/load";
import MOBILE from "./mobileBar";
import Swal from "sweetalert2";
import COLLECTIONS from "../midlleware/collection";

const PLAY = () => {
    
    const [play, setPlay] = useState(null)
    const [windowWidth, setWindowWidth] = useState(0)
    const [maxRate, setMaxRate] = useState(0)
    const [bests, setBests] = useState(null)
    const [target,setTarget] = useState(9.8)
    const [failed, setFailed] = useState([])
    const [address,setAddress] = useState(null)
    const {state} = useLocation()
    const hasFetched = useRef(false)
    const { id, stream,  name, year,  date, imdbId, season, episode, background, anime } = state
    // const [streams, setStreams] = useState(stream)
    console.log(year,"year")

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
                    portal
                }
                
                success
                error
            }
        }
    `
    const [fetchPlaying] = useLazyQuery(FETCH_PLAY_QUERY,{
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
                // fetchedPlayData.refetch()
            }
        },
        onError: error => {
            console.error("insert video Error:", error);
        },
    });
    const cleanTokens = useCallback((tokens) => {
        if(!tokens || tokens.length === 0) return []

        const sorted = [...tokens].sort((a, b) => Number(b.seeders) - Number(a.seeders));
        // console.log(sorted,"sorted tokens")

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

        if(maxRate === 0){
            setMaxRate(0)
            return sorted.map(({seeders,leechers,...rest}) => ({...rest,seeders:seeders.toString(),leechers:leechers.toString()}))
        }
        // let target = 9.8
        let newSorted = sorted.filter(({seeders}) => {
            const limit = (Number(seeders)/Number(maxRate)) * 10

            return limit > target
        })

        console.log("newly sorted: ", newSorted)

        const smallest = newSorted.filter(({size}) => size.match(/mib/i) || size.match(/mb/i));
        // const largestIndex = newSorted.findIndex(({size}) => size.match(/gib/i))
        const largest = newSorted.filter(({size}) => size.match(/gib/i) || size.match(/gb/i)).sort((a, b) => {
            const first = Number(a.size.match(/[\d.]+/));
            const second = Number(b.size.match(/[\d.]+/));
            if (!first || !second) return 0; // Handle cases where size might not
            return first - second; // Sort by size in ascending order
        })

        if(smallest.length > 0)
            newSorted = [...smallest,...largest]
        else
            newSorted = [...largest]

        console.log(newSorted,"new sorted tokens")

        if(newSorted.length < 5){
            // let newtarget = target - 0.3
            setTarget((prevTarget) => prevTarget - 0.3)
            const filterBySeeders = ({ seeders }) => {
                const limit = (Number(seeders) / Number(maxRate)) * 10;
                return limit > 9.5;
            };
            newSorted = sorted.filter(filterBySeeders);


            const smallest = newSorted.filter(({size}) => size.match(/mib/i) || size.match(/mb/i));
            // const largestIndex = newSorted.findIndex(({size}) => size.match(/gib/i))
            const largest = newSorted.filter(({size}) => size.match(/gib/i) || size.match(/gb/i)).sort((a, b) => {
                const first = Number(a.size.match(/[\d.]+/));
                const second = Number(b.size.match(/[\d.]+/));
                if (!first || !second) return 0; // Handle cases where size might not
                return first - second; // Sort by size in ascending order
            })
            if(smallest.length > 0)
                newSorted = [...smallest,...largest]
            else
                newSorted = [...largest]
            // target = newtarget
        }

        // let minimum = newSorted[0].size.match(/[\d.]+/)[0];
        let indexed = 0
        let next = indexed + 1
        let best = newSorted[indexed]
        while(best && best.quality && /CAM/i.test(best.quality) && newSorted.length > next){
            // newSorted.shift();
            if(next >= newSorted.length) break;
            
            best = newSorted[next]
            indexed = next
            next += 1
        }
        // console.log(best)
        // newSorted.forEach((data,index) => {
        //     if(index > 0){
        //         const no = data.size.match(/[\d.]+/)[0];
        //         console.log(no,"no")
        //         if((Number(no) < Number(minimum))){
        //             minimum = no
        //             if(data.quality && /CAM/i.test(data.quality)){
        //                 return
        //             }
        //             console.log("here...")
        //   gth          best = data
                        
        //         }
        //     }
                
        // })
        setBests(() => ({...best}))
        if (newSorted.length > 0) {
            setMaxRate(maxRate);
        }

        newSorted.map(({seeders,leechers,...rest}) => ({...rest,seeders:seeders && seeders.toString(),leechers:leechers && leechers.toString()}))


        return newSorted
    },[target]) 

    useEffect(() => {
        fetch(`${process.env.REACT_APP_environment === "development" ? process.env.REACT_APP_destroy_token : process.env.REACT_APP_destroy_token_live}`,{
            method:"POST",
            headers:{
                "Content-Type":"application/json",
                "Accept":"application/json"
            },
            body:JSON.stringify({
                id,
                // index
            })
        }).then(responseDestroy => {
            console.log(responseDestroy,"response destroy")
        })
        // await responseDestroy.json()
    },[id])
    const fetchFresh = useCallback(async() => {

        const now = new Date(date);
        const day = now.getDate(); // Gets day of the month (1–31)
        const month = now.getMonth() + 1; // Gets month (0–11), so +1 to make it (1–12)
        const dayStr = String(day).padStart(2, '0');
        const monthStr = String(month).padStart(2, '0');
        // console.log({date,now,day,month,year,dayStr,monthStr,anime})
        const response = await fetch(`${process.env.REACT_APP_environment === "development" ? process.env.REACT_APP_stream : process.env.REACT_APP_stream_live}`,{
            method:"POST",
            headers:{
                "Content-Type":"application/json",
                "Accept":"application/json"
            },
            body:JSON.stringify({
                name,
                anime,
                imdbId,
                year,
                season,
                episode,
                id,
                stream,
                address,
                day:dayStr,
                month:monthStr
            })
        })
        const {status, error, movies, portal} = await response.json()

        if(error && error === "No movies found matching the criteria"){
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: error,
                showConfirmButton: false,
                timer: 1500
            })
            setPlay(["no movies found"])
            return null
        }
        if(status){
            console.log("fresh play")
            // return {movies, portal}
            console.log("inserting...",movies)
            if(movies && movies.length > 0){
                const cleanedTokens = cleanTokens(movies)
                console.log("cleaned tokens",cleanedTokens)
                setPlay(() => [...cleanedTokens])
                console.log(portal)
                const new_portal = (Array.isArray(portal) && portal.length > 0) ? portal[portal.length - 1] : 0;
                console.log(new_portal,"portal")
                setAddress(new_portal)
                mutateUpdatePlay({ variables: {
                    type:stream === "series" ? "tv" : stream === "season" ? "season" : stream === "episode" ? "episode" : "movie",
                    season:season ? parseInt(season) : -1,
                    episode:episode ? parseInt(episode) : -1,
                    id:id?parseInt(id):-1,
                    tokens:cleanedTokens && cleanedTokens.map(values => ({...values,portal:new_portal})),
                    token_expire: new Date().toISOString()
                }})
            }            
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
        
    },[address,cleanTokens,date,episode,id,imdbId,mutateUpdatePlay,name,season,stream,year,anime])

    const fetchToken = useCallback(async() => {

        try{          
            
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
                        await fetchFresh()    

                    }else{
                        //every other user --- most fetch
                        console.log("ordinarily...")
                        // const cleanedTokens = cleanTokens(fetchPlay.data?.play?.tokens)
                        // console.log(cleanedTokens)
                        const newSorted = fetchPlay.data?.play?.tokens || []
                        
                        if (newSorted.length > 0) {
                            const maxRate = newSorted[0].seeders
                            setMaxRate(maxRate);
                        }
                        setPlay(() => ([...newSorted]))
                        
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
        
    },[fetchPlaying,fetchFresh,stream,id,season,episode,play,date])

    useEffect(() => {
        if(hasFetched.current){
            return
        }
        hasFetched.current = true
        //fetch token -- db > token
        //create server
        fetchToken()

    },[fetchToken])

    // useEffect(() => {
    //     if (playing) {
    //         new Plyr('#plyr-video');
    //     }
    // }, [playing]);

    const collect = index => {
        
        // console.log((failed.length + 1),play)
        if((failed.length + 1) >= play.length){
            fetchFresh()
            return true
        }
        setFailed((prevFail) => ([...prevFail,index]))
        return false
    }

    return (
        
        <div className={windowWidth > 800 ? "w-[100%] h-[100%]  bg-cover bg-no-repeat bg-center text-white" : "w-[100%] h-[92%] overflow-y-auto movie-scene  bg-cover bg-no-repeat bg-center text-white"} style={{backgroundImage:`linear-gradient(105deg, #0d0d0d, rgba(0,0,0,0.75), #000, rgba(0,0,0,0.56)),url(${typeof background === "object" ? process.env.REACT_APP_img_poster + background?.path : process.env.REACT_APP_img_poster + background})`,backgroundPosition:"0% 40%"}}>
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
                        <COLLECTIONS key={play && play.length} windowWidth={windowWidth} size={bests.size} seeders={bests.seeders} maxRate={maxRate} title={bests.title} token={bests.token} index={play.length} quality={bests.quality} id={id} background={background}/>

                        <h2 style={{fontSize:"100%",textAlign:"center",color:"#ffd800"}}>Other Qualities</h2>
                    </>
                    :
                    ""
                }
                
           {
                play && play.length > 0 && play[0] === "no movies found" ?
                    <>
                        <h2 className="text-[#ffd800]">Not Accessible In Your Region</h2>
                    </>
                :            
                play && play.length > 0 ? 
                    <div className="w-[100%] h-[auto] flex flex-wrap flex-row justify-center items-center">
                        {
                            play.map(({quality,title,token,seeders,size},index) => 
                                <COLLECTIONS key={index} collect={collect} stream={stream} windowWidth={windowWidth} size={size} season={season} seeders={seeders} maxRate={maxRate} title={title} token={token} index={index} quality={quality} id={id} background={background}/>
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
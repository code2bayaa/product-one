import { useMutation, useLazyQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import NAVBAR from "./nav"
import { useLocation } from "react-router-dom";
import { useState, useEffect, useCallback, useRef } from "react";
import LOAD from "../midlleware/load";
import MOBILE from "./mobileBar";
import Swal from "sweetalert2";
import COLLECTIONS from "../midlleware/collection";
import { useKeys } from "./safe";
import { useWindowWidth, DESKTOP_WIDTH } from "../hooks/useWindowWidth";

const PLAY = () => {
    
    const [play, setPlay] = useState(null)
    const windowWidth = useWindowWidth()
    const [maxRate, setMaxRate] = useState(0)
    const [bests, setBests] = useState(null)
    const [target,setTarget] = useState(9.8)
    const [failed, setFailed] = useState([])
    // const [address,setAddress] = useState(null)
    const {state} = useLocation()
    const {safeKeys} = useKeys()
    const hasFetched = useRef(false)
    // const params = useSearchParams();
    // const state = JSON.parse(decodeURIComponent(params.get("state"))); 
    // const state = useStates("movie")
    const { id, stream,  name, year,  date, imdbId, season, episode, background, anime,
        serieID,
        // seasons,
        // episodes
    } = state
    // const [streams, setStreams] = useState(stream)
    // console.log(year,"year")
    // console.log("play episodes", episodes)

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
        fetchPolicy: 'cache-first',
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
            return sorted.map(({portal,seeders,leechers,...rest}) => ({...rest,seeders:Number(seeders),leechers:Number(leechers),portal:portal === false?0:portal}))
        }
        // let target = 9.8
        let newSorted = sorted.filter(({seeders}) => {
            const limit = (Number(seeders)/Number(maxRate)) * 10

            return limit > target
        })

        // console.log("newly sorted: ", newSorted)

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

        // console.log(newSorted,"new sorted tokens")

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
        // console.log(newSorted,"new sorted")
        return newSorted.map(({portal,seeders,leechers,...rest}) => ({...rest,seeders:seeders && Number(seeders),leechers:leechers && Number(leechers),portal:portal === false?0:portal}))


        // return newSorted
    },[target]) 


    const fetchFresh = useCallback(async() => {

        const now = new Date(date);
        const day = now.getDate(); // Gets day of the month (1–31)
        const month = now.getMonth() + 1; // Gets month (0–11), so +1 to make it (1–12)
        const dayStr = String(day).padStart(2, '0');
        const monthStr = String(month).padStart(2, '0');
        // console.log({date,now,day,month,year,dayStr,monthStr,anime})
        // const controller = new AbortController();
        // const signal = controller.signal
        // console.log("fetching...")
        // let portals = []
        // let entered_portals = []
        try {
            async function getStream(round){

                // let newAddress = (portals && portals.length > 0 && portals[portals.length - 1]) || 0;
                // console.log(newAddress, "new address")
                let response;
                async function fetchSource(){
                    return await fetch(`${process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_STREAM : process.env.REACT_APP_STREAM_LIVE}`,{
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
                            serieID,
                            stream,
                            address:round,
                            day:dayStr,
                            month:monthStr
                        }),
                        // signal
                    })
                }

                const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
                let count = 1
                while(!response || (response && !response.ok)){
                    if(count > 5){
                        break;
                    }
                    response = await fetchSource()

                    if(count > 1){
                        await delay(30000);
                    }
                    count++
                }

                if(count > 5){
                    Swal.fire({
                        icon: 'error',
                        title: 'try again later',
                        text: "too many tries",
                        showConfirmButton: false,
                        timer: 1500
                    })                    
                    return false
                }

                const {status, error, movies} = await response.json()

                if(error && error === "No movies found matching the criteria"){
                    Swal.fire({
                        icon: 'error',
                        title: 'server ' + round + ': no movies found',
                        text: error,
                        showConfirmButton: false,
                        timer: 1500
                    })
                    // if(!signal || !signal.aborted) 
                        // setPlay(["no movies found"])
                    return false
                }
                if(status){
                    // console.log("fresh play")
                    // return {movies, portal}
                    // console.log("inserting...",movies)
                    // entered_portals = [...entered_portals,...portal];
                                        // entered_portals = [...entered_portals,...portal];
// +                    // normalize incoming portal(s) to numeric IDs and keep them unique
// +                    const incoming = Array.isArray(portal) ? portal : (portal == null ? [] : [portal]);
// +                    entered_portals = Array.from(new Set([
// +                        ...entered_portals,
// +                        ...incoming.map(p => Number(p)).filter(p => !Number.isNaN(p))
// +                    ]));
                    if(movies && movies.length > 0){
                        const cleanedTokens = cleanTokens(movies)
                        // console.log("cleaned tokens",cleanedTokens)
                        // if(!signal || !signal.aborted){
                            // const new_portal = (Array.isArray(portal) && portal.length > 0) ? portal[portal.length - 1] : 0;
                            // setAddress(new_portal)


                        return cleanedTokens
                        // }
                    }
                }
                // console.log("round",portal)
                return status
            }

            // const runAllStreams = () => {
            //     console.log("running stream(s), new");
            //     for(let i = 1; i < 5; i++) {
            //         getStream(i)
            //         .then(portal_result => {
            //             console.log(portal_result,"portal result")
            //             // portals = portal_result
            //         })
            //     }
            //         // const remainingPortals = portals.filter(p => !entered_portals.some(ep => Number(ep) === Number(p)));
            //         // if(remainingPortals.length === 0) runStream = false;
            // }
            // // let runStream = true
            // await Promise.all(runAllStreams)
            const promises = Array.from({ length: 4 }, (_, i) => {
                const iter = i + 1; // makes it 1,2,3,4,5 instead of 0–4
                console.log(`running stream ${iter}`);
                
                return getStream(iter);
            });

            const results = await Promise.allSettled(promises);

            // Extract the actual portal results
            const portals = results.map(result => {
                if (result.status === 'fulfilled') {
                    return result.value;
                } else {
                    console.warn('Stream rejected:', result.reason);
                    return false;
                }
            });

            // console.log(portals, "all portal results");
            
            // Check if ALL streams failed
            if (portals.every(p => p === false)) {
                console.log("All portals failed");
                setPlay(["no movies found"]);
            } else {
                console.log("At least one stream succeeded");
                console.log("adding play stream")
                portals.forEach((portal_result,round) => {
                    if(portal_result && Array.isArray(portal_result)){
                        const cleanedTokens = cleanTokens(portal_result)
                        setPlay((prevPlay) => {
                            const updatePlay = prevPlay ? [...prevPlay, ...cleanedTokens] : [...cleanedTokens]
                            return updatePlay
                        })
                        try{
                            console.log("mutating...",cleanedTokens)
                            mutateUpdatePlay({ variables: {
                                type:stream === "series" ? "tv" : stream === "season" ? "season" : stream === "episode" ? "episode" : "movie",
                                season:season ? parseInt(season) : -1,
                                episode:episode ? parseInt(episode) : -1,
                                id:id?parseInt(id):-1,
                                tokens:cleanedTokens && cleanedTokens.map(values => ({...values,portal:round})),
                                token_expire: new Date().toISOString()
                            }})
                        }catch(err){
                            if (err && err.name === 'AbortError') {
                                // ignore
                            } else {
                                console.error("mutateUpdatePlay error", err);
                            }
                        }
                    }
                })
                // setPlay((prevPlay) => {
                //     const updatePlay = prevPlay ? [...prevPlay, ...cleanedTokens] : [...cleanedTokens]

                //     return updatePlay
                // })
            }
            // console.log(portals, "all portal results");
            // console.log(error,status)
            return null
        } catch(err){
            if (err && err.name === 'AbortError') {
                // aborted - ignore
                return null;
            }
            console.error("fetchFresh error", err)
            return null
        }

    },[cleanTokens,date,episode,id,imdbId,mutateUpdatePlay,serieID,name,season,stream,year,anime])

    const fetchToken = useCallback(async (signal,round) => {
        let cancelled = false;
        if (signal) {
            signal.addEventListener('abort', () => { cancelled = true });
        }

        try{
            if(!play){
                // const checkCAM = (tokens) => {
                //     if (!tokens || tokens.length === 0 || tokens.length > 6) return false

                //     const now = new Date(date);
                //     const day = now.getDate();

                //     const checkDate = (currentDate) => {
                //     const then = new Date(currentDate);
                //     const currentDay = then.getDate();

                //     if (day > currentDay)
                //         return true

                //     return false;
                //     }
                //     //if all are CAM and date is yesterday return true
                //     const refreshCAM = [...tokens].every(({ quality, dateUploaded }) => checkDate(dateUploaded) && quality && quality.match(/CAM/i))
                //     return refreshCAM;
                // }
                // function checkTokenDates(tokenExpire) {
                //     if (!tokenExpire) return false

                //     const insertedDate = new Date(tokenExpire);
                //     const now = new Date(date);
                //     console.log(now,"now")

                //     // Calculate difference in milliseconds
                //     const diffMs = now - insertedDate;

                //     // 2 weeks and 4 months in ms
                //     const twoWeeksMs = 14 * 24 * 60 * 60 * 1000;
                //     const fourMonthsMs = 4 * 30 * 24 * 60 * 60 * 1000; // Approximate 4 months as 120 days

                //     let response = true
                //     if(diffMs < twoWeeksMs)
                //         response = false
                //     if(diffMs > fourMonthsMs)
                //         response = false
                //     return response
                // }
                const fetchPlay = await fetchPlaying({
                    variables : {
                        type:stream === "series" ? "tv" : stream === "season" ? "season" : stream === "episode" ? "episode" : "movie",
                        episode:episode ? parseInt(episode) : -1,
                        season:season ? parseInt(season) : -1,
                        id:id?parseInt(id):-1
                    },
                    context: { fetchOptions: { signal } },
                }).catch(err => {
                    if (err && err.name === 'AbortError') return null;
                    throw err;
                });

                // console.log(fetchPlay,"fetch play",episode,"episode",season,"season",id,"id")
                if(round === 1 && !fetchPlay){
                    fetchToken(signal,2)
                    return
                }
                // if (cancelled || (signal && signal.aborted)) return;
//  || (fetchPlay.data?.play?.tokens.length < 10 && checkTokenDates(fetchPlay.data.play.token_expire))
                if(!fetchPlay || fetchPlay.error || !fetchPlay.data || (fetchPlay.data && (fetchPlay.data.play.error === "no records found" || fetchPlay.data.play.error === "no token found" || !fetchPlay.data.play.tokens 
                    // || (fetchPlay.data?.play?.tokens && checkCAM(fetchPlay.data?.play?.tokens))
                ))){
                    // fall back to fresh fetch, pass signal so it can be aborted
                    console.log("fetching one")
                    await fetchFresh()
                }else{
                    // ordinarily...
                    console.log("ordinary...")
                    const newSorted = fetchPlay.data?.play?.tokens || []
                    if (newSorted.length > 0) {
                        const maxRate = newSorted[0].seeders
                        if(!cancelled) setMaxRate(maxRate);
                    }
                    const cleanedTokens = cleanTokens(newSorted)
                    if(!cancelled) setPlay(() => ([...cleanedTokens]))
                }

            }
        }catch(err){
            if (err && err.name === 'AbortError') {
                // aborted - ignore
            } else {
                console.error("fetchToken error", err)
                // optionally fall back to fresh fetch if not aborted
                // try{
                //     if(!play && !(err && err.name === 'AbortError')) await fetchFresh();
                // }catch(e){
                //     if (e && e.name === 'AbortError') {}
                // }
            }
        }

    },[fetchPlaying,fetchFresh,stream,id,season,episode,play,cleanTokens])

    useEffect(() => {
        if(hasFetched.current){
            console.log("already loaded")
            return
        }
        hasFetched.current = true
        const controller = new AbortController();
        fetchToken(controller.signal,1).catch(err => {
            if (err && err.name === 'AbortError') return;
            console.error("fetchToken outer error", err);
        });

        return () => {
            try { controller.abort(); } catch(e){/*ignore*/}
        }

    },[fetchToken])

    // useEffect(() => {

    //     const now = new Date(date);
    //     const day = now.getDate(); // Gets day of the month (1–31)
    //     const month = now.getMonth() + 1; // Gets month (0–11), so +1 to make it (1–12)
    //     const dayStr = String(day).padStart(2, '0');
    //     const monthStr = String(month).padStart(2, '0');

    //     async function storeOthers({count}){

    //         const {episode_number} = episodes[count]

    //         if(episode === episode_number){
    //             count++
    //             if(count < 5){
    //                 return await storeOthers({count})
    //             }else{
    //                 return {
    //                     message:"finished"
    //                 }
    //             }
    //         }

    //         const {status,message} = await fetch(`${process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_STREAM : process.env.REACT_APP_STREAM_LIVE}`,{
    //             method:"POST",
    //             headers:{
    //                 "Content-Type":"application/json",
    //                 "Accept":"application/json"
    //             },
    //             body:JSON.stringify({
    //                 name,
    //                 anime,
    //                 imdbId,
    //                 year,
    //                 season,
    //                 episode:episode_number,
    //                 id,
    //                 stream,
    //                 address,
    //                 day:dayStr,
    //                 month:monthStr,
    //                 otherStore:true
    //             })
    //         })
    //         console.log(message,"count: ",count)

    //         if(process.env.REACT_APP_ENVIRONMENT === "production"){
    //             //refresh UKOstream
    //             console.log("refreshing stream...")
    //             const {status,error} = await fetch(process.env.REACT_APP_RESET_STREAM_LIVE)
    //             console.log(status,error)
    //         }

    //         if(status){
    //             console.log("episode transcoding..")
    //             count++
    //             if(count < 5){//only five more episodes
    //                 return await storeOthers({count})
    //             }else{
    //                 return {
    //                     message:"finished"
    //                 }
    //             }
                    
    //         }
    //     }

    //     if(episodes && episodes.length > 0){
    //         storeOthers({count:0})
    //     }
    // },[episodes,address,date,id,imdbId,name,season,episode,stream,year,anime])

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
        
        <div className={windowWidth >= DESKTOP_WIDTH ? "w-[100%] h-[100%]  bg-cover bg-no-repeat bg-center text-white" : "w-[100%] h-[92%] overflow-y-auto movie-scene  bg-cover bg-no-repeat bg-center text-white"} style={{backgroundImage:`linear-gradient(105deg, #0d0d0d, rgba(0,0,0,0.75), #000, rgba(0,0,0,0.56)),url(${typeof background === "object" ? safeKeys.IMG_POSTER + background?.path : safeKeys.IMG_POSTER + background})`,backgroundPosition:"0% 40%"}}>
            {
                windowWidth >= DESKTOP_WIDTH ? 
                    <div className="w-[20%] h-[100%] absolute border-r-[3px] border-[#2E2E3A]" style={{background:"linear-gradient(85deg, rgba(13, 13, 13, 0.75), rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.56), rgba(0, 0, 0, 0.45))"}}>
                        <NAVBAR/>
                    </div>
                :
                    <MOBILE/>
            }
            <div className={windowWidth >= DESKTOP_WIDTH ? "w-[80%] h-[100%] ml-[20%] flex flex-col overflow-y-auto":"w-[100%] h-[auto] flex flex-col"}>
                <h2 style={{fontSize:"180%",textAlign:"center"}}>COLLECTION</h2>
                {
                    bests && play ? 
                    <>
                        <h2 style={{fontSize:"130%",textAlign:"center",color:"#ffd800"}}>Best Quality</h2>
                        <COLLECTIONS 
                            key={play && play.length} 
                            anime={anime} 
                            serieID={serieID} 
                            serie_name={name} 
                            season={season} 
                            episode={episode} 
                            imdbId={imdbId}
                            stream={stream} 
                            date={date}
                            year={year}
                            windowWidth={windowWidth} 
                            size={bests.size} 
                            seeders={bests.seeders} 
                            maxRate={maxRate} 
                            title={bests.title} 
                            token={bests.token} 
                            index={play.length} 
                            quality={bests.quality} 
                            id={id} 
                            background={background}
                            collect={collect} 
                        />

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
                                <COLLECTIONS 
                                    key={index} 
                                    anime={anime} 
                                    serieID={serieID} 
                                    serie_name={name} 
                                    collect={collect} 
                                    imdbId={imdbId}
                                    date={date}
                                    year={year}
                                    stream={stream} 
                                    windowWidth={windowWidth} 
                                    size={size} 
                                    season={season} 
                                    episode={episode} 
                                    seeders={seeders} 
                                    maxRate={maxRate} 
                                    title={title} 
                                    token={token} 
                                    index={index} 
                                    quality={quality} 
                                    id={id} 
                                    background={background}
                                />
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
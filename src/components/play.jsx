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
    // console.log("play",id,stream,name,year,imdbId,season,episode)
    const [play, setPlay] = useState(null)
    // const [fetchedPlay, setFetchedPlay] = useState(null)
    const [windowWidth, setWindowWidth] = useState(0)
    // const [loading,setLoading] = useState(false)

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

    const fetchToken = useCallback(async() => {

        try{
            // console.log(fetchedPlay,"fetchedPlay...")
            // if(fetchedPlay){
            //     console.log(fetchedPlay,"fetchedPlay...")

            // }else{
                const fetchFresh = async() => {

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

                    if(error && error === "No movies found matching the criteria"){
                        Swal.fire({
                            icon: 'error',
                            title: 'Oops...',
                            text: error,
                            showConfirmButton: false,
                            timer: 1500
                        })
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
                            setPlay(() => [...getToken])
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
                        setPlay(() => ([...fetchPlay.data?.play?.tokens]))
                        
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

    useEffect(() => {
        const destroySession = async() => {
            console.log("destroying...")
            const response = await fetch(`${process.env.REACT_APP_destroy_token}`, {
                method: "POST",
                credentials: "include",
                body:JSON.stringify({
                    id
                }),
                headers: {
                    'Content-Type': 'application/json', // Indicates the body is JSON
                },
            });
            const {status, error, message, newToken} = await response.json()
            console.log(newToken,"newToken")
            if(error || !status){
                // Swal.fire({
                //     icon: 'error',
                //     title: 'Oops...',
                //     text: error || message,
                //     showConfirmButton: false,
                //     timer: 2500
                // })
                return null
            }
            Swal.fire({
                icon: 'success',
                title: 'Session destroyed',
                text: "success" + message,
                showConfirmButton: false,
                timer: 2500
            })
            return true
        }
        destroySession()
    },[id])

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
                <h2>Ensure you have unallocated storage space for smooth streaming</h2>
            {
                play && play.length > 0 ? 
                    <div className="w-[100%] h-[auto] flex flex-wrap flex-row justify-center items-center">
                        {
                            play.map(({quality,title,token},index) => 
                                <COLLECTIONS key={index} token={token} index={index} quality={quality} id={id} background={background}/>
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
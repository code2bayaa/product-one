import REACTIONBUTTON, { reactionNeedsUpload } from "./party/ReactionButton";
import { shortRow } from "../midlleware/shortRow"
import { useMutation, useLazyQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import NAVBAR from "./nav"
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback, useRef } from "react";
import PICTURE from "../midlleware/picture";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDoubleRight, faBasketShopping, faCirclePlus, faStar, faPlayCircle } from "@fortawesome/free-solid-svg-icons";
import LOAD from "../midlleware/load";
import MOBILE from "./mobileBar";
import Swal from "sweetalert2";
import { useKeys } from './safe';
import { usePlayGate, PHONEPROMPT } from "./access";
import COMMENTS from "./comments";
import { noCreditsAlert } from "../midlleware/noCredits";
import { useWindowWidth, DESKTOP_WIDTH } from "../hooks/useWindowWidth";
const SERIE = () => {
    const hasFetched = useRef(null)
    const [serie, setSerie] = useState(null);
    // PRD #11: "Start a reaction" shows only when the series has its own UKO copy - episode 1's url
    const [reactionReady, setReactionReady] = useState(false);
    const [images,setImages] = useState(null)
    const [credits,setCredit] = useState(null)
    const [playlist,setPlaylist] = useState(null)
    const windowWidth = useWindowWidth()
    // const controller = new AbortController();
    // const aborter = useRef(null);
    // const aborterOne = useRef(null);
    // const aborterTwo = useRef(null);
    const {safeKeys,loadKeys} = useKeys()
    const { allowed: layouts, needsPhone } = usePlayGate(safeKeys?.GEO)
    // const params = useSearchParams();
    // const state = JSON.parse(decodeURIComponent(params.get("state")));
    // const state = useStates("tv")
    // const router = useRouter()
    // const { state } = useLocation();
    // const navigate = useNavigate();
    const { state } = useLocation();
    const navigate = useNavigate();
    const id = state.id
    // console.log("state id",id)
    //the play gate (Africa / Australia / Brazil device + phone number) lives in access.jsx usePlayGate
    // useEffect(() => {
    //     // Create the inline script
    //     const inlineScript = document.createElement("script");
    //     inlineScript.type = "text/javascript";
    //     inlineScript.text = "var infolinks_pid = 3436935; var infolinks_wsid = 0;";

    //     // Create the external script
    //     const externalScript = document.createElement("script");
    //     externalScript.type = "text/javascript";
    //     externalScript.src = "//resources.infolinks.com/js/infolinks_main.js";

    //     // Append both to the body
    //     document.body.appendChild(inlineScript);
    //     document.body.appendChild(externalScript);

    //     // Cleanup on unmount
    //     return () => {
    //         document.body.removeChild(inlineScript);
    //         document.body.removeChild(externalScript);
    //     };
    // }, []);

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
    const FETCH_SEASON_ONE_QUERY = gql`
        query Season (
            $id: Int!
        ){
            season(
                id:$id
            ) {
                episodes {
                    episode_number
                    id
                    name
                    season_number
                    url {
                        fileName
                        week
                        quality
                    }
                    player {
                        type
                        index
                        token
                        quality
                        size
                        stream
                    }
                    air_date
                    imdb_id
                }
                id
                name
                success
            }
        }
    `
    const [fetchSeasonOne] = useLazyQuery(FETCH_SEASON_ONE_QUERY,{
        notifyOnNetworkStatusChange: true,
        // fetchPolicy: 'cache-first',
        fetchPolicy: 'network-only'
    });

    const INSERT_SEASON_ONE_MUTATION = gql`
        mutation AddSeason(
            $single:COLLECT_SEASON_INPUT
        ) {
            addSeason(
                single:$single
            ) {
                success
                message
            }
        }
    `;

    const [mutateInsertSeasonOne] = useMutation(INSERT_SEASON_ONE_MUTATION, {
        onCompleted: (data) => {
            if (data.addSeason.success) {
                if(data.addSeason.message === "already inserted")
                    console.log("season inserting already started...")
                console.log("Season successfully inserted into MySQL:", data.addSeason.message);
            } else {
                console.error("Failed to insert seasons into MySQL:", data.addSeason.message, data.addSeason.error);
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
            console.error("insert season Error:", error);
        },
    });
    const FETCH_IMDB_QUERY = gql`
        query IMDB(
            $id: Int!
            $season_number: Int
            $episode_number: Int
        ){
            imdb(
                id:$id
                season_number:$season_number
                episode_number:$episode_number
            ){
                id
                success
                error
                message
            }
        }
    `
    const [fetchIMDBData] = useLazyQuery(FETCH_IMDB_QUERY,{
        notifyOnNetworkStatusChange: true,
        fetchPolicy: 'cache-first',
    });

    const UPDATE_IMDB_MUTATION = gql`
        mutation UpdateIMDB(
            $id:Int!
            $external_ids:EXTERNAL_INPUT
            $season_number:Int
            $episode_number:Int
        ) {
            updateIMDB(
                id:$id
                external_ids:$external_ids
                season_number:$season_number
                episode_number:$episode_number
            ) {
                success
                message
            }
        }
    `;

    const [mutateUpdateIMDB] = useMutation(UPDATE_IMDB_MUTATION, {
        onCompleted: (data) => {
            if (data && data.updateIMDB.success) {
            } else {
                console.error("Failed to insert credits into MySQL:", data.updateIMDB.message, data.updateIMDB.error);
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
    // const FETCH_IMAGE_QUERY = gql`
    //     query Image (
    //         $type: String!
    //         $season: Int!
    //         $episode: Int! 
    //         $id : ID! 
    //     ){
    //         image(
    //             type:$type,
    //             episode:$episode,
    //             season:$season,
    //             id:$id
    //         ) {
    //             data {
    //                 id
    //                 path
    //             }
    //             meta_data {
    //                 type
    //                 season
    //                 episode
    //             }
    //             success
    //             error
    //         }
    //     }
    // `
    // const [fetchImage] = useLazyQuery(FETCH_IMAGE_QUERY,{
    //     notifyOnNetworkStatusChange: true,
    //     fetchPolicy: 'cache-first',
    // })

    const [mutateInsertImage] = useMutation(gql`
        mutation AddImage(
            $meta_data: META_DATA_INPUT!
            $data: DATA_INPUT!           
        ) {
            addImage(
            meta_data: $meta_data
            data: $data         
            ){
                data {
                    id
                    path
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
            if (data && data.addImage.success) {
                // Refetch the query to get updated data
                // console.log(fetchImage)
                console.log("Image successfully inserted into MySQL:", data.addImage);
                // fetchImageData.refetch().then((refetched) => {
                //     console.log(refetched)
                //     if(refetched.data.image.success){
                //         const ref = refetched?.data?.image?.data
                //         const typeGetImageData = {...ref}
                //         setImages(() => typeGetImageData)
                //     }

                // })

            }
        },
        onError: (error) => {
            // Ignore abort-related network errors (they are expected when requests are cancelled)
            const isAbort = error && (
                error.name === 'AbortError' ||
                // (error.networkError && error.networkError.name === 'AbortError') ||
                (typeof error.message === 'string' && /abort(ed)?/i.test(error.message))
            );
            if (isAbort) return;
            console.error("insert video Error:", error);
        },
    });


    const FETCH_COMINED_QUERY = gql`
        query TvPayload (
            $image: IMAGE_TV_ARGUMENTS!
            $tv: SINGLE_TV_ARGUMENTS!
            $credit: CREDIT_ITEM_TV_ARGUMENTS!
        ) {
            tvPayload(
                image: $image,
                tv: $tv,
                credit: $credit
            ) {
                image {
                    data {
                        id
                        path
                        logo
                    }
                    meta_data {
                        type
                        season
                        episode
                    }
                    success
                    error
                }
                tv {
                    adult
                    backdrop_path
                    created_by {
                        id
                        credit_id
                        name
                        gender
                        profile_path
                    }
                    episode_run_time
                    first_air_date
                    genres {
                        id
                        name
                    }
                    homepage
                    id
                    in_production
                    languages
                    last_air_date
                    last_episode_to_air {
                        name
                        air_date
                        episode_number
                        season_number
                    },
                    name
                    next_episode_to_air {
                        name
                        air_date
                        episode_number
                        season_number
                    }
                    networks {
                        id
                        logo_path
                        name
                        origin_country
                    }
                    number_of_episodes
                    number_of_seasons
                    origin_country
                    original_language
                    original_name
                    overview
                    popularity
                    poster_path
                    production_companies {
                        id
                        logo_path
                        name,
                        origin_country
                    }
                    production_countries {
                        iso_3166_1
                        name
                    }
                    seasons {
                        episode_count
                        id
                        name
                        season_number
                        vote_average
                    },
                    spoken_languages {
                        english_name
                        iso_639_1
                        name
                    }
                    status
                    tagline
                    type
                    vote_average
                    vote_count
                    message
                    success
                }
                credit {
                    cast {
                        adult
                        gender
                        id
                        known_for_department
                        name
                        original_name
                        popularity
                        profile_path
                        cast_id
                        character
                        credit_id
                        order
                    }
                    crew {
                        adult
                        gender
                        id
                        known_for_department
                        name
                        original_name
                        popularity
                        profile_path
                        credit_id
                        department
                        job
                    }              
                    success
                    error
                    message                
                }
                success
                error
            }
        }
    `

    const [fetchCombined] = useLazyQuery(FETCH_COMINED_QUERY,{
        notifyOnNetworkStatusChange: true,
        fetchPolicy: 'cache-first',
    });

    // const FETCH_MOVIE_QUERY = gql`
    //     query SingleTV (
    //         $id: ID!
    //     ){
    //         singleTV(
    //             id:$id
    //         ) {

    //             adult
    //             backdrop_path
    //             created_by {
    //                 id
    //                 credit_id
    //                 name
    //                 gender
    //                 profile_path
    //             }
    //             episode_run_time
    //             first_air_date
    //             genres {
    //                 id
    //                 name
    //             }
    //             homepage
    //             id
    //             in_production
    //             languages
    //             last_air_date
    //             last_episode_to_air {
    //                 name
    //                 air_date
    //                 episode_number
    //                 season_number
    //             },
    //             name
    //             next_episode_to_air {
    //                 name
    //                 air_date
    //                 episode_number
    //                 season_number
    //             }
    //             networks {
    //                 id
    //                 logo_path
    //                 name
    //                 origin_country
    //             }
    //             number_of_episodes
    //             number_of_seasons
    //             origin_country
    //             original_language
    //             original_name
    //             overview
    //             popularity
    //             poster_path
    //             production_companies {
    //                 id
    //                 logo_path
    //                 name,
    //                 origin_country
    //             }
    //             production_countries {
    //                 iso_3166_1
    //                 name
    //             }
    //             seasons {
    //                 episode_count
    //                 id
    //                 name
    //                 season_number
    //                 vote_average
    //             },
    //             spoken_languages {
    //                 english_name
    //                 iso_639_1
    //                 name
    //             }
    //             status
    //             tagline
    //             type
    //             vote_average
    //             vote_count
    //             message
    //             success
    //         }
    //     }
    // `
    // const [fetchSingleTV] = useLazyQuery(FETCH_MOVIE_QUERY,{
    //     // pollInterval: 500, // fetches new data at that interval
    //     notifyOnNetworkStatusChange: true,
    //     fetchPolicy: 'cache-first',
    //     // variables,
    //     // skip: !variables.page, // Skip query execution if variables are not set
    // });

    const INSERT_MOVIE_MUTATION = gql`
        mutation addTV(
            $single:COLLECT_TV_INPUT
        ) {
            addTV(
                single:$single
            ) {
                success
                message
            }
        }
    `;

    const [mutateInsertTV] = useMutation(INSERT_MOVIE_MUTATION, {
        onCompleted: (data) => {
            console.log("Movie successfully inserted into MySQL:", data);
            if (data.addTV.success) {
                if(data.addTV.message === "already inserted")
                    console.log("movie inserting already started...")
                console.log("Movie successfully inserted into MySQL:", data.addTV);
                // fetchedMovieData.refetch()
                // .then(status => console.log(status,"status"))
            } else {
                console.error("Failed to insert movies into MySQL:", data.addTV.message, data.addTV.error);
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

    // const FETCH_CREDITS_QUERY = gql`
    //     query Credits (
    //         $id: ID!
    //     ){
    //         credits(
    //             id:$id
    //         ) {
    //             cast {
    //                 roles {
    //                     credit_id
    //                     character
    //                     episode_count
    //                 }
    //                 adult
    //                 gender
    //                 id
    //                 known_for_department
    //                 name
    //                 original_name
    //                 popularity
    //                 profile_path
    //                 cast_id
    //                 character
    //                 credit_id
    //                 total_episode_count
    //                 order
    //             }
    //             crew {
    //                 jobs {
    //                     credit_id
    //                     job
    //                     episode_count
    //                 }
    //                 adult
    //                 gender
    //                 id
    //                 known_for_department
    //                 name
    //                 original_name
    //                 popularity
    //                 profile_path
    //                 cast_id
    //                 character
    //                 credit_id
    //                 total_episode_count
    //                 order
    //             }              
    //             success
    //             error
    //             message
    //         }
    //     }
    // `
    // const [fetchCreditsData] = useLazyQuery(FETCH_CREDITS_QUERY,{
    // // pollInterval: 500, // fetches new data at that interval
    // notifyOnNetworkStatusChange: true,
    // fetchPolicy: 'cache-first',
    // // variables,
    // // skip: !variables.page, // Skip query execution if variables are not set
    // });

    const INSERT_CREDITS_MUTATION = gql`
        mutation AddCredits(
            $id:Int!
            $season:Int!
            $episode:Int!
            $cast:[CAST_INPUT]
            $crew:[CREW_INPUT]
            $chunking:Boolean!
            $chunking_index:Int!
        ) {
            addCredits(
                id:$id
                season:$season
                episode:$episode
                cast:$cast
                crew:$crew
                chunking:$chunking
                chunking_index:$chunking_index
            ) {
                success
                message
            }
        }
    `;

    const [mutateInsertCredits] = useMutation(INSERT_CREDITS_MUTATION, {
        onCompleted: (data) => {
            if (data && data.addCredits.success) {
                // Refetch the query to get updated data
                // console.log(fetchImage)
                // fetchedCredits.refetch().then((refetched) => {
                //     console.log(refetched)
                //     if(refetched.data.credits.success){
                //         const ref = refetched?.data?.credits
                //         const typeGetImageData = {...ref}
                //         setCredit(() => ({...typeGetImageData}))
                //     }

                // })

            } else {
                console.error("Failed to insert credits into MySQL:", data.addCredits.message, data.addCredits.error);
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

    // const graphImages = useCallback(async() => {

    //     function freshFetch(){
    //         fetch(`${safeKeys.MOVIE_DB}tv/${id}/images?api_key=${safeKeys.API_KEY}`)
    //         .then(response => response.json())
    //         .then(getImageData => {
    //             let value = 0
    //             const {backdrops, posters, logos} = getImageData
    //             let path = ''
    //             if(backdrops && backdrops.length > 0){
    //                 value = Math.max(...backdrops.map(({height}) => height))
    //                 let key = backdrops.findIndex(({height}) => height === value)
    //                 if(key > -1){
    //                     path = backdrops[key].file_path
    //                 }
    //             } 
    //             if(posters && posters.length > 0){
    //                 let posters_value = Math.max(...posters.map(({height}) => height))
    //                 if(posters_value > value){
    //                     let key = posters.findIndex(({height}) => height === posters_value)
    //                     if(key > -1){
    //                         path = posters[key].file_path
    //                     }
    //                     value = posters_value
    //                 }
    //             }

    //             if(logos && logos.length > 0){
    //                 let logos_value = Math.max(...logos.map(({height}) => height))
    //                 if(logos_value > value){
    //                     let key = logos.findIndex(({height}) => height === logos_value)
    //                     if(key > -1){
    //                         path = logos[key].file_path
    //                     }
    //                 }
    //             }
    //             setImages(() => (path))
    //             mutateInsertImage({ variables: { meta_data : {
    //                     type:"tv",
    //                     season:-1,
    //                     episode:-1,
    //                     id:id?parseInt(id):-1
    //                 }, data:{id:getImageData.id,path}                  
    //             } });
    //         })

    //     }         
    //     try{
    //         // fetchImage({
    //         //     variables : {
    //         //     type:"tv",
    //         //     episode:-1,
    //         //     season:-1,
    //         //     id:id?parseInt(id):-1
    //         // }})
    //         // .then(fetched => {
    //         //     if (fetched.data && fetched.data.image.success) {
    //         //         setImages(() => (fetched.data.image.data.path))

    //         //     }else {
    //         //         freshFetch()
    //         //     }
    //         // })
    //         const fetched = await fetchImage({
    //             variables : {
    //             type:"tv",
    //             episode:-1,
    //             season:-1,
    //             id:id?parseInt(id):-1
    //         }})
    //         if (fetched.data && fetched.data.image.success) {
    //             setImages(() => (fetched.data.image.data.path))

    //         }else {
    //             freshFetch()
    //         }        
            
    //     }catch(error){
    //         freshFetch()
    //     }
    // },[fetchImage,id,mutateInsertImage])

    // const fetchTV = useCallback(async() => {
    //     function freshSingleFetch(){
    //         fetch(`${safeKeys.MOVIE_DB}tv/${id}?api_key=${safeKeys.API_KEY}`)
    //         .then(response => response.json())
    //         .then(response => {
    //             console.log(response,"response wait")
    //             setSerie(() => ({...response}))
    //             mutateInsertTV({
    //                 variables: {
    //                     single : {...response}
    //                 },
    //             });
    //         })
    //         // const data = await response.json();

    //         // return {...data}
    //     } 
    //     try{

    //         const fetched = await fetchSingleTV({
    //             variables : { id }})
    //         console.log(fetched)
    //         if(fetched.data && fetched.data.singleTV && !fetched.data.singleTV.seasons){
    //             //first time serie single
    //             console.log("first time")
    //             // const tv = await freshSingleFetch()
    //             // setSerie(() => ({...tv}));
    //             freshSingleFetch()
    //         }else if(fetched.data && fetched.data.singleTV.success){
    //             console.log("Using cached data:", fetched.data);
    //             setSerie(() => ({...fetched.data.singleTV}))
    //         }else {
    //             // const tv = await freshSingleFetch()
    //             // setSerie(() => ({...tv}));
    //             freshSingleFetch()
    //         }
    //         // fetchSingleTV({
    //         //     variables : { id }})
    //         //     .then((fetched) => {
    //         //         console.log(fetched)
    //         //         if(fetched.data && fetched.data.singleTV && !fetched.data.singleTV.seasons){
    //         //             //first time serie single
    //         //             console.log("first time")
    //         //             freshSingleFetch()
                        
                        
    //         //         }else if(fetched.data && fetched.data.singleTV.success){
    //         //             console.log("Using cached data:", fetched.data);
    //         //             setSerie(() => ({...fetched.data.singleTV}))
    //         //         }else {
    //         //             freshSingleFetch()
    //         //         }
    //         //     })

    //     }catch(error){
    //         console.log(error,"error")
    //         freshSingleFetch()
    //     }

    // },[fetchSingleTV,id,mutateInsertTV])

    // const checkFeedback = (id) => {
    //     console.log(id,"id")
    //     //authentication
    //     fetch(process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_API_URL : process.env.REACT_APP_API_URL_LIVE,{credentials: "include"})
    //     .then(async res => {
    //         const {status, user} = await res.json()
    //         if(status){
    //             console.log(`${process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_PLAYLIST_SELECT : process.env.REACT_APP_PLAYLIST_SELECT_LIVE}`)
    //             fetch(`${process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_PLAYLIST_SELECT : process.env.REACT_APP_PLAYLIST_SELECT_LIVE}`,{
    //                 method:"POST",
    //                 headers:{
    //                     "Content-Type":"application/json"
    //                 },
    //                 body:JSON.stringify({id, user, type:"tv"})
    //             })
    //             .then(res => res.json())
    //             .then(({status}) => {
    //                 if(status){
    //                     setPlaylist(() => true)
    //                 }
    //             })
    //         }
    //     })
    // }

    // useEffect(() => {
    //     if(hasFetched.current.feedback){
    //         return
    //     }
    //     hasFetched.current.feedback = true
    //     if (serie && serie.id) {
    //         checkFeedback(serie.id);
    //     }
    // }, [serie]);

    // const fetchCredits = useCallback(async() => {
    //     function freshFetch(){
    //         fetch(`${safeKeys.MOVIE_DB}tv/${id}/aggregate_credits?api_key=${safeKeys.API_KEY}`)
    //         .then(response => response.json())
    //         .then(credits_data => {
    //             console.log(credits_data)
    //             function chunkArray(array, size) {
    //                 const result = [];
    //                 for (let i = 0; i < array.length; i += size) {
    //                     result.push(array.slice(i, i + size));
    //                 }
    //                 return result;
    //             }
    //             setCredit(() => ({...credits_data}));
    //             let cast_all_results = [...credits_data.cast]
    //             if(cast_all_results.length > 100){
    //                 const chunks = chunkArray(cast_all_results, 100);
    //                 for (let i = 0; i < chunks.length; i++) {
    //                     mutateInsertCredits({
    //                         variables: {
    //                             cast:chunks[i],
    //                             id:id?parseInt(id):0,
    //                             chunking:true,
    //                             chunking_index:i
    //                         },
    //                     });
    //                 }
    //             }else{
    //                 mutateInsertCredits({
    //                     variables: {
    //                         cast:cast_all_results,
    //                         id:id?parseInt(id):0,
    //                         chunking:false,
    //                         chunking_index:0
    //                     },
    //                 });
    //             }
    //         })


    //         // let crew_all_results = [...credits_data.crew]
    //         // if(crew_all_results.length > 100){
    //         //     const chunks = chunkArray(crew_all_results, 100);
    //         //     for (let i = 0; i < chunks.length; i++) {
    //         //         mutateInsertCredits({
    //         //             variables: {
    //         //                 crew:chunks[i],
    //         //                 id:id?parseInt(id):0,
    //         //                 chunking:true,
    //         //                 chunking_index:i                        
    //         //             },
    //         //         });
    //         //     }
    //         // }else{
    //         //     mutateInsertCredits({
    //         //         variables: {
    //         //             crew:crew_all_results,
    //         //             id:id?parseInt(id):0,
    //         //             chunking:false,
    //         //             chunking_index:0                    
    //         //         },
    //         //     });
    //         // }
    //         // return {...credits_data}
    //     } 
    //     try{
    //         const current_date = new Date().toISOString().split("T")[0]
    //         // fetchCreditsData({
    //         //     variables : { id:id?parseInt(id):0, date:current_date }})
    //         // .then(fetched => {
    //         //     console.log(fetched)
    //         //     if(fetched.data && fetched.data.credits.success){
    //         //         console.log("Using cached data:", fetched.data);
    //         //         setCredit(() => ({...fetched.data.credits}));
    //         //     }else {
    //         //         freshFetch()
                    
    //         //     }
    //         // })
    //         const fetched = await fetchCreditsData({
    //             variables : { id:id?parseInt(id):0, date:current_date }})
    //         console.log(fetched)
    //         if(fetched.data && fetched.data.credits.success){
    //             console.log("Using cached data:", fetched.data);
    //             setCredit(() => ({...fetched.data.credits}));
    //         }else {
    //             freshFetch()
    //         }
        
    //     }catch(error){
    //         console.log(error,error.message,"error")
    //         freshFetch()
    //     }


    // },[fetchCreditsData,id,mutateInsertCredits])

    const creditRing = useCallback(async(payload) => {
        //it used to return nothing (so credits became {} until the fetch landed) and never stored the crew
        async function freshFetch(){
            const response = await fetch(`${safeKeys.MOVIE_DB}tv/${id}/aggregate_credits?api_key=${safeKeys.API_KEY}`)
            const credits_data = await response.json()
            function chunkArray(array, size) {
                const result = [];
                for (let i = 0; i < array.length; i += size) {
                    result.push(array.slice(i, i + size));
                }
                return result;
            }
            const storeCredits = (group, people) => {
                const all = Array.isArray(people) ? people : []
                const chunks = all.length > 100 ? chunkArray(all, 100) : [all]
                chunks.forEach((chunk, index) => {
                    mutateInsertCredits({
                        variables: {
                            [group]:chunk,
                            id:id?parseInt(id):0,
                            season:-1,
                            episode:-1,
                            chunking:chunks.length > 1,
                            chunking_index:index
                        },
                    });
                })
            }
            storeCredits("cast", credits_data.cast)
            storeCredits("crew", credits_data.crew)
            return {...credits_data}
        } 

        if(payload && payload.success){
            console.log("credits cached")
            return setCredit(() => ({...payload}));
        }else {
            const credits = await freshFetch()
            return setCredit(() => ({...credits}));
        }
    },[safeKeys, id, mutateInsertCredits])
    
    const movieRing = useCallback(async(payload) => {
        function freshSingleFetch(){
            fetch(`${safeKeys.MOVIE_DB}tv/${id}?api_key=${safeKeys.API_KEY}`)
            .then(response => response.json())
            .then(response => {
                console.log(response,"response wait")
                setSerie(() => ({...response}))
                mutateInsertTV({
                    variables: {
                        single : {...response}
                    },
                });
            })
        }    
        if(payload && !payload.seasons){
            //first time serie single
            console.log("first time")
            freshSingleFetch()
        }else if(payload && payload.success){
            console.log("cached serie")
            setSerie(() => ({...payload}))
        }else {
            freshSingleFetch()
        } 
    },[safeKeys, id, mutateInsertTV])
    
    const imageRing = useCallback(async(payload) => {
        function freshFetch(){
            fetch(`${safeKeys.MOVIE_DB}tv/${id}/images?api_key=${safeKeys.API_KEY}`)
            .then(response => response.json())
            .then(getImageData => {
                let value = 0
                const {backdrops, posters, logos} = getImageData
                let path = ''
                if(backdrops && backdrops.length > 0){
                    value = Math.max(...backdrops.map(({height}) => height))
                    let key = backdrops.findIndex(({height}) => height === value)
                    if(key > -1){
                        path = backdrops[key].file_path
                    }
                } 
                if(posters && posters.length > 0){
                    let posters_value = Math.max(...posters.map(({height}) => height))
                    if(posters_value > value){
                        let key = posters.findIndex(({height}) => height === posters_value)
                        if(key > -1){
                            path = posters[key].file_path
                        }
                        value = posters_value
                    }
                }

                let logo = ''
                if(logos && logos.length > 0){
                    let logos_value = Math.max(...logos.map(({height}) => height))
                    let key = logos.findIndex(({height}) => height === logos_value)
                    if(logos_value > value){
                        if(key > -1){
                            path = logos[key].file_path
                        }
                    }
                    let f = logos.findIndex(({iso_639_1}) => iso_639_1 === "en")
                    logo = logos[f]?.file_path
                }
                setImages(() => ({path, logo}))
                mutateInsertImage({ variables: { meta_data : {
                        type:"tv",
                        season:-1,
                        episode:-1,
                        id:id?parseInt(id):-1
                    }, data:{id:getImageData.id,path,logo}                  
                } });
            })

        }         
        try{
            if (payload && payload.success) {
                console.log("image cached data:", payload);
                setImages(() => ({path: payload.data.path, logo: payload.data.logo}))
            }else {
                freshFetch()
            }
        
            
        }catch(error){
            console.log(error)
            freshFetch()            

        }
    },[safeKeys, id, mutateInsertImage])

    const oneRing = useCallback(async() => {
        let count = 0;
        try{
    
            // console.log("tv id", id)
            const fetched = await fetchCombined({
            variables : { 
                    tv: {id},
                    image: {
                        type:"tv",
                        episode:-1,
                        season:-1,
                        id:id?parseInt(id):-1
                    },
                    credit: {
                        id:id?parseInt(id):-1,
                        season:-1,
                        episode:-1
                    }
                }
            })
            console.log(fetched)
            // if(fetched.data.moviePayload.success){
                const imagePayload = fetched.data?.tvPayload?.image
                const moviePayload = fetched.data?.tvPayload?.tv
                const creditPayload = fetched.data?.tvPayload?.credit

                movieRing(moviePayload)
                imageRing(imagePayload)
                creditRing(creditPayload)
            // }
            
        }catch(error){
            console.log(error,"combined serie error")
            count++
            if(count < 5)
                window.location.reload()
            else{
                Swal.fire({
                    icon: 'error',
                    title: 'Network Error',
                    showConfirmButton: false,
                    timer: 1500
                })
            }
            
        }
    },[fetchCombined, id, movieRing, imageRing, creditRing])

    useEffect(() => {
        if(hasFetched.current){
            return
        }
        if(safeKeys && safeKeys.hasOwnProperty("API_KEY") && safeKeys.API_KEY){

            hasFetched.current = true
            oneRing()
        }else{
            loadKeys()
        }
        const controller = new AbortController()
        return () => {
            controller.abort();
        };
    }, [oneRing,safeKeys,loadKeys]);

    // useEffect(() => {
    //     if(hasFetched.current.images){
    //         return
    //     }
    //     // Cancel previous fetch
    //     if (aborterOne.current) aborterOne.current.abort();
    //     aborterOne.current = new AbortController();
    //     hasFetched.current.images = true
    //     graphImages()
    //     return () => {
    //         if (aborterOne.current) aborterOne.current.abort();
    //     };
    // },[graphImages])

    // useEffect(() => {
    //     if(hasFetched.current.tv){
    //         return
    //     }
    //     hasFetched.current.tv = true
    //     // Cancel previous fetch
    //     if (aborterTwo.current) aborterTwo.current.abort();
    //     aborterTwo.current = new AbortController();
    //     fetchTV()
    //     return () => {
    //         if (aborterTwo.current) aborterTwo.current.abort();
    //     };

    // }, [fetchTV]);

    // useEffect(() => {
    //     if(hasFetched.current.credits){
    //         return
    //     }
    //     hasFetched.current.credits = true
    //     // Cancel previous fetch
    //     if (aborter.current) aborter.current.abort();
    //     aborter.current = new AbortController();
    //     fetchCredits();
    //     return () => {
    //         if (aborter.current) aborter.current.abort();
    //     };
    // }, [fetchCredits]);


    const addToPlayList = async() => {

        //authentication
        const res = await fetch(process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_API_URL : process.env.REACT_APP_API_URL_LIVE,{credentials: "include"})
        const {status, user} = await res.json()
        if(status){
            // console.log(`${process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_PLAYLIST : process.env.REACT_APP_PLAYLIST_LIVE}`)
            fetch(`${process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_INSERT_PLAYLIST : process.env.REACT_APP_INSERT_PLAYLIST_LIVE}`,{
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify({id:serie.id, user, type:"tv"})
            })
            .then(res => res.json())
            .then(({status, message}) => {
                if(status){
                    Swal.fire({
                        icon: 'success',
                        title: 'Added to playlist',
                        showConfirmButton: false,
                        timer: 1500
                    })

                    setPlaylist(() => true)
                }else if(message === "Playlist already exists for this user"){
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: "Already in playlist",
                        showConfirmButton: false,
                        timer: 1500
                    })
                    setPlaylist(() => true)
                }
                
            })
        }else{
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: "Sign in to add to playlist",
                showConfirmButton: false,
                timer: 1500
            })
        }

    }
    const navRoute = ({url,state}) => {
        navigate(url,{
            state : {
                ...state
            }
        })
    }

    const fnSeasonOne = useCallback(async(seasonID) => {

        async function freshFetch(){
            const response = await fetch(`${safeKeys.MOVIE_DB}tv/${id}/season/1?api_key=${safeKeys.API_KEY}`);
            const data = await response.json();
            const newData = {...data }
            newData.episodes = newData?.episodes.map(({crew,guest_stars,cast, ...rest}) => rest) || []

            mutateInsertSeasonOne({
                variables: {
                    single : {...newData}
                },
            });
            return {...data}
        } 
        try{
            const fetched = await fetchSeasonOne({
                variables : { id:seasonID }})
            if (fetched.data && fetched.data.season && !fetched.data.season.episodes) {
                console.log("first time...")
                const tv = await freshFetch()
                return ({...tv})
            }else if(fetched.data && fetched.data.season.success){
                console.log("Using cached data:", fetched.data);
                return ({...fetched.data.season})
            }else {
                const tv = await freshFetch()
                return ({...tv})
            }
        }catch(error){
            console.log(error,"season one error")
            // window.location.reload()
            return false
        }


    },[id, mutateInsertSeasonOne, safeKeys, fetchSeasonOne]);
    const seasonOneId = serie?.seasons?.find(({season_number}) => 1 === season_number)?.id
    useEffect(() => {
        let alive = true
        setReactionReady(false)
        if(!seasonOneId) return
        fnSeasonOne(seasonOneId).then(seasonOne => {
            const episodeOne = seasonOne?.episodes?.find(({episode_number}) => 1 === episode_number)
            if(alive) setReactionReady(!!(episodeOne && episodeOne.url))
        })
        return () => { alive = false }
    },[seasonOneId, fnSeasonOne])
    const fetchID = useCallback(async() => {
        async function freshFetch(){
            const response = await fetch(`${safeKeys.MOVIE_DB}tv/${id}/season/1/episode/1/external_ids?api_key=${safeKeys.API_KEY}`);
            const imdb_data = await response.json();
            //these are S1E1's ids, so they are stored and read as that episode's (the series' own
            //external_ids stay untouched); it used to send `external_id`, which the mutation ignores,
            //so nothing was ever stored and every Play refetched TMDB
            mutateUpdateIMDB({
                variables: {
                    external_ids:{
                        id:imdb_data.id,
                        imdb_id:imdb_data.imdb_id,
                        freebase_mid:imdb_data.freebase_mid,
                        freebase_id:imdb_data.freebase_id,
                        tvdb_id:imdb_data.tvdb_id,
                        tvrage_id:imdb_data.tvrage_id != null ? String(imdb_data.tvrage_id) : null,
                        wikidata_id:imdb_data.wikidata_id
                    },
                    id:id?parseInt(id):0,
                    season_number:1,
                    episode_number:1
                },
            });
            return {...imdb_data}
        }
        try{
            const fetched = await fetchIMDBData({
                variables : { id:id?parseInt(id):0, season_number:1, episode_number:1 }})
            if(fetched.data && fetched.data.imdb.success){
                return ({...fetched.data.imdb})
            }else {
                const imdb = await freshFetch()
                return ({...imdb})
            }
        }catch(error){
            console.log(error,"imdb error")
            return false
        }
    },[id, safeKeys, mutateUpdateIMDB, fetchIMDBData])

    // reaction: from "Start a reaction" - the player then opens the reaction set-up (speed.jsx startParty)
    const openPlay = async(reaction = false) => {

        const season = serie.seasons.find(({season_number}) => 1 === season_number)

        if(!season)
            Swal.fire({
                icon: 'error',
                title: 'No episodes',
                text: "episodes for this serie are not available yet",
            })
        
        const seasonOne = await fnSeasonOne(season.id)
        const episodeOne = seasonOne.episodes.find(({episode_number}) => 1 === episode_number)
        const episodeID = episodeOne.id
        if(reaction && !(episodeOne && episodeOne.url)) return reactionNeedsUpload()
        const imdb = await fetchID()

        async function goTOSPEED(){
            function getCurrentWeek() {
                const now = new Date();
                const startOfYear = new Date(now.getFullYear(), 0, 1);
                const pastDaysOfYear = (now - startOfYear) / 86400000;
                return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
            }

            const currentWeek = getCurrentWeek();            
            if(episodeID && episodeID.url && episodeID.url.quality && episodeID.url.quality === "CAM" && currentWeek > episodeID.url.week){
                navRoute({
                    ref:"episode",
                    url:`/video/episode`,
                    state:{
                        stream:"episode",
                        id:episodeID,
                        serieID:id,
                        name:serie.name || serie.original_name,
                        season:1,
                        episode:1,
                        background:images,
                        date:episodeID.air_date,
                        imdbId:imdb?.imdb_id,
                        anime:serie.genres ? serie.genres.find(({id}) => id === 16):serie.genre_ids?serie.genre_ids.includes(16):false,
                }})
            }else{
                async function authentication(){
                    const res = await fetch(process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_API_URL : process.env.REACT_APP_API_URL_LIVE,{credentials: "include"})
                    const {status,user} = await res.json()
                    // console.log(message)
                    return ({status,user})
                }
                const isLoggedIn = await authentication()
                let hasCredits = false
                let hasPaid = false
                let user;
                if(isLoggedIn.status){
                    user = isLoggedIn.user

                    const response = await fetch(`${process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_USER_PAID : process.env.REACT_APP_USER_PAID_LIVE}`,{
                        credentials: "include",
                        method:"POST",
                        headers:{
                            "Content-Type":"application/json",
                            "Accept":"application/json"
                        },
                        body:JSON.stringify({
                            id:episodeID
                        })
                    })

                    const response_data = await response.json()
                    // console.log(response_data.message)

                    if(response_data.status){
                        hasPaid = true
                        Swal.fire({
                            icon: 'success',
                            title: 'rent paid',
                            text: response_data.message,
                            showConfirmButton: false,
                            timer: 2500
                        })
                    }else if(response_data.message === "day for movie credits ended"){
                        Swal.fire({
                            icon: 'error',
                            title: 'rent elapsed',
                            text: response_data.message,
                            showConfirmButton: false,
                            timer: 1500
                        })
                    }

                    const res = await fetch(process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_CHECK_USER_CREDITS : process.env.REACT_APP_CHECK_USER_CREDITS_LIVE,{credentials: "include"})
                    const {sum,message} = await res.json()
                    console.log(message)
                    //affordable for one movie | episode
                    if(sum && sum > 49){
                        hasCredits = true
                    }
                }else{
                    user = localStorage.getItem("session")
                    console.log("id",episodeID)
                    const res = await fetch(`${process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_PAID : process.env.REACT_APP_PAID_LIVE}`,{
                        method:"POST",
                        headers:{
                            "Content-Type":"application/json",
                            "Accept":"application/json"
                        },
                        body:JSON.stringify({
                            user,
                            id:episodeID
                        })
                    })

                    const res_data = await res.json()
                    console.log(res_data.message)
                    if(res_data.status){
                        hasPaid = true
                        Swal.fire({
                            icon: 'success',
                            title: 'rent paid',
                            text: res_data.message,
                            showConfirmButton: false,
                            timer: 2500
                        })
                    }else if(res_data.message === "day for movie credits ended"){
                        Swal.fire({
                            icon: 'error',
                            title: 'rent elapsed',
                            text: res_data.message,
                            showConfirmButton: false,
                            timer: 1500
                        })
                    }

                    const response = await fetch(`${process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_CHECK_REPORT_CREDITS : process.env.REACT_APP_CHECK_REPORT_CREDITS_LIVE}`,{
                        method:"POST",
                        headers:{
                            "Content-Type":"application/json",
                            "Accept":"application/json"
                        },
                        body:JSON.stringify({
                            user

                        })
                    })
                    const {sum} = await response.json()
                    // console.log(message)
                    //affordable for one movie | episode
                    if(sum && sum > 49){
                        hasCredits = true
                    }
                }

                if(!hasCredits && !hasPaid){
                    noCreditsAlert(isLoggedIn.status)
                    return 
                }                                
                navRoute({
                    ref:"speed",
                    url:`/speed`,
                    state:{
                        stream:"tv",
                        id:episodeID,
                        name:serie.name || serie.original_name,
                        season:1,
                        episode:1,
                        background:images,
                        serieID:id,
                        serie_name:serie.name || serie.original_name,
                        startParty:reaction
                }}) 
            }
        }

        if(episodeOne && episodeOne.hasOwnProperty("url") && episodeOne.url){
            await goTOSPEED()
        }else{
            if(episodeOne && episodeOne.hasOwnProperty("player") && episodeOne.player){
                
                const response = await fetch(`${process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_PLAY : process.env.REACT_APP_PLAY_LIVE}`,{
                    method:"POST",
                    headers:{
                        "Content-Type":"application/json",
                        "Accept":"application/json"
                    },
                    
                    body:JSON.stringify({
                        token:episodeOne.player.token,
                        id:episodeID,
                        index:episodeOne.player.index,
                        quality:episodeOne.player.quality,
                        stream:episodeOne.player.stream,
                        size:episodeOne.player.size,
                    })
                })
                const {status} = await response.json()
                if(status){
                    console.log("ready to play")
                    navRoute({
                        url:`/play`,
                        state:{
                            id:episodeID,
                            index:episodeOne.player.index,
                            background:images,
                            player:true,
                            type:episodeOne.player.type,
                            serieID:id,
                            serie_name:serie.name || serie.original_name,
                            season:1,
                            episode:1,
                            date:episodeOne.air_date,
                            year:episodeOne.air_date.substring(0,4),
                            imdbId:episodeOne.imdb_id,
                        }})
                }                
                
            }else{
                navRoute({
                    url:`/video/episode`,
                    state:{
                        stream:"episode",
                        id:episodeID,
                        serieID:id,
                        name:serie.name || serie.original_name,
                        season:1,
                        episode:1,
                        background:images,
                        date:episodeOne.air_date,
                        year:episodeOne.air_date.substring(0,4),
                        imdbId:imdb?.imdb_id,
                        anime:serie.genres ? serie.genres.find(({id}) => id === 16):serie.genre_ids?serie.genre_ids.includes(16):false
                }})
            }
        }
    }
    return (
        
    credits && serie ? 
        <div className="w-[100%] h-[100%]  bg-cover bg-no-repeat bg-center text-white" style={{backgroundImage:`linear-gradient(105deg, #0d0d0d, rgba(0,0,0,0.75), #000, rgba(0,0,0,0.56)),url(${images ? safeKeys.IMG_POSTER + images.path : "/image/logo.png"})`,backgroundPosition:"0% 40%"}}>
            {
                windowWidth >= DESKTOP_WIDTH ? 
                <div className="w-[20%] h-[100%] absolute" style={{background:"linear-gradient(85deg, rgba(13, 13, 13, 0.75), rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.56), rgba(0, 0, 0, 0.45))"}}>
                    <NAVBAR/>
                </div>
                :
                <MOBILE/>
            }

                    <div className={windowWidth >= DESKTOP_WIDTH ? "duration-150 w-[80%] h-[100%] ml-[20%] overflow-y-auto movie-scene flex flex-col":"w-[98%] duration-100 mx-[1%] h-[92%] overflow-y-auto movie-scene flex flex-col"}>
                        <div className={windowWidth >= DESKTOP_WIDTH ? "w-[100%] min-h-[90%] shrink-0 flex flex-row flex-wrap":"w-[100%] h-[auto] shrink-0 flow-root"}>
                            <div 
                                className={windowWidth >= DESKTOP_WIDTH ? "w-[37%] min-h-[100%] shadow background":"w-[40%] m-[0.5%] h-[auto] float-left"} 
                                style={{
                                    backgroundImage:"url(" + safeKeys.IMG_POSTER + serie?.poster_path + ")",
                                    boxShadow:"rgba(0, 0, 0, 0.97) -180px -200px 130px inset, rgba(0, 0, 0, 0.9) 0px 100px 10px, rgba(0, 0, 0, 0.9) 100px 50px 10px"
                                }}
                            >
                                {
                                    windowWidth < DESKTOP_WIDTH && <PICTURE picture={serie?.poster_path} classes={windowWidth >= DESKTOP_WIDTH ? "shadow-lg h-[70%] shadow-blue-500/50" : "shadow-lg h-[200px] w-[50%] m-[0.5%] shadow-blue-500/50 object-contain"} />

                                }
                            </div>
                            <div className={windowWidth >= DESKTOP_WIDTH ? "w-[61%] m-[1%] h-[auto] justify-center items-center":"w-[100%] h-[auto]"}>
                                {
                                    images && images.hasOwnProperty("logo") && images.logo ? 
                                        <PICTURE picture={images.logo} logo={serie.name} classes={"object-contain w-[70%] h-[150px]"} />
                                    :
                                        <h1 className="text-[30px] gradient-text">{serie.name}</h1>
                                }
                                <p style={{fontStyle:"italic",color:"#ffd800"}}>"{serie.tagline}"</p>
                                <h3>{serie.first_air_date} <FontAwesomeIcon icon={faAngleDoubleRight} /> {serie.last_air_date}</h3>
                                <h3>{serie.revenue}</h3>
                                <h3 style={{color:"#ffd800"}}>genre</h3>
                                {
                                    serie.genres && serie.genres.map(({name}) => `${name}`).join(" || ")
                                }
                                <h3 style={{color:"#ffd800"}}>{serie.in_production ? "airing" : "ended"}</h3>
                                <h3 style={{color:"#ffd800"}}>latest episode</h3>
                                <span>{serie.last_episode_to_air?.name} || {serie.last_episode_to_air?.air_date} || {serie.last_episode_to_air?.season_number} || {serie.last_episode_to_air?.episode_number}</span>
                                <h3>seasons || {serie.number_of_seasons}</h3>
                                <h3>episodes || {serie.number_of_episodes}</h3>
                                <h3 style={{color:"#ffd800"}}><FontAwesomeIcon icon={faStar} /> {serie.vote_average && (parseFloat(serie.vote_average)).toFixed(1)}</h3>
                                { serie.episode_run_time && serie.episode_run_time.length > 0 && <h4>{ (serie.episode_run_time[0] > 60) ? (Math.floor(serie.episode_run_time[0] / 60)) + "h " + (serie.episode_run_time[0] % 60) + "min" : serie.episode_run_time[0] + "min" }</h4>}
                                <article>
                                    {serie.overview || "waiting for more content"}
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
                                <div className="w-[100%] flex flex-row flex-wrap border-b-[#fff] border-b-[2px]">
                                    <button
                                        onClick={() => navRoute({
                                            url:`/series/trailer`,
                                            state:{
                                                stream:"tv",
                                                id:serie.id,
                                                background:images
                                            }})} 
                                        className={windowWidth >= DESKTOP_WIDTH ? "w-[23%] text-[#fff] text-[12px] active rounded-md bg-red-950 border-2 border-[#fff] text-center min-h-[30px] m-1":"w-[48%] ml-1 bg-red-950 border-2 border-[#fff] active text-[10px] text-center min-h-[30px] underline"}

                                    >
                                        {/* <img src="/image/2503508.png" alt="UKOapp" className="w-[50%]"/> */}
                                        <h2>trailers</h2>
                                    </button>
                                    <button
                                        onClick={() => navRoute({
                                            url:`/series/similar`,
                                            state:{
                                                stream:"series",
                                                id:serie.id,
                                                background:images
                                            }})} 
                                        className={windowWidth >= DESKTOP_WIDTH ? "w-[23%] text-[#fff] text-[12px] active rounded-md bg-red-950 border-2 border-[#fff] text-center min-h-[30px] m-1":"w-[48%] m-1 bg-red-950 border-2 border-[#fff] active text-[10px] text-center min-h-[30px] underline"}
                                    >
                                        <h2>similar tv</h2>
                                    </button>
                                    
                                    <button
                                        onClick={() => navRoute({
                                            url:`/series/recommendations`,
                                            state:{
                                                stream:"series",
                                                id:serie.id,
                                                background:images
                                            }})} 
                                        className={windowWidth >= DESKTOP_WIDTH ? "w-[23%] text-[#fff] text-[12px] active rounded-md bg-red-950 border-2 border-[#fff] text-center min-h-[30px] m-1":"w-[48%] m-1 bg-red-950 border-2 border-[#fff] active text-[10px] text-center min-h-[30px] underline"}
                                    >
                                        <h2>recommended tv</h2>
                                    </button>
                                    {needsPhone && <PHONEPROMPT className="m-[1%]" />}
                                    {
                                        layouts && serie?.seasons && 
                                        (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => openPlay()}
                                                    className={windowWidth >= DESKTOP_WIDTH ? "text-[#ffd800] text-[30px] w-[15%] underline text-center min-h-[40px] m-[1%]":"text-[#ffd800] text-[30px] w-[48%] mt-[1%] ml-[1%] text-center justify-center h-[40px] rounded-full"}
                                                >
                                                    {/* <h3>play</h3>  */}
                                                    <FontAwesomeIcon icon={faPlayCircle} fontSize={50}/>
                                                </button>
                                                {/* PRD #11: starts at S1E1 like Play; the player opens the reaction set-up */}
                                                {reactionReady && <REACTIONBUTTON desktop={windowWidth >= DESKTOP_WIDTH} onClick={() => openPlay(true)} />}
                                            </>                                            
                                        )
                                    }
                                </div>
                                <div className={`w-[100%] h-[100px] duration-50 movie-scene overflow-x-auto flex flex-col flex-wrap${shortRow(serie?.seasons)}`}>
                                    {
                                        serie?.seasons && serie?.seasons.map(({episode_count,id,name,season_number,vote_average},node) => 
                                            <button
                                                onClick={() => navRoute({
                                                    url:`/series/season`,
                                                    state:{
                                                        stream:"series",
                                                        id:serie.id,
                                                        seasonID:id,
                                                        season:season_number,
                                                        name:serie.name,
                                                        // seasons:serie.seasons,
                                                        background:images,
                                                        anime:serie.genres ? serie.genres.find(({id}) => id === 16):serie.genre_ids?serie.genre_ids.includes(16):false,
                                                    }})}                                                
                                                key={node}
                                                className={windowWidth >= DESKTOP_WIDTH ? "min-w-[24%] h-[100%] border-[2px] rounded-md m-[0.5%] hover:contrast-150":"min-w-[60%] border-[2px] h-[100%] m-[0.5%] hover:contrast-150"}
                                            >
                                                <p>{name}</p>
                                                <p>season {season_number} || episode(s) ({episode_count})</p>
                                                <p style={{color:"#ffd800"}}><FontAwesomeIcon icon={faStar} /> {(parseFloat(vote_average)).toFixed(1)}</p>
                                            </button>
                                        )
                                    }
                                </div>
                                <div className="w-[100%]">
                                    <button
                                        type="button"
                                        className="w-[100%] h-[50px] bg-[#ffd800] text-black font-bold hover:bg-[#ffd800]/80 duration-200"
                                        onClick={() => addToPlayList()}
                                    >
                                        {
                                            playlist ? 
                                                <>
                                                    <FontAwesomeIcon icon={faBasketShopping} /> <span>Added to Playlist</span>
                                                </>
                                            :
                                                <>
                                                    <FontAwesomeIcon icon={faCirclePlus} /> Add to Playlist
                                                </>
                                                
                                        }
                                        
                                    </button>
                                </div>

                            </div>
                        </div>
                        {
                            credits.cast && credits.cast.length > 0 &&
                            <div className={windowWidth >= DESKTOP_WIDTH ? "w-[90%] h-[auto] shrink-0 mx-[5%] mt-[2%] mb-[5%]":"w-[100%] h-[220px] shrink-0 mt-[2%] mb-[2%]"}>

                                <h1 style={{textAlign:"left",textDecoration:"underline"}}>CASTS</h1>
                                <div className={`w-[100%] duration-50 movie-scene ${windowWidth >= DESKTOP_WIDTH ? "h-[400px]" : "h-[200px]"} flex flex-col flex-wrap overflow-x-auto overflow-y-hidden my-[1%]${shortRow(credits.cast)}`}>
                                    
                                    {
                                        credits.cast.map(({profile_path,roles,popularity,original_name,name,media_type,known_for_department,id,gender,adult},serie_key) => 
                                            <div 
                                                key={serie_key} 
                                                onClick={() => navRoute({
                                                    url:`/people/id`,
                                                    state:{
                                                        id
                                                    }})}  
                                                className={windowWidth >= DESKTOP_WIDTH ? "cursor-pointer w-[25%] h-[100%] hover:scale-115 duration-700 hover:contrast-150":"cursor-pointer w-[48%] h-[100%] m-[0.5%] hover:scale-115 duration-700 hover:contrast-150"}>
                                                <div className="w-[100%] h-[100%]">
                                                    <PICTURE key={id} classes={windowWidth >= DESKTOP_WIDTH ? "object-cover h-[100%]":"object-cover h-[100%] rounded-xl"} picture={profile_path} />
                                                    <div className="w-[100%] relative min-h-[60px] top-[-50%] bg-[rgba(0,0,0,0.75)] bg-opacity-60 text-white flex flex-col items-center justify-center">
                                                        <h2 className={windowWidth >= DESKTOP_WIDTH ? "text-[15px] font-bold":""}>{original_name || name}</h2>
                                                        <p style={{color:"#ffd800"}}><FontAwesomeIcon icon={faStar} /> {parseFloat(popularity).toFixed(1)}</p>
                                                        {
                                                            roles && roles.map(({character,episode_count},node) => 
                                                                <div className="" key={node}>
                                                                    <h3 style={{fontStyle:"italic"}}>{character}</h3>
                                                                    <p>{episode_count} episodes</p>
                                                                </div>
                                                            )
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    }
                                </div>
                            </div>
                        }
                        {/* {
                            credits.crew && credits.crew.length > 0 &&
                            <div className={windowWidth >= DESKTOP_WIDTH ? "w-[90%] h-[420px] mx-[5%] my-[2%]":"w-[100%] h-[420px] my-[2%]"}>

                                <h1 style={{textAlign:"left",textDecoration:"underline"}}>CREW</h1>
                                <div className={`w-[100%] duration-50 movie-scene ${windowWidth >= DESKTOP_WIDTH ? "h-[400px]" : "h-[300px]"} flex flex-col flex-wrap overflow-x-auto overflow-y-hidden my-[1%]${shortRow(credits.crew)}`}>
                                    
                                    {
                                        credits.crew.map(({profile_path,jobs,popularity,original_name,name,media_type,known_for_department,id,gender,adult},serie_key) => 
                                            <div 
                                                key={serie_key} 
                                                onClick={() => navRoute({
                                                    url:`/series/person`,
                                                    state:{
                                                        id
                                                    }})} 
                                                className={windowWidth >= DESKTOP_WIDTH ? "cursor-pointer w-[25%] h-[100%] hover:contrast-150":"cursor-pointer w-[48%] h-[100%] m-[0.5%] hover:contrast-150"}>
                                                <div className="w-[100%] h-[100%]">
                                                    <PICTURE key={id} classes={windowWidth >= DESKTOP_WIDTH ? "object-cover h-[100%]":"object-cover h-[100%] rounded-xl"} picture={profile_path} />
                                                    <div className="w-[100%] relative min-h-[60px] top-[-50%] bg-[#000000] bg-opacity-60 text-white flex flex-col items-center justify-center">
                                                        <h2 className="text-[15px] font-bold">{original_name || name}</h2>
                                                        <p style={{color:"#ffd800"}}><FontAwesomeIcon icon={faStar} /> {parseFloat(popularity).toFixed(1)}</p>
                                                        {
                                                            jobs && jobs.map(({job,episode_count},node) => 
                                                                <div className="" key={node}>
                                                                    <h3>{job}</h3>
                                                                    <p>{episode_count} episodes</p>
                                                                </div>
                                                            )
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    }
                                </div>
                            </div>
                        } */}
                        {/* <div className="w-[90%] duration-50 mx-[5%] mt-[1%] movie-scene flex flex-row min-h-[100%] flex-wrap">
                            {
                                Object.entries(images).map(([key,value],node) => 
                                    value && typeof(value) === "object" && value.map(({file_path},index) => 
                                        <div className="m-[0.5%] w-[48%] h-[50%]" key={node + index}>
                                            <PICTURE picture={file_path} classes={"object-contain h-[100%]"} />
                                        </div>
                                    )
                                )
                            }

                        </div> */}
                        <COMMENTS type="tv" id={id} windowWidth={windowWidth} />
                    </div>


                </div>
                    :
                    <LOAD/>              

    )
}

export default SERIE
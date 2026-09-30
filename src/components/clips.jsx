
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import { useMutation, useLazyQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { useKeys } from './safe';
import SWEETPAGE from "../midlleware/pages"
import { useWindowWidth, DESKTOP_WIDTH } from "../hooks/useWindowWidth";
import { ReelActions, ReelComments, useReelStats } from "./eden/reels";

const CLIPS = ({stream,many=false,season=false,episode=false,addValidation,firstClip=false,data,updateClip}) => {
    const [validated, setValidated] = useState([])
    //like + comment under every trailer, as on the Eden mini series (user service /reels, eden/reels.jsx)
    const trailerKeys = useMemo(() => validated.map(({key}) => key), [validated])
    const [stats, updateStat] = useReelStats(trailerKeys)
    const [commentsOn, setCommentsOn] = useState(null)
    const closeComments = useCallback(() => setCommentsOn(null), [])
    const commentCount = useCallback((comments) => commentsOn && updateStat(commentsOn.key, { comments }), [commentsOn, updateStat])
    const windowWidth = useWindowWidth()
    const navigate = useNavigate()
    // const [movie, setMovie] = useState(null);
    const [totalPages, setTotalPages] = useState(null)
    const [page, setPage] = useState(1)
    // const client = useApolloClient();
    const {safeKeys} = useKeys()
    const FETCH_COMINED_QUERY = gql`
        query MoviePayload (
            $image: IMAGE_ARGUMENTS!
            $movie: SINGLE_MOVIE_ARGUMENTS!
            $credit: CREDIT_ITEM_ARGUMENTS!
        ) {
            moviePayload(
                image: $image,
                movie: $movie,
                credit: $credit
            ) {
                image {
                    data {
                        id
                        path
                    }
                    meta_data {
                        type
                        season
                        episode
                    }
                    success
                    error
                }
                movie {
                    adult
                    backdrop_path
                    genre_ids
                    genres {
                        id
                        name
                    }
                    id
                    original_language
                    original_title
                    overview
                    popularity
                    poster_path
                    release_date
                    title
                    video
                    runtime
                    revenue
                    budget
                    status
                    origin_country
                    production_companies {
                        id
                        name
                    }
                    tagline
                    vote_average
                    vote_count
                    url {
                        fileName
                    }
                    success
                    error
                    message
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
        // pollInterval: 500, // fetches new data at that interval
        notifyOnNetworkStatusChange: true,
        fetchPolicy: 'cache-first',
        // variables,
        // skip: !variables.page, // Skip query execution if variables are not set
    });
    const INSERT_TV_MUTATION = gql`
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

    const [mutateInsertTV] = useMutation(INSERT_TV_MUTATION, {
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

    const INSERT_MOVIE_MUTATION = gql`
        mutation AddMovie(
            $adult:Boolean!
            $backdrop_path:String
            $id:Int!
            $original_language:String!
            $original_title:String!
            $overview:String!
            $popularity:Float!
            $poster_path:String
            $release_date:String!
            $title:String!
            $video :Boolean!
            $vote_average:Float!
            $vote_count:Float!
            $belongs_to_collection:COLLECTION_INPUT
            $production_companies:[PRODUCTION_COMPANIES_INPUT]
            $production_countries:[PRODUCTION_COUNTRIES_INPUT]
            $spoken_languages:[SPOKEN_LANGUAGES_INPUT]
            $runtime:Int!
            $genres:[GENRES_IDS_INPUT]
        ) {
            addMovie(
                adult:$adult
                backdrop_path:$backdrop_path
                genres:$genres
                id:$id
                original_language:$original_language
                original_title:$original_title
                overview:$overview
                popularity:$popularity
                poster_path:$poster_path
                release_date:$release_date
                title:$title
                video:$video
                vote_average:$vote_average
                vote_count:$vote_count
                belongs_to_collection:$belongs_to_collection
                production_companies:$production_companies
                production_countries:$production_countries
                runtime:$runtime
                spoken_languages:$spoken_languages
            ) {
                success
                message
            }
        }
    `;

    const [mutateInsertMovie] = useMutation(INSERT_MOVIE_MUTATION, {
        onCompleted: (data) => {
            console.log(data)
            if (data.addMovie.success) {
                if(data.addMovie.message === "already inserted")
                    console.log("movie inserting already started...")
                console.log("Movie successfully inserted into MySQL:", data.addMovie.message);
                // fetchedMovieData.refetch()
                // .then(status => console.log(status,"status"))
            } else {
                console.error("Failed to insert movies into MySQL:", data.addMovie.message, data.addMovie.error);
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

    const movieRing = useCallback(async(payload,id) => {
        async function freshFetch(){
            const response = await fetch(`${safeKeys.MOVIE_DB}${stream}/${id}?api_key=${safeKeys.API_KEY}`);
            const data = await response.json();
            // console.log(stream,"stream")
            if(stream === "movie"){
                mutateInsertMovie({
                    variables: {...data},
                });
            }else{
                mutateInsertTV({
                    variables: {
                        single : {...data}
                    },
                });
            }

            return {...data}
        }

        if(payload && !payload.runtime){
            //first time
            // console.log("first time...")
            const movie = await freshFetch()
            // setMovie(() => ({...payload,...movie}));
            return ({...payload,...movie})
        }else if(payload.success){
            // console.log("Using cached data:", payload);
            // setMovie(() => ({...payload}));
            return ({...payload})
        }else {
            const movie = await freshFetch()
            // setMovie(() => ({...movie}));
            return ({...movie})
        }
    },[safeKeys,stream,mutateInsertMovie,mutateInsertTV])

    const oneRing = useCallback(async(id) => {
        try{
            if(!safeKeys.MOVIE_DB){
                return {
                    status:false,
                    error:"safe keys error"
                }
            }
            const fetched = await fetchCombined({
                variables : {
                    movie: {id:parseInt(id)},
                    image: {
                        type:stream,
                        episode:episode ? parseInt(episode) : -1,
                        season:season ? parseInt(season) : -1,
                        id:id?parseInt(id):-1
                    },
                    credit: {id:id?parseInt(id):0}
                },
                // context: { fetchOptions: { signal } } // allow network abortion
            })
            // console.log(fetched,"fetched...",`${safeKeys.MOVIE_DB}${stream}/${id}?api_key=${safeKeys.API_KEY}`)
            // if(fetched.data.moviePayload.success){
                // const imagePayload = fetched.data?.moviePayload?.image
                const moviePayload = fetched.data?.moviePayload?.movie
                // const creditPayload = fetched.data?.moviePayload?.credit

                return {
                    status:true,
                    data:await movieRing(moviePayload,id)
                }

                // imageRing(imagePayload)
                // creditRing(creditPayload)
            // }

        }catch(error){
            console.log(error)
            return {
                status:false,
                error
            }

        }
    },[fetchCombined,season,episode,safeKeys,stream,movieRing])

    // useEffect(() => {
    //     if(windowWidth >= DESKTOP_WIDTH)
    //         return
    //     const controller = new AbortController();
    //     oneRing(controller.signal).catch(err => {
    //         if (err && err.name === 'AbortError') return;
    //         console.error("oneRing outer error", err);
    //     });
    //     return () => {
    //         try { controller.abort(); } catch(e) { /* ignore */ }
    //     };
    // }, [oneRing,windowWidth]);

    const FETCH_TRAILER_QUERY = gql`
        query Video (
            $type: String!
            $season: Int!
            $episode: Int!
            $id : ID!
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
                        name
                    }
                }
                success
                error
            }
        }
    `
    const [fetchTrailer] = useLazyQuery(FETCH_TRAILER_QUERY,{
        notifyOnNetworkStatusChange: true,
        fetchPolicy: 'cache-first',
    });

    const [mutateInsertTrailer] = useMutation(gql`
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
                    console.log("trailer successfully inserted into MySQL:", data.addVideo.success);

                } else {
                    console.error("Failed to insert trailer into MySQL:", data.addVideo.message, data.addMovies.error);

                }

            }
        },
        onError: (error) => {
            const isAbort = error && (
                error.name === 'AbortError' ||

                (typeof error.message === 'string' && /abort(ed)?/i.test(error.message))
            );
            if (isAbort) return;
            console.error("insert video Error:", error);
        },
    });

    const FETCH_VIDEO_QUERY = gql`
        query CollectionVideo (
            $type: String!
            $data : COLLECTION_VIDEO_DATA_INPUT!
        ){
            collectionVideo(
                type:$type,
                data:$data
            ) {
                data {
                    id
                    data {
                        key
                        name
                    }
                }
                success
                error
                message
            }
        }
    `
    const [fetchVideo] = useLazyQuery(FETCH_VIDEO_QUERY,{
        notifyOnNetworkStatusChange: true,
        fetchPolicy: 'cache-first',
    });

    const [mutateInsertVideo] = useMutation(gql`
        mutation AddCollectionVideo(
            $meta_data: VIDEO_COLLECTION_META_DATA_INPUT!
            $data: VIDEO_COLLECTION_DATA_INPUT!
        ) {
            addCollectionVideo(
                meta_data: $meta_data
                data: $data
            ){
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
                    console.log("trailer successfully inserted into MySQL:", data.addVideo.success);

                } else {
                    console.error("Failed to insert trailer into MySQL:", data.addVideo.message, data.addMovies.error);

                }

            }
        },
        onError: (error) => {
            const isAbort = error && (
                error.name === 'AbortError' ||

                (typeof error.message === 'string' && /abort(ed)?/i.test(error.message))
            );
            if (isAbort) return;
            console.error("insert video Error:", error);
        },
    });

    // useEffect(() => {
    //     const invalidateCache = () => {
    //         console.log("Invalidating Apollo Client cache");
    //         client.refetchQueries({
    //             include: [FETCH_VIDEO_QUERY] // Refetch all queries using this query
    //         });
    //         // client.resetStore(); // Alternative: Clears the entire cache (more aggressive)
    //     };

    //     // Set up the timer to invalidate the cache after 24 hours
    //     const timerId = setTimeout(invalidateCache, 86400000); // 24 hours in milliseconds

    //     // Clear the timer when the component unmounts to prevent memory leaks
    //     return () => clearTimeout(timerId);
    // }, [client,FETCH_VIDEO_QUERY]); // A

    // Function to check if the YouTube video thumbnail URL returns valid data
    const checkURL = async (url) => {
        try {
            const res = await fetch(url, { method: "HEAD" });
            // If not OK (e.g., 404), return false
            if (!res.ok) return false;
            return true;
        } catch (err) {
            console.error("Error checking URL:", err);
            return false;
        }
    };

    const validateVideos = useCallback(async({signal,page}) => {

        // async function run(){
            if(data === null || !safeKeys.MOVIE_DB)
                return

            const bkData = async() => {
                try{

                    // console.log(stream,"stream")
                    const videoData = await fetch(`${process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_VIDEO_PAGE : process.env.REACT_APP_VIDEO_PAGE_LIVE}`, {
                        // credentials: "include",
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Accept": "application/json"
                        },
                        body: JSON.stringify({
                            page,
                            type:stream
                        })
                    })

                    const {total_pages, data, all} = await videoData.json()
                    // console.log(total_pages,"total pages",page,"page")
                    setTotalPages(total_pages)
                    return {data, all}
                }catch(error){
                    console.log(error,"error")
                    return []
                }
            }
            let collectionTrailorData = [];
            const internalData = await bkData()
            // console.log(internalData,"internalData",collectionTrailorData,"fetched")
            // collectionTrailorData = [...collectionTrailorData,...internalData]
            const additions = [];
            //Eden mini series have their own rows on home (eden/miniseries.jsx) - these rows are blockbuster trailers only
            if(page === 1){
                console.log("page 1 videos")
                const fetchFresh = async () => {
                    // const getCollectionVideoData = (await Promise.all(data && data.length > 0 && data[0].results && data[0].results.map(async({id}) => {
                    //     const response = await fetch(`${safeKeys.MOVIE_DB}${stream}/${id}/videos?api_key=${safeKeys.API_KEY}`,{signal});
                    //     const getVideoData = await response.json();
                    //     if(getVideoData && getVideoData.hasOwnProperty("results") && getVideoData.results && getVideoData.results.length > 0){
                    //         return ({
                    //             id,
                    //             data:await Promise.all(getVideoData.results.map(async({key,name}) => ({key,name})))
                    //         })
                    //     }
                    //     return false
                    // })))
                    // .filter(Boolean)
                    const getCollectionVideoData = [];

                    if (data && data.length > 0 && data[0].results) {
                        for (const { id } of data[0].results) {
                            try {
                                const response = await fetch(
                                    `${safeKeys.MOVIE_DB}${stream}/${id}/videos?api_key=${safeKeys.API_KEY}`,
                                    { signal }
                                );

                                const getVideoData = await response.json();

                                if (
                                    getVideoData &&
                                    getVideoData.results &&
                                    getVideoData.results.length > 0
                                ) {
                                    const videos = [];
                                    for (const { key, name } of getVideoData.results) {

                                        videos.push({ key, name });

                                    }

                                    getCollectionVideoData.push({
                                        id,
                                        data: videos,
                                    });
                                }

                            } catch (err) {
                                if (err.name !== "AbortError") {
                                    console.error("Fetch error:", err);
                                }
                            }
                        }
                    }
                    mutateInsertVideo({
                        variables: {
                            meta_data: {
                                type: stream,
                            },
                            data: { videos:getCollectionVideoData },
                        },
                    })
                    return getCollectionVideoData;
                }
                const fetched = await fetchVideo({
                    variables : {
                        type:stream,
                        data:{
                            data:(data && data.length > 0 && data[0]?.results) ? data[0].results.map(({id}) => ({id})):[]
                        }
                }})
                if(fetched.loading) console.log("fetching video Loading...");
                if(fetched.error){
                    console.log(fetched.error.message);
                }

                if(fetched.data && fetched.data.collectionVideo){
                    if (fetched.data.collectionVideo.error === "no records found") {
                        console.log("fetching fresh collection video data")
                        collectionTrailorData = await fetchFresh()
                    } else {
                        console.log("fetched collection cached",fetched)
                        collectionTrailorData = fetched.data?.collectionVideo?.data
                    }

                }else{
                    collectionTrailorData = await fetchFresh()
                }

                for (const collection of (collectionTrailorData || [])) {
                    for (const { key, name } of (collection?.data || [])) {
                        const thumbUrl = `https://img.youtube.com/vi/${key}/maxresdefault.jpg`;
                        // additions.push({ key, name });
                        if (await checkURL(thumbUrl)) {
                            let movieInfo;
                            if(windowWidth < DESKTOP_WIDTH){
                                const movieDetail = await oneRing(collection?.id)
                                // console.log(movieDetail,"movie detail")
                                if(movieDetail.status){
                                    // console.log("in here...")
                                    movieInfo = movieDetail.data
                                }
                                additions.push({ key, name, movieInfo, id: collection?.id, stream });

                            }else{
                                additions.push({ key, name, id: collection?.id });
                            }
                            // console.log(additions,"additions")
                            break; // only need the first valid for non-many
                        }
                    }
                }

            }else{
                // let all = []
                // console.log("not page 1")
                // console.log(internalData?.all,"all")
                for(const blockbuster of (internalData?.all || [])){
                    for(const {key, name, id} of blockbuster){
                        const thumbUrl = `https://img.youtube.com/vi/${key}/maxresdefault.jpg`;
                        if (await checkURL(thumbUrl)) {
                            let movieInfo;
                            if(windowWidth < DESKTOP_WIDTH){
                                const movieDetail = await oneRing(id)
                                if(movieDetail.status){
                                    movieInfo = movieDetail.data
                                }
                                additions.push({ key, name, movieInfo, id, stream });

                            }else{
                                additions.push({ key, name, id });

                            }
                            // console.log(additions,"additions")
                            break; // only need the first valid for non-many
                        }
                    }
                }
            }

            // console.log(additions,"additions")

            if (additions.length) {
                if(firstClip)
                    firstClip(`${additions[0].key}`)
                if(windowWidth < DESKTOP_WIDTH)
                    addValidation([...additions])
                else{
                    setValidated((prev) => {
                        // append new validated items once
                        return [...additions];
                    });
                }
            }
            setPage(page)

    },[mutateInsertVideo,fetchVideo,stream,data,firstClip,safeKeys,windowWidth,addValidation,oneRing])

    // useEffect(() => {
    //     // const getRandomNumber = (min, max) => {
    //     //     return Math.floor(Math.random() * (max - min + 1)) + min;
    //     // };
    //     if(firstClip && validated && validated.length > 0){
    //         console.log("selected first clip from validated videos",validated)
    //         firstClip(`${validated[0].key}`)
    //     }
    // },[validated,firstClip])

    // useEffect(() => {
    //     if(!many)
    //         validateVideos()

    // },[firstClip,data,fetchVideo,mutateInsertVideo,stream,many]);
    useEffect(() => {
        const controller = new AbortController();

        const run = async () => {
            try {
                await validateVideos({signal:controller.signal,page:1});
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error(err);
                }
            }
        };

        if (!many)
            run();

        return () => controller.abort();
    }, [many, validateVideos]);
    // build a memoized runner object so the async work is invoked inside effects
    const validateTrailer = useCallback(async(signal) => {
        // const run = async () => {
        if (data === null || !safeKeys.MOVIE_DB) return;

        // const controller = new AbortController();
        // const signal = controller.signal;
        if(data && data.length > 0 && data[0].results){
            for (const { id } of data[0].results) {
                const fetchFresh = async () => {
                    const url = `${safeKeys.MOVIE_DB}${stream}/${id}${
                        season ? `/season/${season}` : ''
                    }${episode ? `/episode/${episode}` : ''}/videos?api_key=${safeKeys.API_KEY}`;
                    // console.log(url);
                    const response = await fetch(url,{signal});
                    const getVideoData = await response.json();
                    mutateInsertTrailer({
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
                    return getVideoData;
                };

                const fetched = await fetchTrailer({
                    variables: {
                        type: stream,
                        episode: episode ? parseInt(episode) : -1,
                        season: season ? parseInt(season) : -1,
                        id: id ? parseInt(id) : 0,
                    },
                });

                if (fetched.loading) console.log('fetching video Loading...');
                if (fetched.error) console.log(fetched.error.message);

                if (fetched.data && fetched.data.video) {
                    //a cached row comes back with success - only go to TMDB when there is none
                    const trailorData =
                        fetched.data.video.success && fetched.data.video.data?.results?.length
                            ? fetched.data.video.data
                            : await fetchFresh();
                    // console.log(trailorData,"trailer data")
                    if (trailorData && Array.isArray(trailorData.results) && trailorData.results.length > 0) {
                            // batch thumbnail checks to avoid many re-renders
                            (async () => {
                                const additions = [];
                                // if (many) {
                                //     for (const { key, name } of trailorData.results) {
                                //         // const thumbUrl = `https://img.youtube.com/vi/${key}/maxresdefault.jpg`;
                                //         additions.push({ key, name });
                                //         // if (await checkURL(thumbUrl)) additions.push({ key, name });
                                //     }
                                // } else {
                                //     for (const { key, name } of trailorData.results) {
                                //         // const thumbUrl = `https://img.youtube.com/vi/${key}/maxresdefault.jpg`;
                                //         additions.push({ key, name });
                                //         // if (await checkURL(thumbUrl)) {
                                //         //     additions.push({ key, name });
                                //         //     break; // only need first valid for single
                                //         // }
                                //     }
                                // }
                                //the trailer page already knows the title - no per-trailer movie lookup
                                for (const { key, name, site } of trailorData.results) {
                                    if (key && (!site || site === "YouTube")) additions.push({ key, name });
                                }

                                //                                 let movieInfo;
                                // if(windowWidth < DESKTOP_WIDTH){
                                //     const movieDetail = await oneRing(id)
                                //     if(movieDetail.status){
                                //         movieInfo = movieDetail.data
                                //     }
                                // }

                                // for (const { key, name } of getVideoData.results) {
                                //     if(movieInfo){
                                //         videos.push({ key, name, movieInfo });
                                //     }else{
                                //         videos.push({ key, name });
                                //     }
                                // }

                                // if (additions.length) {
                                //     setValidated((prev) => [...prev, ...additions]);
                                // }
                                if (additions.length) {
                                    if(firstClip)
                                        firstClip(`${additions[0].key}`)
                                    //the trailer page lists every trailer itself
                                    if(many || windowWidth < DESKTOP_WIDTH)
                                        addValidation([...additions])
                                    else{
                                        setValidated((prev) => {
                                            // append new validated items once
                                            return [...prev, ...additions];
                                        });
                                    }
                                }
                            })();
                    }
                }
            }
        }

        // }

        // return { run };
        // keep memo tied to inputs used inside the async runner
    }, [data, stream, season, episode, fetchTrailer, mutateInsertTrailer, many, firstClip, safeKeys, addValidation, windowWidth]);

    useEffect(() => {
        if (many){
            const controller = new AbortController();

            const run = async () => {
                try {
                    await validateTrailer(controller.signal);
                } catch (err) {
                    if (err.name !== 'AbortError') {
                        console.error(err);
                    }
                }
            };

            run();

            return () => controller.abort();
        }
    }, [many, validateTrailer]);

    const clipUpdate = useCallback((key) => {
        updateClip(key);
    }, [updateClip]);

    if(many || windowWidth < DESKTOP_WIDTH){
        return null
    }


    return (
        <div className="w-full clips">
            {
                totalPages && validated && validated.length > 0 ? (
                    <>
                        <SWEETPAGE intitializeMovies={validateVideos} page={page} index={"movie"} total_pages={totalPages}/>
                        {/* same card as the Eden mini series rows (eden/miniseries.jsx) */}
                        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 movie-scene">
                            {validated.map(({key,name,id}) => (
                                <article
                                    key={key}
                                    className="snap-start shrink-0 w-[23%] rounded-xl overflow-hidden border border-[#2E2E3A] bg-[#0f111a] text-white">
                                    <button
                                        onClick={() => clipUpdate(key)}
                                        className="relative block w-full aspect-video group"
                                        aria-label={`Play ${name}`}>
                                        <img
                                            src={`https://img.youtube.com/vi/${key}/hqdefault.jpg`}
                                            alt={name}
                                            loading="lazy"
                                            className="w-full h-full object-cover group-hover:contrast-125 duration-200"
                                        />
                                        <span className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 duration-200">
                                            <FontAwesomeIcon icon={faPlay} className="text-[#ffd800] text-3xl" />
                                        </span>
                                    </button>
                                    <div className="flex items-center justify-between gap-2 p-2">
                                        <p className="text-sm line-clamp-2">{name}</p>
                                        {
                                            id && (
                                                <button
                                                    onClick={() => navigate(stream === "tv" ? "/series/id" : "/movies/id", { state: { id } })}
                                                    className="shrink-0 inline-flex items-center gap-1 rounded border border-[#ffd800]/60 px-2 py-[2px] text-xs text-[#ffd800] hover:bg-[#ffd800] hover:text-black duration-200"
                                                    aria-label={`Read more about ${name}`}>
                                                    <FontAwesomeIcon icon={faCircleInfo} />
                                                    Read more
                                                </button>
                                            )
                                        }
                                    </div>
                                    <ReelActions reel={{ key, name }} stat={stats[key]}
                                        onChange={(change) => updateStat(key, change)}
                                        onComments={() => setCommentsOn({ key, name })} />
                                </article>
                            ))}
                        </div>
                    </>
                ) : !totalPages && (
                    <div className="flex gap-3 pb-2">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="shrink-0 w-[23%] aspect-video rounded-xl bg-[#2E2E3A] animate-pulse" />
                        ))}
                    </div>
                )
            }
            {commentsOn && <ReelComments reel={commentsOn} onClose={closeComments} onCount={commentCount} />}
        </div>
    )
}
export default React.memo(CLIPS);
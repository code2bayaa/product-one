
import { useEffect, useState, useMemo, useCallback } from 'react';
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Thumbs } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/thumbs";
import CLIP from "./clip";
import { useMutation, useLazyQuery, useApolloClient } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { useKeys } from './safe';
const CLIPS = ({stream,many=false,season=false,episode=false,firstClip=false,data,updateClip}) => {
    const [validated, setValidated] = useState([])
    const client = useApolloClient();
    const {safeKeys} = useKeys()

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

    const validateVideos = useMemo(() => {

        async function run(){
            if(data === null)
                return
            const fetchFresh = async () => {
                const getCollectionVideoData = (await Promise.all(data && data.length > 0 && data[0].results && data[0].results.map(async({id}) => {
                    const response = await fetch(`${safeKeys.MOVIE_DB}${stream}/${id}/videos?api_key=${safeKeys.API_KEY}`);
                    const getVideoData = await response.json();
                    if(getVideoData && getVideoData.hasOwnProperty("results") && getVideoData.results && getVideoData.results.length > 0){
                        return ({
                            id,
                            data:await Promise.all(getVideoData.results.map(async({key,name}) => ({key,name})))
                        })
                    }
                    return false
                })))
                .filter(Boolean)
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
            let collectionTrailorData;
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

            // batch thumbnail validation to avoid many re-renders
            (async () => {
                const additions = [];
                for (const collection of (collectionTrailorData || [])) {
                    if (many) {
                        for (const { key, name } of (collection?.data || [])) {
                            const thumbUrl = `https://img.youtube.com/vi/${key}/maxresdefault.jpg`;
                            additions.push({ key, name });
                            // if (await checkURL(thumbUrl)) additions.push({ key, name });
                        }
                    } else {
                        for (const { key, name } of (collection?.data || [])) {
                            const thumbUrl = `https://img.youtube.com/vi/${key}/maxresdefault.jpg`;
                            additions.push({ key, name });
                            // if (await checkURL(thumbUrl)) {
                            //     additions.push({ key, name });
                            //     break; // only need the first valid for non-many
                            // }
                        }
                    }
                }

                if (additions.length) {
                    setValidated((prev) => {
                        // append new validated items once
                        return [...prev, ...additions];
                    });
                }
            })();

        }

        return {run};
    },[mutateInsertVideo,fetchVideo,stream,data,firstClip,many])

    useEffect(() => {
        // const getRandomNumber = (min, max) => {
        //     return Math.floor(Math.random() * (max - min + 1)) + min;
        // };
        if(firstClip && validated && validated.length > 0){
            // console.log("selected first clip from validated videos",validated)
            firstClip(`${validated[0].key}`)
        }
    },[validated])

    useEffect(() => {
        if(!many)
            validateVideos.run()

    },[firstClip,data,fetchVideo,mutateInsertVideo,stream,many]);

    // build a memoized runner object so the async work is invoked inside effects
    const validateTrailer = useMemo(() => {
        const run = async () => {
            if (data === null) return;

            data && data.length > 0 && data[0].results
                && data[0].results.map(async ({ id }) => {
                    const fetchFresh = async () => {
                        const url = `${safeKeys.MOVIE_DB}${stream}/${id}${
                            season ? `/season/${season}` : ''
                        }${episode ? `/episode/${episode}` : ''}/videos?api_key=${safeKeys.API_KEY}`;
                        console.log(url);
                        const response = await fetch(url);
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
                        const trailorData =
                            fetched.data.video.error === null || fetched.data.video.error === 'no records found'
                                ? await fetchFresh()
                                : fetched.data.video.data;

                        if (trailorData && Array.isArray(trailorData.results) && trailorData.results.length > 0) {
                                // batch thumbnail checks to avoid many re-renders
                                (async () => {
                                    const additions = [];
                                    if (many) {
                                        for (const { key, name } of trailorData.results) {
                                            const thumbUrl = `https://img.youtube.com/vi/${key}/maxresdefault.jpg`;
                                            additions.push({ key, name });
                                            // if (await checkURL(thumbUrl)) additions.push({ key, name });
                                        }
                                    } else {
                                        for (const { key, name } of trailorData.results) {
                                            const thumbUrl = `https://img.youtube.com/vi/${key}/maxresdefault.jpg`;
                                            additions.push({ key, name });
                                            // if (await checkURL(thumbUrl)) {
                                            //     additions.push({ key, name });
                                            //     break; // only need first valid for single
                                            // }
                                        }
                                    }

                                    if (additions.length) {
                                        setValidated((prev) => [...prev, ...additions]);
                                    }
                                })();
                        }
                    }
                })

        }

        return { run };
        // keep memo tied to inputs used inside the async runner
    }, [data, stream, season, episode, fetchTrailer, mutateInsertTrailer, many, firstClip]);

    useEffect(() => {
        if (many) validateTrailer.run()
    }, [many, validateTrailer]);

    const clipUpdate = useCallback((key) => {
        updateClip(key);
    }, [updateClip]);
    return (
        <div className="w-[100%] h-[100%] clips">
            <Swiper
                modules={[FreeMode, Thumbs]}
                spaceBetween={10}
                slidesPerView={4}
                freeMode={true}
                watchSlidesProgress={true}
                className="cursor-pointer"
            >
                {validated && validated.length > 0 && validated.map(({key,name}, node) => (
                    <>
                        <SwiperSlide key={node}>
                            <CLIP index={key} updateClip={clipUpdate} node={node} name={name} />
                        </SwiperSlide>
                    </>
                ))}
            </Swiper>
        </div>
    )
}
export default CLIPS;
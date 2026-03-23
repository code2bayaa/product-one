// import { useState, useEffect } from "react";
// import { useQuery, gql } from '@apollo/client';

// function useVideos({id,season,episode,stream}) {
//   const [videos, setVideo] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [index,setIndex] = useState(0);

//     const fetchVideo = useQuery(gql`
//         query Video (
//             $type: String!
//             $season: Int!
//             $episode: Int! 
//             $id : Int! 
//         ){
//             video(
//                 type:$type,
//                 episode:$episode,
//                 season:$season,
//                 id:$id
//             ) {
//                 data {
//                     id
//                     results {
//                         key
//                     }
//                 }
//                 success
//                 error
//             }
//         }
//     `,{
//         // pollInterval: 500, // fetches new data at that interval
//         notifyOnNetworkStatusChange: true,
//         variables : {
//             type:stream,
//             episode: episode?parseInt(episode):-1,
//             season: season?parseInt(season):-1,
//             id:id?parseInt(id):0,
//         }
//     });

//     console.log("useVideos fetchVideo",fetchVideo,id,season,episode,stream)

//     return { videos, loading, error };

//     // const [mutateInsertVideo] = useMutation(gql`
//     //     mutation AddVideo(
//     //         $meta_data: VIDEO_META_DATA_INPUT!
//     //         $data: VIDEO_DATA_INPUT!
//     //     ) {
//     //         addVideo(
//     //             meta_data: $meta_data
//     //             data: $data
//     //         ){
//     //             data {
//     //                 id
//     //                 results {
//     //                     iso_639_1
//     //                     iso_3166_1
//     //                     name
//     //                     key
//     //                     site
//     //                     size
//     //                     type
//     //                     official
//     //                     published_at
//     //                     id
//     //                 }
//     //             }
//     //             meta_data {
//     //                 id
//     //                 type
//     //                 season
//     //                 episode
//     //             }
//     //             success
//     //             error
//     //         }
//     //     }
//     // `,
//     // {
//     //     onCompleted: (data) => {
//     //         console.log(data)
//     //         if (data && data.addVideo.success) {
//     //         if (data.addVideo.success) {
//     //             if(data.addVideo.error === "query error")
//     //                 console.log("trailer inserting already started...")
//     //             console.log("trailer successfully inserted into MySQL:", data.addVideo.message);

//     //         } else {
//     //             console.error("Failed to insert trailer into MySQL:", data.addVideo.message, data.addMovies.error);
//     //         }

//     //         }
//     //     },
//     //     onError: (error) => {
//     //         console.error("insert video Error:", error);
//     //     },
//     // });

// //   useEffect(() => {
// //     let isMounted = true; // prevent state update on unmounted component
// //     setLoading(true);
// //     console.log("fetching videos...")
// //     console.log("next Id", id)
// //     setIndex(id ? parseInt(id) : 0);

// //     try{
// //         console.log("fetchVideo",fetchVideo)
// //         if (fetchVideo.error) {
// //             console.log(fetchVideo.error.message);
// //             setError(fetchVideo.error.message);
// //             setLoading(false);
// //             // trailorData = await fetchFresh();
// //         } else if (fetchVideo.data && fetchVideo.data.video) {
// //             if (fetchVideo.data.video.error === "no records found") {
// //                 // trailorData = await fetchFresh();
// //                 console.log("inserting...");
// //                 setError(fetchVideo.data.video.error);
// //                 setLoading(false);
// //             } else {
// //                 console.log("ordinarily...");
// //                 // trailorData = fetchVideo.data?.video.data
// //                 setVideo(fetchVideo.data.video.data);
// //                 setError(null);
// //                 setLoading(false);
// //             }
// //         }
// //     }catch(err){
// //         setError(err.message);
// //         setLoading(false);
// //         // if (isMounted) setError(err.message);
// //     }finally{
// //         if (isMounted) setLoading(false);
// //     }
// //     // mutateInsertVideo({
// //     //     variables: {
// //     //         meta_data: {
// //     //             type: stream,
// //     //             episode: episode ? parseInt(episode) : -1,
// //     //             season: season ? parseInt(season) : -1,
// //     //             id: id ? parseInt(id) : 0,
// //     //         },
// //     //         data: { ...getVideoData },
// //     //     },
// //     // });
// //     // fetch(url)
// //     //   .then((res) => {
// //     //     if (!res.ok) throw new Error("Network response was not ok");
// //     //     return res.json();
// //     //   })
// //     //   .then((data) => {
// //     //     if (isMounted) {
// //     //       setData(data);
// //     //       setError(null);
// //     //     }
// //     //   })
// //     //   .catch((err) => {
// //     //     if (isMounted) setError(err.message);
// //     //   })
// //     //   .finally(() => {
// //     //     if (isMounted) setLoading(false);
// //     //   });

// //     return () => {
// //       isMounted = false; // cleanup
// //     };
// //   }, [ id, season, episode, stream]);

// //   return { videos, loading, error };
// }

// export default useVideos;

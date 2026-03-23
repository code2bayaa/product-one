// import { useState, useEffect } from "react";
// import { useQuery, gql, useMutation } from '@apollo/client';

// function useInsertVideos({id,season,episode,stream,getVideoData}) {
// //   const [videos, setVideo] = useState(null);
// //   const [loading, setLoading] = useState(true);
//   const [status, setStatus] = useState(false);

//     const [mutateInsertVideo] = useMutation(gql`
//         mutation AddVideo(
//             $meta_data: VIDEO_META_DATA_INPUT!
//             $data: VIDEO_DATA_INPUT!
//         ) {
//             addVideo(
//                 meta_data: $meta_data
//                 data: $data
//             ){
//                 data {
//                     id
//                     results {
//                         iso_639_1
//                         iso_3166_1
//                         name
//                         key
//                         site
//                         size
//                         type
//                         official
//                         published_at
//                         id
//                     }
//                 }
//                 meta_data {
//                     id
//                     type
//                     season
//                     episode
//                 }
//                 success
//                 error
//             }
//         }
//     `,
//     {
//         onCompleted: (data) => {
//             console.log(data)
//             if (data && data.addVideo.success) {
//                 if (data.addVideo.success) {
//                     if(data.addVideo.error === "query error")
//                         console.log("trailer inserting already started...")
//                     else
//                         setStatus(true)
//                     console.log("trailer successfully inserted into MySQL:", data.addVideo.message);

//                 } else {
//                     console.error("Failed to insert trailer into MySQL:", data.addVideo.message, data.addMovies.error);
                    
//                 }

//             }
//         },
//         onError: (error) => {
//             console.error("insert video Error:", error);
//         },
//     });

//   useEffect(() => {
//     let isMounted = true; // prevent state update on unmounted component
//     // setLoading(true);
//     if(!getVideoData)
//         return;

//     try{
//         console.log("inserting...")
//         mutateInsertVideo({
//             variables: {
//                 meta_data: {
//                     type: stream,
//                     episode: episode ? parseInt(episode) : -1,
//                     season: season ? parseInt(season) : -1,
//                     id: id ? parseInt(id) : 0,
//                 },
//                 data: { ...getVideoData },
//             },
//         });
//     }catch(err){
//         // setError(err.message);
//         // setLoading(false);
//         // if (isMounted) setError(err.message);
//     }finally{
//         // if (isMounted) setLoading(false);
//     }

//     return () => {
//       isMounted = false; // cleanup
//     };
//   }, [ id, season, episode, stream, getVideoData, mutateInsertVideo]);

//   return { status };
// }

// export default useInsertVideos;

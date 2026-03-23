import { useCallback, useEffect, useState, useRef } from "react";
import MOBILE from "./mobileBar";
import NAVBAR from "./nav"
import PICTURE from "../midlleware/picture"
import { faStar } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
// import { gql, useLazyQuery } from '@apollo/client';
import Swal from "sweetalert2";
import SWEETPAGE from "../midlleware/pages";
import { useNavigate } from "react-router-dom";
import { useKeys } from "./safe";
// import LOAD from "../midlleware/load";

const FOLLOW = () => {

    // const {safeKeys} = useKeys()
    const [windowWidth, setWindowWidth] = useState(0);
    // const [people, setPeople] = useState({
    //     count: 0,
    //     data: [],
    //     page:1,
    //     tags: []
    // })
    const [people, setPeople] = useState({
        count: 0,
        results: [],
        page: 1,
    })
    const [page, setPage] = useState(1)
    const hasFetched = useRef(false)
    const [total_pages, setTotalPages] = useState(0)
    const navigate = useNavigate();
    // const client = useApolloClient();

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        // Set initial width
        handleResize();

        // Add event listener for window resize
        window.addEventListener('resize', handleResize);

        // Cleanup event listener on component unmount
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);
    
    // const FETCH_FOLLOWERS_QUERY = gql`
    //     query Followers (
    //         $user:ID!
    //         $page:Int!
    //     ){
    //         followers(
    //             user:$user
    //             page:$page
    //         ){
    //             results {
    //                 profile_path,
    //                 popularity,
    //                 original_name,
    //                 name,
    //                 known_for_department,
    //                 id
    //             }
    //             tags
    //             count
    //             success
    //             error
    //         }
    //     }
    // `

    // const [fetchFollowers] = useLazyQuery(FETCH_FOLLOWERS_QUERY,{
    //     // pollInterval: 500, // fetches new data at that interval
    //     notifyOnNetworkStatusChange: true,
    //     // fetchPolicy: 'cache-first',
    // });
    // useEffect(() => {
    //     const invalidateCache = () => {
    //         console.log("Invalidating Apollo Client cache");
    //         client.refetchQueries({
    //             include: [FETCH_FOLLOWERS_QUERY] // Refetch all queries using this query
    //         });
    //         // client.resetStore(); // Alternative: Clears the entire cache (more aggressive)
    //     };

    //     // Set up the timer to invalidate the cache after 24 hours
    //     const timerId = setTimeout(invalidateCache, 86400000); // 24 hours in milliseconds

    //     // Clear the timer when the component unmounts to prevent memory leaks
    //     return () => clearTimeout(timerId);
    // }, [client,FETCH_FOLLOWERS_QUERY]); // 

    const intitializePeople = useCallback(async({page}) => {

        if(page > 1)
            setPage(page)

        fetch(`${process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_FOLLOWING : process.env.REACT_APP_FOLLOWING_LIVE}`, {
            credentials: "include",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                page
            })
        })
      .then(res => res.json())
        .then((data) => {
            console.log(data)
            if (data && data.success && data.results.length > 0) {
                setTotalPages(() => data.count)
                setPeople(prev => (
                    {
                    count: data.count,
                    results: data.results,
                    page
                    // tags: data.tags
                }));
            } else if (data && data.error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: data.error,
                    confirmButtonText: 'OK'
                });
            } else if (data && data.results === 0) {
                Swal.fire({
                    icon: 'Empty',
                    title: 'Error',
                    text: "Follow More People",
                    confirmButtonText: 'OK'
                });
            }
            // if (data && data.followers.success && data.followers.results.length > 0) {
            //     setTotalPages(() => data.followers.count)
            //     setPeople(prev => (
            //         {
            //             count: data.followers.count,
            //             data: data.followers.results,
            //             page:1,
            //             tags: data.followers.tags
            //         }));
            // }else if(data && data.followers.error) {
            //     console.error("Error fetching playlist:", data.followers.error);
            //     Swal.fire({
            //         icon: 'error',
            //         title: 'Error',
            //         text: data.followers.error,
            //         confirmButtonText: 'OK'
            //     });
            // }else if(data && data.followers.tags && data.followers.tags.length > 0 && data.followers.results.length < 0) {
                
            //     let new_total_pages = 0
            //     data.followers.tags.forEach(({tag},node) => {
            //         //understood
            //         let apiUrl = `${safeKeys.MOVIE_DB}person/${tag}?api_key=${safeKeys.API_KEY}`

            //         fetch(`${apiUrl}`)
            //         .then(res => res.json())
            //         .then(movieData => {
            //             setPeople(prev => {
            //                 new_total_pages = prev.count + movieData.length
            //                 return ({
            //                 count: new_total_pages,
            //                 data: [...prev.data,...movieData],
            //                 tags:[...prev.tags, tag]
            //             })});
            //         })

            //     });

            //     setTotalPages(() => new_total_pages)
            // }else if(data && data.followers.results === 0){
            //     Swal.fire({
            //         title:"empty",
            //         text:"follow more people",
            //         timer:2000
            //     })
            // }
        })
    },[])

    useEffect(() => {
        if(hasFetched.current){
            return
        }
        hasFetched.current = true        
        fetch(process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_API_URL : process.env.REACT_APP_API_URL_LIVE,{credentials: "include"})
        .then(res => {
            if (!res.ok) {
                throw new Error('Network response was not ok');
            }
            return res.json();
        })
        .then(({status,message, user}) => {
            if (status) {
                intitializePeople({
                    user,
                    page:1
                })
            }
        })
    },[intitializePeople])
  const navMovie = (id,url) => {
        navigate(url,{
            state : {
                id
            }
        })
    } 
    const removeFollowing = useCallback(async (id) => {
        fetch(`${process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_REMOVE_FOLLOWING : process.env.REACT_APP_REMOVE_FOLLOWING_LIVE}`, {
            credentials: "include",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                id,
            })
        })
        .then(res => res.json())
        .then((data) => {
            if (data.status) {
                Swal.fire({
                    icon: 'success',
                    title: 'success',
                    text: 'success',
                    confirmButtonText: 'OK'
                });
            } else if (data && data.error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: data.error || "playlist error",
                    confirmButtonText: 'OK'
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: "could not remove, try later",
                    confirmButtonText: 'OK'
                });
            }
        })
    }, [])
    return (
        <div className="w-[100%] duration-250 h-[100%] text-white flex flex-row flex-wrap" style={{background:"linear-gradient(65deg, #0d0d0d, rgba(0,0,0,0.75), #1c2a3b, #0f111a)"}}>
            {
                windowWidth > 800 ? 
                <div className="w-[20%] absolute h-[100%] border-r-[3px] border-[#2E2E3A]" style={{background:"linear-gradient(85deg, #0d0d0d, rgba(0,0,0,0.75), #000, #0f111a)"}}>
                    <NAVBAR/>
                </div>
                :
                <MOBILE/>
            }
            <div className={windowWidth > 800 ? "w-[80%] h-[100%] overflow-y-auto movie-scene ml-[20%] flex flex-col":"w-[100%] h-[92%] overflow-y-auto movie-scene flex flex-col"}>
                {
                    people && people.results.length > 0 ?
                        <>
                            <h3>following : {people.count}</h3>
                            <SWEETPAGE intitializeMovies={intitializePeople} page={page} total_pages={total_pages}/>                                
                            <div className={`w-[100%] duration-50 movie-scene ${windowWidth > 800 ? "h-[400px]" : "h-[300px]"} flex flex-col flex-wrap overflow-x-auto overflow-y-hidden my-[1%]`}>
                                {
                                    people.results.map(({profile_path,popularity,original_name,name,known_for_department,id},people_key) => 
                                        <div 
                                            key={people_key} 
                                            // to={`/people/`}
                                            // onClick={} 
                                            className={windowWidth > 800 ? "cursor-pointer w-[25%] h-[100%] hover:skew-4 hover:contrast-150":"cursor-pointer w-[50%] hover:skew-4 h-[100%] hover:contrast-150"}>
                                            <div className="w-[100%] h-[100%]">
                                                <PICTURE picture={profile_path} classes={"object-cover h-[100%]"} />
                                                {/* <div className="w-[100%] relative min-h-[60px] top-[-50%] bg-[#000000] bg-opacity-60 text-white flex flex-col items-center justify-center">
                                                    <h2 className="text-[15px] font-bold">{name ? name : original_name ? original_name : name}</h2>
                                                    <p style={{color:"#ffd800"}}><FontAwesomeIcon icon={faStar} /> {parseFloat(popularity).toFixed(2)}</p>
                                                </div> */}
                                                <div className="w-[100%] flex flex-row">
                                                    <button
                                                        className="w-[48%] m-[1%] bg-[#22C55E]"
                                                        onClick={() => navMovie(id,`/follow/people`)}
                                                    >
                                                        read
                                                    </button>
                                                    <button
                                                        className="w-[48%] m-[1%] bg-[#E50914]"
                                                        onClick={() => removeFollowing()}
                                                    >
                                                        unfollow
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }
                            </div>                        
                        </>
                
                    :
                     <img src="/image/followers.svg" width={200} height={200} className="w-[80%] ml-[10%] h-[80%]" alt="late developers https://late-developers.com" />
                }            
            </div>
        </div>
    )
}

export default FOLLOW
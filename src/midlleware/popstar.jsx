"use client"
import { useMutation, useLazyQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { useEffect, useState, useCallback } from "react"
import Slider from "react-slick";
import Carousel from './carousel';
import PICTURE from './picture';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useNavigate } from "react-router-dom"
import { 
    // faArrowAltCircleDown, faArrowAltCircleUp, 
    faEye } from "@fortawesome/free-solid-svg-icons"
import CryptoJS from "crypto-js";

const POPSTAR = ({actedMovies, mode}) => {
    const [windowWidth, setWindowWidth] = useState(0);
    const [themes, setThemes] = useState(null)
    const navigate = useNavigate();
    // const client = useApolloClient();
    const navRoute = ({state,url}) => {
        navigate(url,{
            state : {
                ...state
            }
        })
    } 
    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.screen.width);
        };
        window.addEventListener("resize", handleResize);
        handleResize(); // Call it once to set the initial value
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    },[])

    const FETCH_PERSON_QUERYTV = gql`
        query People (
            $page: Int!,
            $genre : String!,
            $year : Int!,
            $region : String!,
            $language : String!,
            $index : String!,
            $date:String!,
            $hashedKey:String!
        ){
            people(
                page:$page,
                genre:$genre,
                year:$year,
                region:$region,
                language:$language,
                index:$index,
                date:$date,
                hashedKey:$hashedKey
            ) {
                results {
                    adult
                    gender
                    profile_path
                    id
                    known_for_department
                    name
                    original_name
                    popularity
                    character

                }
                page
                total_pages
                total_results                
                success
                error
                message
                people_page
                people_next
            }
        }
    `
    const [fetchPersonTV] = useLazyQuery(FETCH_PERSON_QUERYTV,{
        notifyOnNetworkStatusChange: true,
        fetchPolicy: 'no-cache',
    });
  
    const INSERT_PERSON_MUTATION_TV = gql`
        mutation AddPerson(
            $page:Int!,
            $results:[ADD_PERSON_RESULTS_INPUT],
            $total_pages:Int!,
            $total_results:Int!,
            $data :TRACK_PERSON_DATA_INPUT,
            $chunking:Boolean!
            $chunking_index:Int!
            $people_total_pages:Int!
            $type:String!,
            $hashedKey:String!
        ) {
            addPerson(
                page:$page,
                results:$results,
                total_pages:$total_pages,
                total_results:$total_results,
                data:$data,
                chunking:$chunking
                chunking_index:$chunking_index
                people_total_pages:$people_total_pages
                type:$type,
                hashedKey:$hashedKey
            ) {
                success
                message
                index
            }
        }
    `;

    const [mutateInsertPersonTV] = useMutation(INSERT_PERSON_MUTATION_TV, {
        onCompleted: (data) => {
            console.log(data)
            if (data.addPerson.success) {
                if(data.addPerson.message === "already inserted")
                    console.log("person inserting already started...")
                // console.log("Movies successfully inserted into MySQL:", data.addPerson.message);
                // fetchedPersonData.refetch()
                // .then(status => console.log(status,"status"))
            } else {
                console.error("Failed to insert movies into MySQL:", data.addPerson.message, data.addPerson.error);
            }
        },
        onError: (error) => {
            console.error("Error inserting movies into MySQL:", error.message);
        },
    });

    // const FETCH_PERSON_QUERY = gql`
    //     query People (
    //         $page: Int!,
    //         $genre : String!,
    //         $year : Int!,
    //         $region : String!,
    //         $language : String!,
    //         $index : String!,
    //         $date:String!,
    //         $hashedKey:String!
    //     ){
    //         people(
    //             page:$page,
    //             genre:$genre,
    //             year:$year,
    //             region:$region,
    //             language:$language,
    //             index:$index,
    //             date:$date,
    //             hashedKey:$hashedKey
    //         ) {
    //             results {
    //                 adult
    //                 gender
    //                 profile_path
    //                 id
    //                 known_for_department
    //                 name
    //                 original_name
    //                 popularity
    //                 character

    //             }
    //             page
    //             total_pages
    //             total_results                
    //             success
    //             error
    //             message
    //             people_page
    //             people_next
    //         }
    //     }
    // `
    // const [fetchPerson,fetchedPersonData] = useLazyQuery(FETCH_PERSON_QUERY,{
    //     notifyOnNetworkStatusChange: true,
    //     fetchPolicy: 'no-cache',
    // });
  
    // const INSERT_PERSON_MUTATION = gql`
    //     mutation AddPerson(
    //         $page:Int!,
    //         $results:[ADD_PERSON_RESULTS_INPUT],
    //         $total_pages:Int!,
    //         $total_results:Int!,
    //         $data :TRACK_PERSON_DATA_INPUT,
    //         $chunking:Boolean!
    //         $chunking_index:Int!
    //         $people_total_pages:Int!
    //         $type:String!,
    //         $hashedKey:String!
    //     ) {
    //         addPerson(
    //             page:$page,
    //             results:$results,
    //             total_pages:$total_pages,
    //             total_results:$total_results,
    //             data:$data,
    //             chunking:$chunking
    //             chunking_index:$chunking_index
    //             people_total_pages:$people_total_pages
    //             type:$type,
    //             hashedKey:$hashedKey
    //         ) {
    //             success
    //             message
    //             index
    //         }
    //     }
    // `;

    // const [mutateInsertPerson] = useMutation(INSERT_PERSON_MUTATION, {
    //     onCompleted: (data) => {
    //         console.log(data)
    //         if (data.addPerson.success) {
    //             if(data.addPerson.message === "already inserted")
    //                 console.log("person inserting already started...")
    //             // console.log("Movies successfully inserted into MySQL:", data.addPerson.message);
    //             // fetchedPersonData.refetch()
    //             // .then(status => console.log(status,"status"))
    //         } else {
    //             console.error("Failed to insert movies into MySQL:", data.addPerson.message, data.addPerson.error);
    //         }
    //     },
    //     onError: (error) => {
    //         console.error("Error inserting movies into MySQL:", error.message);
    //     },
    // });

    const initializeCelebrities = useCallback(({
        page,
        jobId='Actor'
    }) => {

        // create an AbortController for this invocation so caller can cancel it
        const controller = new AbortController();
        const { signal } = controller;
        let cancelled = false;

        const startCelebrityFetch = async () => {
            const chunked = page - 1
            const current_date = new Date().toISOString().split("T")[0]
            const hashed = page + "person_tv" + jobId + chunked + mode
            const hashedKey = CryptoJS.SHA256(hashed).toString();

            async function freshFetch(){
                if (actedMovies.length > 0) {

                    let removeDuplicate = []
                    let peopleArray = await Promise.all(actedMovies.map(async({results}) => {

                        return (await Promise.all(results.map(async({id}) => {

                            if (cancelled || signal.aborted) return false;
                            if(removeDuplicate.includes(id)){
                                return false
                            }
                            removeDuplicate.push(id)
                            let api = mode === "tv" ? `tv/${id}/credits` : `movie/${id}/credits`
                            try{
                                const response = await fetch(`${process.env.REACT_APP_MOVIE_DB}${api}?api_key=${process.env.REACT_APP_API_KEY}&language=en-US`, { signal })
                                if (!response.ok) {
                                    console.warn("Credits fetch failed", response.status, id);
                                    return false;
                                }
                                const {cast = [],crew = []} = await response.json()
                                
                                if(jobId === "Actor"){
                                    const topActors = cast
                                        .sort((a, b) => a.order - b.order)
                                        .slice(0, 2);
                                    return topActors;
                                }else{
                                    return crew.filter(({job,known_for_department,department}) => job === jobId || known_for_department === jobId || department === jobId)
                                }   
                            }catch(err){
                                if (err.name === 'AbortError' || cancelled || signal.aborted) {
                                    // aborted - silently ignore
                                    return false;
                                }
                                console.error("Error fetching credits", err);
                                return false;
                            }
                        }))).filter(Boolean).flat()      
                    }))

                    if(cancelled || signal.aborted) return false;

                    if(peopleArray.length > 0){
                        if(!cancelled) setThemes(() => [...peopleArray[0]].sort((a,b) => b.popularity - a.popularity).slice(0,20))

                        for (let i = 0; i < peopleArray.length; i++) {
                            if(cancelled || signal.aborted) break;
                            const hashed = page + "person_tv" + jobId + i.toString()
                            const hashedKey = CryptoJS.SHA256(hashed).toString();
                            try{
                                await mutateInsertPersonTV({
                                    variables: {
                                        page,
                                        results: peopleArray[i],
                                        total_pages: peopleArray.length,
                                        total_results: peopleArray[i].length,
                                        chunking:true,
                                        chunking_index:i,
                                        people_total_pages:peopleArray.length,
                                        data: {
                                            genre: "",
                                            region: "",
                                            language: "",
                                            year: 0,
                                            index: "",
                                            date: current_date,
                                        },
                                        type: "person",
                                        hashedKey
                                    },
                                });   
                            }catch(err){
                                // ignore errors on insert if aborted or other
                                if (err && err.name === 'AbortError') break;
                                console.error("mutateInsertPerson error", err);
                            }                                  
                        }
                    }                    

                    return true
                }
                return false
            }

            // run the lazy query with try/catch and handle aborts
            let fetched = null;
            try{
                fetched = await fetchPersonTV({
                    variables : {
                        page,
                        genre: "",
                        region: "",
                        language: "",
                        year: 0,
                        index: "",
                        date: current_date, 
                        hashedKey 
                    }
                });
            }catch(err){
                if (err && err.name === 'AbortError') {
                    // aborted - stop silently
                    return;
                }
                console.error("fetchPerson error", err);
            }

            if(cancelled || signal.aborted) return;

            if (fetched && fetched.data) {
                if(fetched.data.people.error === "insert person" || fetched.data.people.error === "no records found"){
                    return await freshFetch()
                }else{
                    if(!cancelled) setThemes(() => [...fetched.data.people.results].sort((a,b) => b.order - a.order).slice(0,20))
                    return true
                }

            } else {
                return await freshFetch()
            }  
        }

        // start and return a cancel function
        startCelebrityFetch();

        return () => {
            cancelled = true;
            try { controller.abort(); } catch(e){ /* ignore */ }
        }
    },[actedMovies, fetchPersonTV, mutateInsertPersonTV,mode]);
    
    useEffect(() => {
        const cancel = initializeCelebrities({
            page:1
        });
        return () => {
            if (typeof cancel === 'function') cancel();
        };
    }, [initializeCelebrities]);
    
    const settings = {
        // dots: true,
        infinite: true,
        autoplaySpeed: 5,
        speed:5000,
        swipeToSlide:true,
        draggable:true,
        slidesToShow: 5,
        slidesToScroll: 5,
        autoplay:true,
        arrows:false,
        pauseOnHover:true,
        dots:false,
        cssEase:"ease",
        responsive: [{

            breakpoint: 1024,
            settings: {
            slidesToShow: 5,
            infinite: true
            }
    
        }, {
    
            breakpoint: 600,
            settings: {
            slidesToShow: 1,
            dots: false
            }
    
        }, {
    
            breakpoint: 300,
            settings: "unslick" // destroys slick
    
        }]
    };
    return (
        <>
        {
            themes ? 
                <>
                    {
                        windowWidth > 800 ? 
                            <div className="w-[100%] h-[60%] overflow-hidden shadow" style={{boxShadow:"0 10px 30px rgba(0,0,0,0.7),0 0 60px rgba(0,0,0,0.5)"}}>
                                <Slider {...settings}>
                                {
                                    themes && themes.map(({
                                        cast_id,
                                        character,
                                        credit_id,
                                        gender,
                                        id,
                                        name,
                                        order,
                                        profile_path
                                    },celebKey) =>  
                                        <div key={celebKey} className="w-[25%] h-[100%] hover:skew-4 contrast-150">
                                            <PICTURE key={id} classes={"object-cover float-left h-[100%]"} picture={profile_path} />
                                            <div style={{boxShadow:"0 10px 30px rgba(0,0,0,0.7),0 0 60px rgba(0,0,0,0.5)"}} className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[90%] h-[60px] bg-[#000000]/30 bg-opacity-30 text-white flex flex-col items-center justify-center z-10">
                                                <h2 className={windowWidth > 800 ? "text-[15px] font-bold":"text-[12px]"}>{name}</h2>
                                                <h3 style={{fontStyle:"italic"}}>{character}</h3>
                                                <button 
                                                    onClick={() => navRoute({
                                                        url:"/people/id",
                                                        state:{
                                                            id
                                                        }})}  
                                                >
                                                    <FontAwesomeIcon icon={faEye} /> read
                                                </button>                                        
                                            </div>

                                        </div>
                                    )
                                }
                                </Slider>                    
                            </div>
                        :
                        <div className="w-[100%] h-[80%] shadow" style={{
                            boxShadow:"inset 0 0 30px rgba(0,0,0,0.6),0 10px 30px rgba(0,0,0,0.7),0 0 60px rgba(0,0,0,0.5)",
                            //   overflow: "hidden",
                        }}>
                            {
                                themes && themes.length > 0 && <Carousel mode={mode} type="people" images={[...themes].sort((a,b) => b.order > a.order)}/>                       
                            }
                        </div>                 
                    }
                </>
            :
            <img src="/videos/load.gif" alt="loader" className="w-[250px] h-[250px] mx-auto mt-[10%]" />
        }
        </>
    )
}

export default POPSTAR
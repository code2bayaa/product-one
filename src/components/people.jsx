import { useMutation, useLazyQuery, useApolloClient } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { useEffect, useState, useCallback, useRef } from "react"
import NAVBAR from "./nav"
import PICTURE from "../midlleware/picture"
import { faStar } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
// import CONTROLLERS from "../midlleware/controllers"
import { useNavigate } from "react-router-dom"
import SWEETPAGE from "../midlleware/pages"
import LOAD from "../midlleware/load"
import MOBILE from "./mobileBar";
import CryptoJS from "crypto-js";
import BAR from "./bar"
import { useKeys } from './safe';
const PEOPLE = () => {

    const [people, setPeople] = useState(null)
    const [windowWidth, setWindowWidth] = useState(0);
    const navigate = useNavigate();
    const hasFetched = useRef(false)
    const client = useApolloClient();
    const {safeKeys} = useKeys()

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.screen.width);
        };
        // window.addEventListener("resize", handleResize);
        handleResize(); // Call it once to set the initial value
        // return () => {
        //     window.removeEventListener("resize", handleResize);
        // };
    },[])

    const FETCH_PEOPLE_COLLECTION_QUERY = gql`
        query PeopleCollection (
            $data:[COLLECTION_TRACK_PEOPLE_DATA_OUTPUT],
            $hashedKey:String!
        ){
            peopleCollection(
                data :$data,
                hashedKey:$hashedKey
            ) {
                data {
                    results {
                        adult
                        gender
                        profile_path
                        id
                        known_for_department
                        name
                        original_name
                        popularity
                    }
                    page
                    total_pages
                    total_results   
                    index               
                }              
                success
                error
                message
            }
        }
    `
    const [fetchPeopleCollection] = useLazyQuery(FETCH_PEOPLE_COLLECTION_QUERY,{
        notifyOnNetworkStatusChange: true,
        fetchPolicy: 'cache-first',
    });
    
    const INSERT_PEOPLE_COLLECTION_MUTATION = gql`
        mutation AddCollectionPeople(
            $data:[ADD_COLLECTION_PEOPLE],
            $hashedKey:String!,
            $date:String!,
        ) {
            addCollectionPeople(
                hashedKey:$hashedKey,
                date:$date,
                data:$data
            ) {
                success
                message
            }
        }
    `;
    const [mutateInsertPeopleCollection] = useMutation(INSERT_PEOPLE_COLLECTION_MUTATION, {
        onCompleted: (data) => {
            console.log(data)
            if (data.addPeople.success) {
                console.log("Movies successfully inserted into MySQL:", data.addPeople.message);
                // fetchedMoviesData.refetch()
                // .then(status => console.log(status,"status"))
            } else {
                console.error("Failed to insert movies into MySQL:", data.addPeople.message, data.addPeople.error);
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

    const FETCH_PERSON_QUERY = gql`
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
    const [fetchPerson,fetchedPersonData] = useLazyQuery(FETCH_PERSON_QUERY,{
        notifyOnNetworkStatusChange: true,
        fetchPolicy: 'cache-first',
    });
    useEffect(() => {
        const invalidateCache = () => {
            console.log("Invalidating Apollo Client cache");
            client.refetchQueries({
                include: [FETCH_PERSON_QUERY] // Refetch all queries using this query
            });
            // client.resetStore(); // Alternative: Clears the entire cache (more aggressive)
        };

        // Set up the timer to invalidate the cache after 24 hours
        const timerId = setTimeout(invalidateCache, 86400000); // 24 hours in milliseconds

        // Clear the timer when the component unmounts to prevent memory leaks
        return () => clearTimeout(timerId);
    }, [client,FETCH_PERSON_QUERY]); // 
    const INSERT_PERSON_MUTATION = gql`
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

    const [mutateInsertPerson] = useMutation(INSERT_PERSON_MUTATION, {
        onCompleted: (data) => {
            console.log(data)
            if (data.addPerson.success) {
                if(data.addPerson.message === "already inserted")
                    console.log("person inserting already started...")
                // console.log("Movies successfully inserted into MySQL:", data.addPerson.message);
                fetchedPersonData.refetch()
                .then(status => console.log(status,"status"))
            } else {
                console.error("Failed to insert movies into MySQL:", data.addPerson.message, data.addPerson.error);
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

    const intitializePeople = useCallback(async ({
        runContent,
        page,
        adjustable = false,
        jobId='Actor',
        genreId = '',
        regionId = '',
        languageId='',
        yearId=0
    }) => {
        console.log("mutating...")
        const downloaded = []
        const fetchPersonFromAPI = async (actual_index) => {

            const current_date = new Date().toISOString().split("T")[0]
            const temp_people = [
                // {"index":"latest","results":[],"api":"movie/latest"},
                // {"index":"discover movie","results":[],"api":"discover/movie","page":1,people_page:1,total_pages:0,total_results:0},
                // {"index":"discover tv","results":[],"api":"discover/tv","page":1,people_page:1,total_pages:0,total_results:0},
                {"index":"trending","results":[],"api":"trending/person/day",page:1,people_page:1,total_pages:0,total_results:0},
                {"index":"popular","results":[],"api":"person/popular",page:1,people_page:1,total_pages:0,total_results:0}
            ]
            const key = temp_people.findIndex(({ index }) => index === actual_index);
            if (page) {
                temp_people[key].page = page;
            }
            
            const hashed = temp_people[key].page + genreId + regionId + languageId + yearId + actual_index + "person0"
            const hashedKey = CryptoJS.SHA256(hashed).toString();
            async function freshFetch(){
                // Fetch data from the API if not found in the cache
                const response = await fetch(
                    `${safeKeys.MOVIE_DB}${temp_people[key].api}?api_key=${safeKeys.API_KEY}&language=en-US&page=${temp_people[key].page}&with_genres=${genreId}&with_origin_country=${regionId}&sort_by=popularity.desc&with_original_language=${languageId}&primary_release_year=${yearId}`
                );
                const data = await response.json();
                console.log(data)
                

                if (data.results.length > 0) {
                    let peopleArray = [...data.results]
                    // temp_people[key].results = [...temp_people[key].results, ...peopleArray];
                    // let peopleArray = [...data.results]
                    temp_people[key].results = [
                        ...temp_people[key].results,
                        ...peopleArray,
                    ];
                    temp_people[key].total_pages = data.total_pages;
                    temp_people[key].total_results = data.total_results;
                    // console.log(temp_people[key].results.find(({known_for}) => known_for),"known_for")
                    
                    setPeople((prevPeople) => {
                        prevPeople = prevPeople || [];
                        let updatedPeople = [...prevPeople];
                        const existingIndex = updatedPeople.findIndex(({ index }) => index === actual_index);
                        if (existingIndex > -1) {
                            updatedPeople[existingIndex].results = [
                                ...peopleArray
                            ];
                        } else {
                            updatedPeople = [...temp_people];
                        }
                        return updatedPeople;
                    });
                    // Less than or equal to 20, insert all at once
                    await mutateInsertPerson({
                        variables: {
                            page: temp_people[key].page,
                            results: peopleArray,
                            total_pages: data.total_pages,
                            total_results: data.total_results,
                            chunking:false,
                            chunking_index:0,
                            people_total_pages:0,
                            data: {
                                genre: genreId,
                                region: regionId,
                                language: languageId,
                                year: yearId,
                                index: actual_index,
                                date: current_date,
                            },
                            type: "person",
                            hashedKey
                        },
                    });
                

                    return true
                }
                return false
            }

            // if(downloaded.includes(actual_index))
            //     return true
            // downloaded.push(actual_index)
            if(adjustable || jobId !== "Actor" || genreId || regionId || languageId || yearId){
                const fetched = await fetchPerson({
                    variables : {
                    page: temp_people[key].page,
                    people_page:temp_people[key].people_page,
                    genre: genreId,
                    region: regionId,
                    language: languageId,
                    year: yearId,
                    index: actual_index,
                    date: current_date, 
                    hashedKey 
                }})

                console.log(fetched.data)
                if (fetched.data) {
                    console.log("Using cached data:", fetched.data);
                    // if(fetched.data.people.success && fetched.data.people.results &&  fetched.data.people.results.length < 15){
                    //     console.log("less items")
                    //     return await freshFetch()
                    // }else 
                    if(fetched.data.people.error === "insert person" || fetched.data.people.error === "no records found"){
                        console.log("no records found")
                        return await freshFetch()
                    }else{
                        console.log("finally using cached data")
                        // console.log(fetched.data.people.results.find(({known_for}) => known_for))
                        setPeople((prevPeople) => {
                            prevPeople = prevPeople || [];
                            const updatedPeople = [...prevPeople]
                            const existingIndex = updatedPeople.findIndex(
                                (person) => person.index === actual_index
                            );
        
                            if (existingIndex > -1) {
                                updatedPeople[existingIndex].results = [
                                    ...fetched.data.people.results,
                                ];
                                updatedPeople[existingIndex].people_next = fetched?.data?.people_next
                            } else {
                                updatedPeople.push({
                                    index: actual_index,
                                    results: fetched.data.people.results,
                                    page: fetched.data.people.page,
                                    total_pages: fetched.data.people.total_pages,
                                    total_results:fetched.data.people.total_results,
                                    people_next:fetched?.data?.people_next
                                });
                            }
        
                            return updatedPeople;
                        });
                        return true
                    }

                } else {
                    console.log("nothing")
                    return await freshFetch()
                }
            }
            
        };
        runContent.forEach((index) => {
            
            if(!downloaded.includes(index)){
                downloaded.push(index)
                fetchPersonFromAPI(index)
            }                
            // .then(status => {
            //     if(!status){
            //         // Swal.fire({
            //         //     title:"internet connection error",
            //         //     text: "Please try again.",
            //         //     icon: "error", // Set the icon to "error"
            //         //     confirmButtonText: "OK",
                        
            //         // })
            //     }
            // })
        })
    },[mutateInsertPerson,fetchPerson])

    const intitPeople = useCallback(async({
            runContent,
            page,
            adjustable = false,
        }) => {
            
            const current_date = new Date().toISOString().split("T")[0]
            let hashed = "people" + current_date
            const peopleWrap = await Promise.all(runContent.map(actual_index => {
                const temp_people = [
                    {"index":"trending","results":[],"api":"trending/person/day",page:1,people_page:1,total_pages:0,total_results:0},
                    {"index":"popular","results":[],"api":"person/popular",page:1,people_page:1,total_pages:0,total_results:0}
                ];
                
                const key = temp_people.findIndex(({ index }) => index === actual_index);
                console.log(page,"page",key,"key")

                if (page) {
                    temp_people[key].page = page;
                }
                
                hashed += temp_people[key].page + actual_index

                return ({
                    page: temp_people[key].page, 
                    index: actual_index,
                    date: current_date,
                    // type:temp_movies[key].type,
                })
            }))
            const hashedKey = CryptoJS.SHA256(hashed).toString();
            if(adjustable){
                console.log("adjustable...")
                async function freshFetch(){
                    let hashed = "people" + current_date
                    const insertContent = (await Promise.all(runContent.map(async actual_index => {
                        const temp_people = [
                            {"index":"trending","results":[],"api":"trending/person/day",page:1,people_page:1,total_pages:0,total_results:0},
                            {"index":"popular","results":[],"api":"person/popular",page:1,people_page:1,total_pages:0,total_results:0}
                        ];
                        const key = temp_people.findIndex(({ index }) => index === actual_index);
                        if (page) {
                            temp_people[key].page = page;
                        }
                        
                        hashed += temp_people[key].page + actual_index
                        // Fetch data from the API if not found in the cache
                        const response = await fetch(
                            `${safeKeys.MOVIE_DB}${temp_people[key].api}?api_key=${safeKeys.API_KEY}&language=en-US&page=${temp_people[key].page}`
                        );
                        const data = await response.json();
                        
                        const peopleArray = data?.results || []

                        if (peopleArray.length > 0) {
                            temp_people[key].results = [
                                ...temp_people[key].results,
                                ...data.results,
                            ];
                            temp_people[key].total_pages = data.total_pages;
                            temp_people[key].total_results = data.total_results;

                            // Update the movies state

                            setPeople((prevPeople) => {
                                prevPeople = prevPeople || [];
                                let updatedPeople = [...prevPeople];
                                const existingIndex = updatedPeople.findIndex(({ index }) => index === actual_index);
                                if (existingIndex > -1) {
                                    updatedPeople[existingIndex].results = [
                                        ...peopleArray
                                    ];
                                } else {
                                    updatedPeople = [...temp_people];
                                }
                                return updatedPeople;
                            });
                            return ({
                                page:temp_people[key].page,
                                results:data.results,
                                total_pages:data.total_pages,
                                total_results:data.total_results,
                                index:actual_index,   
                                // type:temp_movies[key].type                        
                            })
                        }

                        return false
                    }))).filter(Boolean)
                    const hashedKey = CryptoJS.SHA256(hashed).toString();

                    // Less than or equal to 20, insert all at once
                    mutateInsertPeopleCollection({
                        variables: {
                            data:insertContent,
                            date:current_date,
                            hashedKey
                        },
                    });
                }

                const fetched = await fetchPeopleCollection({
                    variables : {
                        data:peopleWrap,
                        hashedKey
                }})

                console.log(fetched)
                if (fetched.data) {
                    if(fetched.data?.peopleCollection?.message === "not initialized" || fetched.data?.peopleCollection?.error){
                        console.log("no yet initialized")
                        return await freshFetch()
                    }else{
                        console.log("finally using cached data")
                        setPeople(() => [...fetched.data.peopleCollection.data]);
                        return true
                    }

                } else {
                    console.log("nothing")
                    return await freshFetch()
                }                    
            }       
    },[fetchPeopleCollection,mutateInsertPeopleCollection])

    useEffect(() => {
        if(hasFetched.current){
            return
        }
        hasFetched.current = true

        intitPeople(
            {runContent:[
            // "latest",
            "trending","popular"],
            adjustable:true,
            page:1
        })

    },[intitPeople])
    const navRoute = ({url,state}) => {
        navigate(url,{
            state : {
                ...state
            }
        })
    }
    return (
        <div className="w-[100%] h-[100%] text-white flex flex-row flex-wrap" style={{background:"linear-gradient(65deg, #0d0d0d, rgba(0,0,0,0.75), #1c2a3b, #0f111a)"}}>
            {
                windowWidth > 800 ? 
                <div className="w-[20%] nav-wall absolute h-[100%]" >
                    <NAVBAR/>
                </div>
                :
                <MOBILE/>
            }
            <div className={windowWidth > 800 ? "w-[80%] component-wall movie-scene h-[100%] ml-[20%] overflow-y-auto flex flex-col":"w-[100%] movie-scene overflow-y-auto h-[92%] flex flex-col"}>
                {
                    windowWidth > 800 && <BAR />
                }
            {
                people ?
                <>
                    {
                        people.map(({index,results,page,total_pages,people_total_pages,people_page,box,people_next},node) =>
                        
                            <div className={windowWidth > 800 ? "w-[90%] mx-[5%] h-[auto] flex flex-wrap flex-col":"w-[100%] h-[auto] flex flex-wrap flex-col"} key={node}>
                                <div className="w-[40%] h-[40px] flex flex-row my-t-[5%] my-b-[2%]">
                                    <span className="w-[5%] h-[100%] border-r-[10px] border-[#fff] bg-[#5A5A68]"></span>
                                    <span className="gradient-text default-text text-[25px]">{index}</span>
                                </div>
                                <SWEETPAGE intitializeMovies={intitializePeople} page={page} index={index} total_pages={total_pages}/>                                
                                <div className={`w-[100%] duration-50 movie-scene ${windowWidth > 800 ? "h-[400px]" : "h-[200px]"} flex flex-col flex-wrap overflow-x-auto overflow-y-hidden my-[1%]`}>
                                    {
                                        results.map(({profile_path,popularity,original_name,name,media_type,known_for_department,id,gender,adult},people_key) => 
                                            <div 
                                                key={people_key} 
                                                onClick={() => navRoute({
                                                    url:"/people/id",
                                                    state:{
                                                        id
                                                    }
                                                })}
                                                className={windowWidth > 800 ? "cursor-pointer w-[25%] h-[100%] hover:scale-110 duration-700":"cursor-pointer w-[40%] hover:scale-110 duration-700 h-[100%]"}>
                                                <div className="w-[100%] h-[100%]">
                                                    <PICTURE picture={profile_path} classes={"object-cover h-[100%]"} />
                                                    <div className="w-[100%] relative min-h-[60px] top-[-50%] bg-[rgba(0,0,0,0.75)] bg-opacity-60 text-white flex flex-col items-center justify-center">
                                                        <h2 className={windowWidth > 800 ? "text-[15px] font-bold":""}>{name ? name : original_name ? original_name : name}</h2>
                                                        <p style={{color:"#ffd800"}}><FontAwesomeIcon icon={faStar} /> {parseFloat(popularity).toFixed(2)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    }
                                </div>

                            </div>

                        )
                    }

                    </>
                    :
                    <img src="/videos/load.gif" alt="loader" className="w-[250px] h-[250px] mx-auto mt-[10%]" />
                }
            </div>
        </div>
    )
}
export default PEOPLE
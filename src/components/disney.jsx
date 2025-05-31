import { useEffect, useState, useCallback } from "react"
import NAVBAR from "./nav"
import PICTURE from "../midlleware/picture"
import { faStar } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
// import CONTROLLERS from "../midlleware/controllers"
import { NavLink } from "react-router-dom"
import SWEETPAGE from "../midlleware/pages"
import { gql, useMutation, useLazyQuery } from '@apollo/client';
import LOAD from "../midlleware/load"
import MOBILE from "./mobileBar";

const DISNEY = () => {

    const [people, setPeople] = useState(null)
    const [movies, setMovies] = useState(null)
    const [windowWidth, setWindowWidth] = useState(0);

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

    const FETCH_MOVIES_QUERY = gql`
        query Movie (
            $page: Int!,
            $genre : String!,
            $year : Int!,
            $region : String!,
            $language : String!,
            $index : String!,
            $date:String!,
        ){
            movie(
                page:$page,
                genre:$genre,
                year:$year,
                region:$region,
                language:$language,
                index:$index,
                date:$date,
            ) {
                results {
                    adult
                    backdrop_path
                    genre_ids
                    id
                    original_language
                    original_title
                    overview
                    popularity
                    poster_path
                    release_date
                    title
                    video 
                    vote_average
                    vote_count
                }
                page
                total_pages
                total_results                
                success
                error
                message
            }
        }
    `
    const [fetchMovies,fetchedMoviesData] = useLazyQuery(FETCH_MOVIES_QUERY,{
        // pollInterval: 500, // fetches new data at that interval
        notifyOnNetworkStatusChange: true,
        // variables,
        // skip: !variables.page, // Skip query execution if variables are not set
    });

    const INSERT_MOVIES_MUTATION = gql`
        mutation AddMovies(
            $page:Int!,
            $results:[ADD_MOVIE_RESULTS_INPUT],
            $total_pages:Int!,
            $total_results:Int!,
            $data :TRACK_DATA_INPUT,
            $type:String!,
        ) {
            addMovies(
                page:$page,
                results:$results,
                total_pages:$total_pages,
                total_results:$total_results,
                data:$data,
                type:$type,
            ) {
                success
                message
            }
        }
    `;

    const [mutateInsertMovies] = useMutation(INSERT_MOVIES_MUTATION, {
        onCompleted: (data) => {
            console.log(data)
            if (data.addMovies.success) {
                if(data.addMovies.message === "already inserted")
                    console.log("movie inserting already started...")
                console.log("Movies successfully inserted into MySQL:", data.addMovies.message);
                fetchedMoviesData.refetch()
                .then(status => console.log(status,"status"))
            } else {
                console.error("Failed to insert movies into MySQL:", data.addMovies.message, data.addMovies.error);
            }
        },
        onError: (error) => {
            console.error("Error inserting movies into MySQL:", error.message);
        },
    });

    const intitializeMovies = useCallback(async({
        runContent,
        page,
        genreId = '',
        adjustable = false,
        regionId = '',
        languageId='',
        yearId=0
    }) => {
        
        const fetchMoviesFromAPI = async (actual_index) => {

            const current_date = new Date().toISOString().split("T")[0]
            // console.log(current_date,"date")
            async function freshFetch(){
                // Fetch data from the API if not found in the cache
                //8 is for disney
                const response = await fetch(
                    `${process.env.REACT_APP_movie_db}${temp_movies[key].api}?api_key=${process.env.REACT_APP_api_key}&language=en-US&page=${temp_movies[key].page}&with_watch_providers=337&watch_region=US`
                );
                const data = await response.json();

                // console.log(data)
                if (data.results.length > 0) {
                    temp_movies[key].results = [
                        ...temp_movies[key].results,
                        ...data.results,
                    ];
                    temp_movies[key].total_pages = data.total_pages;
                    temp_movies[key].total_results = data.total_results;

                    // Update the movies state
                    setMovies((prevMovies) => {
                        prevMovies = prevMovies || [];
                        const updatedMovies = [...prevMovies];
                        const existingIndex = updatedMovies.findIndex(
                            (movie) => movie.index === actual_index
                        );

                        if (existingIndex > -1) {
                            updatedMovies[existingIndex].results = [
                                // ...updatedMovies[existingIndex].results,
                                ...data.results,
                            ];
                        } else {
                            updatedMovies.push(temp_movies[key]);
                        }

                        return updatedMovies;
                    });

                    // Insert the fetched data into MySQL using the mutation
                    mutateInsertMovies({
                        variables: {
                            page:temp_movies[key].page,
                            results:data.results,
                            total_pages:data.total_pages,
                            total_results:data.total_results,
                            data :{
                                genre: genreId,
                                region: regionId,
                                language: languageId,
                                year: yearId,
                                index:actual_index,
                                date:current_date,
                            },
                            
                            type:"movie",
                        },
                    });

                    return true
                }
                return false
            }

            const temp_movies = [
                { index: "discover disney movie", results: [], api: "discover/movie", page: 1, total_pages: 0 },
                { index: "discover disney tv", results: [], api: "discover/tv", page: 1, total_pages: 0 },
                // { index: "discover disney person", results: [], api: "discover/person", page: 1, total_pages: 0 },
            ];
            const key = temp_movies.findIndex(({ index }) => index === actual_index);

            if (page) {
                temp_movies[key].page = page;
            }

            if(!movies || adjustable){
                const fetched = await fetchMovies({
                    variables : {
                    page: temp_movies[key].page,
                    genre: genreId,
                    region: regionId,
                    language: languageId,
                    year: yearId,
                    index: actual_index,
                    date: current_date,  
                }})
                console.log(fetched)
                if (fetched.data) {
                    // console.log("Using cached data:", fetched.data);
                    if(fetched.data.movie.success && fetched.data.movie.results &&  fetched.data.movie.results.length < 20){
                        // console.log("less items")
                        return await freshFetch()
                    }else if(fetched.data.movie.error === "insert movies" || fetched.data.movie.error === "no records found"){
                        // console.log("no records found")
                        return await freshFetch()
                    }else{
                        // console.log("finally using cached data")
                        setMovies((prevMovies) => {
                            prevMovies = prevMovies || [];
                            const updatedMovies = [...prevMovies]
                            const existingIndex = updatedMovies.findIndex(
                                (movie) => movie.index === actual_index
                            );
        
                            if (existingIndex > -1) {
                                updatedMovies[existingIndex].results = [
                                    // ...updatedMovies[existingIndex].results,
                                    ...fetched.data.movie.results,
                                ];
                            } else {
                                updatedMovies.push({
                                    index: actual_index,
                                    results: fetched.data.movie.results,
                                    page: fetched.data.movie.page,
                                    total_pages: fetched.data.movie.total_pages,
                                    total_results:fetched.data.movie.total_results
                                });
                            }
        
                            return updatedMovies;
                        });
                        return true
                    }

                } else {
                    return await freshFetch()
                }
            }

        };
        runContent.forEach((index) => {
            fetchMoviesFromAPI(index)
            .then(status => {

            })
        })
    },[fetchMovies,mutateInsertMovies,movies]);

    useEffect(() => {
        intitializeMovies(
            {runContent:[
            "discover disney movie",
            "discover disney tv"]
        })

    },[intitializeMovies])

    const FETCH_PERSON_QUERY = gql`
        query People (
            $page: Int!,
            $genre : String!,
            $year : Int!,
            $region : String!,
            $language : String!,
            $index : String!,
            $date:String!,
        ){
            people(
                page:$page,
                genre:$genre,
                year:$year,
                region:$region,
                language:$language,
                index:$index,
                date:$date,
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
            }
        }
    `
    const [fetchPerson,fetchedPersonData] = useLazyQuery(FETCH_PERSON_QUERY,{
        notifyOnNetworkStatusChange: true,
    });

    const INSERT_PERSON_MUTATION = gql`
        mutation AddPerson(
            $page:Int!,
            $results:[ADD_PERSON_RESULTS_INPUT],
            $total_pages:Int!,
            $total_results:Int!,
            $data :TRACK_PERSON_DATA_INPUT,
            $type:String!,
        ) {
            addPerson(
                page:$page,
                results:$results,
                total_pages:$total_pages,
                total_results:$total_results,
                data:$data,
                type:$type,
            ) {
                success
                message
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
            console.error("Error inserting movies into MySQL:", error.message);
        },
    });

    const intitializePeople = useCallback(async({
        runContent,
        adjustable = false,
        page
    }) => {
        
        const fetchPersonFromAPI = async (actual_index) => {

            const current_date = new Date().toISOString().split("T")[0]
            
            const temp_people = [
                {"index":"discover disney person","results":[],"api":"discover/person","page":1,people_page:1},
            ]
            const key = temp_people.findIndex(({ index }) => index === actual_index);
            async function freshFetch(){
                // Fetch data from the API if not found in the cache
                const response = await fetch(
                    `${process.env.REACT_APP_movie_db}${temp_people[key].api}?api_key=${process.env.REACT_APP_api_key}&language=en-US&page=${temp_people[key].page}&with_watch_providers=337&watch_region=US`
                );
                const data = await response.json();

                if (data.results.length > 0) {
                    let peopleArray = [...data.results]
                    temp_people[key].results = [...temp_people[key].results, ...peopleArray];
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

                    function chunkArray(array, size) {
                        const result = [];
                        for (let i = 0; i < array.length; i += size) {
                            result.push(array.slice(i, i + size));
                        }
                        return result;
                    }
                    let all_results = [...temp_people[key].results]
                    if(all_results.length > 100){
                        const chunks = chunkArray(all_results, 100);
                        for (let i = 0; i < chunks.length; i++) {
                            await mutateInsertPerson({
                                variables: {
                                    page:temp_people[key].page,
                                    results:temp_people[key].results,
                                    total_pages:data.total_pages,
                                    total_results:data.total_results,
                                    data :{
                                        genre: '',
                                        region: '',
                                        language: '',
                                        year: 0,
                                        index:actual_index,
                                        date:current_date,
                                    },
                                    
                                    type:"person",
                                },
                            });
                        }
                    }else{
                        // Less than or equal to 100, insert all at once
                        await mutateInsertPerson({
                            variables: {
                                page:temp_people[key].page,
                                results:temp_people[key].results,
                                total_pages:data.total_pages,
                                total_results:data.total_results,
                                data :{
                                    genre: '',
                                    region: '',
                                    language: '',
                                    year: 0,
                                    index:actual_index,
                                    date:current_date,
                                },
                                
                                type:"person",
                            },
                        });
                    }

                    return true
                }
                return false
            }


            if (page) {
                temp_people[key].page = page;
            }

            if(!people || adjustable){
                const fetched = await fetchPerson({
                    variables : {
                    page: temp_people[key].page,
                    genre: '',
                    region: '',
                    language: '',
                    year: 0,
                    index: actual_index,
                    date: current_date,  
                }})

                if (fetched.data) {
                    console.log("Using cached data:", fetched.data);
                    if(fetched.data.people.success && fetched.data.people.results &&  fetched.data.people.results.length < 20){
                        console.log("less items")
                        return await freshFetch()
                    }else if(fetched.data.people.error === "insert person" || fetched.data.people.error === "no records found"){
                        console.log("no records found")
                        return await freshFetch()
                    }else{
                        console.log("finally using cached data")
                        console.log(fetched.data.people.results.find(({known_for}) => known_for))
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
                            } else {
                                updatedPeople.push({
                                    index: actual_index,
                                    results: fetched.data.people.results,
                                    page: fetched.data.people.page,
                                    total_pages: fetched.data.people.total_pages,
                                    total_results:fetched.data.people.total_results
                                });
                            }
        
                            return updatedPeople;
                        });
                        return true
                    }

                } else {
                    return await freshFetch()
                }
            }
        };
        runContent.forEach((index) => {
            fetchPersonFromAPI(index)
            .then(status => {
                if(!status){
                    // Swal.fire({
                    //     title:"internet connection error",
                    //     text: "Please try again.",
                    //     icon: "error", // Set the icon to "error"
                    //     confirmButtonText: "OK",
                        
                    // })
                }
            })
        })
    },[mutateInsertPerson,fetchPerson, people])

    useEffect(() => {
        intitializePeople(
            {runContent:[
            "discover disney person"]
        })

    },[intitializePeople])
    return (
        <div className="w-[100%] duration-250 h-[auto] text-white flex flex-row flex-wrap" style={{background:"linear-gradient(65deg, #0d0d0d, rgba(0,0,0,0.75), #000, #0f111a)"}}>
            {
                windowWidth > 800 ? 
                <div className="w-[20%] absolute h-[100%] border-r-[3px] border-[#2E2E3A]" style={{background:"linear-gradient(85deg, #0d0d0d, rgba(0,0,0,0.75), #000, #0f111a)"}}>
                    <NAVBAR/>
                </div>
                :
                <MOBILE/>
            }
            <div className={windowWidth > 800 ? "w-[80%] h-[auto] ml-[20%] flex flex-col":"w-[100%] h-[auto] flex flex-col"}>
                {/* <div className="w-[100%]">
                    <CONTROLLERS intitializeMovies={intitializeMovies} type={"movie"}/>
                </div> */}
                {
                    movies && movies.length > 0 ? movies.map(({index,results,page,total_pages},node) =>
                        <div className="w-[90%] h-[auto] flex flex-wrap flex-col mx-[5%]" key={node}>
                            <h1 className="my-t-[5%]">{index}</h1>
                            <div className="w-[15%] h-[10px] border-r-[4px] bg-[#5A5A68]"></div>
                            <SWEETPAGE intitializeMovies={intitializeMovies} page={page} index={index} total_pages={total_pages}/>
                            <div className={`w-[100%] duration-50 movie-scene ${windowWidth > 800 ? "h-[400px]" : "h-[300px]"} flex flex-col flex-wrap overflow-x-auto overflow-y-hidden my-[1%]`}>
                                {
                                    results.map(({adult,backdrop_path,genre_ids,id,original_language,original_title,overview,popularity,poster_path,release_date,title,video,vote_average,vote_count},movie_key) => 
                                        <NavLink key={movie_key} to={`/movies/${id}`} className={windowWidth > 800 ? "w-[24%] h-[100%] hover:skew-4 m-[0.5%] hover:contrast-150":"w-[48%] hover:skew-4 h-[100%] m-[0.5%] hover:contrast-150"}>
                                            <div className="w-[100%] h-[100%]">
                                                <PICTURE key={id} classes={"object-cover h-[100%]"} picture={poster_path} />
                                                <div className="w-[100%] relative min-h-[60px] top-[-50%] bg-[#000000] bg-opacity-60 text-white flex flex-col items-center justify-center">
                                                    <h2 className="text-[15px] font-bold">{title ? title : original_title ? original_title : title}</h2>
                                                    <p style={{color:"#ffd800"}}><FontAwesomeIcon icon={faStar} /> { parseFloat(vote_average).toFixed(1) || parseFloat(popularity).toFixed(1) || vote_count}</p>
                                                </div>
                                            </div>
                                        </NavLink>
                                    )
                                }
                            </div>
                        </div>

                    )
                    :
                    <LOAD/>
                }
                {
                    people && people.length > 0 ?
                        people.map(({index,results,page,total_pages},node) =>
                            <div className="w-[90%] mx-[5%] h-[auto] flex flex-wrap flex-col" key={node}>
                                <h1 className="my-t-[5%]">{index}</h1>
                                <div className="w-[15%] h-[10px] border-r-[4px] bg-[#5A5A68]"></div>
                                <SWEETPAGE intitializeMovies={intitializePeople} page={page} index={index} total_pages={total_pages}/>
                                <div className={`w-[100%] duration-50 movie-scene ${windowWidth > 800 ? "h-[400px]" : "h-[300px]"} flex flex-col flex-wrap overflow-x-auto overflow-y-hidden my-[1%]`}>
                                    {
                                        results.map(({profile_path,popularity,original_name,name,media_type,known_for_department,id,gender,adult},people_key) => 
                                            <NavLink key={people_key} to={`/people/${id}`} className={windowWidth > 800 ? "w-[24%] h-[100%] hover:skew-4 m-[0.5%] hover:contrast-150":"w-[48%] hover:skew-4 h-[100%] m-[0.5%] hover:contrast-150"}>
                                                <div className="w-[100%] h-[100%]">
                                                    <PICTURE classes={"object-cover h-[100%]"} picture={profile_path} />
                                                    <div className="w-[100%] relative min-h-[60px] top-[-50%] bg-[#000000] bg-opacity-60 text-white flex flex-col items-center justify-center">
                                                        <h2 className="text-[15px] font-bold">{name ? name : original_name ? original_name : name}</h2>
                                                        <p style={{color:"#ffd800"}}><FontAwesomeIcon icon={faStar} /> {parseFloat(popularity).toFixed(2)}</p>
                                                    </div>
                                                </div>
                                            </NavLink>
                                        )
                                    }
                                </div>
                            </div>

                        )
                    :
                    <LOAD/>
                }
            </div>
            <div className="w-[100%] h-[5%] flex flex-row bg-[#000]">
                <NavLink
                    to="/privacy"
                    className={"w-[25% m-[1%]"}
                >
                    Privacy
                </NavLink>
                <NavLink
                    to="/terms"
                    className={"w-[25% m-[1%]"}
                >
                    Terms
                </NavLink>
            </div>
        </div>
    )
}

export default DISNEY
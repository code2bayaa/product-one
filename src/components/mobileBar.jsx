import { faBars, faBarsStaggered } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useState, useEffect } from "react"
import NAVBAR from "./nav"
import { gql, useMutation, useLazyQuery } from '@apollo/client';
import { faSearch, faStar } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import { NavLink } from "react-router-dom";
import SWEETPAGE from "../midlleware/pages";
import PICTURE from "../midlleware/picture";

const MOBILE = () => {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState("")
    const [search_content, setSearchContent] = useState([]);
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
        query fetchMovie (
            $page: Int!,
            $search : String!,
            $index : String!,
            $type:String!
        ){
            fetchMovie(
                search:$search,
                page:$page,
                index:$index,
                type:$type
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
    });

    const INSERT_MOVIES_MUTATION = gql`
        mutation searchMovies(
            $page:Int!,
            $results:[SEARCH_MOVIE_RESULTS_INPUT],
            $total_pages:Int!,
            $total_results:Int!,
            $data :SEARCH_DATA_INPUT,
            $type:String!,
        ) {
            searchMovies(
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
            if (data.searchMovies.success) {
                if(data.searchMovies.message == "already inserted")
                    console.log("movie inserting already started...")
                console.log("Movies successfully inserted into MySQL:", data.searchMovies.message);
                fetchedMoviesData.refetch()
                .then(status => console.log(status,"status"))
            } else {
                console.error("Failed to insert movies into MySQL:", data.searchMovies.message, data.searchMovies.error);
            }
        },
        onError: (error) => {
            console.error("Error inserting movies into MySQL:", error.message);
        },
    });

    const FETCH_PERSON_QUERY = gql`
        query FetchPerson (
            $page: Int!,
            $index : String!,
            $search:String!,
        ){
            fetchPerson(
                page:$page,
                search:$search,
                index:$index,
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
        mutation searchPerson(
            $page:Int!,
            $results:[SEARCH_PERSON_RESULTS_INPUT],
            $total_pages:Int!,
            $total_results:Int!,
            $data :SEARCH_PERSON_DATA_INPUT,
            $type:String!,
        ) {
            searchPerson(
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
            if (data.searchPerson.success) {
                if(data.searchPerson.message == "already inserted")
                    console.log("person inserting already started...")
                fetchedPersonData.refetch()
                .then(status => console.log(status,"status"))
            } else {
                console.error("Failed to insert person into MySQL:", data.searchPerson.message, data.searchPerson.error);
            }
        },
        onError: (error) => {
            console.error("Error inserting person into MySQL:", error.message);
        },
    });

    useEffect(() => {
        console.log("changing search...")
        if(search){
            intitializeMovies({runContent:[
                {"index":"series","api":"search/tv",page:1,"select":fetchMovies,"insert":mutateInsertMovies,"type":"tv","object":"fetchMovie"},
                {"index":"movies","api":"search/movie",page:1,"select":fetchMovies,"insert":mutateInsertMovies,"type":"movie","object":"fetchMovie"},
                {"index":"people","api":"search/person",page:1,"select":fetchPerson,"insert":mutateInsertPerson,"type":"person","object":"fetchPerson"}
            ]})
        }
    },[search])

    const editMachine = (e) => {
        setSearch(() => e.target.value);
    }

    const intitializeMovies = ({runContent}) => {
        if(search){
            runContent.forEach(async({index, api, page, select, insert, type, object}) => {
    
                async function freshFetch(){
                    const response = await fetch(`${process.env.REACT_APP_movie_db}${api}?api_key=${process.env.REACT_APP_api_key}&language=en-US&query=${search}&page=${page}`);
                    const data = await response.json();
        
                    if (data.results.length > 0) {
                        let key = search_content && search_content.findIndex((cont) => cont.index === index) || -1
                        if(key > -1){
                            setSearchContent(prevSearch => {
                                prevSearch[key] = {index, page, total_pages:data.total_pages, results: data.results, name: search, api}
                                return [...prevSearch]
                            })
        
                        }else
                            setSearchContent(prevSearch => ([...prevSearch, {index, page, total_pages:data.total_pages, results: data.results, name: search, api}]));
                    } else {
                        setSearchContent([{index:"not found", results: [], name: search}]);
                    }

                    insert({
                        variables: {
                            page,
                            results:data.results,
                            total_pages:data.total_pages,
                            total_results:data.total_results,
                            data :{
                                index:"search",
                                search
                            },                            
                            type,
                        },
                    })
                }

                const fetched = await select({
                    variables : {
                        page,
                        search,
                        index: "search",
                        type
                }})
                console.log(fetched)

                if (fetched.data) {
                    console.log("Using cached data:", fetched.data);
                    if(fetched.data[object].error === "insert movies" || fetched.data[object].error === "no records found"){
                        console.log("no records found")
                        freshFetch()
                    }else if(fetched.data[object].results && fetched.data[object].results.length > 0){
                        console.log("finally using cached data")
                        let key = search_content && search_content.findIndex((cont) => cont.index === index) || -1
                        if(key > -1){
                            setSearchContent(prevSearch => {
                                prevSearch[key] = {index, page, total_pages:fetched.data[object].total_pages, results: fetched.data[object].results, name: search, api}
                                return [...prevSearch]
                            })
        
                        }else
                            setSearchContent(prevSearch => ([...prevSearch, {index, page, total_pages:fetched.data[object].total_pages, results: fetched.data[object].results, name: search, api}])); 
                    }

                } else {
                    freshFetch()
                }
            })
        }else{
            Swal.fire({
                title: "Input search field",
                text: "Please enter a value in the search field.",
                icon: "warning", // Specify the type of alert
                confirmButtonText: "OK", // Optional: Add a confirm button
            });
        }

    }

    return (
        <>
            {
                search && search_content && search_content.length > 0 &&
                    <div style={{background:"linear-gradient(85deg, #0d0d0d, rgba(0,0,0,0.75), #000, #0f111a)"}} className="w-[100%] h-[85%] flex flex-row flex-wrap z-[51] overflow-y-auto absolute">
                        {
                            search_content.map(({index,results,page,total_pages,api},node) =>
                                <div className="w-[90%] h-[auto] flex flex-wrap flex-col mx-[5%]" key={node}>
                                    <h1 className="my-t-[5%]">{index}</h1>
                                    <div className="w-[15%] h-[10px] border-r-[4px] bg-[#5A5A68]"></div>
                                    <SWEETPAGE intitializeMovies={intitializeMovies} page={page} index={{index,api,page}} total_pages={total_pages}/>
                                    <div className="w-[100%] movie-scene h-[300px] flex flex-col flex-wrap overflow-x-auto overflow-y-hidden my-[1%]">
                                        {
                                            results.map(({title, original_title, vote_count, vote_average, poster_path, overview, original_language, origin_country, backdrop_path, first_air_date, genre_ids, adult, gender, id, known_for, known_for_department, name, original_name, popularity, profile_path},search_key) => 
                                                <NavLink key={search_key} to={`/${index}/${id}`} className={windowWidth > 800 ? "w-[24%] h-[100%] m-[0.5%] hover:contrast-150":"w-[48%] h-[100%] m-[0.5%] hover:contrast-150"}>

                                                    <div key={search_key} className="w-[100%] h-[100%]">
                                                        <PICTURE picture={poster_path || backdrop_path || profile_path} />
                                                        <div className="w-[100%] relative min-h-[60px] top-[-50%] bg-[#000000] bg-opacity-60 text-white flex flex-col items-center justify-center">
                                                            <h2 className="text-[15px] font-bold">{name || original_name || title || original_title}</h2>
                                                            <p style={{color:"#ffd800"}}><FontAwesomeIcon icon={faStar} /> { 
                                                            vote_average ? 
                                                                parseFloat(vote_average).toFixed(1)
                                                                :
                                                                popularity ? parseFloat(popularity).toFixed(0) 
                                                                :
                                                                vote_count ? vote_count : "0"
                                                            }</p>
                                                        </div>
                                                    </div>
                                                </NavLink>
                                            )
                                        }
                                    </div>
                                </div>
                            )
                        }
                    </div>

            }
            {
                open &&
                    <div className="w-[100%] h-[85%] z-[50] overflow-y-auto absolute" style={{background:"linear-gradient(85deg, #0d0d0d, rgba(0,0,0,0.75), #000, #0f111a)"}}>
                        <NAVBAR/>
                    </div>
            }
            <div className="w-[100%] h-[15%] flex flex-row flex-wrap z-[50] fixed bottom-[0px]" style={{background:"linear-gradient(85deg, #0d0d0d, rgba(0,0,0,0.75), #000, #0f111a)"}}>
                <div className="w-[80%] h-[100%] grid justify-items-center">
                    <form
                        className="w-[100%] h-[100%]"
                    >
                        <input
                            type="text"
                            placeholder="type to search..."
                            onInput={(e) => editMachine(e)}
                            className="w-[100%] h-[95%] bg-[transparent] border-b-[3px] border-[#fff] text-white"
                            // style={{boxShadow:"0px 4px 10px #ffd600"}}
                        />
                    </form>
                </div>
                <div className="w-[20%] h-[100%] flex justify-center items-center">
                    <button
                        type="button"
                        className="w-[100%] h-[100%] text-white"
                        onClick={() => setOpen(!open)}
                    >
                        {
                            open ? 
                            <FontAwesomeIcon icon={faBarsStaggered} className="text-[20px]" />
                            :
                            <FontAwesomeIcon icon={faBars} className="text-[20px]" />
                        }
                    </button>
                </div>
            </div>
        
        </>
    )
}

export default MOBILE
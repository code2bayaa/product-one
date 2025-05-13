import NAVBAR from "./nav";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCallback, useEffect, useState } from "react";
import PICTURE from "../midlleware/picture";
import { faSearch, faStar } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import { NavLink } from "react-router-dom";
import SWEETPAGE from "../midlleware/pages";
import { gql, useMutation, useLazyQuery } from '@apollo/client';
import LOAD from "../midlleware/load";

const SEARCH = () => {

    const [search_content, setSearchContent] = useState([]);
    const [search, setSearch] = useState()

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
                if(data.searchMovies.message === "already inserted")
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
                if(data.searchPerson.message === "already inserted")
                    // console.log("person inserting already started...")
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

    const intitializeMovies = useCallback(({runContent}) => {
        if(search){
            runContent.forEach(async({index, api, page, select, insert, type, object}) => {
  
                async function freshFetch(){
                    const response = await fetch(`${process.env.REACT_APP_movie_db}${api}?api_key=${process.env.REACT_APP_api_key}&language=en-US&query=${search}&page=${page}`);
                    const data = await response.json();
        
                    if (data.results.length > 0) {
                        let key = search_content.findIndex((cont) => cont.index === index)
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
                        let key = search_content.findIndex((cont) => cont.index === index)
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

    },[search,search_content])

    useEffect(() => {
        console.log("changing search...")
        if(search){
            intitializeMovies({runContent:[
                {"index":"series","api":"search/tv",page:1,"select":fetchMovies,"insert":mutateInsertMovies,"type":"tv","object":"fetchMovie"},
                {"index":"movies","api":"search/movie",page:1,"select":fetchMovies,"insert":mutateInsertMovies,"type":"movie","object":"fetchMovie"},
                {"index":"people","api":"search/person",page:1,"select":fetchPerson,"insert":mutateInsertPerson,"type":"person","object":"fetchPerson"}
            ]})
        }
    },[search,intitializeMovies,fetchMovies,mutateInsertMovies,fetchPerson,mutateInsertPerson])
    
    const searchMachine = async (e) => {
        try{
            e.preventDefault();
            intitializeMovies({runContent:[
                {"index":"series","api":"search/tv",page:1,"select":fetchMovies,"insert":mutateInsertMovies,"type":"tv","object":"fetchMovie"},
                {"index":"movies","api":"search/movie",page:1,"select":fetchMovies,"insert":mutateInsertMovies,"type":"movie","object":"fetchMovie"},
                {"index":"people","api":"search/person",page:1,"select":fetchPerson,"insert":mutateInsertPerson,"type":"person","object":"fetchPerson"}
            ]})

        }catch(error){
            console.log(error,"error")
        }

    }

    const editMachine = (e) => {
        setSearch(() => e.target.value);
        // sessionStorage.setItem("search",e.target.value)
    }

    return (
        <div className="w-[100%] min-h-[100%] text-white flex flex-row flex-wrap" style={{background:"linear-gradient(85deg, #0d0d0d, rgba(0,0,0,0.75), #000, #0f111a)"}}>
            <div className="w-[20%] h-[100%] absolute border-r-[3px] border-[#2E2E3A]">
                <NAVBAR/>
            </div>
            <div className="w-[80%] min-h-[100%] ml-[20%] flex flex-col">
                <div className="w-[100%] h-[auto] grid justify-items-center">
                    <form
                        className="w-[90%] h-[50px] flex flex-row items-center justify-between mt-[1%]"
                        onSubmit={(e) => searchMachine(e)}
                        style={{boxShadow:"0px 4px 6px #ffd600"}}
                    >
                        <input
                            type="text"
                            placeholder="Search..."
                            onInput={(e) => editMachine(e)}
                            className="w-[80%] h-[100%] bg-[transparent] border-[none] text-white outline-none px-[5%]"
                            // style={{boxShadow:"0px 4px 10px #ffd600"}}
                        />
                        <button
                            type="submit"
                            className="w-[20%] h-[100%] text-white"
                            // style={{boxShadow:"0px 4px 10px #ffd600"}}
                        >
                            <FontAwesomeIcon icon={faSearch} className="text-[20px]" />
                        </button>
                    </form>
                </div>
                <div className="w-[100%] h-[auto] flex flex-col-reverse items-center justify-center">
                    {
                        search_content ? search_content.map(({index,results,page,total_pages,api},node) =>
                            <div className="w-[90%] h-[auto] flex flex-wrap flex-col mx-[5%]" key={node}>
                                <h1 className="my-t-[5%]">{index}</h1>
                                <div className="w-[15%] h-[10px] border-r-[4px] bg-[#5A5A68]"></div>
                                <SWEETPAGE intitializeMovies={intitializeMovies} page={page} index={{index,api,page}} total_pages={total_pages}/>
                                <div className="w-[100%] movie-scene h-[300px] flex flex-col flex-wrap overflow-x-auto overflow-y-hidden my-[1%]">
                                    {
                                        results.map(({title, original_title, vote_count, vote_average, poster_path, overview, original_language, origin_country, backdrop_path, first_air_date, genre_ids, adult, gender, id, known_for, known_for_department, name, original_name, popularity, profile_path},search_key) => 
                                            <NavLink key={search_key} to={`/${index}/${id}`} className="w-[24%] h-[100%] m-[0.5%] hover:contrast-150">

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
                        :
                        <LOAD/>
                    }
                </div>
            </div>
        </div>
    )
}

export default SEARCH;
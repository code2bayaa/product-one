import { gql, useMutation, useLazyQuery } from '@apollo/client';
import Swal from "sweetalert2";

export const useGraphMovies = () => {
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

    const intitializeMovies = ({runContent,search}) => {
        if(search){
            console.log("searching for...",search)
            runContent.forEach(async({index, api, setSearchContent, search_content, page, select, insert, type, object}) => {
    
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
                // console.log(fetched)

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

    }

    return {
        fetchMovies,
        fetchedMoviesData,
        mutateInsertMovies,
        intitializeMovies
    }
}
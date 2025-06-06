import { gql, useMutation, useLazyQuery } from '@apollo/client';

export const useGraphMovies = () => {

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

    const intitializeMovies = async({
        runContent,
        page,
        movies,
        adjustable = false,
        genreId = '',
        regionId = '',
        languageId='',
        yearId=0
    }) => {
        console.log(movies)
        if(!movies || movies === null)
            movies = []

        // movies = await movies
        const fetchMoviesFromAPI = async (actual_index) => {


            const current_date = new Date().toISOString().split("T")[0]
            // console.log(current_date,"date")
            async function freshFetch(){
                // Fetch data from the API if not found in the cache
                const response = await fetch(
                    `${process.env.REACT_APP_movie_db}${temp_movies[key].api}?api_key=${process.env.REACT_APP_api_key}&language=en-US&page=${temp_movies[key].page}&with_genres=${genreId}&with_origin_country=${regionId}&sort_by=popularity.desc&with_original_language=${languageId}&primary_release_year=${yearId}`
                );
                const data = await response.json();

                console.log(data)
                if (data.results.length > 0) {
                    temp_movies[key].results = [
                        ...temp_movies[key].results,
                        ...data.results,
                    ];
                    temp_movies[key].total_pages = data.total_pages;
                    temp_movies[key].total_results = data.total_results;

                    adjustable = false

                    // Update the movies state
                    // setMovies((prevMovies) => {
                        // const prevMovies = movies || [];
                        // const updatedMovies = [...movies];
                        const existingIndex = movies.findIndex(
                            (movie) => movie.index === actual_index
                        );

                        if (existingIndex > -1) {
                            movies[existingIndex].results = [
                                // ...updatedMovies[existingIndex].results,
                                ...data.results,
                            ];
                        } else {
                            movies.push(temp_movies[key]);
                        }

                        // return updatedMovies;
                    // });

                    // console.log(
                    //     {
                    //         variables: {
                    //             page: temp_movies[key].page,
                    //             genre: genreId,
                    //             region: regionId,
                    //             language: languageId,
                    //             year: yearId,
                    //             index: actual_index,
                    //             date: current_date,
                    //         },
                    //     }
                    // )
                    // // Save the fetched data in the Apollo Client cache
                    // const writtenData = client.writeQuery({
                    //     query: FETCH_MOVIES_QUERY,
                    //     variables: {
                    //         page: temp_movies[key].page,
                    //         genre: genreId,
                    //         region: regionId,
                    //         language: languageId,
                    //         year: yearId,
                    //         index: actual_index,
                    //         date: current_date,
                    //     },
                    //     data: {
                    //         movie: {
                    //             data:[
                    //                 {
                    //                     genre: genreId,
                    //                     region: regionId,
                    //                     language: languageId,
                    //                     year: yearId,
                    //                     index:actual_index,
                    //                     page: temp_movies[key].page,
                    //                     results: data.results,
                    //                     total_pages: data.total_pages,
                    //                     total_results: data.total_results,
                    //                     date: current_date
                    //                 }
                    //             ],
                    //             success: true,
                    //             error: null,
                    //         },
                    //     },
                    // });

                    // console.log(writtenData,"written")

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
                { index: "discover", results: [], api: "discover/movie", page: 1, total_pages: 0 },
                { index: "popular", results: [], api: "movie/popular", page: 1, total_pages: 0 },
                { index: "trending", results: [], api: "trending/movie/day", page: 1, total_pages: 0 },
                { index: "top_rated", results: [], api: "movie/top_rated", page: 1, total_pages: 0 },
                { index: "upcoming", results: [], api: "movie/upcoming", page: 1, total_pages: 0 },
                { index: "now_playing", results: [], api: "movie/now_playing", page: 1, total_pages: 0 },
            ];
            const key = temp_movies.findIndex(({ index }) => index === actual_index);

            if (page) {
                temp_movies[key].page = page;
            }

            // Check if data exists in the cache
            // const cachedData = client.readQuery({
            //     query: FETCH_MOVIES_QUERY,
            //     variables: {
            //         page: temp_movies[key].page,
            //         genre: genreId,
            //         region: regionId,
            //         language: languageId,
            //         year: yearId,
            //         index: actual_index,
            //         date: current_date,
            //     },
            // });
            // console.log(cachedData,"cached")
            // console.log({
            //     variables: {
            //         page: temp_movies[key].page,
            //         genre: genreId,
            //         region: regionId,
            //         language: languageId,
            //         year: yearId,
            //         index: actual_index,
            //         date: current_date,
            //     },
            // })
            // console.log(fetchedMoviesData)

            
                console.log(genreId,"genreId")
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
                        // setMovies((prevMovies) => {
                        //     prevMovies = prevMovies || [];
                        //     const updatedMovies = [...prevMovies]
                            const existingIndex = movies.findIndex(
                                (movie) => movie.index === actual_index
                            );
        
                            if (existingIndex > -1) {
                                movies[existingIndex].results = [
                                    // ...updatedMovies[existingIndex].results,
                                    ...fetched.data.movie.results,
                                ];
                            } else {
                                movies.push({
                                    index: actual_index,
                                    results: fetched.data.movie.results,
                                    page: fetched.data.movie.page,
                                    total_pages: fetched.data.movie.total_pages,
                                    total_results:fetched.data.movie.total_results
                                });
                            }
        
                            // return updatedMovies;
                        // });
                        return true
                    }

                } else {
                    return await freshFetch()
                }
            // }

        };
        if(adjustable || genreId || regionId || languageId || yearId){
            runContent.forEach((index) => {
                fetchMoviesFromAPI(index)
                .then(status => {
                    // if(!status){
                    //     Swal.fire({
                    //         title:"internet connection error",
                    //         text: "Please try again.",
                    //         icon: "error", // Set the icon to "error"
                    //         confirmButtonText: "OK",
                            
                    //     })
                    // }
                })
            })
        }

        return movies
    };

    return {
        intitializeMovies
    }
}
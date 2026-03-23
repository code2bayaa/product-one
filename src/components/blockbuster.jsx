import { useCallback, useEffect, useState, useMemo } from 'react';
// import CryptoJS from "crypto-js";
import SHA256 from "crypto-js/sha256";
import { useMutation, useLazyQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/thumbs";
import CLIPS from "./clips";
import { useKeys } from "./safe"
const BLOCKBUSTER = ({setClip}) => {
    const [movies, setMovies] = useState(null)
    const {safeKeys} = useKeys();
    // console.log(movie_db, api_key, "env")
    // console.log(safeKeys,"safe")
    const FETCH_MOVIES_QUERY = gql`
        query Movie (
            $page: Int!,
            $data:TRACK_DATA_OUTPUT,
            $hashedKey:String!
        ){
            movie(
                page:$page,
                data :$data,
                hashedKey:$hashedKey
            ) {
                results {
                    id
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
    const [fetchMovies] = useLazyQuery(FETCH_MOVIES_QUERY,{
        // pollInterval: 500, // fetches new data at that interval
        notifyOnNetworkStatusChange: true,
        fetchPolicy: 'cache-first',
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
            $hashedKey:String!
        ) {
            addMovies(
                page:$page,
                results:$results,
                total_pages:$total_pages,
                total_results:$total_results,
                data:$data,
                hashedKey:$hashedKey
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

            } else {
                console.error("Failed to insert movies into MySQL:", data.addMovies.message, data.addMovies.error);
            }
        },
        onError: (error) => {
            console.error("Error inserting movies into MySQL:", error.message);
        },
    });

    const intitializeMoviesInit = useMemo(() => {

        async function run({
            runContent,
            page,
            adjustable = false,
            genreId = '',
            regionId = '',
            languageId='',
            yearId=0
        }){
            const fetchMoviesFromAPI = async (actual_index) => {

                const current_date = new Date().toISOString().split("T")[0]

                const temp_movies = [
                    { index: "now_playing", results: [], api: "movie/now_playing", page: 1, total_pages: 0 },
                ];
                const key = temp_movies.findIndex(({ index }) => index === actual_index);

                if (page) {
                    temp_movies[key].page = page;
                }
                const hashed = temp_movies[key].page + genreId + regionId + languageId + yearId + actual_index + "movie"
                const hashedKey = SHA256(hashed).toString();

                async function freshFetch(){
                    console.log(safeKeys,"inside")

                    // Fetch data from the API if not found in the cache
                    const response = await fetch(
                        `${safeKeys.MOVIE_DB}${temp_movies[key].api}?api_key=${safeKeys.API_KEY}&language=en-US&page=${temp_movies[key].page}`
                    );
                    console.log(`${safeKeys.MOVIE_DB}${temp_movies[key].api}?api_key=${safeKeys.API_KEY}&language=en-US&page=${temp_movies[key].page}`)
                    const data = await response.json();

                    const themeResults = data?.results || []

                    if (themeResults.length > 0) {
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

                        mutateInsertMovies({
                            variables: {
                                page:temp_movies[key].page,
                                results:data.results,
                                total_pages:data.total_pages,
                                total_results:data.total_results,
                                hashedKey,
                                data :{
                                    genre: genreId,
                                    region: regionId,
                                    language: languageId,
                                    year: yearId,
                                    index:actual_index,
                                    date:current_date,
                                    type:"movie",
                                },

                            },
                        });

                        return true
                    }
                    return false
                }

                if(adjustable || genreId || regionId || languageId || yearId){
                    const fetched = await fetchMovies({
                        variables : {
                        page: temp_movies[key].page,
                        data : {
                            genre: genreId,
                            year: yearId,
                            region: regionId,
                            language: languageId,
                            index: actual_index,
                            date: current_date,
                            type:"movie"
                        },
                        hashedKey
                    }})

                    console.log("fetched adjustable movie data", fetched)

                    if (fetched.data) {
                        if(fetched.data.movie.success && fetched.data.movie.results &&  fetched.data.movie.results.length < 20){
                            console.log("less items")
                            return await freshFetch()
                        }else if(fetched.data.movie.error === "insert movies" || fetched.data.movie.error === "no records found"){
                            console.log("no records found")
                            return await freshFetch()
                        }else{
                            console.log("finally using cached data")
                            setMovies((prevMovies) => {
                                prevMovies = prevMovies || [];
                                const updatedMovies = [...prevMovies]
                                const existingIndex = updatedMovies.findIndex(
                                    (movie) => movie.index === actual_index
                                );

                                if (existingIndex > -1) {
                                    updatedMovies[existingIndex].results = [
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
                        console.log("nothing")
                        return await freshFetch()
                    }

                }

            };

            runContent.forEach((index) => {
                fetchMoviesFromAPI(index)
            })
        }
        return {run};
    },[fetchMovies,mutateInsertMovies,safeKeys])

    useEffect(() => {

        intitializeMoviesInit.run({
            runContent: [
                "now_playing"
            ],
            adjustable: true
        })

    },[intitializeMoviesInit])

    const firstClip = useCallback((video) => {
        console.log("first clip video key", video)
        setClip(video)
    },[setClip])

    const updateClip = (video) => {
        setClip(video)
    }

    return (
        <div className="w-[100%] h-[100%] mt-[2%]">
            <CLIPS firstClip={firstClip} updateClip={updateClip} data={movies} stream={"movie"} />

        </div>
    );
}

export default BLOCKBUSTER;
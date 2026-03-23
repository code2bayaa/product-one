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
const BOX = ({setClip}) => {
    const [movies, setMovies] = useState(null)
    const {safeKeys} = useKeys();

    // console.log("safe keys",safeKeys)
    const FETCH_MOVIES_QUERY = gql`
        query Tv(
            $page: Int!,
            $genre : String!,
            $year : Int!,
            $region : String!,
            $language : String!,
            $index : String!,
            $date:String!,
            $hashedKey:String!
        ){
            tv(
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
                    backdrop_path
                    genre_ids
                    id
                    origin_country
                    original_language
                    original_name
                    first_air_date
                    overview
                    popularity
                    poster_path
                    name
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
    const [fetchMovies] = useLazyQuery(FETCH_MOVIES_QUERY,{
        // pollInterval: 500, // fetches new data at that interval
        notifyOnNetworkStatusChange: true,
        fetchPolicy: 'cache-first',
        // variables,
        // skip: !variables.page, // Skip query execution if variables are not set
    });

    const INSERT_MOVIES_MUTATION = gql`
        mutation AddTVS(
            $page:Int!,
            $results:[ADD_TV_RESULTS_INPUT],
            $total_pages:Int!,
            $total_results:Int!,
            $data :TRACK_TV_DATA_INPUT,
            $type:String!,
            $hashedKey:String!
        ) {
            addTVS(
                page:$page,
                results:$results,
                total_pages:$total_pages,
                total_results:$total_results,
                data:$data,
                type:$type,
                hashedKey:$hashedKey
            ) {
                success
                message
            }
        }
    `;

    const [mutateInsertMovies] = useMutation(INSERT_MOVIES_MUTATION, {
        onCompleted: (data) => {
            if (data.addTVS.success) {
                if(data.addTVS.message === "already inserted")
                    console.log("tv inserting already started...")
            } else {
                console.error("Failed to insert tv into MySQL:", data.addTVS.message, data.addTVS.error);
            }
        },
        onError: (error) => {
            console.error("Error inserting tv into MySQL:", error.message);
        },
    });

    const intitializeMovies = useMemo(() => {

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
                    {"index":"airing","results":[],"api":"tv/airing_today",page:1,total_pages:0},
                ];
                const key = temp_movies.findIndex(({ index }) => index === actual_index);

                if (page) {
                    temp_movies[key].page = page;
                }

                const hashed = temp_movies[key].page + genreId + regionId + languageId + yearId + actual_index + "tv"
                const hashedKey = SHA256(hashed).toString();

                async function freshFetch(){
                    console.log(`${safeKeys.MOVIE_DB}${temp_movies[key].api}?api_key=${safeKeys.API_KEY}&language=en-US&page=${temp_movies[key].page}`)
                    // Fetch data from the API if not found in the cache
                    const response = await fetch(
                        `${safeKeys.MOVIE_DB}${temp_movies[key].api}?api_key=${safeKeys.API_KEY}&language=en-US&page=${temp_movies[key].page}`
                    );
                    const data = await response.json();

                    console.log(data,"box data")
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
                                hashedKey,
                                type:"tv",
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
                        genre: genreId,
                        region: regionId,
                        language: languageId,
                        year: yearId,
                        index: actual_index,
                        date: current_date,
                        hashedKey
                    }})
                    console.log(fetched)

                    if (fetched.data) {
                        console.log("box Using cached data:", fetched.data);
                        if(fetched.data.tv.success && fetched.data.tv.results &&  fetched.data.tv.results.length < 20){
                            console.log("less items")
                            return await freshFetch()
                        }else if(fetched.data.tv.error === "insert tv" || fetched.data.tv.error === "no records found"){
                            console.log("no records found")
                            return await freshFetch()
                        }else{
                            console.log("finally using cached data")
                            setMovies((prevMovies) => {
                                prevMovies = prevMovies || [];
                                const updatedMovies = [...prevMovies]
                                const existingIndex = updatedMovies.findIndex(
                                    (tv) => tv.index === actual_index
                                );

                                if (existingIndex > -1) {
                                    updatedMovies[existingIndex].results = [
                                        // ...updatedMovies[existingIndex].results,
                                        ...fetched.data.tv.results,
                                    ];
                                } else {
                                    updatedMovies.push({
                                        index: actual_index,
                                        results: fetched.data.tv.results,
                                        page: fetched.data.tv.page,
                                        total_pages: fetched.data.tv.total_pages,
                                        total_results:fetched.data.tv.total_results
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
                    if(!status){

                    }
                })
            })
        }
        return {run}
    },[fetchMovies,mutateInsertMovies,safeKeys])

    useEffect(() => {
        intitializeMovies.run(
            {runContent:[
                "airing",
            ],
            adjustable:true
        })

    },[intitializeMovies])


    const updateClip = useCallback((video) => {
        setClip(video)
    },[setClip])

    return (
        <div className="w-[100%] h-[100%] mt-[0.5%]">
            <CLIPS updateClip={updateClip} data={movies} stream={"tv"} />
        </div>
    )
}

export default BOX
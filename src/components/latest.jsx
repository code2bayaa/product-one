"use client"
import { useState, useEffect, useCallback, useRef } from "react";
import Carousel from "../midlleware/carousel";
import { useMutation, useLazyQuery, useApolloClient } from '@apollo/client/react';
import { gql } from '@apollo/client';
import CryptoJS from "crypto-js";
import { useKeys } from "./safe";

const LATEST = ({wireframe,api}) => {

    const [movies, setMovies] = useState(null)
    const [windowWidth, setWindowWidth] = useState(0);
    const hasFetched = useRef(false)
    const {safeKeys} = useKeys()
    // const state = useStates("latest")

    // const wireframe = state.wireframe

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
    const FETCH_MOVIES_COLLECTION_QUERY = gql`
        query MovieCollection (
            $data:[COLLECTION_TRACK_DATA_OUTPUT],
            $hashedKey:String!
        ){
            movieCollection(
                data :$data,
                hashedKey:$hashedKey
            ) {
                data {
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
                    index               
                }              
                success
                error
                message
            }
        }
    `
    const [fetchMoviesCollection] = useLazyQuery(FETCH_MOVIES_COLLECTION_QUERY,{
        notifyOnNetworkStatusChange: true,
        fetchPolicy: 'cache-first',
    });
    
    const INSERT_MOVIES_COLLECTION_MUTATION = gql`
        mutation AddCollectionMovies(
            $data:[ADD_COLLECTION_MOVIES],
            $hashedKey:String!,
            $date:String!,
        ) {
            addCollectionMovies(
                hashedKey:$hashedKey,
                date:$date,
                data:$data
            ) {
                success
                message
            }
        }
    `;
    const [mutateInsertMoviesCollection] = useMutation(INSERT_MOVIES_COLLECTION_MUTATION, {
        onCompleted: (data) => {
            console.log(data)
            if (data.addMovies.success) {
                // if(data.addMovies.message === "already inserted")
                //     console.log("movie inserting already started...")
                console.log("Movies successfully inserted into MySQL:", data.addMovies.message);
                // fetchedMoviesData.refetch()
                // .then(status => console.log(status,"status"))
            } else {
                console.error("Failed to insert movies into MySQL:", data.addMovies.message, data.addMovies.error);
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
    const intitializeMoviesInit = useCallback(async({
            runContent,
            page,
            adjustable = false,
        }) => {
            
            const current_date = new Date().toISOString().split("T")[0]
            let hashed = "latest" + wireframe +  current_date
            const movieWrap = await Promise.all(runContent.map(actual_index => {
                const temp_movies = [
                    { index: "latest movie", results: [], api: "discover/movie", page: 1, total_pages: 0, type:"movie" },
                ];
                
                const key = temp_movies.findIndex(({ index }) => index === actual_index);

                if (page) {
                    temp_movies[key].page = page;
                }
                
                hashed += temp_movies[key].page + actual_index

                return ({
                    page: temp_movies[key].page, 
                    index: actual_index,
                    date: current_date,
                    type:temp_movies[key].type,
                })
            }))
            const hashedKey = CryptoJS.SHA256(hashed).toString();
            if(adjustable){
                async function freshFetch(){
                    let hashed = "latest" + wireframe + current_date
                    const insertContent = (await Promise.all(runContent.map(async actual_index => {
                        const temp_movies = [
                            { index: "latest movie", results: [], api: "discover/movie", page: 1, total_pages: 0, type:"movie" },
                        ];
                        const key = temp_movies.findIndex(({ index }) => index === actual_index);
                        if (page) {
                            temp_movies[key].page = page;
                        }
                        const today = new Date();
                        const sevenDaysBefore = new Date(today);
                        sevenDaysBefore.setDate(today.getDate() - 7);

                        const formatted = sevenDaysBefore.toISOString().slice(0, 10);

                        hashed += temp_movies[key].page + actual_index
                        // Fetch data from the API if not found in the cache
                        const response = await fetch(
                            `${safeKeys.MOVIE_DB}${temp_movies[key].api}?api_key=${safeKeys.API_KEY}&language=en-US&page=${temp_movies[key].page}${api}&sort_by=first_air_date.desc&release_date.gte=${formatted}&release_date.lte=${new Date().toISOString().slice(0,10)}`
                        );
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

                            return ({
                                page:temp_movies[key].page,
                                results:data.results,
                                total_pages:data.total_pages,
                                total_results:data.total_results,
                                index:actual_index,   
                                type:temp_movies[key].type                        
                            })
                        }

                        return false
                    }))).filter(Boolean)
                    const hashedKey = CryptoJS.SHA256(hashed).toString();

                    // Insert the fetched data into MySQL using the mutation
                    mutateInsertMoviesCollection({
                        variables: {
                            data:insertContent,
                            date:current_date,
                            hashedKey
                        },
                    });
                }

                const fetched = await fetchMoviesCollection({
                    variables : {
                        data:movieWrap,
                        hashedKey
                }})

                if (fetched.data) {
                    if(fetched.data?.movieCollection?.message === "not initialized" || fetched.data?.movieCollection?.error){
                        console.log("no yet initialized")
                        return await freshFetch()
                    }else{
                        console.log("finally using cached data")
                        setMovies(() => [...fetched.data.movieCollection.data]);
                        return true
                    }

                } else {
                    console.log("nothing")
                    return await freshFetch()
                }
                //  return await freshFetch()
                
            }       
    },[fetchMoviesCollection,mutateInsertMoviesCollection,wireframe,api])

    useEffect(() => {
        if(hasFetched.current){
            return
        }
        hasFetched.current = true
        intitializeMoviesInit(
            {runContent:[
            "latest movie"
        ],
            adjustable:true
        })

    },[intitializeMoviesInit])

    return (
        <div className="w-[100%] h-[300px] flex justify-center items-center text-white">
            {
                movies && movies.length > 0 && movies[0].results && movies[0].results.length > 0  &&<Carousel type={"latest"} mode={"movie"} images={[...movies[0].results].sort((a,b) => b.vote_average > a.vote_average)}/>                       
            }
        </div>
    )
}

export default LATEST;
import { useEffect, useState, useCallback } from "react"
import NAVBAR from "./nav"
import PICTURE from "../midlleware/picture"
import { faStar } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import CONTROLLERS from "../midlleware/controllers"
import { NavLink, useParams } from "react-router-dom"
import SWEETPAGE from "../midlleware/pages"
import { gql, useMutation, useLazyQuery } from '@apollo/client';
import LOAD from "../midlleware/load"
import MOBILE from "./mobileBar";
import CryptoJS from "crypto-js";
import Swal from "sweetalert2"

const TALENT = () => {

    let { mode, extra } = useParams();
    const [people, setPeople] = useState(null)
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
    });

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
            console.error("Error inserting movies into MySQL:", error.message);
        },
    });

    const intitializeMovies = useCallback(async({
        page = 1,
        adjustable = false,
        genreId = '',
        regionId = '',
        languageId='',
        jobId='Actor',
        manualMode,
        yearId=0
    }) => {
        
        const fetchMoviesFromAPI = async () => {
           
            const current_date = new Date().toISOString().split("T")[0]
            const temp = [
                { index: "discover_movie", actual:"movie", results: [], api: "discover/movie", page: 1, total_pages: 0, type:"movie",people_page:1,total_results:0 },
                { index: "discover_tv", actual:"tv", results: [], api: "discover/tv", page: 1, total_pages: 0,type:"tv" ,people_page:1,total_results:0},
            ];
            const chunked = page - 1

            const key = temp.findIndex(({ actual }) => actual === extra);
            if (page) {
                temp[key].page = page;
            }

            
            const hashed = temp[key].page + genreId + regionId + languageId + yearId + temp[key].index + "person" + chunked
            const hashedKey = CryptoJS.SHA256(hashed).toString();
            console.log("initialize",mode)                

            
            async function freshFetch(){
                // Fetch data from the API if not found in the cache
                //8 is for netflix
                const response = await fetch(
                    `${process.env.REACT_APP_movie_db}${temp[key].api}?api_key=${process.env.REACT_APP_api_key}&language=en-US&page=${temp[key].page}&with_genres=${genreId}&with_origin_country=${regionId}&sort_by=popularity.desc&with_original_language=${languageId}&primary_release_year=${yearId}`
                );
                const data = await response.json();

                // console.log(data)
                if (data.results.length > 0) {

                    let peopleArray = await Promise.all(data.results.map(async({id}) => {
                        let api = extra === "tv" ? `tv/${id}/credits` : `movie/${id}/credits`
                        const response = await fetch(`${process.env.REACT_APP_movie_db}${api}?api_key=${process.env.REACT_APP_api_key}&language=en-US&page=${temp[key].people_page}`)
                        const {cast = [],crew = []} = await response.json()
                        
                        if(jobId === "Actor"){
                            return cast
                        }else{
                            return crew.filter(({job,known_for_department,department}) => job === jobId || known_for_department === jobId || department === jobId)
                        }         
                    }))
                    peopleArray = peopleArray.flat()
                    function chunkArray(array, size) {
                        const result = [];
                        for (let i = 0; i < array.length; i += size) {
                            result.push(array.slice(i, i + size));
                        }
                        return result;
                    }
                    let all_results = [...peopleArray]
                    // console.log(all_results)

                    // Remove duplicates by id (optional, if your data can have duplicates)
                    const uniqueResults = Array.from(
                        new Map(all_results.map(item => [item.id, item])).values()
                    );
                    if(uniqueResults.length > 20){
                        const chunks = chunkArray(all_results, 20);
                        console.log("chunking...")
                        temp[key].people_total_results = uniqueResults.length
                        temp[key].people_total_pages = Math.ceil(uniqueResults.length/20)
                        temp[key].people_next = uniqueResults.length > 20
                        temp[key].box = {
                            page: temp[key].page,
                            genre: genreId,
                            region: regionId,
                            language: languageId,
                            year: yearId,
                            index: temp[key].index,
                            date: current_date, 
                            hashedKey 
                        }

                        setPeople((prevPeople) => {
                            prevPeople = prevPeople || [];
                            let updatedPeople = [...prevPeople];
                            const existingIndex = updatedPeople.findIndex(({ index }) => index === temp[key].index);
                            if (existingIndex > -1) {
                                updatedPeople[existingIndex].people_page = 1
                                updatedPeople[existingIndex].results = chunks[0];
                                updatedPeople[existingIndex].people_total_results = uniqueResults.length
                                updatedPeople[existingIndex].people_next = uniqueResults.length > 20
                                updatedPeople[existingIndex].people_total_pages = Math.ceil(uniqueResults.length/20)
                                updatedPeople[existingIndex].box = {
                                    page: temp[key].page,
                                    genre: genreId,
                                    region: regionId,
                                    language: languageId,
                                    year: yearId,
                                    index: temp[key].index,
                                    date: current_date, 
                                    hashedKey 
                                }
                            } else {
                                updatedPeople = [...temp];
                            }
                            return updatedPeople;
                        });
                        for (let i = 0; i < chunks.length; i++) {
                            const hashed = temp[key].page + genreId + regionId + languageId + yearId + temp[key].index + "person" + i.toString()
                            const hashedKey = CryptoJS.SHA256(hashed).toString();

                                await mutateInsertPerson({
                                    variables: {
                                        page: temp[key].page,
                                        results: chunks[i],
                                        total_pages: data.total_pages,
                                        total_results: data.total_results,
                                        chunking:true,
                                        chunking_index:i,
                                        people_total_pages:chunks.length,
                                        data: {
                                            genre: genreId,
                                            region: regionId,
                                            language: languageId,
                                            year: yearId,
                                            index: temp[key].index,
                                            date: current_date,
                                        },
                                        type: "person",
                                        hashedKey
                                    },
                                });                                    
                        }
                    }                    

                    return true
                }
                return false
            }

            if(adjustable || manualMode){
                    const fetched = await fetchPerson({
                        variables : {
                        page: temp[key].page,
                        people_page:temp[key].people_page,
                        genre: genreId,
                        region: regionId,
                        language: languageId,
                        year: yearId,
                        index: temp[key].index,
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
                                    (person) => person.index === temp[key].index
                                );
            
                                if (existingIndex > -1) {
                                    updatedPeople[existingIndex].results = [
                                        ...fetched.data.people.results,
                                    ];
                                    updatedPeople[existingIndex].people_next = fetched?.data?.people_next
                                } else {
                                    updatedPeople.push({
                                        index: temp[key].index,
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
        // runContent.forEach((index) => {
            fetchMoviesFromAPI()
            .then(status => {

            })
        // })
    },[fetchPerson,mutateInsertPerson,mode,extra]);

    useEffect(() => {
        intitializeMovies(
            {
            adjustable:true
        })

    },[intitializeMovies])

    
    const peopleRun = async(nav,page,box) => {

        if(nav){
            page++
        }else{ //scroll X
            const el = document.getElementById(box.index);
            if (el) {
                el.scrollTo({
                    left: el.scrollWidth * "100%",
                    behavior: "smooth"
                });
            }
        }

        const fetched = await fetchPerson({
            variables : {
            people_page:page,
            ...box
        }})

        console.log(fetched.data)
        if(fetched.data && fetched.data.people && fetched.data.people.success){
            setPeople((prevPeople) => {
                prevPeople = prevPeople || [];
                const updatedPeople = [...prevPeople]
                const existingIndex = updatedPeople.findIndex(
                    (person) => person.index === box.index
                );

                if (existingIndex > -1) {
                    updatedPeople[existingIndex].results = [
                        ...updatedPeople[existingIndex].results,
                        ...fetched.data.people.results,
                    ];
                    updatedPeople[existingIndex].people_next = fetched?.data?.people_next
                    updatedPeople[existingIndex].box = box
                    updatedPeople[existingIndex].people_page = page
                } else {
                    updatedPeople.push({
                        people_page:page,
                        index: box.index,
                        results: fetched.data.people.results,
                        page: fetched.data.people.page,
                        total_pages: fetched.data.people.total_pages,
                        total_results:fetched.data.people.total_results,
                        people_next:fetched?.data?.people_next,
                        box
                    });
                }

                return updatedPeople;
            });
        }else{
            Swal.fire({
                title:"no more data",
                text: "end",
                icon: "error",
                confirmButtonText: "OK",                
            })
            setPeople((prevPeople) => {
                prevPeople = prevPeople || [];
                const updatedPeople = [...prevPeople]
                const existingIndex = updatedPeople.findIndex(
                    (person) => person.index === box.index
                );

                if (existingIndex > -1) {
                    // updatedPeople[existingIndex].results = [
                    //     ...updatedPeople[existingIndex].results,
                    //     ...fetched.data.people.results,
                    // ];
                    updatedPeople[existingIndex].people_next = false
                }

                return updatedPeople;
            });
        }

    }

    return (
        <div className="w-[100%] duration-250 h-[100%] text-white flex flex-row flex-wrap" style={{background:"linear-gradient(65deg, #0d0d0d, rgba(0,0,0,0.75), #1c2a3b, #0f111a)"}}>
            {
                windowWidth > 800 ? 
                <div className="w-[20%] absolute h-[100%] border-r-[3px] border-[#2E2E3A]">
                    <NAVBAR/>
                </div>
                :
                <MOBILE/>
            }
            <div className={windowWidth > 800 ? "w-[80%] movie-scene h-[100%] ml-[20%] overflow-y-auto flex flex-col":"w-[100%] movie-scene overflow-y-auto h-[92%] flex flex-col"}>
                <div className="w-[100%]">
                    <CONTROLLERS intitializeMovies={intitializeMovies} type={"people"} extra={extra}/>
                </div>
                {
                    people ? people.map(({results,page,total_pages,index,people_total_pages,people_page,box,people_next},node) =>
                        <div className={windowWidth > 800 ? "w-[90%] h-[auto] flex flex-wrap flex-col mx-[5%]":"w-[100%] h-[auto] flex flex-wrap flex-col"} key={node}>
                            <h1 className="my-t-[5%]">{index}</h1>
                            <div className="w-[15%] h-[10px] border-r-[4px] bg-[#5A5A68]"></div>
                            <SWEETPAGE intitializeMovies={intitializeMovies} page={page} index={index} total_pages={total_pages}/>
                            <div id={box && box.index} className={`w-[100%] h-auto flex flex-row flex-wrap`}>
                                {
                                    results.map(({adult,backdrop_path,genre_ids,id,original_language,original_name,name,original_title,overview,popularity,profile_path,poster_path,release_date,title,video,vote_average,vote_count},movie_key) => 
                                        <NavLink key={movie_key} to={name || original_name ? `/series/${id}` : `/movies/${id}`} className={windowWidth > 800 ? "w-[24%] m-[0.5%] h-[400px] hover:skew-4 hover:contrast-150":"w-[33%] m-[0.5%] hover:skew-4 h-[200px] hover:contrast-150"}>
                                            <div className="w-[100%] h-[100%]">
                                                <PICTURE key={id} classes={`object-cover h-[100%] ${windowWidth > 800 ? "" : "rounded-xl"}`} picture={poster_path || backdrop_path || profile_path} />
                                                <div className="w-[100%] relative min-h-[60px] top-[-50%] bg-[#000000] bg-opacity-60 text-white flex flex-col items-center justify-center">
                                                    <h2 className={windowWidth > 800 ? "text-[15px] font-bold":""}>{title || original_title || name || original_name }</h2>
                                                    <p style={{color:"#ffd800"}}><FontAwesomeIcon icon={faStar} /> { parseFloat(popularity).toFixed(2)}</p>
                                                </div>
                                            </div>
                                        </NavLink>
                                    )
                                }
                            </div>
                            <div className="w-[100%]">
                                {people_page > 1 && (
                                    <button
                                        className="relative bg-[#18181c] bg-opacity-80 hover:bg-[#ffd800] hover:text-black text-white font-bold rounded-full w-10 h-16 flex items-center justify-center shadow-lg"
                                        style={{ border: "2px solid #ffd800" }}
                                        onClick={() => peopleRun(false, people_page, box)}
                                        aria-label="Previous Page"
                                    >
                                        &#8592;
                                    </button>
                                )}
                                {/* Next Page Button */}
                                {people_next && (
                                    <button
                                        className="relative bg-[#18181c] bg-opacity-80 hover:bg-[#ffd800] hover:text-black text-white font-bold rounded-full w-[15%] h-16 flex items-center justify-center shadow-lg"
                                        style={{ border: "2px solid #ffd800" }}
                                        onClick={() => peopleRun(true, people_page, box)}
                                        aria-label="Next Page"
                                    >
                                        load more..
                                    </button>
                                )}   
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

export default TALENT
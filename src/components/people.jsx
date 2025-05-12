import { useEffect, useState } from "react"
import NAVBAR from "./nav"
import PICTURE from "../midlleware/picture"
import { faStar } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import CONTROLLERS from "../midlleware/controllers"
import { NavLink } from "react-router-dom"
import { useQuery, gql, useMutation, useLazyQuery } from '@apollo/client';
import Swal from "sweetalert2"
import LOAD from "../midlleware/load"
import MOBILE from "./mobileBar";

const PEOPLE = () => {

    const [people, setPeople] = useState([])
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
                if(data.addPerson.message == "already inserted")
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

    useEffect(() => {
        intitializePeople(
            {runContent:[
            // "latest",
            "discover movie","discover tv","trending","popular"]
        })

    },[])

    const intitializePeople = async ({
        runContent,
        page,
        jobId='Actor',
        genreId = '',
        regionId = '',
        languageId='',
        yearId=(new Date).getFullYear()
    }) => {
        
        const fetchPersonFromAPI = async (actual_index) => {

            const current_date = new Date().toISOString().split("T")[0]
            async function freshFetch(){
                // Fetch data from the API if not found in the cache
                const response = await fetch(
                    `${process.env.REACT_APP_movie_db}${temp_people[key].api}?api_key=${process.env.REACT_APP_api_key}&language=en-US&page=${temp_people[key].page}&with_genres=${genreId}&with_origin_country=${regionId}&sort_by=popularity.desc&with_original_language=${languageId}&primary_release_year=${yearId}`
                );
                const data = await response.json();

                if (data.results.length > 0) {
                    let peopleArray = [...data.results]
                    if(actual_index.match(/discover/)){
                        peopleArray = await Promise.all(data.results.map(async({id}) => {
                            let api = key ? `tv/${id}/credits` : `movie/${id}/credits`
                            const response = await fetch(`${process.env.REACT_APP_movie_db}${api}?api_key=${process.env.REACT_APP_api_key}&language=en-US&page=${temp_people[key].people_page}`)
                            const {cast = [],crew = []} = await response.json()
                                if(jobId === "Actor"){
                                    return cast
                                }else{
                                    return crew.filter(({job,known_for_department,department}) => job === jobId || known_for_department === jobId || department === jobId)
                                }
                            
                            
                        }))
                        peopleArray = peopleArray.flat()
                    }
                    temp_people[key].results = [...temp_people[key].results, ...peopleArray];
                    setPeople((prevPeople) => {
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

                    console.log(temp_people[key].results.find(({known_for}) => known_for),"known_for")
                    // Insert the fetched data into MySQL using the mutation
                    mutateInsertPerson({
                        variables: {
                            page:temp_people[key].page,
                            results:temp_people[key].results,
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
                            
                            type:"person",
                        },
                    });

                    return true
                }
                return false
            }

            const temp_people = [
                // {"index":"latest","results":[],"api":"movie/latest"},
                {"index":"discover movie","results":[],"api":"discover/movie","page":1,people_page:1},
                {"index":"discover tv","results":[],"api":"discover/tv","page":1,people_page:1},
                {"index":"trending","results":[],"api":"trending/person/day",page:1},
                {"index":"popular","results":[],"api":"person/popular",page:1}
            ]
            const key = temp_people.findIndex(({ index }) => index === actual_index);

            if (page) {
                temp_people[key].page = page;
            }

            const fetched = await fetchPerson({
                variables : {
                page: temp_people[key].page,
                genre: genreId,
                region: regionId,
                language: languageId,
                year: yearId,
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
        };
        runContent.forEach((index) => {
            fetchPersonFromAPI(index)
            .then(status => {
                if(!status){
                    Swal.fire({
                        title:"internet connection error",
                        text: "Please try again.",
                        icon: "error", // Set the icon to "error"
                        confirmButtonText: "OK",
                        
                    })
                }
            })
        })
    }

    return (
        <div className="w-[100%] min-h-[100%] text-white flex flex-row flex-wrap" style={{background:"linear-gradient(65deg, #0d0d0d, rgba(0,0,0,0.75), #1c2a3b, #0f111a)"}}>
            {
                windowWidth > 800 ? 
                <div className="w-[20%] absolute h-[100%] border-r-[3px] border-[#2E2E3A]" style={{background:"linear-gradient(85deg, #0d0d0d, rgba(0,0,0,0.75), #000, #0f111a)"}}>
                    <NAVBAR/>
                </div>
                :
                <MOBILE/>
            }
            <div className={windowWidth > 800 ? "w-[80%] min-h-[100%] ml-[20%] flex flex-col":"w-[98%] mx-[1%] min-h-[100%] flex flex-col"}>
            {
                people && people.length > 0 ?
                <>
                    <div className="w-[100%]">
                        <CONTROLLERS intitializePeople={intitializePeople} type={"people"}/>
                    </div>
                    {
                        people.map(({index,results},node) =>
                            <div className="w-[100%] h-[auto] flex flex-wrap flex-col" key={node}>
                                <h1 style={{marginLeft:"10%"}} className="my-t-[5%]">{index}</h1>
                                <div style={{marginLeft:"10%"}} className="w-[15%] h-[10px] border-r-[4px] bg-[#5A5A68]"></div>
                                <div className="w-[90%] movie-scene h-[400px] flex flex-col flex-wrap overflow-x-auto overflow-y-hidden mx-[5%] my-[1%]">
                                    {
                                        results.map(({profile_path,popularity,original_name,name,media_type,known_for_department,id,gender,adult},people_key) => 
                                            <NavLink key={people_key} to={`/people/${id}`} className={windowWidth > 800 ? "w-[24%] h-[100%] m-[0.5%] hover:contrast-150":"w-[48%] h-[100%] m-[0.5%] hover:contrast-150"}>
                                                <div className="w-[100%] h-[100%]">
                                                    <PICTURE picture={profile_path} />
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
                    }

                    </>
                    :
                    <LOAD/>
                }
            </div>
        </div>
    )
}
export default PEOPLE
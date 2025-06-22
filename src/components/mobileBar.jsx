import { faBars, faBarsStaggered } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useState, useEffect } from "react"
import NAVBAR from "./nav"
// import { gql, useMutation, useLazyQuery } from '@apollo/client';
import { faStar } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import { NavLink } from "react-router-dom";
import SWEETPAGE from "../midlleware/pages";
import PICTURE from "../midlleware/picture";
import CryptoJS from "crypto-js";

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

    const intitializeSearch = ({runContent,search}) => {
        if(search){
            function getCurrentWeek() {
                const now = new Date();
                const startOfYear = new Date(now.getFullYear(), 0, 1);
                const pastDaysOfYear = (now - startOfYear) / 86400000;
                return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
            }

            // Usage:
            const currentWeek = getCurrentWeek();
            console.log(currentWeek,typeof currentWeek);
            console.log("searching for...",search)
            runContent.forEach(async({index, api, page, type, select, insert}) => {
                console.log("running")
                const hashed = page + search + type
                const hashedKey = CryptoJS.SHA256(hashed).toString();
                console.log("hashedKey",hashedKey)
                async function freshFetch(){
                    const response = await fetch(`${process.env.REACT_APP_movie_db}${api}?api_key=${process.env.REACT_APP_api_key}&language=en-US&query=${search}&page=${page}`);
                    const data = await response.json();
        
                    console.log(data,"fresh")
                    if (data.results.length > 0) {
                        setSearchContent((prevSearch) => {
                            prevSearch = prevSearch || [];
                            const updatedSearch = [...prevSearch]
                            const existingIndex = updatedSearch.findIndex(
                                (search) => search.index === index
                            );
        
                            if (existingIndex > -1) {
                                updatedSearch[existingIndex].results = [
                                    ...data?.results,
                                ];
                                // updatedSearch[existingIndex].people_next = fetched?.data?.people_next
                            } else {
                                updatedSearch.push({
                                    index,
                                    results: data?.results,
                                    page,
                                    total_pages: data?.total_pages,
                                    // total_results:fetched.data.people.total_results,
                                    // people_next:fetched?.data?.people_next
                                    name:search,
                                    api
                                });
                            }
        
                            return updatedSearch;
                        });                            
                    } else {
                        setSearchContent([{index:"not found", results: [], name: search}]);
                    }

                    const responseInsert = await fetch(`${insert}`,{
                        method:"POST",
                        headers:{
                            'Content-Type': 'application/json'
                        },
                        body:JSON.stringify({
                            page,
                            results:data.results,
                            total_pages:data?.total_pages || 0,
                            total_results:data?.total_results || 0,
                            data :{
                                index:"search",
                                search
                            },   
                            date:currentWeek,                         
                            type,
                            hashedKey
                        })
                    })

                    const {success, error, message} = await responseInsert.json()

                    console.log(error,message)
                    if(success){
                        console.log("inserted")
                    }else{
                        console.log("error inserting...")
                    }
                }
// {success, page, results, total_pages, total_results, error}
                const responseSelect = await fetch(`${select}`,{
                    method:"POST",
                    headers:{
                        'Content-Type': 'application/json'
                    },
                    body:JSON.stringify({
                        page,
                        search,
                        index: "search",
                        type,
                        date:currentWeek,
                        hashedKey
                    })
                })

                const selectData = await responseSelect.json()

                console.log(selectData,"select")

                    if(selectData.error === "insert movies" || selectData.error === "no records found"){
                        console.log("no records found")
                        freshFetch()
                    }else if(selectData.success && selectData.results && selectData.results.length > 0){
                        console.log("finally using cached data")
                        setSearchContent((prevSearch) => {
                            prevSearch = prevSearch || [];
                            const updatedSearch = [...prevSearch]
                            const existingIndex = updatedSearch.findIndex(
                                (search) => search.index === index
                            );
        
                            if (existingIndex > -1) {
                                updatedSearch[existingIndex].results = [
                                    ...selectData?.results,
                                ];
                                // updatedSearch[existingIndex].people_next = fetched?.data?.people_next
                            } else {
                                updatedSearch.push({
                                    index,
                                    results:selectData?.results,
                                    page:selectData?.page,
                                    total_pages:selectData?.total_pages,
                                    name:search,
                                    api
                                });
                            }
        
                            return updatedSearch;
                        });                            
                    } else {
                        console.log("fresh...")
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

    const editMachine = (e) => {
        const searchValue = e.target.value.toLowerCase().trim();
        setSearch(() => searchValue);
        intitializeSearch({runContent:[
            {"index":"series","api":"search/tv",page:1,"select":process.env.REACT_APP_search,"insert":process.env.REACT_APP_search_insert,"type":"tv"},
            {"index":"movies","api":"search/movie",page:1,"select":process.env.REACT_APP_search,"insert":process.env.REACT_APP_search_insert,"type":"movie"},
            {"index":"people","api":"search/person",page:1,"select":process.env.REACT_APP_search_person,"insert":process.env.REACT_APP_search_insert_person,"type":"person"}
        ],search:searchValue})
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
                                    <SWEETPAGE intitializeMovies={intitializeSearch} page={page} index={{index,api,page}} total_pages={total_pages}/>
                                    <div className="w-[100%] movie-scene h-[200px] flex flex-col flex-wrap overflow-x-auto overflow-y-hidden my-[1%]">
                                        {
                                            results.map(({title, original_title, vote_count, vote_average, poster_path, overview, original_language, origin_country, backdrop_path, first_air_date, genre_ids, adult, gender, id, known_for, known_for_department, name, original_name, popularity, profile_path},search_key) => 
                                                <NavLink key={search_key} to={`/${index}/${id}`} className={windowWidth > 800 ? "w-[24%] h-[100%] m-[0.5%] hover:contrast-150":"w-[48%] h-[100%] m-[0.5%] hover:contrast-150"}>

                                                    <div key={search_key} className="w-[100%] h-[100%]">
                                                        <PICTURE classes={'object-cover h-[100%]'} picture={poster_path || backdrop_path || profile_path} />
                                                        <div className="w-[100%] relative min-h-[60px] top-[-50%] bg-[#000000] bg-opacity-60 text-white flex flex-col items-center justify-center">
                                                            <h2 className="text-[10px] font-bold">{name || original_name || title || original_title}</h2>
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
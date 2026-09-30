// ...existing code...
import { shortRow } from "../midlleware/shortRow"
import NAVBAR from "./nav";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRef, useState } from "react";
import { faSearch, faStar } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom"
import SWEETPAGE from "../midlleware/pages";
import LOAD from "../midlleware/load";
import Swal from "sweetalert2";
import CryptoJS from "crypto-js";
import MOBILE from "./mobileBar";
import { useKeys } from "./safe";
import { useWindowWidth, DESKTOP_WIDTH } from "../hooks/useWindowWidth";
import { EDENIMAGE } from "./eden/shared";

const SEARCH_URL = process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_SEARCH : process.env.REACT_APP_SEARCH_LIVE
//PRD #20: Eden titles are only in our DB - the database service LIKE-searches them next to the TMDB cache routes
const EDEN_SEARCH_URL = (SEARCH_URL || "").replace(/\/search\/fetch\/?$/, "/search/eden")
const EDEN_ROWS = [
    {key:"movies", index:"eden movies", route:"/eden/movies/id"},
    {key:"tv", index:"eden series", route:"/eden/series/id"}
]
const SEARCH = () => {

    const {safeKeys} = useKeys()
    const [search_content, setSearchContent] = useState([]);
    const [search, setSearch] = useState()
    const windowWidth = useWindowWidth()
    const navigate = useNavigate();
    const typingTimer = useRef(null)

    //replaces (or drops, when empty) one titled row without touching the others
    const putRow = (row) => setSearchContent((prevSearch) => {
        const updatedSearch = (prevSearch || []).filter((item) => item.index !== row.index && item.index !== "not found")
        return row.results && row.results.length > 0 ? [...updatedSearch, row] : updatedSearch
    })

    const searchEden = async(search) => {
        try{
            const response = await fetch(EDEN_SEARCH_URL, {
                method:"POST",
                headers:{ 'Content-Type': 'application/json' },
                body:JSON.stringify({ search })
            })
            const data = await response.json()
            EDEN_ROWS.forEach(({key, index, route}) => putRow({
                index,
                route,
                eden:true,
                results:(data && data[key]) || [],
                page:1,
                total_pages:1,
                name:search
            }))
        }catch(error){
            console.log(error,"eden search")
        }
    }

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
            // console.log(currentWeek,typeof currentWeek);
            // console.log("searching for...",search)
            //a page change (SWEETPAGE) re-runs one TMDB row only; a new search also looks in Eden
            if(runContent.length > 1)
                searchEden(search)
            runContent.forEach(async({index, api, page, type, select, insert}) => {
                // console.log("running")
                const hashed = page + search + type
                const hashedKey = CryptoJS.SHA256(hashed).toString();
                // console.log("hashedKey",hashedKey)
                async function freshFetch(){
                    const response = await fetch(`${safeKeys.MOVIE_DB}${api}?api_key=${safeKeys.API_KEY}&language=en-US&query=${encodeURIComponent(search)}&page=${page}`);
                    const data = await response.json();

                    // console.log(data,"fresh")
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
                        putRow({index, results: [], name: search});
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
                                // updated_search[existingIndex].people_next = fetched?.data?.people_next
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

    const searchMachine = async (e) => {
        try{
            console.log("search name: " + search)
            e.preventDefault();
            clearTimeout(typingTimer.current)
            intitializeSearch({runContent:[
                {"index":"series","api":"search/tv",page:1,"select":process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_SEARCH : process.env.REACT_APP_SEARCH_LIVE,"insert":process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_SEARCH_INSERT : process.env.REACT_APP_SEARCH_INSERT_LIVE,"type":"tv"},
                {"index":"movies","api":"search/movie",page:1,"select":process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_SEARCH : process.env.REACT_APP_SEARCH_LIVE,"insert":process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_SEARCH_INSERT : process.env.REACT_APP_SEARCH_INSERT_LIVE,"type":"movie"},
                {"index":"people","api":"search/person",page:1,"select":process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_SEARCH_PERSON : process.env.REACT_APP_SEARCH_PERSON_LIVE,"insert":process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_SEARCH_INSERT_PERSON : process.env.REACT_APP_SEARCH_INSERT_PERSON_LIVE,"type":"person"}
            ],search})

        }catch(error){
            console.log(error,"error")
        }

    }

    const editMachine = (e) => {
        const raw = String(e.target.value || "");
        // normalize + trim + limit length
        const normalized = raw.toLowerCase().trim().slice(0, 100);

        // simple blacklist of obvious SQL injection markers / comment sequences
        const sqlMarkers = /(--|\/\*|\*\/|;|['"]\s*or\s+|'\s*;|\b(union|select|insert|delete|update|drop|alter|truncate|exec)\b)/i;
        if (sqlMarkers.test(normalized)) {
            // optional: show a brief UI message instead of silently failing
            // Swal.fire("Invalid input","Please remove special characters","error");
            setSearch(""); // clear or ignore
            return;
        }

        setSearch(normalized);
        //wait for a pause in typing - every keystroke used to hit TMDB three times
        clearTimeout(typingTimer.current)
        if(normalized.length < 2)
            return
        typingTimer.current = setTimeout(() => intitializeSearch({runContent:[
                {"index":"series","api":"search/tv",page:1,"select":process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_SEARCH : process.env.REACT_APP_SEARCH_LIVE,"insert":process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_SEARCH_INSERT : process.env.REACT_APP_SEARCH_INSERT_LIVE,"type":"tv"},
                {"index":"movies","api":"search/movie",page:1,"select":process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_SEARCH : process.env.REACT_APP_SEARCH_LIVE,"insert":process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_SEARCH_INSERT : process.env.REACT_APP_SEARCH_INSERT_LIVE,"type":"movie"},
                {"index":"people","api":"search/person",page:1,"select":process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_SEARCH_PERSON : process.env.REACT_APP_SEARCH_PERSON_LIVE,"insert":process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_SEARCH_INSERT_PERSON : process.env.REACT_APP_SEARCH_INSERT_PERSON_LIVE,"type":"person"}
        ],search:normalized}), 500)
    }
    const navRoute = ({state,url}) => {
        navigate(url,{
            state : {
                ...state
            }
        })
    }
    return (
        <div className="w-[100%] h-[100%] text-white flex flex-row flex-wrap" style={{background:"linear-gradient(85deg, #0d0d0d, rgba(0,0,0,0.75), #000, #0f111a)"}}>
            {
                windowWidth >= DESKTOP_WIDTH ?
                    <div className="w-[15%] absolute h-[100%] border-r-[3px] border-[#2E2E3A]" style={{background:"linear-gradient(85deg, rgba(13, 13, 13, 0.75), rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.56), rgba(0, 0, 0, 0.45))"}}>
                        <NAVBAR/>
                    </div>
                :
                    <MOBILE/>
            }
            <div className={windowWidth >= DESKTOP_WIDTH ? "w-[85%] duration-100 h-[100%] overflow-y-auto movie-scene ml-[15%] text-justify justify-center items-center":"w-[98%] mx-[1%] duration-100 h-[92%] overflow-y-auto movie-scene flex flex-col"}>
                <div className="w-[100%] h-[60px] mt-[1%] grid justify-items-center">
                    <form
                        className="w-[90%] h-[50px] flex flex-row items-center justify-between"
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
                        search_content ? search_content.map(({index,results,page,total_pages,api,route,eden},node) =>
                            <div className={windowWidth >= DESKTOP_WIDTH ? "w-[90%] h-[auto] flex flex-wrap flex-col mx-[5%]":"w-[100%] h-[auto] flex flex-wrap flex-col"} key={node}>
                                <h1 className="my-t-[5%]">{index}</h1>
                                <div className="w-[15%] h-[10px] border-r-[4px] bg-[#5A5A68]"></div>
                                {!eden && <SWEETPAGE intitializeMovies={intitializeSearch} page={page} index={{index,api,page}} total_pages={total_pages || 0}/>}
                                <div className={`w-[100%] duration-50 movie-scene ${windowWidth >= DESKTOP_WIDTH ? "h-[400px]" : "h-[300px]"} flex flex-col flex-wrap overflow-x-auto overflow-y-hidden my-[1%]${shortRow(results)}`}>
                                    {
                                        results.map(({title, original_title, vote_count, vote_average, poster_path, overview, original_language, origin_country, backdrop_path, first_air_date, genre_ids, adult, gender, id, known_for, known_for_department, name, original_name, popularity, profile_path},search_key) =>
                                            <div
                                                key={search_key}
                                                onClick={() => navRoute({
                                                    url:route || `/${index}/id`,
                                                    state:{
                                                        id
                                                    }
                                                })}
                                                className={windowWidth >= DESKTOP_WIDTH ? "cursor-pointer w-[25%] h-[100%] hover:contrast-150" : "cursor-pointer w-[45%] h-[100%] hover:contrast-150"}
                                            >
                                                {eden ?
                                                <div className="relative w-[100%] h-[100%]">
                                                    <EDENIMAGE path={poster_path || backdrop_path} alt={title || name || ""} className="w-[100%] h-[100%] object-cover"/>
                                                    <div className="absolute bottom-0 w-[100%] min-h-[60px] text-white flex flex-col items-center justify-center" style={{background:"linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0.85))"}}>
                                                        <h2 className={windowWidth >= DESKTOP_WIDTH ? "text-[15px] font-bold":"text-[12px]"}>{title || original_title || name || original_name}</h2>
                                                        <p className="text-[11px] text-[#ffd800]">Eden</p>
                                                    </div>
                                                </div>
                                                :
                                                <div
                                                    className="w-[100%] h-[100%] background"
                                                    style={{
                                                        boxShadow:windowWidth >= DESKTOP_WIDTH ? "rgba(0,0,0,0.8) -20px -150px 130px inset, rgba(0, 0, 0, 0.7) 0px 100px 10px, rgba(0, 0, 0, 0.8) 100px 50px 10px" : "rgba(0, 0, 0, 0.9) -50px -70px 180px inset, rgba(0, 0, 0, 0.7) 0px 100px 10px, rgba(0, 0, 0, 0.8) 100px 50px 10px",

                                                        backgroundImage: `
                                                            linear-gradient(to bottom, rgba(0,0,0,0) 60%, rgba(0,0,0,0.85) 100%),
                                                            url(${poster_path ? safeKeys.IMG_POSTER + poster_path : backdrop_path ? safeKeys.IMG_POSTER + backdrop_path : safeKeys.IMG_POSTER + profile_path})
                                                        `
                                                    }}
                                                >
                                                    <div className="relative top-[50%] left-1/2 transform -translate-x-1/2 w-[100%] min-h-[60px] bg-opacity-60 text-white flex flex-col items-center justify-center z-10">
                                                        <h2 className={windowWidth >= DESKTOP_WIDTH ? "text-[15px] font-bold":"text-[12px]"}>{title || original_title || name || original_name}</h2>
                                                        <p style={{color:"#ffd800"}}><FontAwesomeIcon icon={faStar} /> { parseFloat(vote_average).toFixed(1) || parseFloat(popularity).toFixed(1) || vote_count}</p>
                                                    </div>
                                                </div>
                                                }
                                            </div>
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
// ...existing code...
import NAVBAR from "./nav";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { useGraphMovies } from "../hooks/useGraphMovies";
import { useGraphPerson } from "../hooks/useGraphPerson";
import PICTURE from "../midlleware/picture";
import { faSearch, faStar } from "@fortawesome/free-solid-svg-icons";
// import Swal from "sweetalert2";
import { NavLink } from "react-router-dom";
import SWEETPAGE from "../midlleware/pages";
import LOAD from "../midlleware/load";
// import { GRAPHMOVIES } from "../models/movies";
// import { GRAPHPEOPLE } from "../models/people";

const SEARCH = () => {

    const [search_content, setSearchContent] = useState([]);
    const [search, setSearch] = useState()
    const {fetchMovies, mutateInsertMovies, intitializeMovies } = useGraphMovies();
    const {fetchPerson, mutateInsertPerson } = useGraphPerson();

    // useEffect(() => {
    //     console.log("changing search...")
    //     if(search){

    //     }
    // },[search,fetchMovies,mutateInsertMovies,intitializeMovies])
    
    const searchMachine = async (e) => {
        try{
            e.preventDefault();
            intitializeMovies({runContent:[
                {setSearchContent,search_content,"index":"series","api":"search/tv",page:1,"select":fetchMovies,"insert":mutateInsertMovies,"type":"tv","object":"fetchMovie"},
                {setSearchContent,search_content,"index":"movies","api":"search/movie",page:1,"select":fetchMovies,"insert":mutateInsertMovies,"type":"movie","object":"fetchMovie"},
                {setSearchContent,search_content,"index":"people","api":"search/person",page:1,"select":fetchPerson,"insert":mutateInsertPerson,"type":"person","object":"fetchPerson"}
            ],search})

        }catch(error){
            console.log(error,"error")
        }

    }

    const editMachine = (e) => {
        const searchValue = e.target.value
        setSearch(() => searchValue);
        intitializeMovies({runContent:[
            {setSearchContent,search_content,"index":"series","api":"search/tv",page:1,"select":fetchMovies,"insert":mutateInsertMovies,"type":"tv","object":"fetchMovie"},
            {setSearchContent,search_content,"index":"movies","api":"search/movie",page:1,"select":fetchMovies,"insert":mutateInsertMovies,"type":"movie","object":"fetchMovie"},
            {setSearchContent,search_content,"index":"people","api":"search/person",page:1,"select":fetchPerson,"insert":mutateInsertPerson,"type":"person","object":"fetchPerson"}
        ],search:searchValue})
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
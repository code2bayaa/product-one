import { useLazyQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { useEffect, useState, useCallback } from "react"
import Slider from "react-slick";
import Carousel from "./carousel";
import PICTURE from "./picture"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useNavigate } from "react-router-dom"
import { faEye } from "@fortawesome/free-solid-svg-icons"
import CryptoJS from "crypto-js";
import Swal from "sweetalert2"
import { useWindowWidth, DESKTOP_WIDTH } from "../hooks/useWindowWidth";
const STARS = ({actedMovies, mode}) => {
    const windowWidth = useWindowWidth()
    const [themes, setThemes] = useState(null)
    const navigate = useNavigate();
    // const client = useApolloClient();
    // const router = useRouter();
    const navRoute = ({state,url,ref}) => {
        navigate(url,{
            state : {
                ...state
            }
        })
    } 
    const FETCH_PERSON_QUERY = gql`
        query EdenPeople (
            $page: Int!,
            $data: [EDEN_PERSON_TRACKING_DATA],
            $index : String!,
            $date:String!,
            $hashedArray:[String!]
        ){
            edenPeople(
                page:$page,
                data:$data,
                index:$index,
                date:$date,
                hashedArray:$hashedArray
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
                    character

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
    const [fetchPerson] = useLazyQuery(FETCH_PERSON_QUERY,{
        notifyOnNetworkStatusChange: true,
        fetchPolicy: 'cache-first',
    });

    const initializeCelebrities = useCallback(({
        page,
        jobId='Actor'
    }) => {

        // create an AbortController for this invocation so caller can cancel it
        const controller = new AbortController();
        const { signal } = controller;
        let cancelled = false;

        const startCelebrityFetch = async () => {
            const current_date = new Date().toISOString().split("T")[0]

            const hashedArray = []
            for (let i = 0; i < 6; i++) {
                const hashed = page + "eden+person" + jobId + i.toString() + current_date + mode
                const hashedKey = CryptoJS.SHA256(hashed).toString();
                hashedArray.push(hashedKey)
            }

            const topActors = actedMovies.map(({results}) => {
                return results.map(({movie_id}) => ({id:movie_id}))
            }).flat()
            console.log(topActors,"topActors",actedMovies)
            // run the lazy query with try/catch and handle aborts
            let fetched = null;
            try{
                fetched = await fetchPerson({
                    variables : {
                        page,
                        data: topActors,
                        index: mode,
                        date: current_date, 
                        hashedArray 
                    }
                });
            }catch(err){
                if (err && err.name === 'AbortError') {
                    // aborted - stop silently
                    return;
                }
                console.error("fetchPerson error", err);
            }

            if(cancelled || signal.aborted) return;
            let retry = 1
            while(!fetched || !fetched.data || (fetched && fetched.data && fetched.data.edenPeople && fetched.data.edenPeople.results && fetched.data.edenPeople.results.length < 7) || (fetched && fetched.data && fetched.data.edenPeople?.error === "insert person") || (fetched && fetched.data && fetched.data.edenPeople?.error === "no records found")){
                if(retry >= 5){
                    Swal.fire('error','reload page')
                    break
                }
                    
                fetched = await fetchPerson({
                    variables : {
                        page,
                        data: topActors,
                        index: mode,
                        date: current_date, 
                        hashedArray 
                    }
                });
                retry++
            }
            console.log(fetched.data?.edenPeople?.results,"results")
            if(fetched.data?.edenPeople?.results && fetched.data?.edenPeople?.results.length > 0)
                setThemes(() => [...fetched.data?.edenPeople?.results].sort((a,b) => b.order - a.order).slice(0,20)) 
        }

        // start and return a cancel function
        startCelebrityFetch();

        return () => {
            cancelled = true;
            try { controller.abort(); } catch(e){ /* ignore */ }
        }
    },[actedMovies, fetchPerson, mode]);
    
    useEffect(() => {
        const cancel = initializeCelebrities({
            page:1
        });
        return () => {
            if (typeof cancel === 'function') cancel();
        };
    }, [initializeCelebrities]);
    const settings = {
        // dots: true,
        infinite: true,
        autoplaySpeed: 5,
        speed:15000,
        swipeToSlide:true,
        draggable:true,
        slidesToShow: 5,
        slidesToScroll: 5,
        autoplay:true,
        arrows:false,
        pauseOnHover:true,
        dots:false,
        cssEase:"ease",
        responsive: [{

            breakpoint: 1024,
            settings: {
            slidesToShow: 5,
            infinite: true
            }
    
        }, {
    
            breakpoint: 600,
            settings: {
            slidesToShow: 1,
            dots: false
            }
    
        }, {
    
            breakpoint: 300,
            settings: "unslick" // destroys slick
    
        }]
    };
    return (
        <>
        {
            themes ? 
                <>
                    {
                        windowWidth >= DESKTOP_WIDTH ? 
                            <div className="w-[100%] h-[60%] overflow-hidden shadow" style={{boxShadow:"0 10px 30px rgba(0,0,0,0.7),0 0 60px rgba(0,0,0,0.5)"}}>
                                <Slider {...settings}>
                                {
                                    themes && themes.map(({
                                        cast_id,
                                        character,
                                        credit_id,
                                        gender,
                                        id,
                                        name,
                                        order,
                                        profile_path
                                    },celebKey) =>  
                                        <div key={celebKey} className="w-[100%] h-[100%] hover:skew-4 contrast-150">
                                            <PICTURE key={id} classes={"object-cover float-left h-[100%]"} picture={profile_path} />
                                            <div style={{boxShadow:"0 10px 30px rgba(0,0,0,0.7),0 0 60px rgba(0,0,0,0.5)"}} className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[90%] h-[60px] bg-[#000000]/30 bg-opacity-30 text-white flex flex-col items-center justify-center z-10">
                                                <h2 className={windowWidth >= DESKTOP_WIDTH ? "text-[15px] font-bold":"text-[12px]"}>{name}</h2>
                                                <h3 style={{fontStyle:"italic"}}>{character}</h3>
                                                <button 
                                                    onClick={() => navRoute({
                                                        url:"/people/id",
                                                        state:{
                                                            id
                                                        }})}  
                                                >
                                                    <FontAwesomeIcon icon={faEye} /> read
                                                </button>                                        
                                            </div>

                                        </div>
                                    )
                                }
                                </Slider>                    
                            </div>
                        :
                        <div className="w-[100%] h-[80%] shadow" style={{
                            boxShadow:"inset 0 0 30px rgba(0,0,0,0.6),0 10px 30px rgba(0,0,0,0.7),0 0 60px rgba(0,0,0,0.5)",
                            //   overflow: "hidden",
                        }}>
                            {
                                themes && themes.length > 0 && <Carousel mode={mode} type="people" images={[...themes].sort((a,b) => b.order > a.order)}/>                       
                            }
                        </div>                 
                    }
                </>
            :
            <img src="/videos/load.gif" alt="loader" className="w-[250px] h-[250px] mx-auto mt-[10%]" />
        }
        </>
    )
}

export default STARS
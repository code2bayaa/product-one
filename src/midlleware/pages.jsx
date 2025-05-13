import { useEffect, useState } from "react"
import { faArrowDown, faArrowUp } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"


const SWEETPAGE = ({intitializeMovies,page,index,total_pages}) => {
    const [view, setView] = useState(false)
    const [newPage, setNewPage] = useState(page)
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

    const changePage = (k) => {
        const changed = k + 1
        setNewPage(changed)
        if(index.hasOwnProperty('page'))
            index.page = changed
        intitializeMovies({runContent:[index],page:changed,genreId:'',regionId:'',languageId:'',yearId:0})
    }
    return (
        <div className="w-[100%] flex flex-col">
            <button
                className={windowWidth > 800 ? "w-[15%] border-[2px]":"min-w-[15%] border-[2px]"}
                onClick={() => setView(!view)}
            >
                page {newPage} <FontAwesomeIcon icon={view ? faArrowUp : faArrowDown} /> 
            </button>
            <div className={`${ view ? "flex" : "hidden"} overflow-x-auto movie-scene w-[100%] flex-col h-[60px] flex-wrap`}>
                { 
                    Array(total_pages - 1 + 1)
                    .fill()
                    .map((_,k) => {
                        if(k + 1 !== newPage){
                            return  <button
                                    key={k}
                                    className={windowWidth > 800 ? "w-[10%] m-[0.5%] h-[100%] border-[2px]":"min-w-[15%] m-[0.5%] h-[100%] border-[2px]"}
                                    onClick={() => changePage(k)}
                                >
                                    page {k + 1}
                                </button>
                        }
                        return false

                    })
                    .filter(page => page)
                }
            </div>
        </div>
    )
}

export default SWEETPAGE
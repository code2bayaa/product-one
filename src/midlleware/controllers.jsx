import { useState, useEffect } from "react"
import { useQuery, gql, useMutation } from '@apollo/client';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowDown, faArrowUp } from "@fortawesome/free-solid-svg-icons";

const CONTROLLERS = ({intitializeMovies,type}) => {

    const [genre, setGenre] = useState([])
    const [region, setRegion] = useState([])
    const [language, setLanguage] = useState([])
    const [years, setYears] = useState([])
    const [jobs, setJob] = useState([])
    const [selectedGenre, setSelectedGenre] = useState(false)
    const [selectedRegion, setSelectedRegion] = useState(false)
    const [selectedLanguage, setSelectedLanguage] = useState(false)
    const [selectedYear, setSelectedYear] = useState(false)
    const [selectedJob, setSelectedJob] = useState(false)
    const [languageId, setLanguageId] = useState('')
    const [yearId, setYearId] = useState(0)
    const [regionId, setRegionId] = useState('')
    const [genreId, setGenreId] = useState('')
    const [genreTVId, setGenreTVId] = useState('')
    const [jobId, setJobId] = useState('Actor')
    const [languageName, setLanguageName] = useState('')
    const [yearName, setYearName] = useState('')
    const [regionName, setRegionName] = useState('')
    const [genreName, setGenreName] = useState('')
    const [genreTVName, setGenreTVName] = useState('')
    const [jobName, setJobName] = useState('')
    const [windowWidth, setWindowWidth] = useState(0);
    const [personType, setPersonType] = useState(null)

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };
        window.addEventListener("resize", handleResize);
        handleResize(); // Call it once to set the initial value
    },[])
    const fetchGenre = useQuery(gql`
        query Genre {
            genre {
                data {
                    id
                    name
                    mode
                }
                date
                success
                error
            }
        }
    `,{
        // pollInterval: 500, // fetches new data at that interval
        notifyOnNetworkStatusChange: true,
    });

    const [mutateInsertGenre] = useMutation(gql`
        mutation AddGenre(
            $date: String!
            $data: [GENRE_LIST_INPUT]!
        ) {
            addGenre(
             date: $date
             data: $data
            ){
                date
                data {
                    id
                    name
                    mode
                }
                success
                error
            }
        }
    `,
    {
        onCompleted: (data) => {
            // console.log("inserted genre", data);
            if (data.addGenre.success) {
                // Refetch the query to get updated data
                fetchGenre.refetch().then((refetched) => {
                    // console.log(refetched)
                    const typeGetGenreData = [...refetched.data.genre.data]
                    console.log("updating genre insert onComplete")
                    setGenre(() => typeGetGenreData)
                })

            }
        },
        onError: (error) => {
            console.error("insert genre Error:", error);
        },
    });

    const [mutateUpdateGenre] = useMutation(gql`
        mutation UpdateGenre(
            $date: String!
            $data: [GENRE_LIST_INPUT]!
        ) {
            updateGenre(
                date: $date
                data: $data
            ){
                date
                data {
                    id
                    name
                    mode
                }
                success
                error
            }
        }
    `,
    {
        onCompleted: (data) => {
            if (data.updateGenre.success) {
                // Refetch the query to get updated data
                fetchGenre.refetch().then((refetched) => {
                    console.log(refetched)
                    const typeGetGenreData = [...refetched.data.genre.data.filter(({mode}) => mode === type)]
                    console.log(typeGetGenreData)
                    console.log("updating genre update onComplete")
                    setGenre(() => typeGetGenreData)
                })

            }
        },
        onError: (error) => {
            console.error("insert genre Error:", error);
        },
    });


    const fetchRegion = useQuery(gql`
        query Region {
            region {
                data {
                    iso_3166_1
                    english_name
                    native_name
                }
                date
                success
                error
            }
        }
    `,{
        // pollInterval: 500, // fetches new data at that interval
        notifyOnNetworkStatusChange: true,
    });

    const [mutateInsertRegion] = useMutation(gql`
        mutation AddRegion(
            $date: String!
            $data: [REGION_DATA_INPUT]!
        ) {
            addRegion(
             date: $date
             data: $data
            ){
                date
                data {
                    iso_3166_1
                    english_name
                    native_name   
                }
                success
                error
            }
        }
    `,
    {
        onCompleted: (data) => {
            // console.log(data)
            if (data && data.addRegion.success) {
                // Refetch the query to get updated data
                fetchRegion.refetch().then((refetched) => {
                    const typeGetRegionData = [...refetched.data.region.data]
                    setRegion(() => typeGetRegionData)
                })

            }
        },
        onError: (error) => {
            console.error("insert region Error:", error);
        },
    });

    // const [mutateUpdateRegion, updateRegion] = useMutation(gql`
    //     mutation UpdateRegion(
    //         $date: String!
    //         $data: [REGION_DATA_INPUT]!
    //     ) {
    //         updateRegion(
    //             date: $date
    //             data: $data
    //         ){
    //             date
    //             data {
    //                 iso_3166_1
    //                 english_name
    //                 native_name  
    //             }
    //             success
    //             error
    //         }
    //     }
    // `,
    // {
    //     onCompleted: (data) => {
    //         if (data.updateRegion.success) {
    //             // Refetch the query to get updated data
    //             if (data && data.addRegion.success) {
    //                 // Refetch the query to get updated data
    //                 fetchRegion.refetch().then((refetched) => {
    //                     const typeGetRegionData = [...refetched.data.region.data]
    //                     setRegion(() => typeGetRegionData)
    //                 })
    
    //             }
    //         }
    //     },
    //     onError: (error) => {
    //         console.error("insert genre Error:", error);
    //     },
    // });

    const fetchLanguage = useQuery(gql`
        query Language {
            language {
                data {
                    iso_639_1
                    english_name
                    name
                }
                date
                success
                error
            }
        }
    `,{
        // pollInterval: 500, // fetches new data at that interval
        notifyOnNetworkStatusChange: true,
    });

    const [mutateInsertLanguage] = useMutation(gql`
        mutation AddLanguage(
            $date: String!
            $data: [LANGUAGE_DATA_INPUT]!
        ) {
            addLanguage(
             date: $date
             data: $data
            ){
                date
                data {
                    iso_639_1
                    english_name
                    name   
                }
                success
                error
            }
        }
    `,
    {
        onCompleted: (data) => {
            // console.log(data)
            if (data && data.addLanguage.success) {
                // Refetch the query to get updated data
                fetchLanguage.refetch().then((refetched) => {
                    const typeGetLanguageData = [...refetched.data.language.data]
                    setLanguage(() => typeGetLanguageData)
                })

            }
        },
        onError: (error) => {
            console.error("insert language Error:", error);
        },
    });

    // const [mutateUpdateLanguage, updateLanguage] = useMutation(gql`
    //     mutation UpdateLanguage(
    //         $date: String!
    //         $data: [LANGUAGE_DATA_INPUT]!
    //     ) {
    //         updateLanguage(
    //             date: $date
    //             data: $data
    //         ){
    //             date
    //             data {
    //                 iso_639_1
    //                 english_name
    //                 name  
    //             }
    //             success
    //             error
    //         }
    //     }
    // `,
    // {
    //     onCompleted: (data) => {
    //         if (data.updateLanguage.success) {
    //             // Refetch the query to get updated data
    //             if (data && data.addLanguage.success) {
    //                 // Refetch the query to get updated data
    //                 fetchLanguage.refetch().then((refetched) => {
    //                     const typeGetLanguageData = [...refetched.data.language.data]
    //                     setLanguage(() => typeGetLanguageData)
    //                 })
    
    //             }
    //         }
    //     },
    //     onError: (error) => {
    //         console.error("insert language Error:", error);
    //     },
    // });

    const removeGenre = (n) => {
        function runMain(){
            console.log("remove genre")
            setGenreId('')
            setGenreName('')
        }

        if(type === "people"){
            if(n === "movie"){
                intitializeMovies({runContent:["discover movie"],page:1,genreId:'',regionId,languageId,yearId,jobId})
                runMain()
            }else if(n === "tv"){
                intitializeMovies({runContent:["discover tv"],page:1,genreId:genreTVId,regionId,languageId,yearId,jobId})
                console.log("remove genre tv")
                setGenreTVId('')
                setGenreTVName('')
            }
             // setPersonType(null)
        }else{
            intitializeMovies({runContent:["discover"],page:1,genreId:'',regionId,languageId,yearId})
            runMain()
        }
            
    }

    const removeJob = () => {
        setJobId('')
        setJobName('')
        if(personType === "movie")
            intitializeMovies({runContent:["discover movie"],page:1,regionId,languageId,yearId,genreId,jobId:'Actor'})
        else if(personType === "tv")
            intitializeMovies({runContent:["discover tv"],page:1,regionId,languageId,yearId,genreId:genreTVId,jobId:'Actor'})
        else
            intitializeMovies({runContent:["discover movie","discover tv"],page:1,regionId,languageId,yearId,genreId,jobId:'Actor'})
    }

    const removeLanguage = () => {
        setLanguageId('')
        setLanguageName('')
        if(type === "people"){
            if(personType === "movie")
                intitializeMovies({runContent:["discover movie"],page:1,regionId,languageId:'',yearId,genreId,jobId})
            else if(personType === "tv")
                intitializeMovies({runContent:["discover tv"],page:1,regionId,languageId:'',yearId,genreId:genreTVId,jobId})
            else
                intitializeMovies({runContent:["discover movie","discover tv"],page:1,regionId,languageId:'',yearId,genreId,jobId})
        }else
            intitializeMovies({runContent:["discover"],page:1,regionId,languageId:'',yearId,genreId})
    }

    const removeRegion = () => {
        setRegionId('')
        setRegionName('')
        if(type === "people"){
            if(personType === "movie")
                intitializeMovies({runContent:["discover movie"],page:1,regionId:'',languageId,yearId,genreId,jobId})
            else if(personType === "tv")
                intitializeMovies({runContent:["discover tv"],page:1,regionId:'',languageId,yearId,genreId:genreTVId,jobId})
            else
                intitializeMovies({runContent:["discover movie","discover tv"],page:1,regionId:'',languageId,yearId,genreId,jobId})
        }else
            intitializeMovies({runContent:["discover"],page:1,regionId:'',languageId,yearId,genreId})
    }

    const removeYear = () => {
        setYearId((new Date()).getFullYear())
        setYearName('')
        if(type === "people"){
            if(personType === "movie")
                intitializeMovies({runContent:["discover movie"],page:1,regionId,languageId,yearId:0,genreId,jobId})
            else if(personType === "tv")
                intitializeMovies({runContent:["discover tv"],page:1,regionId,languageId,yearId:0,genreId:genreTVId,jobId})
            else
                intitializeMovies({runContent:["discover movie","discover tv"],page:1,regionId,languageId,yearId:0,genreId,jobId})
        }else
            intitializeMovies({runContent:["discover"],page:1,regionId,languageId,yearId:0,genreId})
    }
    const filterGenre = (id,name) => {
        // setMovies([])
        // console.log("filtered",id)
        function runMain(){
            console.log("remove genre movie")
            setGenreId(id.toString())
            setGenreName(name)
        }

        if(type === "people"){
            if(personType === "movie"){
                intitializeMovies({runContent:["discover movie"],page:1,genreId:id.toString(),regionId,languageId,yearId,jobId})
                runMain()
            }else if(personType === "tv"){
                intitializeMovies({runContent:["discover tv"],page:1,genreId:id.toString(),regionId,languageId,yearId,jobId})
                console.log("remove genre tv")
                setGenreTVId(id.toString())
                setGenreTVName(name)
            }
                

            // setPersonType(null)
        }else{
            intitializeMovies({runContent:["discover"],page:1,genreId:id.toString(),regionId,languageId,yearId})
            runMain()
        }
          
        console.log("filter genre")
        setGenre([])
        setSelectedGenre(false)
        
    }

    const filterRegion = (id,name) => {
        // console.log(id,"region")
        setRegionId(id)
        setRegionName(name)
        if(type === "people"){
            if(personType === "movie")
                intitializeMovies({runContent:["discover movie"],page:1,regionId:id,languageId,yearId,genreId,jobId})
            else if(personType === "tv")
                intitializeMovies({runContent:["discover tv"],page:1,regionId:id,languageId,yearId,genreId:genreTVId,jobId})
            else
                intitializeMovies({runContent:["discover movie","discover tv"],page:1,regionId:id,languageId,yearId,genreId,jobId})
        }else
            intitializeMovies({runContent:["discover"],page:1,regionId:id,languageId,yearId,genreId})
        setRegion([])
        setSelectedRegion(false)
    }

    const filterLanguage = (id,name) => {
        // console.log(id,"region")
        setLanguageId(id)
        setLanguageName(name)
        if(type === "people"){
            if(personType === "movie")
                intitializeMovies({runContent:["discover movie"],page:1,regionId,languageId:id,yearId,genreId,jobId})
            else if(personType === "tv")
                intitializeMovies({runContent:["discover tv"],page:1,regionId,languageId:id,yearId,genreId:genreTVId,jobId})
            else
                intitializeMovies({runContent:["discover movie","discover tv"],page:1,regionId,languageId:id,yearId,genreId,jobId})
        }else
            intitializeMovies({runContent:["discover"],page:1,regionId,languageId:id,yearId,genreId})
        setLanguage([])
        setSelectedLanguage(false)
    }

    const filterYear = id => {
        setYearId(id)
        setYearName(id)
        if(type === "people"){
            if(personType === "movie")
                intitializeMovies({runContent:["discover movie"],page:1,regionId,languageId,yearId:id,genreId,jobId})
            else if(personType === "tv")
                intitializeMovies({runContent:["discover tv"],page:1,regionId,languageId,yearId:id,genreId:genreTVId,jobId})
            else
                intitializeMovies({runContent:["discover movie","discover tv"],page:1,regionId,languageId,yearId:id,genreId,jobId})
        }else
            intitializeMovies({runContent:["discover"],page:1,regionId,languageId,yearId:id,genreId})
        // console.log("refresh")
        setYears(() => [])
        setSelectedYear(false)
    }

    const filterJob = id => {
        setJobId(id)
        setJobName(id)
        if(personType === "movie")
            intitializeMovies({runContent:["discover movie"],page:1,regionId,languageId,yearId,genreId,jobId:id})
        else if(personType === "tv")
            intitializeMovies({runContent:["discover tv"],page:1,regionId,languageId,yearId,genreId:genreTVId,jobId:id})
        else
            intitializeMovies({runContent:["discover movie","discover tv"],page:1,regionId,languageId,yearId,genreId,jobId:id})
        // console.log("refresh")
        setJob(() => [])
        setSelectedJob(false)
    }

    const getLanguage = async() => {
        if(selectedLanguage){
            setSelectedLanguage(() => false)
            setLanguage([])
        }else{
            try{

                const fetchFresh = async() => {
                    const response = await fetch(`${process.env.REACT_APP_movie_db}configuration/languages?api_key=${process.env.REACT_APP_api_key}&language=en-US`)
                    const data = await response.json()
                    return data
                }

                if (fetchLanguage.loading) console.log("fetching language Loading...");
                if (fetchLanguage.error){
                    // console.log(fetchGenre.error.message)
                    const getLanguageData = await fetchFresh()
                    setLanguage(() => [...getLanguageData])
                }else{
                    if(fetchLanguage.hasOwnProperty("data") && fetchLanguage.data){
                        const date = new Date()

                        if(fetchLanguage.data.language.error === "no records found"){
                            const getLanguageData = await fetchFresh()    
                                
                            mutateInsertLanguage({ variables: { date, data:[...getLanguageData] } })

                        }else{
                            //every other user --- most fetch
                            console.log("ordinarily...")
                            const getLanguage = fetchLanguage.data?.language?.data
                            setLanguage(() => [...getLanguage])
                        } 
                    }else{
                        const getLanguageData = await fetchFresh()
                        setLanguage(() => [...getLanguageData])
                        console.log("error fetching graph")
                    }
                }
                // else if(fetchLanguage.data.language.date && new Date(fetchLanguage.data.language.date) < date){
                //     //update -- first fetch of the day
                //     const getLanguageData = await fetchFresh()                                
                //     mutateUpdateLanguage({ variables: { date, data:getLanguageData } })

                // }
            }catch(err){
                console.log(err)
                fetch(`${process.env.REACT_APP_movie_db}configuration/language?api_key=${process.env.REACT_APP_api_key}&language=en-US`)
                .then(data => data.json())
                .then(data => setLanguage(() => [...data]))
            }
            setSelectedLanguage(() => true)
        }
    }

    const getRegion = async() => {
        if(selectedRegion){
            setSelectedRegion(() => false)
            setRegion([])
        }else{
            try{

                const fetchFresh = async() => {
                    const response = await fetch(`${process.env.REACT_APP_movie_db}configuration/countries?api_key=${process.env.REACT_APP_api_key}&language=en-US`)
                    const data = await response.json()
                    return data
                }

                if (fetchRegion.loading) console.log("fetching region Loading...");
                if (fetchRegion.error){
                    // console.log(fetchGenre.error.message)
                    const getRegionData = await fetchFresh()
                    setRegion(() => [...getRegionData])
                }else{
                    if(fetchRegion.hasOwnProperty("data") && fetchRegion.data){
                        const date = new Date()

                        if(fetchRegion.data.region.error === "no records found"){
                            const getRegionData = await fetchFresh()    
                                
                            mutateInsertRegion({ variables: { date, data:[...getRegionData] } })

                        }else{
                            //every other user --- most fetch
                            console.log("ordinarily...")
                            const getRegion = fetchRegion.data?.region?.data
                            setRegion(() => [...getRegion])
                        } 
                    }else{
                        const getRegionData = await fetchFresh()
                        setRegion(() => [...getRegionData])
                        console.log("error fetching graph")
                    }
                }
                // else if(fetchRegion.data.region.date && new Date(fetchRegion.data.region.date) < date){
                //     //update -- first fetch of the day
                //     const getRegionData = await fetchFresh()                                
                //     mutateUpdateRegion({ variables: { date, data:getRegionData } })

                // }
            }catch(err){
                console.log(err)
                fetch(`${process.env.REACT_APP_movie_db}configuration/countries?api_key=${process.env.REACT_APP_api_key}&language=en-US`)
                .then(data => data.json())
                .then(data => setRegion(() => [...data]))
            }
            setSelectedRegion(() => true)
        }
    }

    const getGenre = async(n) => {
        if(selectedGenre){
            // setSelectedGenre(false)
            console.log("get genre")
            setGenre([])
        }else{
            try{

                async function fetchFresh(){
                    const response = await fetch(`${process.env.REACT_APP_movie_db}genre/${type === "movie" ? "movie" : n === "movie" ? "movie" : "tv"}/list?api_key=${process.env.REACT_APP_api_key}&language=en-US`)
                    const data = await response.json()
                    // console.log(data,"fresh fetch")
                    return data.genres
                        
                }

                
                if (fetchGenre.loading) console.log("fetching genre Loading...");
                if (fetchGenre.error){
                    // console.log(fetchGenre.error.message)
                    const getGenreData = await fetchFresh()
                    console.log("error genre")
                    setGenre(() => [...getGenreData])
                }else{
                    //insert
                    
                    // console.log(fetchGenre)
                    if(fetchGenre.hasOwnProperty("data") && fetchGenre.data){

                        const date = new Date()

                        if(fetchGenre.data.genre.error === "no records found"){
                            const getGenreData = await fetchFresh()
                            // setGenre(() => [...getGenreData])
                            const typeGetGenreData = getGenreData.map((genres) => ({...genres, mode:n || type}))
    
                                
                            mutateInsertGenre({ variables: { date, data:[...typeGetGenreData] } })

                        }else if(!fetchGenre.data.genre.data.find(({mode}) => mode === type)){
                            console.log("switching...")
                            //switching from movie to tv 
                            const getGenreData = await fetchFresh()
                            const typeGetGenreData = getGenreData.map((genres) => ({...genres, mode:n || type}))

                            const jointGenre = [...fetchGenre.data.genre.data.map(old => ({...old,__typename:undefined})),...typeGetGenreData]
                            console.log(jointGenre)
                            mutateUpdateGenre({ variables: { date, data:[...jointGenre] } })
                        }else{
                            //every other user --- most fetch
                            console.log("ordinarily...")
                            const new_genre = fetchGenre.data?.genre?.data.filter(({mode}) => mode === n || mode === type)
                            // console.log(new_genre,n,type)
                            console.log("ordinarily genre")
                            setGenre(() => [...new_genre])
                        } 
                    }else{
                        const getGenreData = await fetchFresh()
                        console.log("fresh genre")
                        setGenre(() => [...getGenreData])
                        console.log("error fetching graph")
                    }

                } 


                // else if(fetchGenre.data.genre.date && new Date(fetchGenre.data.genre.date) < date){
                //     //update -- first fetch of the day
                //     const getGenreData = await fetchFresh()
                //     const typeGetGenreData = getGenreData.map((genres) => ({...genres, mode:n || type}))
                        
                //     mutateUpdateGenre({ variables: { date, data:typeGetGenreData } })

                // }

            }catch(err){
                console.log(err)
                fetch(`${process.env.REACT_APP_movie_db}genre/${type === "movie" ? "movie" : n === "movie" ? "movie" : "tv"}/list?api_key=${process.env.REACT_APP_api_key}&language=en-US`)
                .then(data => data.json())
                .then(({genres}) => setGenre(() => [...genres]))
            }
            
            setPersonType(n)
        }
        setSelectedGenre(!selectedGenre)
    }

    const getYears = () => {
        if(selectedYear){
            setSelectedYear(false)
            setYears([])
        }else{
            const newYears = Array((new Date()).getFullYear() - 1993 + 1)
            .fill()
            .map((_,k) => k + 1993)
            setYears(() => [...newYears])
            setSelectedYear(true)
        }
    }

    const getJobs = () => {
        if(selectedJob){
            setSelectedJob(false)
            setJob([])
        }else{
            try{
                fetch(`${process.env.REACT_APP_movie_db}configuration/jobs?api_key=${process.env.REACT_APP_api_key}&language=en-US`)
                .then((response) => response.json())
                .then((data) => {
                    console.log(data)
                    setJob(() => [...data])
                })
            }catch(err){
                console.log(err)
            }
            setSelectedJob(true)
        }
    }

    return (
        <div className="w-[100%] h-[auto] text-white" style={{background:"linear-gradient(25deg, #0d0d0d, rgba(0,0,0,0.75), #000, #0f111a)"}}>
            <div className="w-[100%] flex flex-col flex-wrap">
                <div className="w-[100%] h-[auto] border-r-[3px] border-[#2E2E3A]">
                    {/* <h1 className="text-[30px] font-bold">Controllers</h1> */}
                    <div className="w-[100%] h-[auto] text-white flex flex-row flex-wrap items-center justify-center">
                        {
                            type === "people"?
                            <>
                                <button
                                    onClick={() => getGenre("movie")}
                                    className={windowWidth > 800 ? `w-[23%] h-[50px] bg-[#000] mt-[0.5%] border-[#fff] border-[2px] text-white ${selectedGenre ? "active" : "pending"}` : `min-w-[23%] h-[50px] bg-[#000] mt-[0.5%] border-[#fff] border-[2px] text-white ${selectedGenre ? "active" : "pending"}`}
                                >
                                    Genre Movie 
                                    {
                                        selectedGenre ?
                                        <FontAwesomeIcon icon={faArrowUp}/>
                                        :
                                        <FontAwesomeIcon icon={faArrowDown}/>    
                                    }
                                </button>
                                <button
                                    onClick={() => getGenre("tv")}
                                    className={windowWidth > 800 ? `w-[23%] h-[50px] bg-[#000] mt-[0.5%] border-[#fff] border-[2px] text-white ${selectedGenre ? "active" : "pending"}` : `min-w-[23%] h-[50px] bg-[#000] mt-[0.5%] border-[#fff] border-[2px] text-white ${selectedGenre ? "active" : "pending"}`}
                                >
                                    Genre TV 
                                    {
                                        selectedGenre ?
                                        <FontAwesomeIcon icon={faArrowUp}/>
                                        :
                                        <FontAwesomeIcon icon={faArrowDown}/>    
                                    }
                                </button>
                            </>
                            :
                            <button
                                onClick={() => getGenre()}
                                className={windowWidth > 800 ? `w-[23%] h-[50px] bg-[#000] mt-[0.5%] border-[#fff] border-[2px] text-white ${selectedGenre ? "active" : "pending"}` : `min-w-[23%] h-[50px] bg-[#000] mt-[0.5%] border-[#fff] border-[2px] text-white ${selectedGenre ? "active" : "pending"}`}
                            >
                                Genre 
                                {
                                    selectedGenre ?
                                    <FontAwesomeIcon icon={faArrowUp}/>
                                    :
                                    <FontAwesomeIcon icon={faArrowDown}/>    
                                }
                            </button>
                        }
                        <button
                            onClick={() => getRegion()}
                            className={windowWidth > 800 ? `w-[23%] h-[50px] bg-[#000] mt-[0.5%] border-[#fff] border-[2px] text-white ${selectedRegion ? "active" : "pending"}` : `min-w-[23%] h-[50px] bg-[#000] mt-[0.5%] border-[#fff] border-[2px] text-white ${selectedRegion ? "active" : "pending"}`}
                        >
                            Region 
                            {
                                selectedRegion ?
                                <FontAwesomeIcon icon={faArrowUp}/>
                                :
                                <FontAwesomeIcon icon={faArrowDown}/>    
                            }
                        </button>
                        <button
                            onClick={() => getLanguage()}
                            className={windowWidth > 800 ? `w-[23%] h-[50px] bg-[#000] mt-[0.5%] border-[#fff] border-[2px] text-white ${selectedLanguage ? "active" : "pending"}` : `min-w-[23%] h-[50px] bg-[#000] mt-[0.5%] border-[#fff] border-[2px] text-white ${selectedLanguage ? "active" : "pending"}`}
                        >
                            Language 
                            {
                                selectedLanguage ?
                                <FontAwesomeIcon icon={faArrowUp}/>
                                :
                                <FontAwesomeIcon icon={faArrowDown}/>    
                            }
                        </button>
                        <button
                            onClick={() => getYears()}
                            className={windowWidth > 800 ? `w-[23%] h-[50px] bg-[#000] mt-[0.5%] border-[#fff] border-[2px] text-white ${selectedYear ? "active" : "pending"}` : `min-w-[23%] h-[50px] bg-[#000] mt-[0.5%] border-[#fff] border-[2px] text-white ${selectedYear ? "active" : "pending"}`}
                        >
                            Year 
                            {
                                selectedYear ?
                                <FontAwesomeIcon icon={faArrowUp}/>
                                :
                                <FontAwesomeIcon icon={faArrowDown}/>    
                            }
                        </button>
                        {
                            type === "people" ?
                                <button
                                    onClick={() => getJobs()}
                                    className={windowWidth > 800 ? `w-[23%] h-[50px] bg-[#000] mt-[0.5%] border-[#fff] border-[2px] text-white ${selectedJob ? "active" : "pending"}` : `min-w-[23%] h-[50px] bg-[#000] mt-[0.5%] border-[#fff] border-[2px] text-white ${selectedJob ? "active" : "pending"}`}
                                >
                                    Actor Jobs 
                                    {
                                        selectedJob ?
                                        <FontAwesomeIcon icon={faArrowUp}/>
                                        :
                                        <FontAwesomeIcon icon={faArrowDown}/>    
                                    }
                                </button>
                            :
                                ""
                        }
                    </div>
                </div>
                <div className="w-[100%] h-[auto] flex flex-row flex-wrap">
                    {
                        genre && genre.map(({id, name}, node) => (
                            <button 
                                className="w-[24%] min-h-[60px] m-[0.5%] flex flex-col justify-center items-center"
                                key={node}
                                onClick={() => filterGenre(id,name)}
                            >
                                <h1 className="w-[100%]">{name}</h1>
                                <div className="w-[15%] h-[10px] border-r-[4px] bg-[#5A5A68]"></div>
                            </button>
                        ))
                    }
                    {
                        region && region.map(({iso_3166_1, english_name, native_name}, node) => (
                            <button 
                                className="w-[24%] min-h-[60px] m-[0.5%] flex flex-col justify-center items-center"
                                key={node}
                                onClick={() => filterRegion(iso_3166_1,english_name)}
                            >
                                <h1 className="w-[100%]">{english_name}</h1>
                                <div className="w-[15%] h-[10px] border-r-[4px] bg-[#5A5A68]"></div>
                            </button>
                        ))
                    }
                    {
                        language && language.map(({iso_639_1, english_name, name}, node) => (
                            <button 
                                className="w-[24%] min-h-[60px] m-[0.5%] flex flex-col justify-center items-center"
                                key={node}
                                onClick={() => filterLanguage(iso_639_1,english_name)}
                            >
                                <h1 className="w-[100%]">{english_name}</h1>
                                <div className="w-[15%] h-[10px] border-r-[4px] bg-[#5A5A68]"></div>
                            </button>
                        ))
                    }
                    {
                        years && years.map((year, node) => (
                            <button 
                                className="w-[24%] min-h-[60px] m-[0.5%] flex flex-col justify-center items-center"
                                key={node}
                                onClick={() => filterYear(year)}
                            >
                                <h1 className="w-[100%]">{year}</h1>
                                <div className="w-[15%] h-[10px] border-r-[4px] bg-[#5A5A68]"></div>
                            </button>
                        ))
                    }
                                        {
                        jobs && jobs.map(({department,jobs}, node) => (
                            <>
                                <h2>{department}</h2>
                                {
                                    jobs.map(job => 
                                        <button 
                                            className="w-[24%] min-h-[60px] m-[0.5%] flex flex-col justify-center items-center"
                                            key={node}
                                            onClick={() => filterJob(job)}
                                        >
                                            <h1 className="w-[100%]">{job}</h1>
                                            <div className="w-[15%] h-[10px] border-r-[4px] bg-[#5A5A68]"></div>
                                        </button>
                                    )
                                }
                            </>

                        ))
                    }
                </div>
            </div>
            <div className="w-[100%] flex flex-row flex-wrap">
                {
                    genreName ? 
                        <div className="max-w-[23%] m-[1%] border-r-[4px] border-[#ffd800]">
                            <h2 style={{color:"#ffd800"}}>genre</h2>
                            {genreName}
                            <button 
                                className="w-[100%] min-h-[20px] underline text-left"
                                onClick={() => removeGenre("movie")}
                            >
                                <p>remove</p>
                            </button>
                        </div>
                    : 
                    ""
                }
                {
                    genreTVName ? 
                        <div className="max-w-[23%] m-[1%] border-r-[4px] border-[#ffd800]">
                            <h2 style={{color:"#ffd800"}}>tv genre</h2>
                            {genreTVName}
                            <button 
                                className="w-[100%] min-h-[20px] underline text-left"
                                onClick={() => removeGenre("tv")}
                            >
                                <p>remove</p>
                            </button>
                        </div>
                    : 
                    ""
                }
                {
                    languageName ? 
                        <div className="max-w-[23%] m-[1%] border-r-[4px] border-[#ffd800]">
                            <h2 style={{color:"#ffd800"}}>language</h2>
                            {languageName}
                            <button 
                                className="w-[100%] min-h-[20px] underline text-left"
                                onClick={() => removeLanguage()}
                            >
                                <p>remove</p>
                            </button>
                        </div>
                    : 
                    ""
                }
                {
                    regionName ? 
                        <div className="max-w-[23%] m-[1%] border-r-[4px] border-[#ffd800]">
                            <h2 style={{color:"#ffd800"}}>region</h2>
                            {regionName}
                            <button 
                                className="w-[100%] min-h-[20px] underline text-left"
                                onClick={() => removeRegion()}
                            >
                                <p>remove</p>
                            </button>
                        </div>
                    : 
                    ""
                }
                {
                    yearName ? 
                        <div className="max-w-[23%] m-[1%] border-r-[4px] border-[#ffd800]">
                            <h2 style={{color:"#ffd800"}}>year</h2>
                            {yearName}
                            <button 
                                className="w-[100%] min-h-[20px] underline text-left"
                                onClick={() => removeYear()}
                            >
                                <p>remove</p>
                            </button>
                        </div>
                    : 
                    ""
                }
                {
                    jobName ? 
                        <div className="max-w-[23%] m-[1%] border-r-[4px] border-[#ffd800]">
                            <h2 style={{color:"#ffd800"}}>actor job</h2>
                            {jobName}
                            <button 
                                className="w-[100%] min-h-[20px] underline text-left"
                                onClick={() => removeJob()}
                            >
                                <p>remove</p>
                            </button>
                        </div>
                    : 
                    ""
                }
            </div>
        </div>
    )
}

export default CONTROLLERS
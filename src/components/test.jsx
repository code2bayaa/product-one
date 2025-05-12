const fetchMoviesFromAPI = async (actual_index) => {
    const current_date = new Date().toISOString().split("T")[0];

    async function freshFetch() {
        // Fetch data from the API if not found in the cache
        const response = await fetch(
            `${process.env.REACT_APP_movie_db}${temp_movies[key].api}?api_key=${process.env.REACT_APP_api_key}&language=en-US&page=${temp_movies[key].page}&with_genres=${genreId}&with_origin_country=${regionId}&sort_by=popularity.desc&with_original_language=${languageId}&primary_release_year=${yearId}`
        );
        const data = await response.json();

        if (data.results.length > 0) {
            temp_movies[key].results = [
                ...temp_movies[key].results,
                ...data.results,
            ];
            temp_movies[key].total_pages = data.total_pages;

            // Update the movies state
            setMovies((prevMovies) => {
                const updatedMovies = [...prevMovies];
                const existingIndex = updatedMovies.findIndex(
                    (movie) => movie.index === actual_index
                );

                if (existingIndex > -1) {
                    updatedMovies[existingIndex].results = [
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
                    page: temp_movies[key].page,
                    results: data.results,
                    total_pages: data.total_pages,
                    total_results: data.total_results,
                    data: {
                        genre: genreId,
                        region: regionId,
                        language: languageId,
                        year: yearId,
                        index: actual_index,
                    },
                    date: current_date,
                    type: "movie",
                },
            });

            return true;
        }
        return false;
    }

    const temp_movies = [
        { index: "discover", results: [], api: "discover/movie", page: 1, total_pages: 0 },
        { index: "popular", results: [], api: "movie/popular", page: 1, total_pages: 0 },
        { index: "trending", results: [], api: "trending/movie/day", page: 1, total_pages: 0 },
        { index: "top_rated", results: [], api: "movie/top_rated", page: 1, total_pages: 0 },
        { index: "upcoming", results: [], api: "movie/upcoming", page: 1, total_pages: 0 },
        { index: "now_playing", results: [], api: "movie/now_playing", page: 1, total_pages: 0 },
    ];
    const key = temp_movies.findIndex(({ index }) => index === actual_index);

    if (page) {
        temp_movies[key].page = page;
    }

    // Use refetch to fetch updated data
    const fetched = await fetchMovies({
        variables: {
            page: temp_movies[key].page,
            genre: genreId,
            region: regionId,
            language: languageId,
            year: yearId,
            index: actual_index,
            date: current_date,
        },
    });

    if (fetched.data) {
        console.log("Using cached data:", fetched.data);
        if (
            fetched.data.movie.success &&
            fetched.data.movie.data &&
            fetched.data.movie.data.find(
                (item) =>
                    item.index === actual_index && item.results.length < 20
            )
        ) {
            console.log("Less items, refetching...");
            const refetchedData = await fetchedMoviesData.refetch();
            console.log("Refetched data:", refetchedData.data);
            return await freshFetch();
        } else if (
            fetched.data.movie.error === "insert movies" ||
            fetched.data.movie.error === "no records found"
        ) {
            console.log("No records found, refetching...");
            const refetchedData = await fetchedMoviesData.refetch();
            console.log("Refetched data:", refetchedData.data);
            return await freshFetch();
        } else {
            console.log("Finally using cached data");
            setMovies((prevMovies) => {
                const updatedMovies = [...prevMovies];
                const existingIndex = updatedMovies.findIndex(
                    (movie) => movie.index === actual_index
                );

                if (existingIndex > -1) {
                    updatedMovies[existingIndex].results = [
                        ...fetched.data.movie.data[existingIndex].results,
                    ];
                } else {
                    updatedMovies.push({
                        index: actual_index,
                        results: fetched.data.movie.data[0].results,
                        page: fetched.data.movie.data[0].page,
                        total_pages: fetched.data.movie.data[0].total_pages,
                    });
                }

                return updatedMovies;
            });
            return true;
        }
    } else {
        return await freshFetch();
    }
};
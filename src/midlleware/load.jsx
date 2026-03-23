const LOAD = () => {
    return (
        <div className="w-full h-screen bg-[#000] flex justify-center items-center">
            <video
                src="/videos/load.mp4"
                autoPlay
                loop
                muted
                className="w-[70%] z-1 h-[100%] object-contain"
            />
            <div className="w-[100%] height-[100%] z-3 absolute top-0 left-0 flex justify-center items-center">
            </div>
        </div>
    )
    // {"adult":false,"backdrop_path":"/7Zx3wDG5bBtcfk8lcnCWDOLM4Y4.jpg","genre_ids":[10751,35,878],"id":"552524","original_language":"en","original_title":"Lilo & Stitch","overview":"The wildly funny and touching story of a lonely Hawaiian girl and the fugitive alien who helps to mend her broken family.","popularity":679.0045,"poster_path":"/tUae3mefrDVTgm5mRzqWnZK6fOP.jpg","release_date":"2025-05-17","title":"Lilo & Stitch","video":false,"vote_average":7.092,"vote_count":424,"runtime":108,"production_companies":[{"id":"2","logo_path":"/wdrCwmRnLFJhEoH8GSfymY85KHT.png","name":"Walt Disney Pictures","origin_country":"US"},{"id":"118854","logo_path":"/g9LPNlQFoDcHjfnvrEqFmeIaDrZ.png","name":"Rideback","origin_country":"US"}],"production_countries":[{"iso_3166_1":"US","name":"United States of America"}],"spoken_languages":[{"english_name":"English","iso_639_1":"en","name":"English"},{"english_name":"Spanish","iso_639_1":"es","name":"Español"}],"tokens":[428,430,432,434,436,438,440],"token_expire":"2025-06-03T13:15:56.953Z"}
}

export default LOAD;
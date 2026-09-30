import REACTIONBUTTON from "../party/ReactionButton";
import { useLazyQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import NAVBAR from "./../nav"
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBasketShopping, faCirclePlus, faPlay, faHourglassHalf } from "@fortawesome/free-solid-svg-icons";
import LOAD from "./../../midlleware/load";
import MOBILE from "./../mobileBar";
import Swal from "sweetalert2";
import { EDENIMAGE, useEdenImage, canPlayWithCredits } from "./shared";
import { usePlayGate, PHONEPROMPT } from "../access";
import COMMENTS from "../comments";
import { useKeys } from "../safe";
import { useWindowWidth, DESKTOP_WIDTH } from "../../hooks/useWindowWidth";

const env = (dev, live) => process.env.REACT_APP_ENVIRONMENT === "development" ? process.env[dev] : process.env[live]

//POST /database/eden/episodes lives beside /database/videos on the database service
const EPISODES = (env("REACT_APP_VIDEO_PAGE", "REACT_APP_VIDEO_PAGE_LIVE") || "").replace(/\/videos$/, "/eden/episodes")

const FETCH_GENRE_QUERY = gql`
    query Genre {
        genre {
            success
            data { id name mode }
        }
    }
`

//edenTvPayload - the series, its seasons (Eden season rows) and its cast from Eden's stars/crew
const FETCH_EDEN_TV_QUERY = gql`
    query EdenTvPayload(
        $image: EDEN_IMAGE_TV_ARGUMENTS!
        $tv: EDEN_SINGLE_TV_ARGUMENTS!
        $credit: EDEN_CREDIT_ITEM_TV_ARGUMENTS!
    ) {
        edenTvPayload(image: $image, tv: $tv, credit: $credit) {
            image { data { id path logo } success }
            tv {
                adult backdrop_path genre_ids genres { id name } id original_language original_name name
                overview poster_path first_air_date status origin_country tagline vote_average
                seasons { id name overview season_number episode_count poster_path }
                success error message
            }
            credit {
                cast { id name original_name profile_path character known_for_department popularity }
                crew { id name original_name profile_path department job }
                success
            }
            success
            error
        }
    }
`

//An Eden studio's series. Until now this page was a copy of the TMDB series page;
//it reads Eden's own rows: edenTvPayload for the series, /database/eden/episodes for its episodes.
const SERIE = () => {
    const [serie, setSerie] = useState(null)
    const [people, setPeople] = useState([])
    const [genres, setGenres] = useState([])
    const [episodes, setEpisodes] = useState([])
    const [season, setSeason] = useState(null)
    const [loading, setLoading] = useState(true)
    const [playlist, setPlaylist] = useState(false)
    const [starting, setStarting] = useState(null)
    const windowWidth = useWindowWidth()
    const navigate = useNavigate()
    const { state } = useLocation()
    const id = state?.id
    const { safeKeys } = useKeys()
    const { allowed: layouts, needsPhone } = usePlayGate(safeKeys?.GEO)
    const backdrop = useEdenImage(serie?.backdrop_path)

    const [fetchSerie] = useLazyQuery(FETCH_EDEN_TV_QUERY, { fetchPolicy: 'network-only' })
    const [fetchGenre] = useLazyQuery(FETCH_GENRE_QUERY, { fetchPolicy: 'cache-first' })

    useEffect(() => {
        const inlineScript = document.createElement("script")
        inlineScript.type = "text/javascript"
        inlineScript.crossorigin = "anonymous"
        inlineScript.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8036256488117651"
        inlineScript.async = true
        document.body.appendChild(inlineScript)
        return () => document.body.removeChild(inlineScript)
    }, [])

    useEffect(() => {
        if (!id) { setLoading(false); return }
        const controller = new AbortController()
        const load = async () => {
            try {
                const [fetched, listed] = await Promise.all([
                    fetchSerie({
                        variables: {
                            tv: { id: `${id}` },
                            image: { type: "tv", episode: -1, season: -1, id: parseInt(id) },
                            credit: { id: parseInt(id), season: -1, episode: -1 }
                        }
                    }),
                    fetch(EPISODES, {
                        method: "POST",
                        headers: { "Content-Type": "application/json", "Accept": "application/json" },
                        body: JSON.stringify({ id }),
                        signal: controller.signal
                    }).then(res => res.json()).catch(() => ({ data: [] }))
                ])
                const payload = fetched.data?.edenTvPayload
                const tv = payload?.tv?.success ? payload.tv : null
                setSerie(tv)
                setPeople([...(payload?.credit?.cast || []), ...(payload?.credit?.crew || [])].filter(p => p?.name || p?.original_name))
                setEpisodes(listed?.data || [])
            } catch (error) {
                if (error.name !== "AbortError") console.log(error, "eden serie")
            }
            setLoading(false)
        }
        load()
        return () => controller.abort()
    }, [id, fetchSerie])

    //Eden rows carry genre_ids only - name them from the genre list, as setGenreIDS
    useEffect(() => {
        if (!serie) return
        if (serie.genres?.length) { setGenres(serie.genres); return }
        if (!serie.genre_ids?.length) return
        fetchGenre().then(({ data }) => {
            if (!data?.genre?.success) return
            setGenres(data.genre.data.filter(({ id, mode }) => serie.genre_ids.includes(Number(id)) && mode === "tv"))
        })
    }, [serie, fetchGenre])

    //checkFeedback: already in the viewer's playlist?
    useEffect(() => {
        if (!serie?.id) return
        fetch(env("REACT_APP_API_URL", "REACT_APP_API_URL_LIVE"), { credentials: "include" })
            .then(res => res.json())
            .then(({ status, user }) => {
                if (!status) return
                return fetch(env("REACT_APP_PLAYLIST_SELECT", "REACT_APP_PLAYLIST_SELECT_LIVE"), {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: serie.id, user, type: "tv" })
                }).then(res => res.json()).then(({ status }) => { if (status) setPlaylist(true) })
            })
            .catch(error => console.log(error, "playlist"))
    }, [serie])

    //seasons the studio made plus any an episode is filed under, in order
    const seasons = useMemo(() => {
        const numbers = new Set([
            ...(serie?.seasons || []).map(({ season_number }) => Number(season_number)),
            ...episodes.map(({ season_number }) => Number(season_number))
        ])
        return [...numbers].filter(n => n > 0).sort((a, b) => a - b)
    }, [serie, episodes])

    useEffect(() => {
        if (season === null && seasons.length) setSeason(seasons[0])
    }, [seasons, season])

    const seasonInfo = (serie?.seasons || []).find(({ season_number }) => Number(season_number) === season)
    const shown = episodes.filter(({ season_number }) => Number(season_number) === season)

    const addToPlayList = async () => {
        const { status, user } = await fetch(env("REACT_APP_API_URL", "REACT_APP_API_URL_LIVE"), { credentials: "include" }).then(res => res.json())
        if (!status) {
            Swal.fire({ icon: 'error', title: 'Oops...', text: "Sign in to add to playlist", showConfirmButton: false, timer: 1500 })
            return
        }
        const res = await fetch(env("REACT_APP_INSERT_PLAYLIST", "REACT_APP_INSERT_PLAYLIST_LIVE"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: serie.id, user, type: "tv" })
        }).then(res => res.json())
        Swal.fire(res.status
            ? { icon: 'success', title: 'Added to playlist', showConfirmButton: false, timer: 1500 }
            : { icon: 'error', title: 'Oops...', text: "Already in playlist", showConfirmButton: false, timer: 1500 })
        setPlaylist(true)
    }

    // reaction: from "Start a reaction" - the player then opens the reaction set-up (speed.jsx startParty)
    const playEpisode = useCallback(async (episode, reaction = false) => {
        if (starting) return
        if (!episode.playable) {
            Swal.fire({ icon: 'info', title: 'Coming soon', text: "This episode is not uploaded yet", showConfirmButton: false, timer: 1500 })
            return
        }
        setStarting(episode.id)
        const ok = await canPlayWithCredits(episode.id).catch(error => {
            console.log(error, "credit check")
            Swal.fire({ icon: 'error', title: 'Network Error', text: "could not check your credits", showConfirmButton: false, timer: 1500 })
            return false
        })
        setStarting(null)
        if (!ok) return
        navigate("/speed", {
            state: {
                eden: true,   //Eden content - the credit charge pays the studio (user/credits/earnings.js)
                serieID: serie.id,   //producers are paid per series; speed.jsx skips its TMDB season lookup for Eden
                stream: "tv",
                id: episode.id,
                name: episode.name,
                serie_name: serie.name || serie.original_name,
                season: episode.season_number,
                episode: episode.episode_number,
                background: { path: episode.backdrop_path || serie.backdrop_path },
                anime: (serie.genre_ids || []).includes(16),
                date: episode.date,
                year: (serie.first_air_date || "").substring(0, 4),
                startParty: reaction
            }
        })
    }, [navigate, serie, starting])

    if (loading) return <LOAD />

    const desktop = windowWidth >= DESKTOP_WIDTH
    const title = serie ? (serie.name || serie.original_name) : ""
    const firstPlayable = [...episodes]
        .filter(e => e.playable)
        .sort((a, b) => (a.season_number - b.season_number) || (a.episode_number - b.episode_number))[0]

    return (
        <div
            className="w-[100%] duration-150 h-[100%] text-white bg-cover bg-no-repeat bg-center"
            style={{ backgroundImage: `linear-gradient(105deg, #0d0d0d, rgba(0,0,0,0.75), #000, rgba(0,0,0,0.56)),url(${backdrop || "/image/logo.png"})`, backgroundPosition: "0% 40%" }}>
            {
                desktop ?
                    <div className="w-[20%] absolute h-[100%]" style={{ background: "linear-gradient(85deg, rgba(13, 13, 13, 0.75), rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.56), rgba(0, 0, 0, 0.45))" }}>
                        <NAVBAR data={title} />
                    </div>
                    :
                    <MOBILE />
            }
            <div className={desktop ? "w-[80%] relative h-[100%] ml-[20%] overflow-y-auto movie-scene" : "w-[98%] mx-[1%] h-[100%] overflow-y-auto movie-scene pb-24"}>
                {
                    !serie ?
                        <p className="text-[#808C8C] text-center mt-[20%]">This Eden series could not be found.</p>
                        :
                        <>
                            <div className={desktop ? "w-[100%] flex flex-row gap-6 p-4" : "w-[100%] flex flex-col gap-3 p-2"}>
                                <div className={desktop ? "w-[32%] shrink-0" : "w-[60%] mx-auto"}>
                                    <EDENIMAGE path={serie.poster_path} alt={title} className="w-full aspect-[2/3] object-cover rounded-xl shadow-lg shadow-[#ffd800]/30" />
                                </div>
                                <div className="flex-1 flex flex-col gap-2">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <h1 className="text-[30px] gradient-text font-bold">{title}</h1>
                                        <span className="text-[11px] uppercase tracking-wider text-[#808C8C] border border-[#2E2E3A] rounded px-2 py-[2px]">Eden</span>
                                    </div>
                                    {serie.original_name && serie.original_name !== serie.name && <p className="text-[#9CA3AF]">{serie.original_name}</p>}
                                    {serie.tagline && <p style={{ fontStyle: "italic", color: "#ffd800" }}>"{serie.tagline}"</p>}
                                    <p>
                                        {serie.first_air_date}
                                        <span className="text-[#9CA3AF]"> · {seasons.length} season{seasons.length === 1 ? "" : "s"} · {episodes.length} episode{episodes.length === 1 ? "" : "s"}</span>
                                    </p>
                                    {serie.vote_average ? <p className="text-[#ffd800]">★ {Number(serie.vote_average).toFixed(1)}/10</p> : null}
                                    {genres.length > 0 && <p className="gradient-text">{genres.map(({ name }) => name).join(" || ")}</p>}
                                    <article>
                                        {serie.overview || "waiting for more content"}
                                        <div style={{ overflow: "hidden", margin: "5px" }}>
                                            <ins
                                                className="adsbygoogle"
                                                style={{ display: "block", width: "100%", height: "auto" }}
                                                data-ad-client="ca-pub-8036256488117651"
                                                data-ad-slot="1234567890"
                                                data-ad-format="auto"
                                                data-full-width-responsive="true"
                                            ></ins>
                                        </div>
                                    </article>
                                    {serie.original_language && <h2>{serie.origin_country?.[0] ? `${serie.origin_country[0]} || ` : ""}{serie.original_language}</h2>}
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        <button
                                            onClick={() => navigate(`/series/trailer`, { state: { stream: "tv", eden: true, title, id: serie.id, background: { path: serie.backdrop_path } } })}
                                            className={desktop ? "w-[30%] text-[12px] rounded-md bg-red-950 border-2 border-[#fff] h-[40px]" : "w-[48%] text-[12px] rounded-md bg-red-950 border-2 border-[#fff] h-[40px] underline"}>
                                            trailers
                                        </button>
                                        <button
                                            type="button"
                                            onClick={addToPlayList}
                                            className={desktop ? "w-[30%] rounded-md h-[40px] bg-[#ffd800] text-black font-bold hover:bg-[#ffd800]/80 duration-200" : "w-[48%] rounded-md h-[40px] bg-[#ffd800] text-black font-bold"}>
                                            {playlist
                                                ? <><FontAwesomeIcon icon={faBasketShopping} /> Added to Playlist</>
                                                : <><FontAwesomeIcon icon={faCirclePlus} /> Add to Playlist</>}
                                        </button>
                                        {/* PRD #11: a reaction starts on the first uploaded episode */}
                                        {layouts && firstPlayable && (
                                            <REACTIONBUTTON desktop={desktop} className="!m-0" onClick={() => playEpisode(firstPlayable, true)} />
                                        )}
                                    </div>
                                </div>
                            </div>

                            <section className={desktop ? "w-[90%] mx-[5%] my-[2%]" : "w-[100%] my-[2%] px-2"}>
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="w-[6px] h-6 bg-[#5A5A68] border-r-[4px] border-white" />
                                    <h2 className="gradient-text font-bold text-lg md:text-2xl">Episodes</h2>
                                </div>
                                {
                                    seasons.length === 0 ?
                                        <p className="text-[#808C8C]">No episodes uploaded yet.</p>
                                        :
                                        <>
                                            <div className="flex gap-2 overflow-x-auto pb-2 movie-scene" role="tablist">
                                                {seasons.map(n => (
                                                    <button
                                                        key={n}
                                                        role="tab"
                                                        aria-selected={n === season}
                                                        onClick={() => setSeason(n)}
                                                        className={`shrink-0 px-4 py-2 rounded-lg text-sm font-bold border ${n === season ? "border-[#ffd800] text-[#ffd800]" : "border-[#2E2E3A] text-[#808C8C]"}`}>
                                                        Season {n}
                                                    </button>
                                                ))}
                                            </div>
                                            {seasonInfo && (
                                                <div className="my-2">
                                                    <h3 className="text-lg font-bold">{seasonInfo.name}</h3>
                                                    {seasonInfo.overview && <p className="text-[#9CA3AF] text-sm">{seasonInfo.overview}</p>}
                                                </div>
                                            )}
                                            {needsPhone && <PHONEPROMPT className="my-2" />}
                                            {shown.length === 0 &&<p className="text-[#808C8C] my-2">No episodes uploaded for this season yet.</p>}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                                                {shown.map(episode => (
                                                    <article key={episode.id} className="flex rounded-xl overflow-hidden border border-[#2E2E3A] bg-[#0f111a]">
                                                        <button
                                                            onClick={() => playEpisode(episode)}
                                                            disabled={!layouts}
                                                            className="relative w-[42%] shrink-0 aspect-video group"
                                                            aria-label={`Play ${episode.name}`}>
                                                            <EDENIMAGE
                                                                path={episode.backdrop_path || episode.poster_path || serie.backdrop_path}
                                                                alt={episode.name}
                                                                className="w-full h-full object-cover group-hover:contrast-125 duration-200" />
                                                            {layouts && (
                                                                <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                                                                    {starting === episode.id
                                                                        ? <span className="w-7 h-7 rounded-full border-2 border-[#ffd800] border-t-transparent animate-spin" />
                                                                        : <FontAwesomeIcon icon={episode.playable ? faPlay : faHourglassHalf} className={episode.playable ? "text-[#ffd800] text-2xl" : "text-[#808C8C] text-xl"} />}
                                                                </span>
                                                            )}
                                                        </button>
                                                        <div className="p-2 flex flex-col gap-1 min-w-0">
                                                            <h4 className="font-bold line-clamp-2">E{episode.episode_number} · {episode.name}</h4>
                                                            <p className="text-[12px] text-[#808C8C]">
                                                                {[episode.runtime ? `${episode.runtime} min` : null, episode.episode_type, episode.playable ? null : "coming soon"].filter(Boolean).join(" · ")}
                                                            </p>
                                                            {episode.overview && <p className="text-[12px] text-[#9CA3AF] line-clamp-3">{episode.overview}</p>}
                                                        </div>
                                                    </article>
                                                ))}
                                            </div>
                                        </>
                                }
                            </section>

                            {
                                people.length > 0 &&
                                <section className={desktop ? "w-[90%] mx-[5%] my-[2%]" : "w-[100%] my-[2%] px-2"}>
                                    <h1 style={{ textAlign: "left", textDecoration: "underline" }}>CASTS</h1>
                                    <div className="flex gap-3 overflow-x-auto pb-2 my-[1%] movie-scene">
                                        {people.map((person, index) => (
                                            <button
                                                key={`${person.id}-${index}`}
                                                type="button"
                                                onClick={() => navigate("/eden/people/id", { state: { id: person.id, eden: true } })}
                                                className={`${desktop ? "shrink-0 w-[18%]" : "shrink-0 w-[40%]"} text-left hover:contrast-125 duration-200`}>
                                                <EDENIMAGE path={person.profile_path} alt={person.name} className="w-full aspect-[2/3] object-cover rounded-xl" />
                                                <h2 className="text-[14px] font-bold mt-1 truncate">{person.name || person.original_name}</h2>
                                                <p className="text-[12px] italic text-[#808C8C] truncate">{person.character || person.job || person.known_for_department}</p>
                                            </button>
                                        ))}
                                    </div>
                                </section>
                            }
                            <COMMENTS type="tv" id={id} eden windowWidth={windowWidth} />
                        </>
                }
            </div>
        </div>
    )
}

export default SERIE

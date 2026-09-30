import NAVBAR from "./../nav"
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBasketShopping, faCirclePlus, faPlay, faUserFriends } from "@fortawesome/free-solid-svg-icons";
import LOAD from "./../../midlleware/load";
import MOBILE from "./../mobileBar";
import Swal from "sweetalert2";
import { EDENIMAGE, useEdenImage } from "./shared";
import { useWindowWidth, DESKTOP_WIDTH } from "../../hooks/useWindowWidth";

const env = (dev, live) => process.env.REACT_APP_ENVIRONMENT === "development" ? process.env[dev] : process.env[live]

//POST /database/people/eden/id lives beside /database/videos on the database service
const EDEN_PERSON = (env("REACT_APP_VIDEO_PAGE", "REACT_APP_VIDEO_PAGE_LIVE") || "").replace(/\/videos$/, "/people/eden/id")
//following lives on the user service, which knows who is signed in (session cookie)
const AUTH_URL = env("REACT_APP_API_URL", "REACT_APP_API_URL_LIVE") || ""
const EDEN_FOLLOW = AUTH_URL.replace(/\/authentication$/, "/eden/follow")
const EDEN_FOLLOWING = AUTH_URL.replace(/\/authentication$/, "/eden/following")

const DETAIL = { movie: "/eden/movies/id", tv: "/eden/series/id" }

//one horizontal row of Eden titles a person is credited on
const CREDITS = ({ title, items, desktop, navigate }) => (
    items.length > 0 &&
    <section className={desktop ? "w-[90%] mx-[5%] my-[2%]" : "w-[100%] my-[2%] px-2"}>
        <div className="flex items-center gap-3 mb-3">
            <span className="w-[6px] h-6 bg-[#5A5A68] border-r-[4px] border-white" />
            <h2 className="gradient-text font-bold text-lg md:text-2xl">{title}</h2>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 movie-scene">
            {items.map((credit, index) => (
                <button
                    key={`${credit.credit_type}-${credit.id}-${index}`}
                    type="button"
                    //a season or episode whose series could not be resolved has no page to open
                    disabled={!credit.id}
                    onClick={() => navigate(DETAIL[credit.media_type], { state: { id: credit.id } })}
                    className={`${desktop ? "shrink-0 w-[18%]" : "shrink-0 w-[40%]"} text-left hover:contrast-125 duration-200`}>
                    <EDENIMAGE path={credit.poster_path || credit.backdrop_path} alt={credit.name} className="w-full aspect-[2/3] object-cover rounded-xl" />
                    <h3 className="text-[14px] font-bold mt-1 truncate">{credit.name || credit.title}</h3>
                    <p className="text-[12px] italic text-[#808C8C] truncate">{credit.character || credit.job}</p>
                    {credit.vote_average ? <p className="text-[12px] text-[#ffd800]">★ {Number(credit.vote_average).toFixed(1)}</p> : null}
                </button>
            ))}
        </div>
    </section>
)

//An Eden studio's cast or crew member, read from the database only - never TMDB, whose ids
//collide with Eden's. state: {person_id} (their `person` row id) and/or {id} (Eden's public id).
const EDENPERSON = () => {
    const [person, setPerson] = useState(null)
    const [movies, setMovies] = useState({ cast: [], crew: [] })
    const [series, setSeries] = useState({ cast: [], crew: [] })
    const [resume, setResume] = useState([])
    const [related, setRelated] = useState([])
    const [playing, setPlaying] = useState(null)
    const [following, setFollowing] = useState(false)
    const [loading, setLoading] = useState(true)
    const windowWidth = useWindowWidth()
    const navigate = useNavigate()
    const { state } = useLocation()
    const id = state?.id
    const person_id = state?.person_id
    //the background is the newest credit's backdrop, as the title pages use their own
    const backdropPath = [...movies.cast, ...movies.crew, ...series.cast, ...series.crew].find(credit => credit.backdrop_path)?.backdrop_path
    const backdrop = useEdenImage(backdropPath)

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
        if (!id && !person_id) { setLoading(false); return }
        const controller = new AbortController()
        setLoading(true)
        setPlaying(null)
        const load = async () => {
            try {
                const data = await fetch(EDEN_PERSON, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ person_id, id }),
                    signal: controller.signal
                }).then(res => res.json())
                if (data?.success) {
                    setPerson(data.person)
                    setMovies({ cast: data.movies?.cast || [], crew: data.movies?.crew || [] })
                    setSeries({ cast: data.series?.cast || [], crew: data.series?.crew || [] })
                    setResume(data.resume || [])
                    setRelated(data.related || [])
                } else {
                    setPerson(null)
                }
            } catch (error) {
                if (error.name !== "AbortError") console.log(error, "eden person")
            }
            setLoading(false)
        }
        load()
        return () => controller.abort()
    }, [id, person_id])

    //checkFeedback: does the signed-in viewer already follow them?
    useEffect(() => {
        if (!person?.person_id) return
        setFollowing(false)
        fetch(EDEN_FOLLOWING, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ person_id: person.person_id })
        })
            .then(res => res.json())
            .then(({ following }) => setFollowing(!!following))
            .catch(error => console.log(error, "eden following"))
    }, [person?.person_id])

    const addToFollowers = async () => {
        const res = await fetch(EDEN_FOLLOW, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ person_id: person.person_id })
        }).catch(() => null)
        if (res && res.status === 401) {
            Swal.fire({ icon: 'error', title: 'Oops...', text: "Sign in to follow " + person.name, showConfirmButton: false, timer: 1500 })
            return
        }
        //a network/CORS failure or an older user service without this route is not "signed out"
        const data = res && res.ok ? await res.json().catch(() => null) : null
        if (!data) {
            Swal.fire({ icon: 'error', title: 'Oops...', text: "Couldn't follow " + person.name + " right now, try again", showConfirmButton: false, timer: 1500 })
            return
        }
        const { status } = data
        if (status) {
            Swal.fire({ icon: 'success', title: 'Added to following', showConfirmButton: false, timer: 1500 })
            setPerson(current => ({ ...current, followers: (Number(current.followers) || 0) + 1 }))
        } else {
            Swal.fire({ icon: 'error', title: 'Oops...', text: "Already following", showConfirmButton: false, timer: 1500 })
        }
        setFollowing(true)
    }

    if (loading) return <LOAD />

    const desktop = windowWidth >= DESKTOP_WIDTH
    const name = person ? (person.name || person.original_name) : ""
    const credits = movies.cast.length + movies.crew.length + series.cast.length + series.crew.length

    return (
        <div
            className="w-[100%] duration-150 h-[100%] text-white bg-cover bg-no-repeat bg-center"
            style={{ backgroundImage: `linear-gradient(105deg, #0d0d0d, rgba(0,0,0,0.75), #000, rgba(0,0,0,0.56)),url(${backdrop || "/image/logo.png"})`, backgroundPosition: "0% 40%" }}>
            {
                desktop ?
                    <div className="w-[20%] absolute h-[100%]" style={{ background: "linear-gradient(85deg, rgba(13, 13, 13, 0.75), rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.56), rgba(0, 0, 0, 0.45))" }}>
                        <NAVBAR data={name} />
                    </div>
                    :
                    <MOBILE />
            }
            <div className={desktop ? "w-[80%] relative h-[100%] ml-[20%] overflow-y-auto movie-scene" : "w-[98%] mx-[1%] h-[100%] overflow-y-auto movie-scene pb-24"}>
                {
                    !person ?
                        <p className="text-[#808C8C] text-center mt-[20%]">This Eden person could not be found.</p>
                        :
                        <>
                            <div className={desktop ? "w-[100%] flex flex-row gap-6 p-4" : "w-[100%] flex flex-col gap-3 p-2"}>
                                <div className={desktop ? "w-[28%] shrink-0" : "w-[60%] mx-auto"}>
                                    <EDENIMAGE path={person.profile_path} alt={name} className="w-full aspect-[2/3] object-cover rounded-xl shadow-lg shadow-[#ffd800]/30" />
                                </div>
                                <div className="flex-1 flex flex-col gap-2">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <h1 className="text-[30px] gradient-text font-bold">{name}</h1>
                                        <span className="text-[11px] uppercase tracking-wider text-[#808C8C] border border-[#2E2E3A] rounded px-2 py-[2px]">Eden</span>
                                    </div>
                                    {person.original_name && person.original_name !== person.name && <p className="text-[#9CA3AF]">{person.original_name}</p>}
                                    {person.also_known_as?.length > 0 && <p style={{ fontStyle: "italic", color: "#ffd800" }}>{person.also_known_as.join(" || ")}</p>}
                                    <p>
                                        {person.known_for_department}
                                        <span className="text-[#9CA3AF]"> · {credits} credit{credits === 1 ? "" : "s"}</span>
                                    </p>
                                    <p className="text-[#ffd800]"><FontAwesomeIcon icon={faUserFriends} /> {Number(person.followers) || 0} follower{Number(person.followers) === 1 ? "" : "s"}</p>
                                    {(person.birthday || person.place_of_birth) && (
                                        <p className="text-[#9CA3AF]">{[person.birthday, person.deathday && `– ${person.deathday}`, person.place_of_birth].filter(Boolean).join(" · ")}</p>
                                    )}
                                    {person.skills && <p className="gradient-text">{Array.isArray(person.skills) ? person.skills.join(" || ") : person.skills}</p>}
                                    <article>
                                        {person.biography || "waiting for more content"}
                                    </article>
                                    {/* follow hangs right under the biography; the ad goes below the buttons */}
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {resume.length > 0 && (
                                            <button
                                                onClick={() => setPlaying(playing ? null : resume[0].key)}
                                                className={desktop ? "w-[30%] text-[12px] rounded-md bg-red-950 border-2 border-[#fff] h-[40px]" : "w-[48%] text-[12px] rounded-md bg-red-950 border-2 border-[#fff] h-[40px] underline"}>
                                                <FontAwesomeIcon icon={faPlay} /> {playing ? "close resume" : "resume reel"}
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={addToFollowers}
                                            className={desktop ? "w-[30%] rounded-md h-[40px] bg-[#ffd800] text-black font-bold hover:bg-[#ffd800]/80 duration-200" : "w-[48%] rounded-md h-[40px] bg-[#ffd800] text-black font-bold"}>
                                            {following
                                                ? <><FontAwesomeIcon icon={faBasketShopping} /> following</>
                                                : <><FontAwesomeIcon icon={faCirclePlus} /> follow</>}
                                        </button>
                                    </div>
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
                                </div>
                            </div>

                            {playing && (
                                <section className={desktop ? "w-[90%] mx-[5%] my-[2%]" : "w-[100%] my-[2%] px-2"}>
                                    <div className="w-full max-w-[900px] aspect-video">
                                        <iframe
                                            className="w-full h-full rounded-xl"
                                            src={`https://www.youtube.com/embed/${playing}?autoplay=1`}
                                            title={`${name} resume`}
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                                        />
                                    </div>
                                    {resume.length > 1 && (
                                        <div className="flex gap-2 overflow-x-auto pt-2 movie-scene">
                                            {resume.map(({ key, name: reel }, index) => (
                                                <button
                                                    key={key}
                                                    onClick={() => setPlaying(key)}
                                                    className={`shrink-0 px-4 py-2 rounded-lg text-sm font-bold border ${key === playing ? "border-[#ffd800] text-[#ffd800]" : "border-[#2E2E3A] text-[#808C8C]"}`}>
                                                    {reel || `reel ${index + 1}`}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </section>
                            )}

                            {credits === 0 && <p className={`${desktop ? "mx-[5%]" : "px-2"} text-[#808C8C]`}>No Eden credits yet.</p>}
                            <CREDITS title="Movies · cast" items={movies.cast} desktop={desktop} navigate={navigate} />
                            <CREDITS title="Movies · crew" items={movies.crew} desktop={desktop} navigate={navigate} />
                            <CREDITS title="Series · cast" items={series.cast} desktop={desktop} navigate={navigate} />
                            <CREDITS title="Series · crew" items={series.crew} desktop={desktop} navigate={navigate} />

                            {
                                related.length > 0 &&
                                <section className={desktop ? "w-[90%] mx-[5%] my-[2%]" : "w-[100%] my-[2%] px-2"}>
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="w-[6px] h-6 bg-[#5A5A68] border-r-[4px] border-white" />
                                        <h2 className="gradient-text font-bold text-lg md:text-2xl">More from this studio</h2>
                                    </div>
                                    <div className="flex gap-3 overflow-x-auto pb-2 movie-scene">
                                        {related.map(other => (
                                            <button
                                                key={other.person_id}
                                                type="button"
                                                onClick={() => navigate("/eden/people/id", { state: { id: other.id, person_id: other.person_id, eden: true } })}
                                                className={`${desktop ? "shrink-0 w-[18%]" : "shrink-0 w-[40%]"} text-left hover:contrast-125 duration-200`}>
                                                <EDENIMAGE path={other.profile_path} alt={other.name} className="w-full aspect-[2/3] object-cover rounded-xl" />
                                                <h3 className="text-[14px] font-bold mt-1 truncate">{other.name || other.original_name}</h3>
                                                <p className="text-[12px] text-[#808C8C] truncate">
                                                    <FontAwesomeIcon icon={faUserFriends} className="text-[#ffd800]" /> {other.followers} · {other.known_for_department}
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                </section>
                            }
                        </>
                }
            </div>
        </div>
    )
}

export default EDENPERSON

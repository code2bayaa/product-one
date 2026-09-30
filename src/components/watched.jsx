import { shortRow } from "../midlleware/shortRow"
import { useEffect, useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useKeys } from "./safe"
import { DESKTOP_WIDTH } from "../hooks/useWindowWidth";

// "watched recently" and "what neighbors are watching" rows for the movies and
// series lists. kind = "movies" | "tv" picks which half of the response to show.
// Rows that come back empty (or fail) are not rendered.

const isDev = process.env.REACT_APP_ENVIRONMENT === "development"

const sendForm = async ({ url, options }) => {
    const response = await fetch(url, options)
    return await response.json()
}

async function runLocale(geoKey) {
    try {
        const stored = localStorage.getItem("location")
        if (stored) return JSON.parse(stored)
        const urls = [
            "https://ipinfo.io/json",
            "https://ipapi.co/json/",
            geoKey ? "https://api.ipgeolocation.io/ipgeo?apiKey=" + geoKey : null //no key yet: skip, it only answers 401
        ]
        return await Promise.all(urls.map(async (url) => {
            if (!url) return null
            try {
                return await sendForm({ url, options: {
                    method: "GET",
                    headers: { 'Content-type': 'application/json; charset=UTF-8' },
                }})
            } catch (err) {
                return null
            }
        }))
    } catch (err) {
        console.error("runLocale error", err)
        return null
    }
}

async function neighborLocation(geoKey) {
    const location = {}
    const raw_locations = await runLocale(geoKey)
    if (raw_locations && raw_locations.length > 0) {
        const [ipinfo, ipapi, ipgeolocation] = raw_locations
        location.city = ipinfo?.city || ipapi?.city || ipgeolocation?.city || null
        location.region = ipinfo?.region || ipapi?.region || ipgeolocation?.state_prov || null
        location.country = ipinfo?.country || ipapi?.country || ipgeolocation?.country_code2 || null
        location.loc = ipinfo?.loc || (ipapi ? `${ipapi.latitude},${ipapi.longitude}` : null) || (ipgeolocation ? `${ipgeolocation.latitude},${ipgeolocation.longitude}` : null) || null
        location.postal = ipinfo?.postal || ipapi?.postal || ipgeolocation?.zipcode || null
        location.continent_code = ipapi?.continent_code || ipgeolocation?.continent_code || null
        location.state = ipgeolocation?.state_prov || null
    }
    return location
}

// One card per title: a series watched episode by episode shows once, on its
// latest episode.
function toItems(rows, kind) {
    const items = []
    const seen = new Set()
    for (const { movie_type } of rows || []) {
        let item
        try { item = JSON.parse(movie_type) } catch { continue }
        if (!item) continue
        const key = kind === "tv" ? (item.serieID || item.id) : item.id
        if (seen.has(key)) continue
        seen.add(key)
        items.push(item)
    }
    return items
}

async function loadRow({ source, kind, geoKey }) {
    const url = source === "recent"
        ? (isDev ? process.env.REACT_APP_RECENT_VIEWS : process.env.REACT_APP_RECENT_VIEWS_LIVE)
        : (isDev ? process.env.REACT_APP_NEIGHBORS_VIEWS : process.env.REACT_APP_NEIGHBORS_VIEWS_LIVE)
    const body = { session: localStorage.getItem("session") }
    if (source === "neighbors") body.location = await neighborLocation(geoKey)

    const res = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify(body)
    })
    if (!res.ok) throw new Error("Network response was not ok")
    const { status, tv, movies } = await res.json()
    if (!status) return []
    return toItems(kind === "tv" ? tv : movies, kind)
}

const WATCHED = ({ kind, windowWidth }) => {

    const [rows, setRows] = useState([])
    const hasFetched = useRef(false)
    const { safeKeys } = useKeys()
    const navigate = useNavigate()

    useEffect(() => {
        if (hasFetched.current) return
        hasFetched.current = true

        const sources = [
            { source: "recent", title: "watched recently" },
            { source: "neighbors", title: "what neighbors are watching" }
        ]
        Promise.all(sources.map(async ({ source, title }) => {
            try {
                return { title, results: await loadRow({ source, kind, geoKey: safeKeys?.GEO }) }
            } catch (err) {
                console.warn(`${source} row failed`, err)
                return { title, results: [] }
            }
        }))
        .then(loaded => setRows(loaded.filter(({ results }) => results.length > 0)))
    }, [kind, safeKeys])

    const open = ({ id, name, background, season, episode, anime, serieID }) => {
        navigate(season ? '/series/episode' : kind === "tv" ? '/series/id' : '/movies/id', {
            state: season ? {
                id: serieID,
                stream: "series",
                episodeID: id,
                season,
                episode,
                name,
                background,
                anime,
            } : { id: serieID || id }
        })
    }

    return rows.map(({ title, results }) =>
        <div className={windowWidth >= DESKTOP_WIDTH ? "w-[90%] h-[auto] flex flex-wrap flex-col ml-[1%]" : "w-[100%] h-[auto] flex flex-wrap flex-col mt-[10%]"} key={title}>
            <div className="w-[40%] h-[40px] flex flex-row my-t-[5%] my-b-[2%]">
                <span className="w-[5%] h-[100%] border-r-[10px] border-[#fff] bg-[#5A5A68]"></span>
                <span className="gradient-text default-text text-[25px]">{title}</span>
            </div>
            <div className={`w-[100%] duration-50 movie-scene ${windowWidth >= DESKTOP_WIDTH ? "h-[400px]" : "h-[200px]"} flex flex-col flex-wrap overflow-x-auto overflow-y-hidden my-[1%]${shortRow(results)}`}>
                {
                    results.map((item, key) =>
                        <div
                            key={key}
                            onClick={() => open(item)}
                            className={windowWidth >= DESKTOP_WIDTH ? "cursor-pointer w-[25%] h-[100%] hover:scale-110 duration-700" : "cursor-pointer w-[40%] h-[100%] hover:scale-110 duration-700"}
                        >
                            <div
                                className="w-[100%] h-[100%] background"
                                style={{
                                    backgroundImage: `
                                        linear-gradient(to bottom, rgba(0,0,0,0) 60%, rgba(0,0,0,0.85) 100%),
                                        url(${safeKeys.IMG_POSTER + item.background})
                                    `
                                }}
                            >
                                <div className="relative backdrop-blur-md top-[50%] left-1/2 transform -translate-x-1/2 w-[100%] min-h-[60px] bg-opacity-60 text-white flex flex-col items-center justify-center z-10">
                                    <h2 className={windowWidth >= DESKTOP_WIDTH ? "text-[15px] font-bold" : "text-[12px]"}>{item.name}</h2>
                                    { item.season && <p className={windowWidth >= DESKTOP_WIDTH ? "text-[10px]" : "text-[8px]"}>season {item.season} | episode {item.episode}</p> }
                                </div>
                            </div>
                        </div>
                    )
                }
            </div>
        </div>
    )
}

export default WATCHED

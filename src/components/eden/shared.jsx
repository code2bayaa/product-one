import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { Navigate, useParams } from "react-router-dom";
import { useKeys } from "./../safe";
import { noCreditsAlert } from "../../midlleware/noCredits";

const env = (dev, live) => process.env.REACT_APP_ENVIRONMENT === "development" ? process.env[dev] : process.env[live]

//Eden images are bucket keys ("6/images/1785....jpg"), never TMDB paths. Their bytes come from
//VIEW_IMG - the speed subdomain's private Backblaze endpoint (/secure-image) - not image.tmdb.org.
const STUDIO_IMAGE = /^\d+\/images\//
const TMDB_URL = /^https?:\/\/image\.tmdb\.org\//i
const edenImages = new Map()

export const isEdenImage = (path) => typeof path === "string" && STUDIO_IMAGE.test(path)

export const loadEdenImage = (path) => {
    if (!edenImages.has(path)) {
        edenImages.set(path, fetch(env("REACT_APP_VIEW_IMG", "REACT_APP_VIEW_IMG_LIVE"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: path })
        })
            .then(res => {
                if (!res.ok || !(res.headers.get("content-type") || "").startsWith("image/")) throw new Error("not an image")
                return res.blob()
            })
            .then(blob => URL.createObjectURL(blob))
            .catch(error => {
                edenImages.delete(path) //let a later render retry
                console.log(error, "eden image")
                return null
            }))
    }
    return edenImages.get(path)
}

//an object URL for an Eden image, read from the Backblaze bucket through VIEW_IMG.
//Only a caller showing non-Eden media (trailer.jsx for a TMDB title) passes tmdb to allow
//the TMDB poster prefix. null while it loads, false when it could not load.
export const useEdenImage = (path, { tmdb = false } = {}) => {
    const { safeKeys } = useKeys()
    const [url, setUrl] = useState(null)
    useEffect(() => {
        let live = true
        setUrl(null)
        if (!path || typeof path !== "string") return
        if (/^(blob|data):/.test(path)) {
            setUrl(path)
        } else if (/^https?:/.test(path)) {
            setUrl(tmdb || !TMDB_URL.test(path) ? path : false)
        } else if (tmdb && !isEdenImage(path)) {
            if (safeKeys.IMG_POSTER) setUrl(safeKeys.IMG_POSTER + path)
        } else {
            loadEdenImage(path.replace(/^\/+/, "")).then(u => { if (live) setUrl(u || false) })
        }
        return () => { live = false }
    }, [path, tmdb, safeKeys.IMG_POSTER])
    return url
}

export const EDENIMAGE = ({ path, alt = "", className = "" }) => {
    const url = useEdenImage(path)
    const [failed, setFailed] = useState(false)
    if (!path || failed || url === false) return <img src="/image/alt.webp" alt={alt} className={className} />
    if (!url) return <div className={`${className} bg-[#2E2E3A] animate-pulse`} />
    return <img src={url} alt={alt} loading="lazy" className={className} onError={() => setFailed(true)} />
}

//runLocale(): the play button is only offered in Africa, Australia and Oceania
export const usePlayRegion = () => {
    const { safeKeys } = useKeys()
    const [allowed, setAllowed] = useState(false)
    useEffect(() => {
        const controller = new AbortController()
        const run = async () => {
            try {
                let location = null
                try { location = JSON.parse(localStorage.getItem("location")) } catch (e) { location = null }
                if (!location) {
                    const urls = [
                        "https://ipinfo.io/json",
                        "https://ipapi.co/json/",
                        safeKeys?.GEO ? "https://api.ipgeolocation.io/ipgeo?apiKey=" + safeKeys.GEO : null //no key yet: skip, it only answers 401
                    ]
                    location = await Promise.all(urls.map(url => url ?
                        fetch(url, { signal: controller.signal }).then(res => res.json()).catch(() => null) : null
                    ))
                }
                const region = /(Africa|Australia|Oceania)/i
                const hit = (location?.[2]?.continent_name && ["Africa", "Australia", "Oceania"].includes(location[2].continent_name))
                    || region.test(location?.[1]?.timezone || "")
                    || region.test(location?.[0]?.timezone || "")
                setAllowed(!!hit)
            } catch (error) {
                if (error.name !== "AbortError") console.log(error, "runLocale")
            }
        }
        run()
        return () => controller.abort()
    }, [safeKeys?.GEO])
    return allowed
}

//earn / buy credits are only offered in Kenya, Brazil and Oceania (Australia, NZ, Pacific islands).
const CREDIT_COUNTRIES = ["KE", "BR"]
export const useCreditRegion = () => {
    const { safeKeys } = useKeys()
    const [allowed, setAllowed] = useState(null) //null while checking
    useEffect(() => {
        const controller = new AbortController()
        const run = async () => {
            try {
                let location = null
                try { location = JSON.parse(localStorage.getItem("location")) } catch (e) { location = null }
                if (!location) {
                    const urls = [
                        "https://ipinfo.io/json",
                        "https://ipapi.co/json/",
                        safeKeys?.GEO ? "https://api.ipgeolocation.io/ipgeo?apiKey=" + safeKeys.GEO : null //no key yet: skip, it only answers 401
                    ]
                    location = await Promise.all(urls.map(url => url ?
                        fetch(url, { signal: controller.signal }).then(res => res.json()).catch(() => null) : null
                    ))
                }
                if (controller.signal.aborted) return
                const [ipinfo, ipapi, ipgeo] = location || []
                const hit = ipgeo?.continent_code === "OC"
                    || ipapi?.continent_code === "OC"
                    || /^Australia\//i.test(ipapi?.timezone || ipinfo?.timezone || "")
                    || [ipinfo?.country, ipapi?.country_code, ipgeo?.country_code2].some(code => CREDIT_COUNTRIES.includes(code))
                setAllowed(!!hit)
            } catch (error) {
                if (error.name !== "AbortError") {
                    console.log(error, "creditRegion")
                    setAllowed(false)
                }
            }
        }
        run()
        return () => controller.abort()
    }, [safeKeys?.GEO])
    return allowed
}

//signed in (same check as nav.jsx) and useCreditRegion(). null while checking.
export const useCreditAccess = () => {
    const region = useCreditRegion()
    const [loggedIn, setLoggedIn] = useState(null)
    useEffect(() => {
        let live = true
        fetch(env("REACT_APP_API_URL", "REACT_APP_API_URL_LIVE"), { credentials: "include" })
            .then(res => res.json())
            .then(({ status }) => live && setLoggedIn(!!status && status !== 429))
            .catch(() => live && setLoggedIn(false))
        return () => { live = false }
    }, [])
    if (loggedIn === false || region === false) return false
    if (loggedIn === null || region === null) return null
    return true
}

//wraps /earn and /subscribe: sends everyone who may not buy / earn credits home
export const CREDITGATE = ({ children }) => {
    const access = useCreditAccess()
    if (access === null) return null
    return access ? children : <Navigate to="/" replace />
}

//wraps /subscribe/:user, the page the mobile apps open in a WebView. The app has no web
//session cookie there - the :user param is the sign-in - so only the region is checked.
export const APPCREDITGATE = ({ children }) => {
    const { user } = useParams()
    const region = useCreditRegion()
    if (!user) return <Navigate to="/" replace />
    if (region === null) return null
    return region ? children : <Navigate to="/" replace />
}

const post = async (url, body, credentials) => {
    const res = await fetch(url, {
        method: "POST",
        ...(credentials ? { credentials: "include" } : {}),
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(body)
    })
    return res.json()
}

//the rent / credit gate eden/movie.jsx runs before /speed: a paid rental, else more than 49 credits
export const canPlayWithCredits = async (id) => {
    const auth = await fetch(env("REACT_APP_API_URL", "REACT_APP_API_URL_LIVE"), { credentials: "include" }).then(res => res.json())
    let paid, credits
    if (auth.status) {
        paid = await post(env("REACT_APP_USER_PAID", "REACT_APP_USER_PAID_LIVE"), { id }, true)
        credits = await fetch(env("REACT_APP_CHECK_USER_CREDITS", "REACT_APP_CHECK_USER_CREDITS_LIVE"), { credentials: "include" }).then(res => res.json())
    } else {
        const user = localStorage.getItem("session")
        paid = await post(env("REACT_APP_PAID", "REACT_APP_PAID_LIVE"), { user, id })
        credits = await post(env("REACT_APP_CHECK_REPORT_CREDITS", "REACT_APP_CHECK_REPORT_CREDITS_LIVE"), { user })
    }
    if (paid?.status) {
        Swal.fire({ icon: "success", title: "rent paid", text: paid.message, showConfirmButton: false, timer: 2500 })
        return true
    }
    if (paid?.message === "day for movie credits ended") {
        Swal.fire({ icon: "error", title: "rent elapsed", text: paid.message, showConfirmButton: false, timer: 1500 })
    }
    if (credits?.sum > 49) return true
    noCreditsAlert(auth.status)
    return false
}

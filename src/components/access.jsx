// Who may open what (movies PRD #5) and who sees the Play button (#7).
//   REQUIRELOGIN  - blockbuster movies / series / movie / season / episode / player pages need a
//                   signed-in account; Eden pages and an Eden /speed are open to everyone
//   usePlayGate   - Play shows when the device is in Africa, Australia or Brazil AND, for a signed-in
//                   account, its phone number is from one of those countries (profile/index.js)
import { useEffect, useState } from "react";
import { Navigate, NavLink, useLocation } from "react-router-dom";

const env = (dev, live) => process.env.REACT_APP_ENVIRONMENT === "development" ? process.env[dev] : process.env[live]

export const authUrl = () => env("REACT_APP_API_URL", "REACT_APP_API_URL_LIVE")

// a route on the user service, found next to its /user/authentication route
export const serviceUrl = (path) => {
    const auth = authUrl() || ""
    const base = /\/user\/authentication\/?$/.test(auth)
        ? auth.replace(/\/user\/authentication\/?$/, "")
        : new URL(auth).origin
    return base + path
}
// the user service's /profile router
export const profileUrl = (path = "") => serviceUrl("/profile" + path)

// one sign-in check per page load, shared by every hook that asks
let signedInCheck = null
export const checkSignedIn = () => {
    if (!signedInCheck) {
        signedInCheck = fetch(authUrl(), { credentials: "include" })
            .then(res => res.json())
            .then(({ status }) => status === true)
            .catch(() => false)
        // a later sign-in / sign-out on this tab must be seen, so the answer is kept briefly only
        setTimeout(() => { signedInCheck = null }, 30 * 1000)
    }
    return signedInCheck
}
// signin.jsx calls this once the cookie is set, so the page it returns to asks again
export const forgetSignedIn = () => { signedInCheck = null; profileCheck = null }

// true | false, null while checking
export const useSignedIn = () => {
    const [signedIn, setSignedIn] = useState(null)
    useEffect(() => {
        let live = true
        checkSignedIn().then(value => live && setSignedIn(value))
        return () => { live = false }
    }, [])
    return signedIn
}

// Eden content is open to guests; everything else sends them to /signin and back again afterwards
export const REQUIRELOGIN = ({ children }) => {
    const location = useLocation()
    const signedIn = useSignedIn()
    if (location.pathname === "/speed" && location.state?.eden) return children
    if (signedIn === null) return null
    if (signedIn) return children
    return <Navigate to="/signin" replace state={{ next: { pathname: location.pathname, search: location.search, state: location.state } }} />
}

// PRD #7 play countries: every African country, Australia, Brazil
const PLAY_EXTRA = ["AU", "BR"]
const deviceInPlayRegion = (location) => {
    const [ipinfo, ipapi, ipgeo] = Array.isArray(location) ? location : []
    if ([ipapi?.continent_code, ipgeo?.continent_code].includes("AF")) return true
    if (ipgeo?.continent_name === "Africa") return true
    if ([ipinfo?.country, ipapi?.country_code, ipgeo?.country_code2].some(code => PLAY_EXTRA.includes(code))) return true
    return [ipinfo?.timezone, ipapi?.timezone, ipgeo?.time_zone?.name].some(tz => /^Africa\//.test(tz || ""))
}

const readDeviceLocation = async (geoKey, signal) => {
    try {
        const stored = JSON.parse(localStorage.getItem("location"))
        if (stored) return stored
    } catch (e) { /* fetch it below */ }
    const urls = [
        "https://ipinfo.io/json",
        "https://ipapi.co/json/",
        geoKey ? "https://api.ipgeolocation.io/ipgeo?apiKey=" + geoKey : null //no key yet: skip, it only answers 401
    ]
    return Promise.all(urls.map(url => url ? fetch(url, { signal }).then(res => res.json()).catch(() => null) : null))
}

let profileCheck = null
export const fetchProfile = () => {
    if (!profileCheck) {
        profileCheck = fetch(profileUrl(), { credentials: "include" })
            .then(res => res.ok ? res.json() : null)
            .then(data => data?.profile || null)
            .catch(() => null)
        setTimeout(() => { profileCheck = null }, 30 * 1000)
    }
    return profileCheck
}
export const forgetProfile = () => { profileCheck = null }

// {allowed, needsPhone}: needsPhone when the device may play but the account's phone does not
// allow it (none on the account, or one from outside the play countries)
export const usePlayGate = (geoKey) => {
    const [gate, setGate] = useState({ allowed: false, needsPhone: false })
    useEffect(() => {
        const controller = new AbortController()
        const run = async () => {
            const location = await readDeviceLocation(geoKey, controller.signal)
            if (controller.signal.aborted) return
            if (!deviceInPlayRegion(location)) return setGate({ allowed: false, needsPhone: false })
            if (!(await checkSignedIn())) return setGate({ allowed: true, needsPhone: false }) //guests only reach Eden content
            const profile = await fetchProfile()
            if (controller.signal.aborted) return
            const phoneOk = !!profile?.phone_allows_play
            setGate({ allowed: phoneOk, needsPhone: !phoneOk })
        }
        run().catch(error => console.log(error, "play gate"))
        return () => controller.abort()
    }, [geoKey])
    return gate
}

// what shows where Play would be when only the phone number is missing / from elsewhere
export const PHONEPROMPT = ({ className = "" }) => (
    <NavLink
        to="/profile"
        className={`inline-block rounded bg-[#2E2E3A] text-white text-sm px-3 py-2 underline ${className}`}
    >
        Add a phone number from Africa, Australia or Brazil to play
    </NavLink>
)

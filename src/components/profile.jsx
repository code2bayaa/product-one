// /profile - the signed-in account's phone number and Country / County / Ward (movies PRD #6, #21).
// Accounts made before registration asked for them (and Google sign-ins) complete them here; the
// phone number is also the account half of the play gate (#7, access.jsx usePlayGate).
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import Swal from "sweetalert2";
import NAVBAR from "./nav";
import MOBILE from "./mobileBar";
import LOCATIONFIELDS, { EMPTY_PLACE, placeProblem } from "./locationFields";
import { profileUrl, fetchProfile, forgetProfile } from "./access"
import { usernameProblem } from "./comments";
import WALLET from "./wallet";
import { useWindowWidth, DESKTOP_WIDTH } from "../hooks/useWindowWidth";

const PROFILE = () => {
    const windowWidth = useWindowWidth()
    const [profile, setProfile] = useState(null)
    const [place, setPlace] = useState(EMPTY_PLACE)
    const [username, setUsername] = useState("")
    const [saving, setSaving] = useState(false)
    const [sending, setSending] = useState(false)

    const show = (next) => {
        setProfile(next)
        setUsername(next?.username || "")
        setPlace({
            telephone: next?.telephone || "",
            country: next?.country || EMPTY_PLACE.country,
            county: next?.county || "",
            ward: next?.ward || "",
        })
    }

    useEffect(() => {
        forgetProfile()
        fetchProfile().then(show)
    }, [])

    const save = async (e) => {
        e.preventDefault()
        const name = username.trim().replace(/^@/, "")
        if (profile?.username && !name) return Swal.fire("Oops", "A username can be changed but not removed", "error")
        const badName = name ? usernameProblem(name) : null
        if (badName) return Swal.fire("Oops", badName, "error")
        // a username can be saved on its own; phone + location are sent once they're all filled in
        const problem = placeProblem(place)
        const placeTouched = [place.telephone, place.county, place.ward].some(v => String(v || "").trim())
        if (problem && (placeTouched || !name)) return Swal.fire("Oops", problem, "error")
        setSaving(true)
        try {
            const res = await fetch(profileUrl(), {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: name || undefined,
                    ...(problem ? {} : {
                        telephone: place.telephone.trim(),
                        country: place.country,
                        county: place.county.trim(),
                        ward: place.ward.trim(),
                    }),
                })
            })
            const data = await res.json()
            if (!data?.status) return Swal.fire("Oops", data?.message || "Could not save your profile", "error")
            forgetProfile()
            show(data.profile)
            Swal.fire({
                icon: "success",
                title: "Saved",
                text: data.profile?.phone_allows_play
                    ? "Your phone number lets you play videos."
                    : "Saved. Playing videos needs a phone number from Africa, Australia or Brazil.",
                timer: 2500,
                showConfirmButton: false,
            })
        } catch (error) {
            console.log(error, "profile save")
            Swal.fire("Error", "Unexpected error. Try again later.", "error")
        } finally {
            setSaving(false)
        }
    }

    // the account number is only stored hashed, so it can't be shown - a new one is made and
    // emailed by the same route as /change (session/index.js), which retires the old one
    const newAccountNumber = async () => {
        const email = profile?.email
        if (!email) return
        const ok = await Swal.fire({
            icon: "question",
            title: "New account number?",
            text: `We'll email a new account number to ${email}. Your current one will stop working.`,
            showCancelButton: true,
            confirmButtonText: "Send it",
        })
        if (!ok.isConfirmed) return
        setSending(true)
        try {
            const res = await fetch(`${process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_CHANGE : process.env.REACT_APP_CHANGE_LIVE}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            })
            const { status, message } = await res.json()
            Swal.fire(status ? "Check your email" : "Oops", message || "Could not send a new account number", status ? "success" : "error")
        } catch (error) {
            console.log(error, "new account number")
            Swal.fire("Error", "Unexpected error. Try again later.", "error")
        } finally {
            setSending(false)
        }
    }

    return (
        <div className="w-[100%] h-[100%] text-white flex flex-row flex-wrap" style={{ background: "url(/image/grey.jpg)" }}>
            {windowWidth >= DESKTOP_WIDTH ?
                <div className="w-[20%] absolute h-[100%] border-r-[3px] border-[#2E2E3A]" style={{ background: "linear-gradient(85deg, #0d0d0d, rgba(0,0,0,0.75), #000, #0f111a)" }}>
                    <NAVBAR fullCover={true} />
                </div>
                :
                <MOBILE />
            }
            {/* html/body don't scroll (index.css), so this fixed-height box does; m-auto on the card
                centres it when it's short without clipping its top once the wallet makes it tall */}
            <div className={`flex overflow-y-auto overflow-x-hidden movie-scene ${windowWidth >= DESKTOP_WIDTH ? "w-[80%] h-[100%] ml-[20%] py-8" : "w-[100%] h-[92%] py-4"}`}>
                <div className={`${windowWidth >= DESKTOP_WIDTH ? "w-[50%]" : "w-[92%]"} m-auto h-fit text-[#000] bg-[linear-gradient(#fdfcfb,#e2d1c3,#e2d1c3)] rounded-xl p-6`}>
                    <h1 className="text-2xl font-bold mb-2">Your profile</h1>
                    {profile && !profile.complete && (
                        <p className="mb-3 text-sm">Add your phone number and where you live to finish your account.</p>
                    )}
                    {profile && profile.telephone && !profile.phone_allows_play && (
                        <p className="mb-3 text-sm text-[#b45309]">
                            Playing videos needs a phone number from Africa, Australia or Brazil
                            {profile.phone_country ? ` - this one is from ${profile.phone_country}` : ""}.
                        </p>
                    )}
                    {profile?.email && (
                        <div className="mb-4 p-3 rounded-lg border border-[#c9b7a7]">
                            <p className="text-sm font-semibold">Account number</p>
                            <p className="text-sm">
                                Your account number was emailed to <span className="font-semibold">{profile.email}</span> when you registered. Sign in with it.
                            </p>
                            <button
                                type="button"
                                onClick={newAccountNumber}
                                disabled={sending}
                                className="underline text-sm mt-1"
                            >
                                {sending ? "sending..." : "Email me a new account number"}
                            </button>
                        </div>
                    )}
                    {/* PRD #28: money earned + M-PESA withdrawal */}
                    {profile && <WALLET />}
                    <form onSubmit={save}>
                        <label className="block mb-3">
                            <span className="text-sm font-semibold">Username</span>
                            <input
                                type="text"
                                value={username}
                                maxLength={21}
                                autoCapitalize="off"
                                autoCorrect="off"
                                placeholder="e.g. movie_fan254"
                                onChange={e => setUsername(e.target.value)}
                                className="w-[100%] h-[40px] px-2 mt-1 rounded border border-[#c9b7a7] bg-white"
                            />
                            <span className="text-xs">Unique. Your comments are shown under it. 3-20 letters, numbers, _ or .</span>
                        </label>
                        <LOCATIONFIELDS value={place} onChange={setPlace} />
                        <button
                            type="submit"
                            disabled={saving}
                            className="w-[40%] h-[40px] text-white bg-[#000] mx-[30%] mt-3"
                        >
                            {saving ? "saving..." : "Save"}
                        </button>
                    </form>
                    <NavLink to="/" className="underline text-sm">Back home</NavLink>
                </div>
            </div>
        </div>
    )
}

export default PROFILE

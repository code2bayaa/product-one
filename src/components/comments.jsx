// Viewers' comments under a movie or series (movies PRD #4), on the user service's /comments routes.
// Anyone can read them; a signed-in viewer has one comment (and optional 1-5 stars) per title, which
// posting again edits. Bodies are plain text - React escapes them, nothing is rendered as HTML.
import { useCallback, useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import { serviceUrl } from "./access";
import { DESKTOP_WIDTH } from "../hooks/useWindowWidth";

const MAX_BODY = 1000
// same rule as the user service (profile/index.js readUsername), so most mistakes are caught before posting
const USERNAME = /^[A-Za-z0-9][A-Za-z0-9_.]{2,19}$/
export const usernameProblem = (value) => {
    const name = value.trim().replace(/^@/, "")
    if (!name) return "Choose a username"
    if (!USERNAME.test(name) || name.includes("..") || name.endsWith(".")) return "3 to 20 letters, numbers, _ or . - starting with a letter or number"
    if (/^\d+$/.test(name)) return "A username needs at least one letter"
    return null
}

// asks for the unique username comments are posted under; resolves to it, or null if cancelled
export const askUsername = async (message) => {
    const { isConfirmed, value } = await Swal.fire({
        title: "Choose a username",
        text: message || "Your comments are shown under your username. It's saved on your profile and must be unique.",
        input: "text",
        inputPlaceholder: "e.g. movie_fan254",
        inputAttributes: { maxlength: 21, autocapitalize: "off", autocorrect: "off" },
        showCancelButton: true,
        confirmButtonText: "Save and post",
        inputValidator: usernameProblem,
    })
    return isConfirmed ? value.trim().replace(/^@/, "") : null
}

const post = async (path, body) => {
    const res = await fetch(serviceUrl("/comments" + path), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    })
    const data = await res.json().catch(() => null)
    return data || { status: false, message: "Something went wrong" }
}

export const when = (value) => {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ""
    const minutes = Math.round((Date.now() - date.getTime()) / 60000)
    if (minutes < 1) return "just now"
    if (minutes < 60) return `${minutes} min ago`
    if (minutes < 60 * 24) return `${Math.round(minutes / 60)} h ago`
    if (minutes < 60 * 24 * 30) return `${Math.round(minutes / (60 * 24))} d ago`
    return date.toLocaleDateString()
}

const STARS = ({ value, size = "text-[13px]" }) => (
    <span className={`${size} whitespace-nowrap`} aria-label={`${value} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map(n => (
            <FontAwesomeIcon key={n} icon={faStar} className={n <= Math.round(value) ? "text-[#ffd800]" : "text-[#3a3a48]"} />
        ))}
    </span>
)

const COMMENTS = ({ type, id, eden = false, windowWidth = 1000 }) => {
    const location = useLocation()
    const [data, setData] = useState(null)
    const [comments, setComments] = useState([])
    const [page, setPage] = useState(1)
    const [body, setBody] = useState("")
    const [rating, setRating] = useState(0)
    const [busy, setBusy] = useState(false)
    const [failed, setFailed] = useState(false)
    const title = { type, id, eden: !!eden }

    // the whole reply replaces page 1; "load more" appends later pages
    const show = useCallback((reply, { append = false } = {}) => {
        if (!reply?.status) return false
        setData(reply)
        setComments(list => append ? [...list, ...reply.comments] : reply.comments)
        setPage(reply.page || 1)
        if (!append) {
            setBody(reply.mine?.body || "")
            setRating(reply.mine?.rating || 0)
        }
        return true
    }, [])

    useEffect(() => {
        if (!id) return
        let live = true
        setFailed(false)
        post("/list", { type, id, eden: !!eden, page: 1 })
            .then(reply => { if (live && !show(reply)) setFailed(true) })
            .catch(() => live && setFailed(true))
        return () => { live = false }
    }, [type, id, eden, show])

    const send = async (e) => {
        e.preventDefault()
        const text = body.trim()
        if (text.length < 2) return Swal.fire("Oops", "Write a comment first", "error")
        // no username on the profile yet: ask for one and send it with the comment - the service saves it
        let username = data?.username ? undefined : await askUsername()
        if (username === null) return
        setBusy(true)
        try {
            for (;;) {
                const reply = await post("/add", { ...title, body: text, rating: rating || null, username })
                if (show(reply)) break
                if (["username_required", "username_taken", "username_invalid"].includes(reply.code)) {
                    username = await askUsername(reply.code === "username_required" ? undefined : reply.message)
                    if (username === null) break
                    continue
                }
                Swal.fire("Oops", reply.message || "Could not save your comment", "error")
                break
            }
        } finally {
            setBusy(false)
        }
    }

    const removeMine = async () => {
        const { isConfirmed } = await Swal.fire({
            title: "Delete your comment?", icon: "warning", showCancelButton: true, confirmButtonText: "Delete",
        })
        if (!isConfirmed) return
        setBusy(true)
        try {
            const reply = await post("/remove", title)
            if (!show(reply)) Swal.fire("Oops", reply.message || "Could not delete your comment", "error")
        } finally {
            setBusy(false)
        }
    }

    const loadMore = async () => {
        setBusy(true)
        try {
            show(await post("/list", { ...title, page: page + 1 }), { append: true })
        } finally {
            setBusy(false)
        }
    }

    if (!id) return null
    const mine = data?.mine
    return (
        <section className={`${windowWidth >= DESKTOP_WIDTH ? "w-[90%] mx-[5%]" : "w-[96%] mx-[2%]"} my-[2%] text-white`}>
            <div className="flex flex-row items-center gap-3 flex-wrap">
                <h1 style={{ textAlign: "left", textDecoration: "underline" }}>COMMENTS{data ? ` (${data.count})` : ""}</h1>
                {data?.rated > 0 && (
                    <span className="flex items-center gap-2 text-[14px]">
                        <STARS value={data.average} /> {data.average} from {data.rated} {data.rated === 1 ? "rating" : "ratings"}
                    </span>
                )}
            </div>

            {failed && <p className="text-[#808C8C] my-2">Comments could not be loaded right now.</p>}

            {data && (data.signed_in ? (
                <form onSubmit={send} className="my-3 p-3 rounded-xl border border-[#2E2E3A] bg-[#0f111a]">
                    {data.username && (
                        <p className="text-[12px] text-[#808C8C] mb-2">
                            Posting as <span className="text-white font-bold">{data.username}</span> · <NavLink to="/profile" className="underline">change</NavLink>
                        </p>
                    )}
                    {mine?.status === "hidden" && (
                        <p className="text-[#b45309] text-[13px] mb-2">Your comment was hidden by UKO moderators, so only you can see it.</p>
                    )}
                    <div className="flex flex-row items-center gap-1 mb-2" role="radiogroup" aria-label="Your rating">
                        {[1, 2, 3, 4, 5].map(n => (
                            <button
                                key={n}
                                type="button"
                                role="radio"
                                aria-checked={rating === n}
                                aria-label={`${n} star${n > 1 ? "s" : ""}`}
                                onClick={() => setRating(rating === n ? 0 : n)}
                                className="bg-transparent p-1"
                            >
                                <FontAwesomeIcon icon={faStar} className={n <= rating ? "text-[#ffd800]" : "text-[#3a3a48]"} />
                            </button>
                        ))}
                        <span className="text-[12px] text-[#808C8C] ml-2">{rating ? "tap again to clear" : "optional rating"}</span>
                    </div>
                    <textarea
                        value={body}
                        maxLength={MAX_BODY}
                        rows={3}
                        placeholder="What did you think?"
                        onChange={e => setBody(e.target.value)}
                        className="w-[100%] p-2 rounded bg-[#18181c] text-white border border-[#2E2E3A] focus:outline-none focus:border-[#ffd800]"
                    />
                    <div className="flex flex-row items-center justify-between mt-2 gap-2">
                        <span className="text-[12px] text-[#808C8C]">{body.length}/{MAX_BODY}</span>
                        <div className="flex flex-row gap-2">
                            {mine && (
                                <button type="button" disabled={busy} onClick={removeMine}
                                    className="px-3 py-1 rounded border border-[#2E2E3A] text-[#e5e7eb] hover:bg-[#2E2E3A]">
                                    Delete
                                </button>
                            )}
                            <button type="submit" disabled={busy}
                                className="px-4 py-1 rounded bg-[#ffd800] text-black font-bold disabled:opacity-60">
                                {busy ? "saving..." : mine ? "Update" : "Post"}
                            </button>
                        </div>
                    </div>
                </form>
            ) : (
                <p className="my-3">
                    <NavLink
                        to="/signin"
                        state={{ next: { pathname: location.pathname, search: location.search, state: location.state } }}
                        className="underline text-[#ffd800]"
                    >
                        Sign in to comment
                    </NavLink>
                </p>
            ))}

            {data && comments.length === 0 && <p className="text-[#808C8C] my-2">No comments yet. Be the first.</p>}

            <ul className="flex flex-col gap-2">
                {comments.map(comment => (
                    <li key={comment.id} className="p-3 rounded-xl border border-[#2E2E3A] bg-[#0f111a]">
                        <div className="flex flex-row flex-wrap items-center gap-2 text-[13px]">
                            <span className="font-bold">{comment.author}{comment.mine ? " (you)" : ""}</span>
                            {comment.rating ? <STARS value={comment.rating} size="text-[11px]" /> : null}
                            <span className="text-[#808C8C]">{when(comment.created_at)}{comment.edited ? " · edited" : ""}</span>
                        </div>
                        <p className="mt-1 text-[14px] whitespace-pre-line break-words">{comment.body}</p>
                    </li>
                ))}
            </ul>

            {data?.more && (
                <button type="button" disabled={busy} onClick={loadMore}
                    className="mt-3 px-4 py-1 rounded border border-[#2E2E3A] hover:bg-[#2E2E3A]">
                    {busy ? "loading..." : "Load more"}
                </button>
            )}
        </section>
    )
}

export default COMMENTS

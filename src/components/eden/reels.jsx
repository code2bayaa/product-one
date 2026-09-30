// Likes and comments on Eden mini series reels (movies PRD #26), Instagram-reels style: a like and a comment button
// at the bottom of every tile, and a comments panel where a comment can be replied to. User service /reels routes.
// Bodies are plain text - React escapes them, nothing is rendered as HTML.
import { useCallback, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faComment, faXmark, faReply, faTrash } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import { serviceUrl } from "../access";
import { askUsername, when } from "../comments";

const MAX_BODY = 500

const post = async (path, body) => {
    try {
        const res = await fetch(serviceUrl("/reels" + path), {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        })
        return (await res.json().catch(() => null)) || { status: false, message: "Something went wrong" }
    } catch (error) {
        return { status: false, message: "You're offline" }
    }
}

const count = (n) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : String(n || 0))

// likes / comment counts for a row: fetched for new keys as the row pages in
export const useReelStats = (keys) => {
    const [stats, setStats] = useState({})
    const asked = useRef(new Set())
    useEffect(() => {
        const fresh = keys.filter(key => !asked.current.has(key))
        if (!fresh.length) return
        fresh.forEach(key => asked.current.add(key))
        for (let i = 0; i < fresh.length; i += 50) {
            post("/stats", { keys: fresh.slice(i, i + 50) }).then(reply => {
                if (reply.status) setStats(current => ({ ...current, ...reply.stats }))
            })
        }
    }, [keys])
    const update = useCallback((key, change) => setStats(current => ({ ...current, [key]: { likes: 0, comments: 0, liked: false, ...current[key], ...change } })), [])
    return [stats, update]
}

// the like + comment buttons under a tile
export const ReelActions = ({ reel, stat = {}, onChange, onComments }) => {
    const [busy, setBusy] = useState(false)
    const like = async () => {
        if (busy) return
        setBusy(true)
        // show the tap at once; the reply has the real count
        onChange({ liked: !stat.liked, likes: Math.max(0, (stat.likes || 0) + (stat.liked ? -1 : 1)) })
        const reply = await post("/like", { key: reel.key })
        setBusy(false)
        if (reply.status) return onChange({ liked: reply.liked, likes: reply.likes })
        onChange({ liked: !!stat.liked, likes: stat.likes || 0 })
        Swal.fire({ icon: "info", title: reply.message || "Could not save your like", timer: 1500, showConfirmButton: false })
    }
    return (
        <div className="flex items-center gap-4 px-2 pb-2 text-[14px]">
            <button onClick={like} aria-pressed={!!stat.liked} aria-label={stat.liked ? "Unlike" : "Like"}
                className="flex items-center gap-1 hover:scale-110 duration-150">
                <FontAwesomeIcon icon={faHeart} style={stat.liked ? { color: "#ef4444" } : { color: "transparent", stroke: "#fff", strokeWidth: 40 }} />
                <span>{count(stat.likes)}</span>
            </button>
            <button onClick={onComments} aria-label="Comments" className="flex items-center gap-1 hover:scale-110 duration-150">
                <FontAwesomeIcon icon={faComment} />
                <span>{count(stat.comments)}</span>
            </button>
        </div>
    )
}

const Comment = ({ comment, onReply, onRemove, small }) => (
    <div className={`flex flex-col ${small ? "ml-8 mt-2" : "mt-3"}`}>
        <p className="text-[13px]">
            <span className="font-bold mr-2">{comment.author}</span>
            <span className="whitespace-pre-wrap break-words">{comment.body}</span>
        </p>
        <div className="flex items-center gap-3 text-[11px] text-[#808C8C]">
            <span>{when(comment.created_at)}</span>
            <button onClick={() => onReply(comment)} className="hover:text-white"><FontAwesomeIcon icon={faReply} /> Reply</button>
            {comment.mine && <button onClick={() => onRemove(comment)} className="hover:text-red-400"><FontAwesomeIcon icon={faTrash} /> Delete</button>}
        </div>
    </div>
)

// the comments panel of one reel: newest first, replies under each, a box at the bottom
export const ReelComments = ({ reel, onClose, onCount }) => {
    const [data, setData] = useState(null)
    const [comments, setComments] = useState([])
    const [body, setBody] = useState("")
    const [replyTo, setReplyTo] = useState(null)
    const [busy, setBusy] = useState(false)
    const input = useRef(null)

    const show = useCallback((reply, append = false) => {
        if (!reply?.status) return false
        setData(reply)
        setComments(list => (append ? [...list, ...reply.comments] : reply.comments))
        if (!append) onCount(reply.count)
        return true
    }, [onCount])

    useEffect(() => {
        let live = true
        post("/comments", { key: reel.key, page: 1 }).then(reply => { if (live && !show(reply)) setData({ failed: true }) })
        return () => { live = false }
    }, [reel.key, show])

    useEffect(() => {
        const onKey = (e) => { if (e.key === "Escape") onClose() }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [onClose])

    const reply = (comment) => {
        setReplyTo(comment)
        setBody(current => current || `@${comment.author} `)
        input.current?.focus()
    }

    const send = async (e) => {
        e.preventDefault()
        const text = body.trim()
        if (!text) return
        let username = data?.username ? undefined : await askUsername()
        if (username === null) return
        setBusy(true)
        try {
            for (;;) {
                const answer = await post("/comment", { key: reel.key, body: text, parent: replyTo?.id, username })
                if (show(answer)) { setBody(""); setReplyTo(null); break }
                if (["username_required", "username_taken", "username_invalid"].includes(answer.code)) {
                    username = await askUsername(answer.code === "username_required" ? undefined : answer.message)
                    if (username === null) break
                    continue
                }
                Swal.fire("Oops", answer.message || "Could not post your comment", "error")
                break
            }
        } finally {
            setBusy(false)
        }
    }

    const remove = async (comment) => {
        const { isConfirmed } = await Swal.fire({
            title: comment.parent ? "Delete your reply?" : "Delete your comment?",
            text: comment.parent ? undefined : "Its replies go with it.",
            icon: "warning", showCancelButton: true, confirmButtonText: "Delete",
        })
        if (!isConfirmed) return
        const answer = await post("/comment/remove", { id: comment.id })
        if (!answer.status) return Swal.fire("Oops", answer.message || "Could not delete it", "error")
        show(await post("/comments", { key: reel.key, page: 1 }))
    }

    const more = async () => {
        setBusy(true)
        show(await post("/comments", { key: reel.key, page: (data?.page || 1) + 1 }), true)
        setBusy(false)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/70" onClick={onClose}>
            <div role="dialog" aria-label={`Comments on ${reel.name}`} onClick={e => e.stopPropagation()}
                className="w-full md:w-[520px] max-h-[80vh] flex flex-col rounded-t-2xl md:rounded-2xl bg-[#0f111a] border border-[#2E2E3A] text-white">
                <div className="flex items-center justify-between p-3 border-b border-[#2E2E3A]">
                    <h2 className="font-bold">Comments{data?.count ? ` (${data.count})` : ""}</h2>
                    <button onClick={onClose} aria-label="Close"><FontAwesomeIcon icon={faXmark} /></button>
                </div>
                <div className="flex-1 overflow-y-auto px-3 pb-3 movie-scene">
                    {!data && <p className="text-[#808C8C] text-sm mt-3">Loading…</p>}
                    {data?.failed && <p className="text-[#808C8C] text-sm mt-3">Comments could not load.</p>}
                    {data?.status && comments.length === 0 && <p className="text-[#808C8C] text-sm mt-3">No comments yet. Start the conversation.</p>}
                    {comments.map(comment => (
                        <div key={comment.id}>
                            <Comment comment={comment} onReply={reply} onRemove={remove} />
                            {comment.replies.map(r => <Comment key={r.id} comment={r} onReply={() => reply(comment)} onRemove={remove} small />)}
                            {comment.reply_count > comment.replies.length && (
                                <p className="ml-8 mt-1 text-[11px] text-[#808C8C]">+{comment.reply_count - comment.replies.length} older replies</p>
                            )}
                        </div>
                    ))}
                    {data?.more && <button onClick={more} disabled={busy} className="mt-3 text-[13px] underline text-[#ffd800]">Load more</button>}
                </div>
                {data?.status && (data.signed_in ? (
                    <form onSubmit={send} className="p-3 border-t border-[#2E2E3A]">
                        {replyTo && (
                            <p className="text-[12px] text-[#808C8C] mb-1">
                                Replying to <span className="text-white">{replyTo.author}</span>
                                <button type="button" onClick={() => { setReplyTo(null); setBody("") }} className="ml-2 underline">cancel</button>
                            </p>
                        )}
                        <div className="flex gap-2">
                            <input ref={input} value={body} maxLength={MAX_BODY} onChange={e => setBody(e.target.value)}
                                placeholder={replyTo ? "Write a reply…" : "Add a comment…"}
                                className="flex-1 px-3 py-2 rounded-full bg-[#18181c] border border-[#2E2E3A] focus:outline-none focus:border-[#ffd800] text-sm" />
                            <button type="submit" disabled={busy || !body.trim()} className="px-4 rounded-full bg-[#ffd800] text-black font-bold text-sm disabled:opacity-40">Post</button>
                        </div>
                    </form>
                ) : (
                    <p className="p-3 border-t border-[#2E2E3A] text-[13px] text-[#808C8C]">Sign in to like and comment.</p>
                ))}
            </div>
        </div>
    )
}

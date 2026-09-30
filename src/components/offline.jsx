import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { getVideoRecord } from "../models/idb";

//plays a download straight from IndexedDB - the id comes from ?id= (survives a refresh) or the router state
const OFFLINE = () => {
    const { state } = useLocation()
    const [params] = useSearchParams()
    const navigate = useNavigate()
    const id = params.get("id") ?? state?.id ?? null
    const [record, setRecord] = useState(null)
    const [urls, setURLs] = useState(null)
    const [missing, setMissing] = useState(false)

    useEffect(() => {
        let cancelled = false
        //downloads are keyed by the title id, saved as either a string or a number
        //older links passed the blobs themselves in the router state
        const load = id != null
            ? getVideoRecord(String(id)).then(found => found ?? (isNaN(id) ? null : getVideoRecord(Number(id))))
            : Promise.resolve(state?.video ? state : null)
        load
        .then(found => {
            if (cancelled) return
            if (found?.video) setRecord(found)
            else setMissing(true)
        })
        .catch(() => !cancelled && setMissing(true))
        return () => { cancelled = true }
    }, [id, state])

    //blob urls are made once per record and released when the page closes
    useEffect(() => {
        if (!record) return
        const made = {
            video: URL.createObjectURL(record.video),
            //older downloads saved the subtitle as video/mp4 - a track needs text/vtt
            subtitle: record.subtitle ? URL.createObjectURL(new Blob([record.subtitle], { type: "text/vtt" })) : null,
            image: record.image ? URL.createObjectURL(record.image) : null
        }
        setURLs(made)
        return () => Object.values(made).forEach(url => url && URL.revokeObjectURL(url))
    }, [record])

    const title = record?.data?.title || record?.data?.original_title || record?.data?.name || record?.data?.original_name || ""

    return (
        <div
            className="w-full min-h-full bg-cover bg-no-repeat text-white"
            style={{
                backgroundImage: `linear-gradient(45deg, rgba(0,0,0,0.85), hsl(220, 70%, 10%))${urls?.image ? `,url(${urls.image})` : ""}`,
                backgroundPosition: "0% 40%"
            }}>
            <div className="w-full max-w-[1200px] mx-auto px-4 py-4 flex flex-col gap-3">
                <button
                    onClick={() => navigate(-1)}
                    className="self-start flex items-center gap-2 text-[#ffd800] hover:underline">
                    <FontAwesomeIcon icon={faArrowLeft} /> downloads
                </button>
                {title && <h1 className="text-lg md:text-2xl font-bold">{title}</h1>}
                {
                    missing ?
                        <p className="text-[#808C8C]">This download is no longer on this device.</p>
                    : urls ?
                        <video
                            key={urls.video}
                            src={urls.video}
                            controls
                            autoPlay
                            playsInline
                            className="w-full max-h-[80vh] aspect-video bg-black rounded-xl">
                            {urls.subtitle && <track label="English" kind="subtitles" srcLang="en" src={urls.subtitle} default />}
                        </video>
                    :
                        <div className="w-full aspect-video bg-black/60 rounded-xl flex items-center justify-center text-[#808C8C]">loading…</div>
                }
            </div>
        </div>
    )
}

export default OFFLINE;

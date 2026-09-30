// /party?code=XXXXXX - what an invite link opens (movies PRD #11): the party's title, host and fee; joining pays
// the fee (if any) and opens the same title in the player, where the watch party panel takes over.
import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserGroup } from "@fortawesome/free-solid-svg-icons";
import NAVBAR from "../nav";
import MOBILE from "../mobileBar";
import { partyPost } from "./usePartyRoom";
import { useWindowWidth, DESKTOP_WIDTH } from "../../hooks/useWindowWidth";

const PARTYJOIN = () => {
    const { search } = useLocation();
    const navigate = useNavigate();
    const windowWidth = useWindowWidth();
    const [code, setCode] = useState(() => (new URLSearchParams(search).get("code") || "").toUpperCase());
    const [info, setInfo] = useState(null);
    const [message, setMessage] = useState(null);
    const [busy, setBusy] = useState(false);

    const look = useCallback(async (value) => {
        const clean = String(value || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
        if (clean.length !== 6) return;
        setBusy(true);
        const res = await partyPost("/info", { code: clean });
        setBusy(false);
        if (!res.status) { setInfo(null); setMessage(res.message || "No party with that code"); return; }
        setMessage(null);
        setInfo(res);
    }, []);

    useEffect(() => { look(code); }, [look, code]);

    const openPlayer = (party) => {
        const launch = party.launch || {};
        // a phone host sends its backdrop as a path; the web player reads {path, logo}
        const bg = launch.background;
        const background = bg && typeof bg === "object" ? bg : { path: typeof bg === "string" ? bg : "" };
        navigate("/speed", { state: { ...launch, background, party: party.code } });
    };

    const join = async () => {
        const party = info.party;
        if (info.you.member) return openPlayer(party);
        if (party.fee > 0) {
            const ok = await Swal.fire({
                title: `Join for ${party.fee} credits?`,
                text: "The party fee goes to the host (60%) and UKO (40%). You also pay the title's normal play charge unless you already watched it today.",
                showCancelButton: true,
                confirmButtonText: `Pay ${party.fee} credits`,
            });
            if (!ok.isConfirmed) return;
        }
        setBusy(true);
        const res = await partyPost("/join", { code: party.code, fee: party.fee });
        setBusy(false);
        if (!res.status) return Swal.fire("Reaction", res.message || "Could not join", "error");
        // PRD #27: which credits paid the fee
        if (res.paid_with) await Swal.fire({ icon: "success", title: "Party fee paid", text: `Paid with ${res.paid_with}`, timer: 2500, showConfirmButton: false });
        openPlayer(res.party);
    };

    const party = info && info.party;
    return (
        <div className="w-[100%] h-[100%] text-white flex flex-row" style={{ background: "linear-gradient(85deg, #0d0d0d, rgba(0,0,0,0.75), #000, #0f111a)" }}>
            {windowWidth >= DESKTOP_WIDTH
                ? <div className="w-[15%] h-[100%] border-r-[3px] border-[#2E2E3A]"><NAVBAR /></div>
                : <MOBILE />}
            <div className={`${windowWidth >= DESKTOP_WIDTH ? "w-[85%]" : "w-[100%]"} h-[100%] overflow-y-auto flex flex-col items-center pt-[6%] px-[16px]`}>
                <div className="w-full max-w-[440px] p-[20px] rounded-lg bg-black/50 border border-white/10">
                    <h1 className="text-[20px] font-bold flex items-center gap-[10px]"><FontAwesomeIcon icon={faUserGroup} className="text-[#ffd800]" /> Join a reaction</h1>
                    <label className="block mt-[16px] text-[13px] text-white/60">Party code</label>
                    <input value={code} maxLength={6} onChange={(e) => setCode(e.target.value.toUpperCase())}
                        className="w-full mt-[4px] bg-white/10 rounded px-[12px] py-[10px] text-[20px] tracking-[6px] uppercase outline-none" placeholder="ABC234" />
                    {busy && <p className="mt-[10px] text-[13px] text-white/60">Checking…</p>}
                    {message && <p className="mt-[10px] text-[13px] text-red-300">{message}</p>}
                    {party && (
                        <div className="mt-[16px] text-[14px] space-y-[4px]">
                            <p className="text-[18px] font-bold">{party.title || "Untitled"}</p>
                            <p className="text-white/70">Hosted by {party.host}</p>
                            <p className="text-white/70">{party.members} / {party.max_members} watching</p>
                            <p className="text-[#ffd800]">{party.fee > 0 ? `${party.fee} credits to join` : "Free to join"}</p>
                            {!party.open && <p className="text-red-300">This party has ended.</p>}
                            <button onClick={join} disabled={busy || !party.open || (party.members >= party.max_members && !info.you.member)}
                                className="mt-[12px] w-full py-[10px] rounded bg-[#ffd800] text-black font-bold disabled:opacity-40">
                                {info.you.member ? "Back to the party" : party.members >= party.max_members ? "Party is full" : "Join the party"}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PARTYJOIN;

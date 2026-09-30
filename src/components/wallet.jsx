// The money this account has earned (offline video sales, reaction host fees) and its M-PESA withdrawal
// (movies PRD #28, #30) - on the profile page. User service /profile/wallet | /withdraw (sales/wallet.js): the payout
// only ever goes to the account's own profile number, one at a time.
import { useCallback, useEffect, useState } from "react";
import Swal from "sweetalert2";
import { profileUrl } from "./access";

const SOURCE_LABELS = { video_sales: "Offline video sales", reaction_fees: "Reaction fees (your 60% of guests' paid fees)" };
const ksh = (n) => `KSh ${(Number(n) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// the relay keeps the B2C Result under this key until the status check reads it
const socketKey = () => Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, "0")).join("");

const call = async (path, body) => {
    try {
        const res = await fetch(profileUrl(path), {
            method: body ? "POST" : "GET",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: body ? JSON.stringify(body) : undefined,
        });
        return (await res.json().catch(() => null)) || { status: false, message: "Something went wrong" };
    } catch (error) {
        return { status: false, message: "You're offline" };
    }
};

const WALLET = () => {
    const [wallet, setWallet] = useState(null);
    const [busy, setBusy] = useState(false);

    const load = useCallback(async () => {
        const w = await call("/wallet");
        setWallet(w.status ? w : null);
    }, []);

    useEffect(() => { load(); }, [load]);

    // a payout settles when M-PESA's Result reaches the relay - checked for up to a minute
    const follow = async (id) => {
        for (let i = 0; i < 20; i++) {
            await new Promise((r) => setTimeout(r, 3000));
            const s = await call(`/withdraw/${id}`);
            const status = s.data?.status;
            if (status === "completed") return Swal.fire("Withdrawal sent", `${ksh(s.data.amount)} is on its way to ${s.data.phone}.`, "success");
            if (status === "failed") return Swal.fire("Withdrawal failed", s.data.error || "The amount is back in your balance.", "error");
        }
        Swal.fire("Still processing", "M-PESA hasn't confirmed yet - check back here in a few minutes.", "info");
    };

    const withdraw = async () => {
        const balance = Number(wallet.balance) || 0;
        const min = Number(wallet.min_withdrawal) || 100;
        const { isConfirmed, value } = await Swal.fire({
            title: "Withdraw to M-PESA",
            text: `To ${wallet.payout_phone || "your profile number"} · minimum ${ksh(min)} · balance ${ksh(balance)}`,
            input: "number",
            inputValue: Math.floor(balance),
            inputAttributes: { min, max: Math.floor(balance), step: 1 },
            showCancelButton: true,
            confirmButtonText: "Withdraw",
            inputValidator: (v) => {
                const amount = Number(v);
                if (!Number.isInteger(amount)) return "Enter a whole number of shillings";
                if (amount < min) return `The minimum is ${ksh(min)}`;
                if (amount > balance) return `Your balance is ${ksh(balance)}`;
                return null;
            },
        });
        if (!isConfirmed) return;
        setBusy(true);
        try {
            const res = await call("/withdraw", { amount: Number(value), socket_key: socketKey() });
            if (!res.status) return Swal.fire("Withdrawal", res.message || "Could not withdraw", "error");
            Swal.fire({ icon: "info", title: "Withdrawal started", text: res.message, timer: 2500, showConfirmButton: false });
            if (res.data?.id) await follow(res.data.id);
        } finally {
            setBusy(false);
            load();
        }
    };

    if (!wallet) return null;
    const sources = Object.entries(wallet.earned_by_source || {});
    const canWithdraw = wallet.withdrawals_enabled && !busy && Number(wallet.balance) >= Number(wallet.min_withdrawal);
    return (
        <div className="mb-4 p-3 rounded-lg border border-[#c9b7a7]">
            <p className="text-sm font-semibold">Wallet</p>
            <p className="text-2xl font-bold">{ksh(wallet.balance)}</p>
            {sources.map(([key, amount]) => (
                <p key={key} className="text-sm">{SOURCE_LABELS[key] || key}: {ksh(amount)} earned</p>
            ))}
            <p className="text-sm">Withdrawn: {ksh(wallet.withdrawn)}</p>
            {wallet.withdrawals_enabled ? (
                <button type="button" onClick={withdraw} disabled={!canWithdraw}
                    className="mt-2 px-4 h-[36px] text-white bg-[#000] rounded disabled:opacity-40">
                    {busy ? "withdrawing..." : "Withdraw to M-PESA"}
                </button>
            ) : (
                <p className="text-xs mt-1">M-PESA withdrawals open soon - your balance is kept safe.</p>
            )}
            {wallet.withdrawals?.length > 0 && (
                <ul className="mt-2 text-xs space-y-[2px]">
                    {wallet.withdrawals.slice(0, 5).map((w) => (
                        <li key={w.id}>{w.ref} · {ksh(w.amount)} · {w.status}{w.receipt ? ` · ${w.receipt}` : ""}{w.error ? ` · ${w.error}` : ""}</li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default WALLET;

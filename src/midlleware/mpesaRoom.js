import { io } from "socket.io-client";

// Per-payment M-PESA room on the UKO sockets relay - the scheme UKOshop uses.
// A random key goes to the API with the STK push; the API signs it into the callback URL and the relay emits the
// callback only into "<MerchantRequestID>$<key>". Hearing it just wakes the page to ask the API sooner - the API
// confirms the payment with Safaricom itself before any credits are added (user/payment/purchases.js).
export function newSocketKey() {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

// Join the room; wait(ms) resolves after ms, or as soon as the callback arrives
export function watchMpesaRoom(socketsUrl, merchantRequestId, key) {
    let wake = null;
    let heard = false;
    const socket = socketsUrl && merchantRequestId && key ? io(socketsUrl, { transports: ["websocket", "polling"] }) : null;
    if (socket) {
        const room = `${merchantRequestId}$${key}`;
        socket.on("connect", () => socket.emit("user", room));
        socket.on("callback", ({ data } = {}) => {
            if (data && data.MerchantRequestID !== merchantRequestId) return;
            heard = true;
            if (wake) wake();
        });
    }
    return {
        wait: (ms) => new Promise((resolve) => {
            if (heard) { heard = false; return resolve(); }
            const timer = setTimeout(resolve, ms);
            wake = () => { clearTimeout(timer); heard = false; resolve(); };
        }),
        close: () => { if (socket) socket.disconnect(); },
    };
}

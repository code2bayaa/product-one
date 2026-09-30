// The browser window's width, kept current (movies PRD #8).
//
// Pages used to read window.screen.width - the device's screen, not the window - so a narrowed
// desktop window, split-screen tablet or zoomed page got the desktop layout while nav.jsx (which
// read innerWidth) switched to the phone bar. They also started at 0, so every page drew its phone
// layout first and then jumped. This reads innerWidth from the first render, follows resizes and
// rotation at most once a frame, and removes its listeners.
import { useEffect, useState } from "react";

// From this width up pages use the desktop layout (the 20% sidebar). It used to be 800, where the
// sidebar is only 160px: the credits line ran into the menu and the footer links spilled out.
// Tablets and narrow windows below it get the phone layout with the bottom bar.
export const DESKTOP_WIDTH = 1024

const current = () => (typeof window === "undefined" ? 1024 : window.innerWidth || document.documentElement.clientWidth || 1024)

export const useWindowWidth = () => {
    const [width, setWidth] = useState(current)
    useEffect(() => {
        let frame = 0
        const onResize = () => {
            if (frame) return
            frame = requestAnimationFrame(() => {
                frame = 0
                setWidth(current())
            })
        }
        window.addEventListener("resize", onResize)
        window.addEventListener("orientationchange", onResize)
        onResize()
        return () => {
            if (frame) cancelAnimationFrame(frame)
            window.removeEventListener("resize", onResize)
            window.removeEventListener("orientationchange", onResize)
        }
    }, [])
    return width
}

export default useWindowWidth

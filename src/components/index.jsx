import NAVBAR from "./nav";
import gsap from "gsap";
import { home } from "../midlleware/constant";
import { NavLink } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import MOBILE from "./mobileBar";
const EMPIRE = () => {
        
    const divRefs = useRef([]);
    const [windowWidth, setWindowWidth] = useState(0);
    // const [layouts, setLayouts] = useState(false);

    // useEffect(() => {
    //     async function runTest(){
    //         const response = await fetch("https://uko.late-developers.com/test",{credentials:"include"})
    //         const data = await response.json()

    //         console.log(data,"init data")

    //     }

    //     runTest()
    // })
    useEffect(() => {
            gsap.registerPlugin(ScrollTrigger);
            divRefs.current.forEach((divRef) => {
                if (!divRef) return;
                const h2Tag = divRef.querySelector("h2");
                if(!h2Tag) return;
                gsap.fromTo(
                    h2Tag,
                    { opacity: 0, y: 50 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 1,
                        ease: "power3.out",
                        scrollTrigger: {
                            trigger: divRef,
                            scroller:".home",
                            start: windowWidth > 800 ? "top 30%" : "5% 80%",
                            toggleActions: "play none none none",
                            markers:false
                        },
                    }
                );

                const imgs = divRef.querySelectorAll("img");
                imgs && imgs.length > 0 && imgs.forEach((img,index) => {
                    if (!img) return;
                    gsap.fromTo(
                        img,
                        {
                            opacity: 0,
                            x: index === 0 ? 0 : index % 2 === 0 ? "-100%" : "100%", // Left or right
                            y: index === 0 ? "-100%" : "0%", // Top for center image
                        },
                        {
                            opacity: 1,
                            x: "0%",
                            y: "0%",
                            duration: 1.5,
                            ease: "power3.out",
                            delay: index * 0.2, // Stagger animation
                            scrollTrigger: {
                                trigger: divRef,
                                scroller:".home",
                                start: windowWidth > 800 ? "top 35%" : "5% 85%",
                                toggleActions: "play none none none",
                                markers:false
                            },
                        }
                    );
                })
            });
    },[windowWidth])
    useEffect(() => {

        const bigScreen = () => {
            const elem = document.documentElement;
            if (elem.requestFullscreen) {
                elem.requestFullscreen();
            } else if (elem.mozRequestFullScreen) { // Firefox
                elem.mozRequestFullScreen();
            } else if (elem.webkitRequestFullscreen) { // Chrome, Safari & Opera
                elem.webkitRequestFullscreen();
            } else if (elem.msRequestFullscreen) { // IE/Edge
                elem.msRequestFullscreen();
            }
        };
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };
        window.addEventListener("resize", handleResize);
        handleResize(); // Call it once to set the initial value

                // On mobile, request fullscreen on load
        if (window.innerWidth <= 800) {
            setTimeout(() => {
                bigScreen();
            }, 500); // slight delay to allow DOM to settle
        }

    }, [windowWidth]);
    
    return (
        <div className={windowWidth > 800 ? "w-[100%] h-[100%] overflow-hidden flex flex-row flex-wrap":"w-[100%] h-[100%] text-white flex flex-row flex-wrap"} style={{background:"url(/image/grey.jpg)"}}>
            {
                windowWidth > 800 ? 
                <div className="w-[20%] absolute h-[100%] text-[#fff] border-r-[3px] border-[#2E2E3A]" style={{background:"linear-gradient(85deg, #0d0d0d, rgba(0,0,0,0.75), #000, #0f111a)"}}>
                    <NAVBAR/>
                </div>
                :
                <MOBILE/>
            }
            <div className={`${windowWidth > 800 ? "w-[80%] h-[100%]  ml-[20%]" : "w-[100%] h-[85%] overflow-y-auto movie-scene" }`}>
                <div className={`${windowWidth > 800 ? "w-[90%] home text-[#000] h-[90%] mx-[5%] overflow-y-auto movie-scene":"w-[100%] text-[#000] home h-[auto]"}`}>
                    {
                        home.map(({title, article, image}, index) => 
                        <div
                            ref={(el) => {
                                if (el) divRefs.current[index] = el;
                            }}
                            key={index}
                            className={`${
                                windowWidth > 800
                                    ? `w-[100%] min-h-[70%] flex ${
                                        index % 2 ? "flex-row" : "flex-row-reverse"
                                    } flex-wrap mt-[3%]`
                                    : "w-[100%] min-h-[70%] flex flex-col flex-wrap mt-[0.5%]"
                            }`}
                        >
                            {/* Images Section */}
                            <div
                                className={`${
                                    windowWidth > 800 ? "w-[40%] h-[100%] relative flex justify-center items-center" : "w-[100%] h-[auto] relative flex justify-center items-center"
                                }`}
                            >
                                {image.map((img, node) => (
                                    <img
                                        key={node}
                                        src={img}
                                        alt="https://late-developers.com"
                                        className={`${
                                            windowWidth > 800 ? "absolute" : "relative"
                                        } shadow-2xl w-[50%] h-auto ${
                                            node === 0
                                                ? windowWidth > 800 ? "z-[10] mt-[140%]": "z-[10]" // Center image
                                                : node % 2 === 0
                                                ? windowWidth > 800 ? "left-[5%] mt-[50%] z-[5]": " z-[5]" // Left image
                                                : windowWidth > 800 ? "right-[5%] mt-[70%] z-[5]": "z-[5]" // Right image
                                        }`}
                                    />
                                ))}
                            </div>

                            {/* Article Section */}
                            <div className={windowWidth > 800 ? `w-[60%] ${index === 2 ? "bg-[#000] text-[#fff]" : ""}` : `w-[80%] ml-[10%] ${index === 2 ? "bg-[#000] text-[#fff]" : ""} mt-[0.5%]`}>
                                <h2 className="text-[30px]">{title}</h2>
                                <article
                                    className={windowWidth > 800 ? `border-l-[4px] border-[#2E2E3A] w-[60%] pl-[10px] pr-[10px] text-20px]`:`w-[100%] text-20px]`}
                                >
                                    {article}
                                </article>
                            </div>
                        </div>
                        )
                    }
                </div>
                <div className="w-[100%] h-[8%] text-[#ffff] flex flex-row bg-[#000]">
                    <NavLink
                     to="/privacy"
                     className={"w-[25% m-[1%]"}
                    >
                        Privacy
                    </NavLink>
                    <NavLink
                     to="/terms"
                     className={"w-[25% m-[1%]"}
                    >
                        Terms
                    </NavLink>
                </div>
            </div>
        </div>
    )

}

export default EMPIRE;
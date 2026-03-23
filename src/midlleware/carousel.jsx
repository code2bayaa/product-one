
import { useState, useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from "swiper/react"
import {Navigation, Pagination, Autoplay, EffectCoverflow, EffectCards, Scrollbar, Thumbs, Controller, A11y } from "swiper/modules"
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { Flip, Draggable, MotionPathPlugin } from "gsap/all";
import PICTURE from "./picture"
import { faEye, faStar } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useNavigate } from "react-router-dom"
import "swiper/css"
import "swiper/css/bundle"
import "swiper/css/effect-coverflow"
import "swiper/css/pagination"
import "swiper/css/navigation"
import "swiper/css/effect-cards"

const Carousel = ({ images, type, mode, autoplayInterval = 5000 }) => {

  const swiperRef = useRef(null); // Reference to the Swiper instance
  const [windowWidth, setWindowWidth] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    handleResize(); // Call it once to set the initial value
    return () => {
        window.removeEventListener("resize", handleResize);
    };
  },[])

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger, Draggable, Flip, MotionPathPlugin); 

    // Trigger animation when the component mounts
    // if (swiperRef.current) {
    //   console.log(swiperRef.current)
    //   // swiperRef.current.autoplay.start(); // Start autoplay programmatically
    // }

    // return () => {
    //   if (swiperRef.current) {
    //     swiperRef.current.autoplay.stop(); // Cleanup autoplay on unmount
    //   }
    // };
        
  }, [autoplayInterval]);

  // const [firstSwiper, setFirstSwiper] = useState(null);
  // const [secondSwiper, setSecondSwiper] = useState(null);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const navRoute = ({state,url}) => {
      navigate(url,{
          state : {
              ...state
          }
      })
  }
  return (
         <Swiper
          ref={swiperRef}
          modules={[Navigation, Pagination, EffectCards, EffectCoverflow, Autoplay, Scrollbar, A11y, Thumbs, Controller]}
          thumbs={{ swiper: thumbsSwiper }}
          onSwiper={(swiper) => {
            // console.log("loop:"+loop)
            // setFirstSwiper()
            setThumbsSwiper()
            // setFirstSwiper(swiper);
            // setSecondSwiper(swiper)
          }}
          controller={{ control: true }}
          onSlideChange={(swiper) => {
            // console.log(swiper)
            if(window.screen.width > 800)
              swiper.el.style.width = "100%"
          }}
          effect={'coverflow'} 
          grabCursor={true}
          centeredSlides={true}
          spaceBetween={mode === "init" ? 0 :5}
          navigation={true}
          autoplay={{delay:autoplayInterval, disableOnInteraction:false}}
          loop={true}
          slidesPerView={mode === "init" ? 1 :3}
          coverflowEffect={
            {
              rotate:40,
              stretch:0,
              depth:100,
              modifier:1,
              slideShadows:true
            }
          }
          pagination={{clickable:true}}
          scrollbar={{draggable:false}}
        >
          {
            images.map(({
              vote_count,
              poster_path,
              id,title,name,original_name,original_title,overview,
              vote_average,popularity,
              cast_id,
              character,
              credit_id,
              gender,
              // id,
              // name,
              order,
              profile_path
            },index) => (
              <SwiperSlide key={index} virtual={index}>
                
                <div 
                  className={windowWidth > 800 ? "w-[100%] h-[100%] hover:skew-4 hover:contrast-150":"w-[100%] hover:skew-4 h-[90%] hover:contrast-150"}
                  style={{
                    boxShadow:"inset 0 0 30px rgba(0,0,0,0.6),0 10px 30px rgba(0,0,0,0.7),0 0 60px rgba(0,0,0,0.5)",
                    overflow: "hidden",
                  }}
                >
                    <PICTURE key={id} classes={"object-cover h-[100%]"} picture={poster_path || profile_path} />
                    <div style={{boxShadow:"0 10px 30px rgba(0,0,0,0.7),0 0 60px rgba(0,0,0,0.5)"}} className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[90%] h-[90%] bg-[#000000] bg-opacity-60 text-white flex flex-col items-center justify-center z-10">
                        <h2 className={windowWidth > 800 ? "text-[15px] font-bold":"text-[12px]"}>{title || original_title || name || original_name}</h2>
                        {
                          windowWidth > 800 ?
                            <p style={{color:"#ffd800"}}><FontAwesomeIcon icon={faStar} /> { parseFloat(vote_average).toFixed(1) || parseFloat(popularity).toFixed(1) || vote_count || credit_id}</p>
                          :
                            <h3 className="italic">{character}</h3>
                        }
                        {/* <article className="text-[15px]">{overview}</article> */}
                        {/* <NavLink key={index} className={`h-[60px]`} to={type === "movies" ? `/movies/${id}`: `/series/${id}`}>
                          <FontAwesomeIcon icon={faEye} /> { mode === "init" ? "read" : "watch" }
                        </NavLink> */}
                        <button key={index}
                         className={`h-[60px]`}
                         onClick={() => navRoute({
                          url:mode === "movie" && type === "people" ? `/movies/person` : mode === "tv" && type === "people" ? "/tv/person" : mode === "tv" ? '/series/id' : '/movies/id',
                          state:{
                              id
                          }
                        })} >
                          <FontAwesomeIcon icon={faEye} /> { mode === "init" || type === "people" ? "read" : "watch" }
                        </button>  
                    </div>
                </div>                
              </SwiperSlide>
            ))
          }
         </Swiper>
  );
};

export default Carousel;
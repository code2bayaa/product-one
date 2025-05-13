
import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react"
import {Navigation, Pagination, Autoplay, EffectCoverflow, EffectCards, Scrollbar, Thumbs, Controller, A11y } from "swiper/modules"
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { Flip, Draggable, MotionPathPlugin } from "gsap/all";

import "swiper/css"
import "swiper/css/bundle"
import "swiper/css/effect-coverflow"
import "swiper/css/pagination"
import "swiper/css/navigation"
import "swiper/css/effect-cards"
// import $ from "jquery"

const Carousel = ({ images, autoplayInterval = 5000 }) => {

  // const readRef = useRef(null)
  const swiperRef = useRef(null); // Reference to the Swiper instance


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
          spaceBetween={5}
          navigation={true}
          autoplay={{delay:autoplayInterval, disableOnInteraction:false}}
          loop={true}
          slidesPerView={3}
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
            images.map(({poster_path,id,title,name,overview},index) => (
              <SwiperSlide key={index} virtual={index}>
                  <div className= "w-[100%] h-[350px] bg-contain bg-no-repeat bg-center" style={{backgroundImage:"linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(" + process.env.REACT_APP_img_poster + poster_path + ")"}}>
                      <div className='w-[50%] grid justify-center'>
                        <h1 className='text-[20px] text-[#ffd800]'>{title || name}</h1>
                        <article>
                          {`${overview.substr(0,100)}...`}
                        </article>
                        <NavLink 
                          to = {`/movie/${id}`} 
                          style={{color:"#fff",margin:"1%",textDecoration:"underline"}}>see more
                        </NavLink>
                      </div>

                  </div>
                
              </SwiperSlide>
            ))
          }
         </Swiper>
  );
};

export default Carousel;
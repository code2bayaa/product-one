import { useRef } from "react";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/thumbs";

const CLIP = ({index,name,updateClip}) => {

    const nameRef = useRef(null);
    const clipUpdate = (key,img) => {
        updateClip(key)
    }

    return (
        <div className="w-[100%] h-[100%]">
            <div 
                className="w-[100%] h-[100%] cursor-pointer" 
                style={{zIndex:40}} 
                onClick={() => clipUpdate(index)}
                onMouseEnter={() => {
                    nameRef.current.style.display = "block";
                }}
                onMouseLeave={() => {
                    nameRef.current.style.display = "none";
                }}
            >
                <img
                    width="100%"
                    height="100%"
                    src={`https://img.youtube.com/vi/${index}/maxresdefault.jpg`} // Use a thumbnail instead of the iframe
                    alt={name}
                    style={{ borderRadius: "3px", background: "#000", objectFit: "cover" }}
                />
                <div ref={nameRef} className='w-[100%] absolute h-[100%] top-[-1%] hidden items-center backdrop-blur-md text-[#ffd800]'>
                    <p>{name}</p>
                </div>
            </div> 
        </div>
    )
}
export default CLIP;
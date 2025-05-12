import { useState, useEffect } from "react";



const PICTURE = ({picture,classes}) => {

    const [img, setImg] = useState(null)
    const [isLoaded, setLoad] = useState(false)

    // console.log(picture,"picture")
    useEffect(() => {
        if (picture) {

            setImg(process.env.REACT_APP_img_poster + picture)
        } else {
            setImg("/image/alt.webp")
        }
    },[picture])

    const editImg = (e) => {
        setLoad(true)
    }
    const loadImg = () => {
        // console.log("error loading image")
        setImg("/image/alt.webp")
    }

    return (
        // <>
            <img src={img} onError={loadImg} alt="https://late-developers.com" 
                onLoad={(e) => editImg(e)}
                className={`w-[100%] h-[100%] ${classes} ${ isLoaded ? "blur-0" : "blur-md scale-105"}`}/>

        // </>
    )
}

export default PICTURE;
import { useState, useEffect } from "react";
import { useKeys } from "../components/safe";


const PICTURE = ({picture,classes,url}) => {

    const [img, setImg] = useState(null)
    const [isLoaded, setLoad] = useState(false)
    const {safeKeys} = useKeys()
    // console.log(picture,"picture")
    useEffect(() => {
        if (url) {
            // console.log(picture,"picture")
            setImg(url) 
        }else if(picture){
            // console.log(process.env.REACT_APP_IMG_POSTER + picture)
            setImg(safeKeys.IMG_POSTER + picture)
        } else {
            setImg("/image/logo3.png")
        }
    },[picture,url])

    const editImg = (e) => {
        setLoad(true)
    }
    const loadImg = () => {
        // console.log("error loading image")
        setImg("/image/alt.webp")
    }

    return (
        // <>
            <img 
                src={img} 
                onError={loadImg} 
                alt="https://wekesa-apps.io" 
                loading="lazy"
                onLoad={(e) => editImg(e)}
                className={`w-[100%] ${classes} ${ isLoaded ? "blur-0" : "blur-md scale-105"}`}
                
            />

        // </>
    )
}

export default PICTURE;
import { useState, useEffect } from "react";
import { useKeys } from "../components/safe";


const PICTURE = ({picture,classes,url,logo}) => {

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
            if(!safeKeys.IMG_POSTER)
                return
            setImg(safeKeys.IMG_POSTER + picture)
        } else {
            //an effect may only return a cleanup function, so the old JSX return here was dropped
            if(!logo)
                setImg("/image/alt.webp")
        }
    },[picture,url,safeKeys,logo])

    const editImg = (e) => {
        setLoad(true)
    }
    const loadImg = () => {
        // console.log("error loading image")
        if(logo){
            return (
                <h1 className="text-[30px] gradient-text">{logo}</h1>
            )
        }else{
            setImg("/image/alt.webp")
        }
        
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
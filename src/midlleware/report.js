import { v4 as uuidv4 } from 'uuid';


const COLLECT = async() => {

    try{
        const api_url = process.env.REACT_APP_report

        let user = localStorage.getItem("session")
        let user_location = localStorage.getItem("location")
        let device = localStorage.getItem("device")
        const date = new Date()
        const time = date.toLocaleTimeString()

        const sendForm = async({url,options}) => {

            const response = await fetch(
                url,
                options,
                {credentials:"initial"}
            )

            
            return await response.json()

        }

        if(!user_location){
            const urls = [
                "https://ipinfo.io/json",
                // "https://apiip.net/api/check?accessKey=13ad4095-2d84-41f6-be25-df331c9e4f01",
                "https://ipapi.co/json/",
                "https://api.ipgeolocation.io/ipgeo?apiKey=02be68312fd5432fa07048f4b27b6542"
            ]

            const locations = await Promise.all(urls.map(async(url) => {
                return await sendForm({url, options : {
                    method:"GET",
                    headers : {'Content-type': 'application/json; charset=UTF-8'},
                }})
            }))

            localStorage.setItem("location",JSON.stringify(locations))
            user_location = JSON.stringify(locations)
        }

        if(!user){
            const session = uuidv4()
            localStorage.setItem("session",session)
            user = session
        }
            // const browser = navigator.userAgent

        if(!device){
            const getUA = () => {
                let device = "Unknown";
                const ua = {
                    "Generic Linux": /Linux/i,
                    "Android": /Android/i,
                    "BlackBerry": /BlackBerry/i,
                    "Bluebird": /EF500/i,
                    "Chrome OS": /CrOS/i,
                    "Datalogic": /DL-AXIS/i,
                    "Honeywell": /CT50/i,
                    "iPad": /iPad/i,
                    "iPhone": /iPhone/i,
                    "iPod": /iPod/i,
                    "macOS PC": /Macintosh/i,
                    "Windows PC": /IEMobile|Windows/i,
                    "Zebra": /TC70|TC55/i,
                }
                Object.keys(ua).map(v => navigator.userAgent.match(ua[v]) && (device = v));
                return device;
            }

            const deviceType = getUA()
            function getBrowserName() {
                const ua = navigator.userAgent;
              
                if (ua.includes("Firefox")) return "Firefox";
                if (ua.includes("Edg")) return "Microsoft Edge";
                if (ua.includes("OPR") || ua.includes("Opera")) return "Opera";
                if (ua.includes("Chrome")) return "Chrome";
                if (ua.includes("Safari")) return "Safari";
                if (ua.includes("MSIE") || ua.includes("Trident")) return "Internet Explorer";
              
                return "Unknown";
            }

            const browser = getBrowserName()
            const browserVersion = navigator.userAgent.match(/(?:\d+\.)?\d+/g)[0]
            const os = navigator.platform
            const osVersion = navigator.userAgent.match(/(?:\d+\.)?\d+/g)[0]
            device = JSON.stringify({
                deviceType,
                browser,
                browserVersion,
                os,
                osVersion
            })
            localStorage.setItem("device",device)
            
        }
            
        const wireframe = window.location.href

            sendForm({
                url:api_url,
                options:{
                    method : "POST",
                    headers : {'Content-type': 'application/json; charset=UTF-8'},
                    body : JSON.stringify({
                        wireframe,
                        time,
                        user,
                        date,
                        locations: user_location,
                        device,
                    })
                }
            })        
            .then(({ status, error }) => {
                console.log(status,"status report")
            })  
            .catch(error => {
                console.log(error) 
            }) 


    }catch(error){
        console.log(error)
    }

}
export { COLLECT }
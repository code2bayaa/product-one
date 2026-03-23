import { v4 as uuidv4 } from 'uuid';


const COLLECT = async(data) => {

    try{
        const api_url = process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_REPORT : process.env.REACT_APP_REPORT_LIVE

        let user = localStorage.getItem("session")
        let user_location = localStorage.getItem("location")
        let device = localStorage.getItem("device")
        const dateDATA = new Date()
        const time = dateDATA.toISOString().slice(11, 19);
        const getFormattedDate = () => {
            const now = new Date();
            const year = String(now.getFullYear()).slice(-2);
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        // ...inside your /daily route...
        const date = getFormattedDate();

        const sendForm = async({url,options}) => {

            const response = await fetch(
                url,
                options,
                {credentials:"initial"}
            )

            
            return await response.json()

        }
        if (!user_location) {
        const urls = [
            "https://ipinfo.io/json",
            "https://ipapi.co/json/",
            "https://api.ipgeolocation.io/ipgeo?apiKey=" + process.env.REACT_APP_GEO
        ];

        const locations = await Promise.all(
            urls.map(async (url) => {
            try {
                return await sendForm({
                url,
                options: { method: "GET", headers: { "Content-type": "application/json; charset=UTF-8" } }
                });
            } catch (err) {
                console.warn("location fetch failed", url, err);
                return null;
            }
            })
        );

        localStorage.setItem("location", JSON.stringify(locations));
        user_location = locations;
        } else {
            try {
                console.log("user location",user_location)
                user_location = user_location ? JSON.parse(user_location): [];
            } catch (e) {
                // leave as-is if parsing fails
                console.log("parsing error",e)
            }
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
            
        const wireframe = data ? JSON.stringify({
            url:window.location.href,
            data
        })
        :
            window.location.href

        try {
        const res = await sendForm({
            url: api_url,
            options: {
            method: "POST",
            headers: { "Content-type": "application/json; charset=UTF-8" },
            body: JSON.stringify({
                wireframe,
                time,
                user,
                date,
                locations: user_location,
                device
            })
            }
        });

        console.log(res.status, "status report");
        } catch (err) {
        console.log("report send failed", err);
        }


    }catch(error){
        console.log(error)
    }

}

//hacking technique
                    // body : JSON.stringify({
                    //     wireframe : data ? ({
                    //         url:window.location.href,
                    //         data 
                    //     })
                    //     : w
export { COLLECT }
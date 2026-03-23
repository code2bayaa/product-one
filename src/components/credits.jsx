import NAVBAR from "./nav";
import MOBILE from "./mobileBar";
import Swal from "sweetalert2";
import { useEffect, useRef, useState } from "react";

const CREDITS = () => {

    const [windowWidth,setWindowWidth] = useState(0)
    const formRef = useRef();
    const [form, setForm] = useState({name: "", email: "", message: "", subject : ""});
    const [loading, setLoading] = useState(false);
    
    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };
        window.addEventListener("resize", handleResize);
        handleResize(); // Call it once to set the initial value
    },[])


    const handleChange = ({target:{ name, value }}) => {
      setForm({ ...form, [name]: value });
    };

    const handleSubmit = (e) => {

        e.preventDefault();
        setLoading(true);
    
        let body = { 
            name: form.name, 
            email : form.email, 
            subject : form.subject, 
            message : form.message,
            session:localStorage.getItem("user") ? localStorage.getItem("user") : false
        }

        fetch(process.env.REACT_APP_environment === "development" ? process.env.REACT_APP_feedback : process.env.REACT_APP_feedback_live,{
                method : "POST",
                headers : {'Content-type': 'application/json; charset=UTF-8'},
                body : JSON.stringify(body),
                credentials:"include"
            })
        .then(res => res.json())
        .then(({ status, error }) => {
            
            console.log(status)
            if(status){
                setLoading(false);
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: "Thank you for your message 😃",
                    showConfirmButton: false,
                    timer: 2500
                })
                setTimeout(() => {
                    setForm({
                        name: "",
                        email: "",
                        subject : "",
                        message: "",
                    });
                }, [3000]);
            }


            if(error || !status){
                setLoading(false);
                console.error(error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: "I didn't receive your message 😢",
                    showConfirmButton: false,
                    timer: 1500
                })
            }
        })
        .catch((error) => {
            console.error(error);
            setLoading(false);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: "I didn't receive your message 😢",
                showConfirmButton: false,
                timer: 1500
            })
        })

    }
//     useEffect(() => {
//         // const query = searchParams.get("query");
//         // const url = `${location.pathname}?${searchParams.toString()}`;
// {/* <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8036256488117651"
//      crossorigin="anonymous"></script> */}
//         const scriptElement = document.querySelector('script[src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8036256488117651"]');
//         // if (query) {
//         //     document.title = `Empire | ${query}`;
//         // } else {
//         //     document.title = "Empire";
//         // }
//         function handleScriptLoad() {
//             try{
//                 if(window.adsbygoogle){
//                     console.log("pushing ads")
//                     window.adsbygoogle.push({});
//                 }else{
//                     scriptElement.addEventListener("load",handleScriptLoad)
//                     console.log("adsbygoogle not defined, waiting for script to load");
//                 }
//             }catch(error){
//                 console.error("Error loading script:", error);
//             }
//         }
//         handleScriptLoad()

//         return () => {
//             if(scriptElement){
//                 scriptElement.removeEventListener("load", handleScriptLoad);
//             }
//         }
//     }, [searchParams,location]);
    return (
        <div className="w-[100%] h-[100%] overflow-hidden text-white flex flex-row flex-wrap" style={{background:"linear-gradient(65deg, #0d0d0d, rgba(0,0,0,0.75), #1c2a3b, #0f111a)"}}>
            {
                windowWidth > 800 ? 
                    <div className="w-[20%] absolute h-[100%] border-r-[3px] border-[#2E2E3A]" style={{background:"transparent"}}>
                        <NAVBAR/>
                    </div>
                :
                    <MOBILE/>
            }
            <div className={`${windowWidth > 800 ? "w-[80%] h-[100%] gap-7 justify-center items-center ml-[20%]" : " gap-7 justify-center items-center w-[100%] h-[92%]" }`}>
                <h2>Provide feedback for free credits</h2>
                <form
                    ref={formRef}
                    onSubmit={(e) => handleSubmit(e)}
                    className='w-full flex flex-col gap-7 justify-center items-center'
                >
                    <div className="border-b-2 border-black/20 w-[80%]">
                        <label className='text-black-500 font-semibold'>
                            Name
                        </label>
                        <input
                            type='text'
                            name='name'
                            className='w-[100%] text-[#000] h-[40px]'
                            placeholder='Name'
                            required
                            value={form.name}
                            onChange={(e) => handleChange(e)}
                            // onFocus={(e) => handleFocus(e)}
                            // onBlur={(e) => handleBlur(e)}
                        />
                    </div>
                    <div className="border-b-2 border-black/20 w-[80%]">
                        <label className='text-black-500 font-semibold'>
                            Email
                        </label>
                        <input
                            type='email'
                            name='email'
                            className='w-[100%] text-[#000] h-[40px]'
                            placeholder='BrianWekesa@hotmail.com'
                            required
                            value={form.email}
                            onChange={(e) => handleChange(e)}
                            // onFocus={(e) => handleFocus(e)}
                            // onBlur={(e) => handleBlur(e)}
                        />
                    </div>
                    <div className="border-b-2 border-black/20 w-[80%]">
                        <label className='text-black-500 font-semibold'>
                            Subject
                        </label>
                        <input
                            name='subject'
                            className='w-[100%] text-[#000] h-[40px]'
                            placeholder='subject'
                            value={form.subject}
                            onChange={(e) => handleChange(e)}
                            // onFocus={(e) => handleFocus(e)}
                            // onBlur={(e) => handleBlur(e)}
                        />
                    </div>
                    <div className="border-b-2 border-black/20 w-[80%]">
                        <label className='text-black-500 font-semibold'>
                            Your Message
                        </label>
                        <textarea
                            name='message'
                            rows='4'
                            className='w-[100%] text-[#000] min-h-[100px]'
                            placeholder='Write here...'
                            value={form.message}
                            onChange={(e) => handleChange(e)}
                            // onFocus={(e) => handleFocus(e)}
                            // onBlur={(e) => handleBlur(e)}
                        />
                    </div>
                    <button
                        type='submit'
                        disabled={loading}
                        className='w-[80%] bg-stone-900 cursor-pointer text-white font-bold py-3 px-6 rounded-md hover:glow-primary transition-all duration-300 disabled:opacity-50'
                        // onFocus={(e) => handleFocus(e)}
                        // onBlur={(e) => handleBlur(e)}
                    >
                        {loading ? "Sending..." : "Submit"}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default CREDITS;
// import NAVBAR from "./nav";
import {useState,useEffect} from "react"
import { NavLink  } from "react-router-dom"
import MOBILE from "./mobileBar";
import Swal from "sweetalert2";

const FORGOT = () => {
  const [form, setForm] = useState({email:""});
  const [loading, setLoading] = useState(false)
  const [windowWidth, setWindowWidth] = useState(0)

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };
        window.addEventListener("resize", handleResize);
        handleResize(); // Call it once to set the initial value      
    })

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true)
    if(!form.email){
        setLoading(false)
      Swal.fire("oops","input email","error")

      return null
    }

    const response = await fetch(process.env.REACT_APP_environment === "development" ? process.env.REACT_APP_forgot : process.env.REACT_APP_forgot_live, {
      method: "POST",
      body:JSON.stringify({
        email:form.email
      }),
      headers: {
        'Content-Type': 'application/json', // Indicates the body is JSON
      },
    });

    const {status, message, code} = await response.json()
    if(!status){
      Swal.fire("oops!",message,"error");
      setLoading(false)
      return null
    }

    const res = await fetch(process.env.REACT_APP_environment === "development" ? process.env.REACT_APP_email : process.env.REACT_APP_email_live, {
      cache: "no-store",
      method: 'POST', // HTTP method
      headers: {
        'Content-Type': 'application/json', // Indicates the body is JSON
      },
      body: JSON.stringify({
        RECEIVER: form.email,
        SUBJECT: 'FORGOT YOUR EMAIL',
        MSG:`
          <div style='width:100%'>
              <div style='width:80%;margin-left:10%;'>
                  <h1>Welcome To Late Developers product UKO</h1>
                  <p>Use the link to change your password</p>
                  <p><a style="text-decoration:underline;" href="${process.env.REACT_APP_environment === "development" ? process.env.REACT_APP_app : process.env.REACT_APP_app_live}/forgot/code?code=${code}">click me</a></p>
                  <p>Have an idea, contact us to implement it, it's not too late - web - mobile - tv - tablet</p>
                  <p>For more information contact info@late-developers.com © 2025</p>
                  <a href="https://late-developers.com" style="text-decoration:none;color:#000;font-weight:bold;">Visit our website</a>
              </div>
          </div>`
      }), // Convert the data object to JSON
    });

    const waited = await res.json()
    if (!waited.status) {
        Swal.fire("Oops!", status.message + "Try again", "error");
        setLoading(false)
        return null
    }

    setLoading(false)

  };

    return (
        <div className="w-[100%] h-[100%] text-white flex flex-row flex-wrap" style={{background:"url(/image/grey.jpg)"}}>
            {
                windowWidth > 800 ?
                <>
                </> 
                // <div className="w-[20%] absolute h-[100%] border-r-[3px] border-[#2E2E3A]" style={{background:"linear-gradient(85deg, #0d0d0d, rgba(0,0,0,0.75), #000, #0f111a)"}}>
                //     <NAVBAR/>
                // </div>
                :
                <MOBILE/>
            }
            <div className={`flex flex-1 items-center ${windowWidth > 800 ? "w-[100%] overflow-y-auto movie-scene" : "w-[100%]"} justify-center min-h-screen`}>
                <div className="w-[100%] text-[#000] flex justify-center h-[auto] bg-[linear-gradient(#fdfcfb,#e2d1c3,#e2d1c3)]">
                <h1 style={{textAlign:"center",fontSize:"200%"}}>Forgot Password</h1>
                <div className={windowWidth > 800 ? "w-[100%] h-[60%] flex flex-row" : "w-[100%] h-[auto] flex flex-col-reverse" }>
                    {/* <div className={windowWidth > 800 ? "w-[44%] mx-[5%] bg-[linear-gradient(#900C3F,#900c85bd,#900c85bd)]" : "w-[100%] bg-[linear-gradient(#900C3F,#900c85bd,#900c85bd)]"}>
                        <Image src = {forgot_password} alt="late-developers" className="w-[80%] p-0 m-[-1%] z-[2] object-contain"/>
                    </div> */}
                    <div className={windowWidth > 800 ? "w-[45%] grid items-center justify-items-center":"w-[100%] grid items-center justify-items-center"}>
                        <form onSubmit={handleSubmit} className="w-[80%]">
                        <input
                            type="email"
                            placeholder="Email"
                            value={form.email}
                            className="w-[100%] m-[0.5%] items-center h-[40px] border border-[#ccc]"
                            name="email"
                            onChange={(e) => setForm(() => ({...form, [e.target.name] : e.target.value}))}
                        />
                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-[40%] h-[40px] text-white bg-[#000] mx-[30%]"
                            >
                            {loading ? "sending..." :"Send Email"}
                            </button>
                        <fieldset>
                            <NavLink to="/signup" className="w-[48%] m-[1%] underline">Create an Account</NavLink>
                            <NavLink to="/signin" className="w-[48%] m-[1%] underline">Sign In</NavLink>     
                        </fieldset>
                        </form>
                    </div>
                </div>
                </div>
     
            </div>
        </div>
    )
}
export default FORGOT
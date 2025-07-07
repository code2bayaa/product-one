import NAVBAR from "./nav";
import {useEffect,useState,useCallback} from "react"
import { NavLink, useNavigate  } from "react-router-dom"
import Swal from "sweetalert2";
import MOBILE from "./mobileBar";
import {jwtDecode} from 'jwt-decode';
const SIGNIN = () => {

    const [loading, setLoading] = useState(false)
    const [form,setForm] = useState({username:"",password:""})
    const [remember, setRemember] = useState(false);

    const router = useNavigate()
    const [windowWidth, setWindowWidth] = useState(0);

    const handleCredentialResponse = useCallback(async(response) => {
      const {email,family_name,given_name,name,picture} = jwtDecode(response.credential);
      localStorage.setItem("google",JSON.stringify({
        email,
        family_name,
        given_name,
        name,
        picture
      }))
      // You can now send token or userObject to your backend for further processing
      const res = await fetch(process.env.REACT_APP_environment === "development" ? process.env.REACT_APP_google_signin : process.env.REACT_APP_google_signin_live, {
          method: "POST",
          credentials: "include",
          body:JSON.stringify({
            email,
            remember
          }),
          headers: {
            'Content-Type': 'application/json', // Indicates the body is JSON
          },
        });
    
        const {status, message} = await res.json()
        if(!status){
          Swal.fire("oops!",message,"error");
          setLoading(false)
          return null
        }

        console.log(message)
        router("/");
    },[router,remember])

    useEffect(() => {
      /* global google */
      window.onload = () => {
        google.accounts.id.initialize({
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          auto_select: true, // Enables auto-signin
        });
        google.accounts.id.renderButton(
          document.getElementById("google-signin-btn"), // The container ID
          { theme: "outline", size: "large" } // customization
        );
        google.accounts.id.prompt(); // Shows popup or auto signs in if remembered
      };
    }, [handleCredentialResponse]);
    // useEffect(() => {

    //   async function authentication(){
    //     const res = await fetch(api_url + "/session/authentication",{credentials: "include"})
    //     const {status,message} = await res.json()
    //     console.log(message)
    //     if(status){
    //         router('/')
    //     }
    //   }
    //   authentication()
    // },[api_url,router])

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };
        window.addEventListener("resize", handleResize);
        handleResize(); // Call it once to set the initial value
    },[])


    const handleSubmit = async (e) => {
      try{
        e.preventDefault();
        setLoading(true)
        if(!form.password || !form.username){
          if(!form.username){
            Swal.fire("oops","input email","error")
          }
          if(!form.password){
            Swal.fire("oops","input passowrd","error")
          }
          setLoading(false)
          return null
        }
        const response = await fetch(process.env.REACT_APP_environment === "development" ? process.env.REACT_APP_signin : process.env.REACT_APP_signin_live, {
          method: "POST",
          credentials: "include",
          body:JSON.stringify({
            username:form.username,
            password:form.password,
            remember
          }),
          headers: {
            'Content-Type': 'application/json', // Indicates the body is JSON
          },
        });
    
        const {status, message} = await response.json()
        console.log("message",message)
        if(!status){
          Swal.fire("oops!",message,"error");
          setLoading(false)
          return null
        }

        console.log(message)
        router("/");
      }catch(error){
        console.error(error,error.message)
      }

    };

    return (
        <div className="w-[100%] h-[100%] text-white flex flex-row flex-wrap" style={{background:"url(/image/grey.jpg)"}}>
            {
                windowWidth > 800 ? 
                <div className="w-[20%] absolute h-[100%] border-r-[3px] border-[#2E2E3A]" style={{background:"linear-gradient(85deg, #0d0d0d, rgba(0,0,0,0.75), #000, #0f111a)"}}>
                    <NAVBAR/>
                </div>
                :
                <MOBILE/>
            }
            <div className={`flex flex-1 items-center ${windowWidth > 800 ? "w-[80%] ml-[20%]" : "w-[100%]"} justify-center min-h-screen`}>
                <div className={`bg-white bg-opacity-95 rounded-xl shadow-2xl p-8 flex flex-col items-center  ${windowWidth > 800 ? "w-[60%]" : "w-[100%]"}`}>
                    <img src="/image/footer3.png" alt="late developers https://late-developers.com" className="w-1/2 mx-auto mb-6" />
                    <h2 className="text-2xl font-bold text-center text-[#18181c] mb-6">Sign in to your account</h2>
                    <div className={`${windowWidth > 800 ? "w-full" : "w-[100%]"} flex flex-col gap-4`}>
                        {/* Google Sign-In */}
                        <div className="flex flex-col items-center w-full mb-2">
                            <div id="google-signin-btn" style={{ width: "100%", display: "flex", justifyContent: "center" }}></div>
                            <div className="my-4 text-gray-400 text-sm">or</div>
                        </div>
                        {/* Email/Password Sign-In */}
                        <form onSubmit={handleSubmit} className={`${windowWidth > 800 ? "w-full" : "w-[100%]"} flex flex-col gap-4`}>
                            <div className={`flex gap-2 ${windowWidth > 800 ? "w-full flex-row" : "w-[100%] flex-col"}`}>
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={form.username}
                                    name="username"
                                    onChange={e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))}
                                    className="flex-1 p-3 rounded border border-gray-300 focus:outline-none focus:border-[#ffd800] text-black"
                                    autoComplete="username"
                                />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={form.password}
                                    name="password"
                                    onChange={e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))}
                                    className="flex-1 p-3 rounded border border-gray-300 focus:outline-none focus:border-[#ffd800] text-black"
                                    autoComplete="current-password"
                                />
                            </div>
                            <div className="flex items-center justify-between w-full mt-2">
                                <label className="flex items-center gap-2 text-gray-700">
                                    <input
                                        type="checkbox"
                                        checked={remember}
                                        onChange={() => setRemember(r => !r)}
                                        className="accent-[#ffd800]"
                                    />
                                    Remember me
                                </label>
                                {/* <a
                                    type="button"
                                    className="text-[#ffd800] hover:underline text-sm"
                                    href = "https://app.late-developers.com/users/forgot"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Forgot password?
                                </a> */}
                                <NavLink
                                to="/forgot"
                                className="text-[#ffd800] hover:underline text-sm"
                                >
                                  forgot password
                                </NavLink>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full mt-4 py-3 rounded bg-[#18181c] text-white font-bold hover:bg-[#ffd800] hover:text-black transition"
                            >
                                {loading ? "Signing in..." : "Sign In"}
                            </button>
                        </form>
                    </div>
                </div>
     
            </div>
        </div>
    )
}
export default SIGNIN
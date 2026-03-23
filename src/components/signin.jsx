import NAVBAR from "./nav";
import {useEffect,useState,useCallback,useRef} from "react"
import { NavLink, useNavigate  } from "react-router-dom"
import Swal from "sweetalert2";
import MOBILE from "./mobileBar";
import {jwtDecode} from 'jwt-decode';

const SIGNIN = () => {
    const [loading, setLoading] = useState(false)
    const [form,setForm] = useState({username:"",password:"",account:""})
    const [remember, setRemember] = useState(false);
    const [honeypot, setHoneypot] = useState("") // bot trap
    const recaptchaSiteKey = process.env.REACT_APP_RECAPTCHA_SITE_KEY || null
    const router = useNavigate()
    // const router = useRouter()
    const formStartRef = useRef(Date.now()) 
    const [windowWidth, setWindowWidth] = useState(0);
    const recaptchaLoadedRef = useRef(false)
    useEffect(() => {
      const handleResize = () => {
          setWindowWidth(window.screen.width);
      };
      window.addEventListener("resize", handleResize);
      handleResize(); // Call it once to set the initial value      
    })
    // rate-limit config
    const MAX_ATTEMPTS = 5
    const LOCK_WINDOW_MS = 15 * 60 * 1000 // 15 minutes lockout

    const ATTEMPTS_KEY = "signin_attempts_v1"

    const getAttempts = () => {
      try {
        const raw = localStorage.getItem(ATTEMPTS_KEY)
        if(!raw) return {count:0, firstAt:0, lockedUntil:0}
        return JSON.parse(raw)
      }catch(e){
        return {count:0, firstAt:0, lockedUntil:0}
      }
    }
    const setAttempts = (obj) => localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(obj))
    const resetAttempts = () => localStorage.removeItem(ATTEMPTS_KEY)

    // load reCAPTCHA script optionally
    useEffect(() => {
      if(!recaptchaSiteKey) return
      if(recaptchaLoadedRef.current) return
      const s = document.createElement("script")
      s.src = `https://www.google.com/recaptcha/api.js?render=${recaptchaSiteKey}`
      s.async = true
      s.defer = true
      s.onload = () => { recaptchaLoadedRef.current = true }
      document.body.appendChild(s)
      return () => { /* keep script for app lifetime */ }
    },[recaptchaSiteKey])

    const handleCredentialResponse = useCallback(async(response) => {
      // ...existing code...
      const {email,family_name,given_name,name,picture} = jwtDecode(response.credential);
      localStorage.setItem("google",JSON.stringify({
        email,
        family_name,
        given_name,
        name,
        picture
      }))
      // You can now send token or userObject to your backend for further processing
      const res = await fetch(process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_GOOGLE_SIGNIN : process.env.REACT_APP_GOOGLE_SIGNIN_LIVE, {
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

    // ...existing code (resize effect etc) ...
    useEffect(() => {
      /* global google */
      window.onload = () => {
        google.accounts.id.initialize({
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          auto_select: true, // Enables auto-signin
        });
        console.log("google render....")
        google.accounts.id.renderButton(
          document.getElementById("google-signin-btn"), // The container ID
          { theme: "outline", size: "large" } // customization
        );
        google.accounts.id.prompt(); // Shows popup or auto signs in if remembered
      };
    }, [handleCredentialResponse]);
    
    const validateInput = ({ username, password, hp }) => {
      // honeypot must be empty
      if(hp && hp.trim().length > 0) return { ok:false, message: "Bot detected" }

      const email = String(username || "").trim()
      const pass = String(password || "")

      if(email.length === 0) return { ok:false, message: "Email is required" }
      if(email.length > 254) return { ok:false, message: "Email too long" }

      // simple RFC-like email regex (not perfect but OK for client-side)
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
      if(!emailRe.test(email)) return { ok:false, message: "Invalid email format" }

      if(pass.length === 0) return { ok:false, message: "Password is required" }
      if(pass.length < 8) return { ok:false, message: "Password must be at least 8 characters" }
      if(pass.length > 128) return { ok:false, message: "Password too long" }

      // optional: check basic complexity (at least letters + number)
      const complexity = /(?=.*[A-Za-z])(?=.*\d)/
      if(!complexity.test(pass)) return { ok:false, message: "Password must include letters and numbers" }

      return { ok:true, email, pass }
    }

    const handleSubmit = async (e) => {
      try{
        e.preventDefault();
        setLoading(true)

        // check lockout
        const attempts = getAttempts()
        const now = Date.now()
        if(attempts.lockedUntil && attempts.lockedUntil > now){
          const mins = Math.ceil((attempts.lockedUntil - now)/60000)
          Swal.fire("Too many attempts", `Try again in ${mins} minute(s)`, "error")
          setLoading(false)
          return
        }

        // const { ok, message, email, pass } = validateInput({ username: form.username, password: form.password, hp: honeypot })
        // if(!ok){
        //   Swal.fire("oops", message, "error")
        //   setLoading(false)
        //   return
        // }

        // prepare payload
        // const payload = {
        //   username: email,
        //   password: pass,
        //   remember
        // }
        const payload = {
          account: form.account,
          remember
        }

        // include recaptcha token if available
        if(recaptchaSiteKey && window.grecaptcha && typeof window.grecaptcha.execute === "function"){
          try{
            let token
            const checkToken = sessionStorage.getItem("recaptcha_test_token")
            if(checkToken){
              token = checkToken
            }else{
              token = await window.grecaptcha.execute(recaptchaSiteKey, {action: 'login'})
              sessionStorage.setItem("recaptcha_test_token", token)
            }
            payload.recaptchaToken = token
          }catch(rcErr){
            // don't block login if recaptcha fails client-side, let backend decide
            console.warn("reCAPTCHA error", rcErr)
          }
        }
        // include navigator/browser signals to help server-side heuristics
        const clientSignals = {
          ua: navigator.userAgent,
          language: navigator.language,
          platform: navigator.platform,
          timeToSubmitMs: Date.now() - formStartRef.current,
        }
        payload.clientSignals = clientSignals
        const response = await fetch(process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_SIGNIN : process.env.REACT_APP_SIGNIN_LIVE, {
          method: "POST",
          credentials: "include",
          body: JSON.stringify(payload),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        // backend MUST validate recaptcha token and use prepared statements to avoid SQL injection
        const data = await response.json()
        if(!data?.status){
          // increment attempts
          const prev = getAttempts()
          const newCount = (prev.count || 0) + 1
          const firstAt = prev.firstAt || now
          const lockedUntil = (newCount >= MAX_ATTEMPTS) ? (now + LOCK_WINDOW_MS) : 0
          setAttempts({ count: newCount, firstAt, lockedUntil })
          if(lockedUntil){
            Swal.fire("Too many attempts", `Too many failed sign-ins. Locked for ${Math.ceil(LOCK_WINDOW_MS/60000)} minutes.`, "error")
          } else {
            Swal.fire("oops!", data.message || "Invalid credentials", "error")
          }
          setLoading(false)
          return null
        }

        // success -> clear attempts
        resetAttempts()
        router("/");
      }catch(error){
        console.error(error)
        Swal.fire("Error","Unexpected error. Try again later.","error")
      } finally {
        setLoading(false)
      }

    };

    return (
        <div className="w-[100%] h-[100%] text-white flex flex-row flex-wrap" style={{background:"url(/image/grey.jpg)"}}>
            {
              windowWidth > 800 ? 
                <div className="w-[20%] absolute h-[100%] border-r-[3px] border-[#2E2E3A]" style={{background:"linear-gradient(85deg, #0d0d0d, rgba(0,0,0,0.75), #000, #0f111a)"}}>
                    <NAVBAR  fullCover={true}/>
                </div>
                :
                <MOBILE/>
            }
            <div className={`flex flex-1 items-center ${windowWidth > 800 ? "w-[100%]" : "h-[92%] w-[100%]"} justify-center min-h-screen`}>
                <div className={`bg-white bg-opacity-95 rounded-xl shadow-2xl p-8 flex flex-col items-center  ${windowWidth > 800 ? "w-[60%] ml-[20%]" : "w-[100%]"}`}>
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
                            {/* honeypot field - hidden from users, visible to bots */}
                            <input
                              name="hp"
                              value={honeypot}
                              onChange={e => setHoneypot(e.target.value)}
                              autoComplete="off"
                              tabIndex="-1"
                              style={{position:'absolute', left:'-9999px', top:'-9999px', opacity:0, height:0, width:0}}
                            />
                            <div className={`flex gap-2 ${windowWidth > 800 ? "w-full flex-row" : "w-[100%] flex-col"}`}>
                                {/* <input
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
                                /> */}
                                <input
                                  type="text"
                                  placeholder="Account Number"
                                  value={form.account}
                                  name="account"
                                  onChange={e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))}
                                  className="flex-1 p-3 rounded border border-gray-300 focus:outline-none focus:border-[#ffd800] text-black"
                                  autoComplete="account number"
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
                                <NavLink
                                  to="/change"
                                  className="text-[#ffd800] underline"
                                >
                                  change account no
                                </NavLink>
                                <NavLink to="/signup" className="text-[#ffd800] w-[48%] m-[1%] underline">Create an Account</NavLink>
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
// ...existing code...
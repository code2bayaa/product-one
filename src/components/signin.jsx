import NAVBAR from "./nav";
import {useEffect,useState,useCallback,useRef} from "react"
import { NavLink, useNavigate, useLocation } from "react-router-dom"
import Swal from "sweetalert2";
import MOBILE from "./mobileBar";
import {jwtDecode} from 'jwt-decode';
import { forgetSignedIn } from "./access";
import { useWindowWidth, DESKTOP_WIDTH } from "../hooks/useWindowWidth";

const SIGNIN = () => {
    const [loading, setLoading] = useState(false)
    const [form,setForm] = useState({username:"",password:"",account:""})
    const [remember, setRemember] = useState(false);
    //PRD #22: a right account number gets a code emailed; the cookie comes from /signin/verify
    const [challenge, setChallenge] = useState(null) // {id, sentTo}
    const [code, setCode] = useState("")
    const [honeypot, setHoneypot] = useState("") // bot trap
    const recaptchaSiteKey = process.env.REACT_APP_RECAPTCHA_SITE_KEY || null
    const router = useNavigate()
    // REQUIRELOGIN (access.jsx) sends the page it turned away here, to go back to once signed in
    const { state: arrivedWith } = useLocation()
    const goNext = useCallback(() => {
      forgetSignedIn()
      const next = arrivedWith?.next
      if (next?.pathname) router(next.pathname + (next.search || ""), { state: next.state })
      else router("/")
    }, [router, arrivedWith])
    // const router = useRouter()
    const formStartRef = useRef(Date.now()) 
    const windowWidth = useWindowWidth()
    const recaptchaLoadedRef = useRef(false)
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
          //the server checks the credential with Google - the decoded email above is only for display
          body:JSON.stringify({
            credential:response.credential,
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
        goNext();
    },[goNext,remember])

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
        if(data.twoFactor){
          setCode("")
          setChallenge({ id:data.challenge, sentTo:data.sentTo })
          return
        }
        goNext();
      }catch(error){
        console.error(error)
        Swal.fire("Error","Unexpected error. Try again later.","error")
      } finally {
        setLoading(false)
      }

    };

    const signinUrl = process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_SIGNIN : process.env.REACT_APP_SIGNIN_LIVE
    const verifyCode = async (e) => {
      e.preventDefault()
      if(!/^\d{6}$/.test(code.trim())){
        Swal.fire("oops!", "Enter the 6-digit code from your email", "error")
        return
      }
      setLoading(true)
      try{
        const response = await fetch(`${signinUrl}/verify`, {
          method: "POST",
          credentials: "include",
          body: JSON.stringify({ challenge:challenge.id, code:code.trim() }),
          headers: { 'Content-Type': 'application/json' },
        })
        const data = await response.json()
        if(!data?.status){
          Swal.fire("oops!", data?.message || "Wrong code", "error")
          //the code is used up (expired / too many tries) - back to the account number
          if(/sign in again/i.test(data?.message || "")) setChallenge(null)
          return
        }
        goNext()
      }catch(error){
        console.error(error)
        Swal.fire("Error","Unexpected error. Try again later.","error")
      }finally{
        setLoading(false)
      }
    }

    return (
        <div className="w-[100%] h-[100%] text-white flex flex-row flex-wrap" style={{background:"url(/image/grey.jpg)"}}>
            {
              windowWidth >= DESKTOP_WIDTH ? 
                <div className="w-[20%] absolute h-[100%] border-r-[3px] border-[#2E2E3A]" style={{background:"linear-gradient(85deg, #0d0d0d, rgba(0,0,0,0.75), #000, #0f111a)"}}>
                    <NAVBAR  
                    // fullCover={true}
                    />
                </div>
                :
                <MOBILE/>
            }
            <div className={`flex flex-1 items-center ${windowWidth >= DESKTOP_WIDTH ? "w-[100%]" : "h-[92%] w-[100%]"} justify-center min-h-screen`}>
                <div className={`bg-white bg-opacity-95 rounded-xl shadow-2xl p-8 flex flex-col items-center  ${windowWidth >= DESKTOP_WIDTH ? "w-[60%] ml-[20%]" : "w-[100%]"}`}>
                    <img src="/image/footer3.png" alt="late developers https://late-developers.com" className="w-1/2 mx-auto mb-6" />
                    <h2 className="text-2xl font-bold text-center text-[#18181c] mb-6">Sign in to your account</h2>
                    <div className={`${windowWidth >= DESKTOP_WIDTH ? "w-full" : "w-[100%]"} flex flex-col gap-4`}>
                        {/* Google Sign-In */}
                        <div className="flex flex-col items-center w-full mb-2">
                            <div id="google-signin-btn" style={{ width: "100%", display: "flex", justifyContent: "center" }}></div>
                            <div className="my-4 text-gray-400 text-sm">or</div>
                        </div>
                        {challenge ?
                        <form onSubmit={verifyCode} className="w-full flex flex-col gap-4">
                            <p className="text-gray-700 text-center">We emailed a 6-digit sign-in code to <b>{challenge.sentTo}</b>. It works for 10 minutes.</p>
                            <input
                              type="text"
                              inputMode="numeric"
                              autoComplete="one-time-code"
                              maxLength={6}
                              placeholder="Sign-in code"
                              value={code}
                              onChange={e => setCode(e.target.value.replace(/\D/g, ""))}
                              className="p-3 rounded border border-gray-300 focus:outline-none focus:border-[#ffd800] text-black text-center tracking-[0.4em]"
                              autoFocus
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 rounded bg-[#18181c] text-white font-bold hover:bg-[#ffd800] hover:text-black transition"
                            >
                                {loading ? "Checking..." : "Verify"}
                            </button>
                            <button type="button" onClick={() => setChallenge(null)} className="text-[#18181c] underline">
                                Use a different account number / send a new code
                            </button>
                        </form>
                        :
                        /* Account-number Sign-In */
                        <form onSubmit={handleSubmit} className={`${windowWidth >= DESKTOP_WIDTH ? "w-full" : "w-[100%]"} flex flex-col gap-4`}>
                            {/* honeypot field - hidden from users, visible to bots */}
                            <input
                              name="hp"
                              value={honeypot}
                              onChange={e => setHoneypot(e.target.value)}
                              autoComplete="off"
                              tabIndex="-1"
                              style={{position:'absolute', left:'-9999px', top:'-9999px', opacity:0, height:0, width:0}}
                            />
                            <div className={`flex gap-2 ${windowWidth >= DESKTOP_WIDTH ? "w-full flex-row" : "w-[100%] flex-col"}`}>
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
                                </NavLink>                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full mt-4 py-3 rounded bg-[#18181c] text-white font-bold hover:bg-[#ffd800] hover:text-black transition"
                            >
                                {loading ? "Signing in..." : "Sign In"}
                            </button>
                            <p className="w-full mt-3 text-center text-gray-700">
                                New here?{" "}
                                <NavLink to="/signup" className="text-[#ffd800] underline">Create an Account</NavLink>
                            </p>
                        </form>
                        }
                    </div>
                </div>
     
            </div>
        </div>
    )
}
export default SIGNIN
// ...existing code...
import {useEffect,useState, useRef} from "react"
import { NavLink, useNavigate  } from "react-router-dom"
import MOBILE from "./mobileBar";
import Swal from "sweetalert2";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import gsap from "gsap"
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import NAVBAR from "./nav";

const SIGNUP = () => {
    const [form, setForm] = useState({name:"",email:"",password:"",repeat_password:"",telephone:""});
    const [confirming, setConfirming] = useState(false)
    const [check_password, setCheckPassword] = useState(false)
    const [code, setCode] = useState(null)
    const [view, setView] = useState(true)
    const [loading, setLoading] = useState(false)
    const [passwordType, setPasswordType] = useState("password")
    const [verifyLoading, setVerifyLoading] = useState(false)
    const repeatPasswordRef = useRef()
    const registerRef = useRef()
    const verifyRef = useRef()
    const router = useNavigate()
    const [windowWidth, setWindowWidth] = useState(0)

    useEffect(() => {
      const handleResize = () => {
          setWindowWidth(window.screen.width);
      };
      window.addEventListener("resize", handleResize);
      handleResize(); // Call it once to set the initial value      
    })
    // Bot detection / prevention states
    const [honeypot, setHoneypot] = useState("")               // should remain empty
    const formStartRef = useRef(Date.now())                    // measure time-to-submit
    const recaptchaSiteKey = process.env.REACT_APP_RECAPTCHA_SITE_KEY || null
    const SIGNUP_ATTEMPTS_KEY = "signup_attempts_v1"
    const MAX_ATTEMPTS = 8
    const LOCK_WINDOW_MS = 60 * 60 * 1000 // 1 hour lockout

    const getAttempts = () => {
      try { return JSON.parse(localStorage.getItem(SIGNUP_ATTEMPTS_KEY)) || {count:0, lockedUntil:0} } 
      catch(e){ return {count:0, lockedUntil:0} }
    }
    const setAttempts = (obj) => localStorage.setItem(SIGNUP_ATTEMPTS_KEY, JSON.stringify(obj))
    const resetAttempts = () => localStorage.removeItem(SIGNUP_ATTEMPTS_KEY)

    // load recaptcha v3 if configured
    useEffect(() => {
      if(!recaptchaSiteKey) return
      if((window).__recaptcha_loaded) return
      const s = document.createElement("script")
      s.src = `https://www.google.com/recaptcha/api.js?render=${recaptchaSiteKey}`
      s.async = true; s.defer = true
      s.onload = () => { (window).__recaptcha_loaded = true }
      document.head.appendChild(s)
    },[recaptchaSiteKey])

    // reset formStart on mount
    useEffect(() => { formStartRef.current = Date.now() }, [])

    // helper: simple client-side validation & bot checks
    const validateClient = ({ name, email, telephone, password, repeat_password, hp }) => {
      if(hp && hp.trim().length > 0) return { ok:false, error: "Bot detected (honeypot)" }

      // time-to-submit (if too fast, likely bot)
      const now = Date.now()
      const elapsed = now - (formStartRef.current || now)
      if(elapsed < 3000) return { ok:false, error: "Form submitted too quickly" } // less than 3s

      // attempts/lockout
      const attempts = getAttempts()
      if(attempts.lockedUntil && attempts.lockedUntil > now){
          const mins = Math.ceil((attempts.lockedUntil - now)/60000)
          return { ok:false, error: `Too many attempts. Try again in ${mins} minute(s)` }
      }

      // existing form checks (trim & regex)
        //   const n = String(name || "").trim()
      const e = String(email || "").trim()
        //   const tel = String(telephone || "").trim()
        //   const pass = String(password || "")
        //   const repeat = String(repeat_password || "")

        //   if(!n) return { ok:false, error:"Name required" }
        //   if(n.length > 100) return { ok:false, error:"Name too long" }

      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
      if(!e || !emailRe.test(e) || e.length > 254) return { ok:false, error:"Invalid email" }

        //   if(!tel) return { ok:false, error:"Telephone required" }

        //   const passRe = /(?=.{8,128}$)(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/
        //   if(!pass || !passRe.test(pass)) return { ok:false, error:"Password policy not met" }
        //   if(pass !== repeat) return { ok:false, error:"Passwords do not match" }

      return { ok:true, payload: { 
        // name:n, 
        email:e.toLowerCase(), 
        // telephone:tel, password:pass
     } }
    }
    const letters = [
        "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"
    ]
    const providers = [
        "gmail",
        "outlook",
        "yahoo mail",
        "icloud mail",
        "proton mail",
        "zoho mail",
        "aol mail",
        "gmx mail",
        "yandex mail",
        "fastmail",
        "tutanota",
        "mail.com",
        "hey",
        "rediffmail",
        "inbox.lv"
    ];
    const convertAccount = (email) => {
        const Phase = email.split("@")
        const firstPhase = Phase[0]
        const secondPhase = Phase[1]

        let security = ""
        firstPhase.split("").map(l => {
            const index = letters.findIndex(a => a === l)
            if (index > -1)
            security += index
            else
            security += l
        })

        const p = providers.findIndex(m => m === secondPhase.toLowerCase())

        if (p > -1)
            security += p

        return security
    }
    const sendMail = async(email,account) => {
        try{
            const res = await fetch(process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_EMAIL : process.env.REACT_APP_EMAIL_LIVE , {
            cache: "no-store",
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                    RECEIVER: email,
                    SUBJECT: 'SAVE YOUR ACCOUNT NUMBER',
                    MSG:`
                        <div style='width:100%'>
                            <div style='width:80%;margin-left:10%;'>
                                <h1>Welcome</h1>
                                <p>Use this account number to login || ${account}</p>
                            </div>
                        </div>`

                    // MSG:`<div style='width:100%'><div style='width:80%;margin-left:10%;'><h1>Welcome</h1><p>Use the following code to verify ${randomCode}</p></div></div>`
                }),
            });
            const {status} = await res.json();
            return status
        }catch(error){
            console.log("error sending mail", error)
            console.log("trying again after 2 sec...")
            setTimeout(() => sendMail(email,account), 2000)  
        }

    }
    const handleSubmit = async(e) => {
        try {
            e.preventDefault()
            setLoading(true)

            // client side validation + bot checks
            const { ok, error, payload } = validateClient({
            //   name: form.name,
              email: form.email,
            //   telephone: form.telephone,
            //   password: form.password,
            //   repeat_password: form.repeat_password,
              hp: honeypot
            })

            if(!ok){
                Swal.fire("Oops", error, "error")
                setLoading(false)
                // if lockout message, keep lock state
                return
            }

            // include navigator/browser signals to help server-side heuristics
            const clientSignals = {
              ua: navigator.userAgent,
              language: navigator.language,
              platform: navigator.platform,
              timeToSubmitMs: Date.now() - formStartRef.current,
            }

            // optionally get recaptcha token
            if(recaptchaSiteKey && (window).grecaptcha && typeof (window).grecaptcha.execute === "function"){
                try{
                    let token
                    const checkToken = sessionStorage.getItem("recaptcha_test_token")
                    if(checkToken){
                        token = checkToken
                    }else{
                        token = await window.grecaptcha.execute(recaptchaSiteKey, {action: 'signup'})
                        sessionStorage.setItem("recaptcha_test_token", token)
                    }
                    payload.recaptchaToken = token
                }catch(rcErr){
                    console.warn("reCAPTCHA client error", rcErr)
                }
            }

            // add clientSignals
            payload.clientSignals = clientSignals

            // -- check email ---
            const emailResponse = await fetch(process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_EMAIL_VERIFY : process.env.REACT_APP_EMAIL_VERIFY_LIVE, {
                method: "POST",
                headers: {'Content-Type':'application/json'},
                body: JSON.stringify({email:payload.email})
            });

            const emailJSON = await emailResponse.json();
            if(emailJSON.status){
                Swal.fire("oops", emailJSON.message, "error");
                setLoading(false);
                return;
            }

            const account = convertAccount(payload.email)
            //sending mail
            let sent = await sendMail(payload.email,account);
            let retryCount = 0;
            while(!sent && retryCount < 4){
                console.log("retrying sending mail")
                sent = await sendMail(payload.email,account)
                retryCount++;
            }

            const response = await fetch(process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_SIGNUP : process.env.REACT_APP_SIGNUP_LIVE, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({...payload,account})
            });

            const {status, message} = await response.json();
            if(!status){
                Swal.fire("oops", message || "Registration failed", "error");
                setLoading(false);
                return;
            }

            // success: proceed to verification UI (existing animation code)
            // setLoading(false);
            // const formDiv = gsap.timeline();
            // formDiv.to(registerRef.current,{ x:500, duration:3 });
            // formDiv.to(registerRef.current,{ opacity:0, duration:2 });

            // const verifyDiv = gsap.timeline();
            // verifyDiv.to(verifyRef.current,{ onEnter:() => { verifyRef.current.classList.remove("hidden") }, duration:1 });
            // verifyDiv.to(verifyRef.current,{ x:-500, duration:2 });

            // const response = await fetch(process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_signup : process.env.REACT_APP_signup_LIVE, {
            //     method: "POST",
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(payload),
            //     credentials: "include"
            // })

            // const { status, message: msg } = await response.json()

            if(!status){
                // increment attempts and possibly lock
                const prev = getAttempts()
                const now = Date.now()
                const count = (prev.count || 0) + 1
                const lockedUntil = count >= MAX_ATTEMPTS ? now + LOCK_WINDOW_MS : (prev.lockedUntil || 0)
                setAttempts({ count, lockedUntil })
                if(lockedUntil){
                    Swal.fire("Too many attempts", `Locked for ${Math.ceil(LOCK_WINDOW_MS/60000)} minute(s)`, "error")
                } else {
                    Swal.fire("Oops", "Registration failed", "error")
                }
                setLoading(false)
                return
            }

            Swal.fire("Success", `Account number sent to your email`, "success")
            // success -> clear attempts, proceed to verification UI
            resetAttempts()
            setLoading(false)
            // const randomCode = ""; // server already sent code in your current flow
            // const formDiv = gsap.timeline();
            // formDiv.to(registerRef.current,{ x:500, duration:3 });
            // formDiv.to(registerRef.current,{ opacity:0, duration:2 });

            // const verifyDiv = gsap.timeline();
            // verifyDiv.to(verifyRef.current,{ onEnter:() => { verifyRef.current.classList.remove("hidden") }, duration:1 });
            // verifyDiv.to(verifyRef.current,{ x:-500, duration:2 });

        } catch (err) {
            console.error(err)
            Swal.fire("Error","Unexpected error. Try again later.","error")
            setLoading(false)
        }
    }
    const repeatPassword = (e) => {
      
      repeatPasswordRef.current.classList.add("border-b-[red]")
      setConfirming(true)
      console.log(repeatPasswordRef.current.value)
      if(form.password === repeatPasswordRef.current.value){
          setConfirming(false)
          setForm(() => ({...form, [e.target.name]:e.target.value}))
          repeatPasswordRef.current.classList.remove("border-b-[red]")
      }

    }

    const verifyEmail = async(e) => {
      e.preventDefault()
      setVerifyLoading(true)
      if(!code){
          Swal.fire("oops","input code","error")
          setVerifyLoading(false)
          return null
      }
      const response = await fetch(process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_SIGNUP_VERIFY : process.env.REACT_APP_SIGNUP_VERIFY_LIVE, {
          method: "POST",
          body:JSON.stringify({code}),
          headers: {
              'Content-Type': 'application/json', // Indicates the body is JSON
          },
      });

      const {status, message} = await response.json()

      if(!status){
          Swal.fire("oops!",message,"error")
          setVerifyLoading(false)
          return null
      }

      setVerifyLoading(false)
      router("/signin")
    }

    const toggleVision = () => {
      if(view){
          setPasswordType("text")
      }else{
          setPasswordType("password")
      }
      setView(!view)
    }

    const checkTelephone = (e) => {
      const value = e.target.value;
      const telephoneData = localStorage.getItem("location")
      let telephonePass = false;
      if(value.length > 3 && telephoneData){
          const [one, two] = JSON.parse(telephoneData);
          console.log(one)
          const { country_calling_code } = two
          const proper_calling = country_calling_code.replace("+", "")
          if(value.startsWith(proper_calling)){
              telephonePass = true;
          }else{
              Swal.fire("oops","telephone must start with "+proper_calling,"error")
          }
      }
      
      const regex = /^[0-9]{0,15}$/; // Allow only numbers and limit to 15 digits
      if (regex.test(value) && telephonePass) {
          setForm(() => ({...form, [e.target.name]:value}));
      }
  }

  const checkPassword = (e) => {
      setCheckPassword(false)
      const value = e.target.value;
      console.log(value)
      const regex = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}/; // At least 8 characters, one uppercase, one lowercase, and one number
      if (regex.test(value)) {
          console.log("valid password")
          setForm(() => ({...form, [e.target.name]:value}));
          e.currentTarget.classList.remove("border-b-[red]")
          setCheckPassword(false)
      }else {
          e.currentTarget.classList.add("border-b-[red]")
          setCheckPassword(true)
      }
  }

    return (
        <div className="w-[100%] h-[100%] text-white flex flex-row flex-wrap" style={{background:"url(/image/grey.jpg)"}}>
            {
                windowWidth > 800 ? 
                    <div className="w-[20%] absolute h-[100%] border-r-[3px] border-[#2E2E3A]" style={{background:"linear-gradient(85deg, #0d0d0d, rgba(0,0,0,0.75), #000, #0f111a)"}}>
                        <NAVBAR fullCover={true}/>
                    </div>
                :
                <MOBILE/>
            }
            <div className={`flex flex-1 items-center ${windowWidth > 800 ? "w-[80%] ml-[20%] overflow-y-auto movie-scene" : "w-[100%] h-[92%]"} justify-center min-h-screen`}>
              <div className={`w-[100%] h-[auto] text-[#000] flex ${windowWidth > 800 ? "flex-row" : "flex-col"} justify-center bg-[linear-gradient(#fdfcfb,#e2d1c3,#e2d1c3)]`}>
                <h1 style={{textAlign:"center",fontSize:"200%"}}>Create an Account</h1>
                <div className={windowWidth > 800 ? "w-[100%] h-[60%] flex flex-row" : "w-[100%] h-[auto]" }>
                    {/* <div className={windowWidth > 800 ? "w-[44%] mx-[5%] bg-[linear-gradient(#900C3F,#900c85bd,#900c85bd)]":"w-[100%] bg-[linear-gradient(#900C3F,#900c85bd,#900c85bd)]"}>
                      <Image src = {sign_up} alt="late-developers" className="w-[80%] p-0 m-[-1%] z-[2] object-contain"/>
                    </div> */}
                    <div ref={registerRef} className={windowWidth > 800 ? "w-[45%] grid items-center justify-items-center" : "w-[100%] grid items-center justify-items-center"}>
                      <form onSubmit={handleSubmit} className="w-[80%]">
                            <input
                                name="hp"
                                value={honeypot}
                                onChange={e => setHoneypot(e.target.value)}
                                autoComplete="off"
                                tabIndex="-1"
                                style={{position:'absolute', left:'-9999px', top:'-9999px', opacity:0, height:0, width:0}}
                            />
                          {/* <fieldset>
                              <legend>Name</legend>
                              <input
                                  type="text"
                                  placeholder="Name"
                                  // value={form.name}
                                  className="w-[100%] m-[0.5%] h-[40px] border border-[#ccc]"
                                  name="name"
                                  onChange={(e) => setForm(() => ({...form, [e.target.name]:e.target.value}))}
                              />
                          </fieldset> */}
                          <fieldset>
                              <legend>Email</legend>
                              <input
                                  type="email"
                                  placeholder="Email"
                                  // value={form.email}
                                  className="w-[100%] m-[0.5%] items-center h-[40px] border border-[#ccc]"
                                  name="email"
                                  onChange={(e) => setForm(() => ({...form, [e.target.name] : e.target.value}))}
                              />
                          </fieldset>
                          {/* <fieldset>
                              <legend>Telephone</legend>
                              <input
                                  type="telephone"
                                  placeholder="254717323852"
                                  // value={form.telephone}
                                  className="w-[100%] m-[0.5%] items-center h-[40px] border border-[#ccc]"
                                  name="telephone"
                                  onChange={(e) => checkTelephone(e)}
                              />
                          </fieldset> */}
                          {/* <fieldset>
                              <legend>Password</legend>
                              <input
                                  type={passwordType}
                                  placeholder="Password"
                                  // value={form.password}
                                  className="w-[89%] m-[0.5%] h-[40px] border border-[#ccc]"
                                  name="password"
                                  onChange={(e) => checkPassword(e)}
                              />
                              <button 
                                  type="button"
                                  className="w-[10%] h-[40px] text-white bg-[#000]"
                                  onClick={toggleVision}
                              >
                                  { view ? <FontAwesomeIcon icon={faEyeSlash}/> : <FontAwesomeIcon icon={faEye}/> }
                              </button>
                          </fieldset> */}
                          {/* {
                              check_password ? 
                              <ul>
                                  <li className="text-[red]">Password must be at least 8 characters long</li>
                                  <li className="text-[red]">Must contain at least one uppercase letter</li>
                                  <li className="text-[red]">Must contain at least one lowercase letter</li>
                                  <li className="text-[red]">Must contain at least one number</li>
                              </ul>
                              : ""
                          } */}
                          {/* <fieldset>
                              <legend>Repeat Password</legend>
                              <input
                                  type="password"
                                  ref={repeatPasswordRef}
                                  placeholder="Repeat Password"
                                  // value={form.repeat_password}
                                  className="w-[100%] m-[0.5%] h-[40px] border border-[#ccc]"
                                  name="repeat_password"
                                  onChange={(e) => repeatPassword(e)}
                              />
                          </fieldset> */}

                        {/* {confirming ? <p style={{color:"red"}}>passwords must match</p> : ""} */}
                        <button 
                          type="submit"
                          disabled={loading}
                          className="w-[40%] h-[40px] text-white bg-[#000] mx-[30%]"
                          >
                            {loading?"registering...":"Register"}
                          </button>
                          <fieldset>
                              <NavLink to="/signin" className="w-[48%] m-[1%] underline">Sign In</NavLink>
                              <NavLink to="/change" className="w-[48%] m-[1%] underline">Change Account No</NavLink>     
                          </fieldset>
                      </form>
                    </div>
                      <div ref={verifyRef} className="w-[45%] hidden">
                          <p>A code was sent to your email. Input it below</p>
                          <form onSubmit={verifyEmail}>
                              <input
                                  type="number"
                                  placeholder="Input Code"
                                  className="w-[100%] m-[0.5%] h-[40px] border border-[#000]"
                                  name="code"
                                  onChange={(e) => setCode(e.target.value)}
                              />
                              <button 
                              type="submit"
                              disabled={verifyLoading}
                              className="w-[40%] h-[40px] text-white bg-[#000] mx-[30%]"
                              >
                                  {verifyLoading ? "verifying..." : "VERIFY"}
                              </button>
                          </form>
                      </div>

                </div>
              </div>
     
            </div>
        </div>
    )
}
export default SIGNUP
import NAVBAR from "./nav";
import {useEffect,useState, useRef} from "react"
import { NavLink, useNavigate  } from "react-router-dom"
import MOBILE from "./mobileBar";
import Swal from "sweetalert2";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import gsap from "gsap"
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
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
          setWindowWidth(window.innerWidth);
      };
      window.addEventListener("resize", handleResize);
      handleResize(); // Call it once to set the initial value      
    })

    const handleSubmit = async(e) => {
      e.preventDefault();

      setLoading(true)
      const values = [...Object.values(form)]
      const check = values.findIndex( value => value === "")
      if(check > -1){
          let msg = ""
          if(!form.name)
              msg += "input name, "
              

          if(!form.repeat_password)
              msg += "input repeat password, "
          
          if(!form.email)
              msg += "input email, "
                  
          if(!form.telephone)
              msg += "input telephone, "

          if(!form.password)
              msg += "input password"

          Swal.fire("oops",msg,"error")
          setLoading(false)
          return null
      }

      console.log(form)
      const randomCode = Math.floor(1000 + Math.random() * 9999);
      //email first
        
      const res = await fetch(process.env.REACT_APP_environment === "development" ? process.env.REACT_APP_email : process.env.REACT_APP_email_live , {
          cache: "no-store",
          method: 'POST', // HTTP method
          headers: {
            'Content-Type': 'application/json', // Indicates the body is JSON
          },
          body: JSON.stringify({
            RECEIVER: form.email,
            SUBJECT: 'VERIFY YOUR EMAIL',
            MSG:`
              <div style='width:100%'>
                  <div style='width:80%;margin-left:10%;'>
                      <h1>Welcome To Late Developers product UKO</h1>
                      <p>Use the following code to verify ${randomCode}</p>
                      <p>Have an idea, contact us to implement it, it's not too late - web - mobile - tv - tablet</p>
                      <p>For more information contact info@late-developers.com © 2025</p>
                      <a href="https://late-developers.com" style="text-decoration:none;color:#000;font-weight:bold;">Visit our website</a>
                  </div>
              </div>`
          }), // Convert the data object to JSON
        });

        const waited = await res.json()
      if (!waited.status) {
          Swal.fire("Oops!", "Try again!", "error");
          setLoading(false)
          return null
      }

      const response = await fetch(process.env.REACT_APP_environment === "development" ? process.env.REACT_APP_signup : process.env.REACT_APP_signup_live, {
          method: "POST",
          body:JSON.stringify({...form, randomCode}),
          headers: {
              'Content-Type': 'application/json', // Indicates the body is JSON
          },
      });

      console.log(response)
      const {status, message} = await response.json()
      console.log(status,"status",message,"message")
      if(!status){
          Swal.fire("oops",message,"error")
          setLoading(false)
          return null
      }

        setLoading(false)

      const formDiv = gsap.timeline()
      formDiv.to(registerRef.current,{
          x:500,
          duration:3
      })
      formDiv.to(registerRef.current,{opacity:0, duration:2})

      const verifyDiv = gsap.timeline()
      verifyDiv.to(verifyRef.current,{
          onEnter:() => {
              verifyRef.current.classList.remove("hidden")
          },
          duration:1
      })
      verifyDiv.to(verifyRef.current,{
          x:-500,
          duration:2
      })
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
      const response = await fetch(process.env.REACT_APP_environment === "development" ? process.env.REACT_APP_signup_verify : process.env.REACT_APP_signup_verify_live, {
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
                    <NAVBAR/>
                </div>
                :
                <MOBILE/>
            }
            <div className={`flex flex-1 items-center ${windowWidth > 800 ? "w-[80%] ml-[20%] overflow-y-auto movie-scene" : "w-[100%]"} justify-center min-h-screen`}>
              <div className="w-[100%] h-[auto] text-[#000] flex justify-center bg-[linear-gradient(#fdfcfb,#e2d1c3,#e2d1c3)]">
                <h1 style={{textAlign:"center",fontSize:"200%"}}>Create an Account</h1>
                <div className={windowWidth > 800 ? "w-[100%] h-[60%] flex flex-row" : "w-[100%] h-[auto] flex flex-col-reverse" }>
                    {/* <div className={windowWidth > 800 ? "w-[44%] mx-[5%] bg-[linear-gradient(#900C3F,#900c85bd,#900c85bd)]":"w-[100%] bg-[linear-gradient(#900C3F,#900c85bd,#900c85bd)]"}>
                      <Image src = {sign_up} alt="late-developers" className="w-[80%] p-0 m-[-1%] z-[2] object-contain"/>
                    </div> */}
                    <div ref={registerRef} className={windowWidth > 800 ? "w-[45%] grid items-center justify-items-center" : "w-[100%] grid items-center justify-items-center"}>
                      <form onSubmit={handleSubmit} className="w-[80%]">
                          <fieldset>
                              <legend>Name</legend>
                              <input
                                  type="text"
                                  placeholder="Name"
                                  // value={form.name}
                                  className="w-[100%] m-[0.5%] h-[40px] border border-[#ccc]"
                                  name="name"
                                  onChange={(e) => setForm(() => ({...form, [e.target.name]:e.target.value}))}
                              />
                          </fieldset>
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
                          <fieldset>
                              <legend>Telephone</legend>
                              <input
                                  type="telephone"
                                  placeholder="254717323852"
                                  // value={form.telephone}
                                  className="w-[100%] m-[0.5%] items-center h-[40px] border border-[#ccc]"
                                  name="telephone"
                                  onChange={(e) => checkTelephone(e)}
                              />
                          </fieldset>
                          <fieldset>
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
                          </fieldset>
                          {
                              check_password ? 
                              <ul>
                                  <li className="text-[red]">Password must be at least 8 characters long</li>
                                  <li className="text-[red]">Must contain at least one uppercase letter</li>
                                  <li className="text-[red]">Must contain at least one lowercase letter</li>
                                  <li className="text-[red]">Must contain at least one number</li>
                              </ul>
                              : ""
                          }
                          <fieldset>
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
                          </fieldset>

                        {confirming ? <p style={{color:"red"}}>passwords must match</p> : ""}
                        <button 
                          type="submit"
                          disabled={loading}
                          className="w-[40%] h-[40px] text-white bg-[#000] mx-[30%]"
                          >
                              {loading?"registering...":"Register"}
                          </button>
                          <fieldset>
                              <NavLink to="/signin" className="w-[48%] m-[1%] underline">Sign In</NavLink>
                              <NavLink to="/forgot" className="w-[48%] m-[1%] underline">Forgot Password</NavLink>     
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
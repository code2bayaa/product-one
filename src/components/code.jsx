import NAVBAR from "./nav";
import {useState,useEffect,useRef, Suspense} from "react"
import { useNavigate, useSearchParams  } from "react-router-dom"
import MOBILE from "./mobileBar";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEyeSlash, faEye } from "@fortawesome/free-solid-svg-icons";

const CHANGE = () => {
  const [form, setForm] = useState({password:"",repeat_password:""});
  const [loading, setLoading] = useState(false)
  const [passwordType, setPasswordType] = useState("password")
  const [confirming, setConfirming] = useState(false)
  const repeatPasswordRef = useRef()
  const [view, setView] = useState(true)
  const router = useNavigate()
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code"); // Get the code from the URL
  const [windowWidth, setWindowWidth] = useState(0)

  useEffect(() => {
      const handleResize = () => {
          setWindowWidth(window.innerWidth);
      };
      window.addEventListener("resize", handleResize);
      handleResize(); // Call it once to set the initial value      
  })  

  const repeatPassword = (e) => {
    setForm(() => ({...form, [e.target.name]:e.target.value}))
    repeatPasswordRef.current.classList.add("text-red")
    setConfirming(true)
    console.log(repeatPasswordRef.current.value)
    if(form.password === repeatPasswordRef.current.value){
        setConfirming(false)
        repeatPasswordRef.current.classList.remove("text-red")
    }

  }

  const toggleVision = () => {
    if(view){
        setPasswordType("text")
    }else{
        setPasswordType("password")
    }
    setView(!view)
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true)
    if(!form.password){
      Swal.fire("oops","input password","error")
      setLoading(false)
      return null
    }
    if(!form.repeat_password){
        Swal.fire("oops","input repeat password","error")
        setLoading(false)
        return null
    }

    const response = await fetch(process.env.REACT_APP_environment === "development" ? process.env.REACT_APP_forgot_change : process.env.REACT_APP_forgot_change_live, {
      method: "POST",
      body:JSON.stringify({
        code,
        password:form.password
      }),
      headers: {
        'Content-Type': 'application/json', // Indicates the body is JSON
      },
    });

    const {status, message} = await response.json()
    if(!status){
      Swal.fire("oops!",message,"error");
      setLoading(false)
      return null
    }

    router("/signin")


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
            <div className={`flex flex-1 items-center ${windowWidth > 800 ? "w-[80%] ml-[20%] overflow-y-auto movie-scene" : "w-[100%]"} justify-center min-h-screen`}>
              <div className="w-[100%] text-[#000] flex justify-center h-[auto] bg-[linear-gradient(#fdfcfb,#e2d1c3,#e2d1c3)]">
                <h1 style={{textAlign:"center",fontSize:"200%"}}>Change Password</h1>
                <div className={windowWidth > 800 ? "w-[100%] h-[60%] flex flex-row" : "w-[100%] h-[auto] flex flex-col-reverse" }>
                    {/* <div className={windowWidth > 800 ? "w-[44%] mx-[5%] bg-[linear-gradient(#900C3F,#900c85bd,#900c85bd)]" : "w-[100%] bg-[linear-gradient(#900C3F,#900c85bd,#900c85bd)]"}>
                      <Image src = {forgot_password} alt="late-developers" className="w-[80%] p-0 m-[-1%] z-[2] object-contain"/>
                    </div> */}
                    <div className={windowWidth > 800 ? "w-[45%] grid items-center justify-items-center" : "w-[100%] grid items-center justify-items-center"}>
                      <form onSubmit={handleSubmit} className="w-[80%]">
                          <fieldset>
                              <legend>Password</legend>
                              <input
                                  type={passwordType}
                                  placeholder="Password"
                                  value={form.password}
                                  className="w-[89%] m-[0.5%] h-[40px] border border-[#ccc]"
                                  name="password"
                                  onChange={(e) => setForm(() => ({...form, [e.target.name]:e.target.value}))}
                              />
                              <button 
                                  type="button"
                                  className="w-[10%] h-[40px] text-white bg-[#000]"
                                  onClick={toggleVision}
                              >
                                  { view ? <FontAwesomeIcon icon={faEyeSlash}/> : <FontAwesomeIcon icon={faEye}/> }
                              </button>
                          </fieldset>
                          <fieldset>
                              <legend>Repeat Password</legend>
                              <input
                                  ref={repeatPasswordRef}
                                  type="password"
                                  placeholder="Repeat Password"
                                  value={form.repeat_password}
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
                            {loading ? "changing..." : "Change Password"}
                          </button>
                      </form>
                    </div>
                </div>
              </div>
     
            </div>
        </div>
    )
}
export default function CHANGEPAGE() {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <CHANGE />
      </Suspense>
    );
  }
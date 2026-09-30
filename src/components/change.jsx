// import { useState } from "react"
import NAVBAR from "./nav";
import {useState} from "react"
import { NavLink  } from "react-router-dom"
import MOBILE from "./mobileBar";
import Swal from "sweetalert2";
import { useWindowWidth, DESKTOP_WIDTH } from "../hooks/useWindowWidth";
const CHANGE = () => {

  const [form, setForm] = useState({email:""});
  const [loading, setLoading] = useState(false)
  const windowWidth = useWindowWidth()
  //the new account number is made and emailed by the server - this page never sees it
  const handleSubmit = async (e) => {
    e?.preventDefault()
    const email = form.email.trim()
    try {
      setLoading(true)
      if (!email) {
        Swal.fire("Error", "Input email","error")
        setLoading(false)
        return
      }

      const response = await fetch(`${process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_CHANGE : process.env.REACT_APP_CHANGE_LIVE}`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const { status, message } = await response.json();
      if (!status) {
        Swal.fire("Error", message || "Registration failed","error");
        setLoading(false);
        return;
      }

      Swal.fire("Check your email", message,"success")
      setLoading(false)
    } catch (err) {
      console.error(err)
      Swal.fire("Error", "Unexpected error. Try again later.","error")
      setLoading(false)
    }
  }

  return (
    <div className="w-[100%] h-[100%] text-white flex flex-row flex-wrap" style={{background:"url(/image/grey.jpg)"}}>
        {
            windowWidth >= DESKTOP_WIDTH ?
            <div className="w-[20%] absolute h-[100%] border-r-[3px] border-[#2E2E3A]" style={{background:"linear-gradient(85deg, #0d0d0d, rgba(0,0,0,0.75), #000, #0f111a)"}}>
                <NAVBAR/>
            </div>
            :
            <MOBILE/>
        }
        <div className={`flex flex-1 items-center ${windowWidth >= DESKTOP_WIDTH ? "w-[100%] overflow-y-auto movie-scene" : "w-[100%]"} justify-center min-h-screen`}>
            <div className="w-[100%] text-[#000] flex justify-center h-[auto] bg-[linear-gradient(#fdfcfb,#e2d1c3,#e2d1c3)]">
            <h1 style={{textAlign:"center",fontSize:"200%"}}>Forgot Password</h1>
            <div className={windowWidth >= DESKTOP_WIDTH ? "w-[100%] h-[60%] flex flex-row" : "w-[100%] h-[auto] flex flex-col-reverse" }>
                <div className={windowWidth >= DESKTOP_WIDTH ? "w-[45%] grid items-center justify-items-center":"w-[100%] grid items-center justify-items-center"}>
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

export default CHANGE

// import { useState } from "react"
import NAVBAR from "./nav";
import {useState,useEffect} from "react"
import { NavLink  } from "react-router-dom"
import MOBILE from "./mobileBar";
import Swal from "sweetalert2";
const CHANGE = () => {

  const [email, setEmail] = useState(null)
  const [form, setForm] = useState({email:""});
  const [loading, setLoading] = useState(false)
  const [windowWidth, setWindowWidth] = useState(0)
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
  const convertAccount = (email, count) => {
    const Phase = email.split("@")
    const firstPhase = Phase[0]
    const secondPhase = Phase[1]

    //add more digits
    const base = letters.length * count
    let security = ""
    firstPhase.split("").map(l => {
      const index = letters.findIndex(a => a === l)
      if (index > -1)
        security += index + base
      else
        security += l
    })

    const p = providers.findIndex(m => m === secondPhase.toLowerCase())

    if (p > -1)
      security += p

    return security
  }
  const sendMail = async (email, account) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_EMAIL : process.env.REACT_APP_EMAIL_LIVE}`, {
        cache: "no-store",
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          RECEIVER: email,
          SUBJECT: 'SAVE YOUR ACCOUNT NUMBER',
          MSG: `
                  <div style='width:100%'>
                      <div style='width:80%;margin-left:10%;'>
                          <h1>Welcome</h1>
                          <p>Use this account number to login || ${account}</p>
                      </div>
                  </div>`
        }),
      });
      const { status } = await res.json();
      return status
    } catch (error) {
      console.log("error sending mail", error)
      console.log("trying again after 2 sec...")
      setTimeout(() => sendMail(email, account), 2000)
    }
  }
  const handleSubmit = async () => {
    try {
      setLoading(true)
      if (!email) {
        Swal.fire("Error", "Input email","error")
        setLoading(false)
        return
      }

      const emailResponse = await fetch(`${process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_EMAIL_VERIFY : process.env.REACT_APP_EMAIL_VERIFY_LIVE}`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const emailJSON = await emailResponse.json();
      if (emailJSON.status) {
        Swal.fire("Error", emailJSON.message,"error")
        setLoading(false);
        return;
      }

      const count = emailJSON.count

      const account = convertAccount(email, count)

      console.log("account", account)
      //sending mail
      let sent = await sendMail(email, account)
      let retryCount = 0;
      while (!sent && retryCount < 4) {
        console.log("retrying sending mail")
        sent = await sendMail(email, account)
        retryCount++;
      }

      const response = await fetch(`${process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_CHANGE : process.env.REACT_APP_CHANGE_LIVE}`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account, email })
      });

      const { status, message } = await response.json();
      if (!status) {
        Swal.fire("Error", message || "Registration failed","error");
        setLoading(false);
        return;
      }

      Swal.fire("Success", `Account number sent to your email`,"success")
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
            windowWidth > 800 ?
            <div className="w-[20%] absolute h-[100%] border-r-[3px] border-[#2E2E3A]" style={{background:"linear-gradient(85deg, #0d0d0d, rgba(0,0,0,0.75), #000, #0f111a)"}}>
                <NAVBAR/>
            </div>
            :
            <MOBILE/>
        }
        <div className={`flex flex-1 items-center ${windowWidth > 800 ? "w-[100%] overflow-y-auto movie-scene" : "w-[100%]"} justify-center min-h-screen`}>
            <div className="w-[100%] text-[#000] flex justify-center h-[auto] bg-[linear-gradient(#fdfcfb,#e2d1c3,#e2d1c3)]">
            <h1 style={{textAlign:"center",fontSize:"200%"}}>Forgot Password</h1>
            <div className={windowWidth > 800 ? "w-[100%] h-[60%] flex flex-row" : "w-[100%] h-[auto] flex flex-col-reverse" }>
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

export default CHANGE

import NAVBAR from "./nav";
import {useEffect,useState} from "react"
import { useNavigate  } from "react-router-dom"
import Swal from "sweetalert2";
import MOBILE from "./mobileBar";
const SIGNIN = () => {

    const [loading, setLoading] = useState(false)
    const [form,setForm] = useState({username:"",password:""})
    const router = useNavigate()
    const [windowWidth, setWindowWidth] = useState(0);
    const api_url = process.env.REACT_APP_api_url

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
        const response = await fetch(`${api_url}/user/signin`, {
          method: "POST",
          credentials: "include",
          body:JSON.stringify({
            username:form.username,
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

        console.log(message)
        router("/");
      }catch(error){
        console.log(error)
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
            <div className={`${windowWidth > 800 ? "w-[80%] h-[100%]  ml-[20%]" : "w-[100%] h-[auto]" }`}>
                <img src="/image/footer3.png"  alt="https://late-developers.com" 
                className={`w-[60%] mx-[20%]`}/>
                <div style={{width:"100%",textAlign:"center",color:"#000",display:"grid",justifyItems:"center"}}>
                    <div style={{width:"45%"}}>
                        <form 
                            onSubmit={(e) => handleSubmit(e)} style={{width:"100%"}}
                        >
                        <fieldset>
                            <input
                              type="email"
                              placeholder="username"
                              value={form.username}
                              style={{width:"100%",height:"60px",borderBottom:"1px solid #ccc"}}
                              name="username"
                              onChange={(e) => setForm(() => ({...form, [e.target.name] : e.target.value}))}
                            />
                        </fieldset>
                        <fieldset>
                            <input
                            type="password"
                            placeholder="Password"
                            value={form.password}
                            style={{width:"100%",height:"60px",borderBottom:"1px solid #ccc"}}
                            name="password"
                            onChange={(e) => setForm(() => ({...form, [e.target.name]:e.target.value}))}
                            />
                        </fieldset>

                        <button 
                            type="submit"
                            disabled={loading}
                            style={{width:"50%",margin:"0.5%",height:"60px",background:"#000",color:"#fff"}}
                            >
                            {loading ? "signing in...":"Login"}
                        </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default SIGNIN
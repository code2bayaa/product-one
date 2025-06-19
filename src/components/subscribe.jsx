import NAVBAR from "./nav";
import MOBILE from "./mobileBar";
import { useEffect, useState, useRef } from "react";
import SOCKETS from "../midlleware/sockets";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import Swal from "sweetalert2";
import {useNavigate} from "react-router-dom"

const SUBSCRIBE = () => {

    const [windowWidth,setWindowWidth] = useState(0)
    const [payment, setPayment] = useState(null)
    const [loading, setLoading] = useState({paypal:false,mpesa:false})
    const [credits, setCredits] = useState(1500);
    const modalRef = useRef(null);
    const [usd, setUsd] = useState(1);
    const router = useNavigate()
   const initialOptions = {

        "client-id":process.env.REACT_APP_environment === "development" ? process.env.REACT_APP_paypal_sandbox_client: process.env.REACT_APP_paypal_live_client,

        // "enable-funding": "venmo",

        "disable-funding": "",

        "buyer-country": "US",

        currency: "USD",

        "data-page-type": "product-details",

        components: "buttons",

        "data-sdk-integration-source": "developer-studio",

    };
    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };
        window.addEventListener("resize", handleResize);
        handleResize(); // Call it once to set the initial value
    },[])

    // Update USD when credits change and vice versa
    const handleCreditsChange = (e) => {
        let val = parseInt(e.target.value) || 0;
        // Ensure minimum credits is 1500
        if (val < 1000) val = 1000;
        setCredits(val);
        setUsd((val / 1000).toFixed(2));
    };
    const handleUsdChange = (e) => {
        let val = parseFloat(e.target.value) || 0;
        // Ensure minimum USD is 1
        if (val < 1) val = 1;
        setUsd(val);
        setCredits(Math.round(val * 1000));
    };

    const payWithMPESA = async() => {

        try{
            setLoading({...loading,mpesa:true})
            const res = await fetch(process.env.REACT_APP_init_mpesa,{
                credentials: "include",
                method:"POST",
                body : JSON.stringify({
                    total:Math.ceil(usd * 100)
                    // total:1.00 //testing
                }),
                headers: {
                    'Content-Type': 'application/json', // Indicates the body is JSON
                },
            });

            const {status, data, message} = await res.json()

            if(!status || data.ResponseCode !== "0"){
                setLoading({...loading,mpesa:false})
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: message,
                    showConfirmButton: false,
                    timer: 2500
                })
                return false
            }
            //start socket io
            console.log(data)

            setPayment("mpesa")
            //open model to wait for payment success
            modalRef.current?.showModal();

            SOCKETS.connect().then(socket => {
                socket.emit("user", data.MerchantRequestID)
                socket.on("callback", async({data}) => {
                    //check if payment was cancelled
                    console.log(data)
                    if(data.ResultCode !== 0){
                        Swal.fire({
                            icon: 'error',
                            title: 'Oops...',
                            text: message,
                            showConfirmButton: false,
                            timer: 2500
                        })
                        setLoading({...loading,mpesa:false})
                        modalRef.current?.close()
                        socket.emit("destroy", data.MerchantRequestID);
                        return null
                    }
                    Swal.fire({
                        icon: 'success',
                        title: 'confirmed',
                        text: "success",
                        showConfirmButton: false,
                        timer: 2500
                    })
                    socket.emit("destroy", data.MerchantRequestID);
                    //include app pay
                    runPurchase({success:data.ResultDesc,payment:"mpesa",data:{...data,app:"uko"}})
                    
                })
            })

        }catch(error){
            console.log(error,error.message,"error")
            setLoading({...loading,mpesa:false})
        }

    }

    const runPurchase = async({data,payment}) => {
        console.log("running purchase...")
        //insert payment
        const res = await fetch(process.env.REACT_APP_payment,{
            credentials: "include",
            method:"POST",
            body : JSON.stringify({
                data,
                payment
            }),
            headers: {
                'Content-Type': 'application/json', // Indicates the body is JSON
            },
        });

        const {status,message} = await res.json()
        console.log(status,"status",message,"message")
        if(!status){
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: message,
                showConfirmButton: false,
                timer: 2500
            })
        }

        console.log("include credits")
        //include credits
        const response = await fetch(process.env.REACT_APP_add_user_credits,{
            credentials: "include",
            method:"POST",
            body : JSON.stringify({
                data,
                credit:credits
            }),
            headers: {
                'Content-Type': 'application/json', // Indicates the body is JSON
            },
        });

        const creditBlock = await response.json()
        console.log(creditBlock?.status,"status")
        if(!creditBlock.status){
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: creditBlock?.message,
                showConfirmButton: false,
                timer: 2500
            })
        }

        setLoading({...loading,mpesa:false,paypal:false})
        modalRef.current?.close()
        router("/")
    }
    const payWithPayPal = async() => {
        setLoading({...loading,paypal:true})
        const res = await fetch(process.env.REACT_APP_api_url,{credentials: "include"})
        const {status,message} = await res.json()
        console.log(message)
        if(status){
            setPayment("paypal")
            modalRef.current?.showModal();
        }else{
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text:message,
                showConfirmButton: false,
                timer: 2500
            })
        }

    }
    //1500 === $1
    return (
        <div className="w-[100%] h-[100%] overflow-hidden text-white flex flex-row flex-wrap" style={{background:"url(/image/grey.jpg)"}}>
            {
                windowWidth > 800 ? 
                    <div className="w-[20%] absolute h-[100%] border-r-[3px] border-[#2E2E3A]" style={{background:"linear-gradient(85deg, #0d0d0d, rgba(0,0,0,0.75), #000, #0f111a)"}}>
                        <NAVBAR/>
                    </div>
                :
                    <MOBILE/>
            }
            <div className={`flex text-center justify-center items-center ${windowWidth > 800 ? "w-[80%] h-[100%]  ml-[20%]" : "w-[100%] h-[auto]" }`}>
                <div className="bg-[#18181c] rounded-lg shadow-lg p-8 max-w-md w-full flex flex-col items-center">
                    <h2 className="text-2xl font-bold mb-4 text-[#ffd800]">Subscribe with Credits</h2>
                    <p className="mb-4 text-center">1 USD = <span className="font-bold">1500 credits</span></p>
                    <div className="flex flex-col gap-4 w-full">
                        <label className="flex flex-col text-left">
                            <span>Credits</span>
                            <input
                                type="number"
                                min="1500"
                                step="1500"
                                value={credits}
                                onChange={handleCreditsChange}
                                className="mt-1 p-2 rounded bg-[#222] text-white border border-[#444]"
                            />
                        </label>
                        <label className="flex flex-col text-left">
                            <span>USD</span>
                            <input
                                type="number"
                                min="1"
                                step="0.01"
                                value={usd}
                                onChange={handleUsdChange}
                                className="mt-1 p-2 rounded bg-[#222] text-white border border-[#444]"
                            />
                        </label>
                    </div>
                    <div className="mt-8 w-full flex flex-col gap-4">
                        <button
                            type="button"
                            disabled={loading.mpesa}
                            onClick={() => payWithMPESA()}
                            className="w-full text-center bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition"
                        >
                            Pay via Mpesa
                        </button>
                        <button
                            type="button"
                            disabled={loading.paypal}
                            onClick={() => payWithPayPal()}
                            className="w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition"
                        >
                            Pay via Paypal
                        </button>
                    </div>
                </div>
                <dialog ref={modalRef} className="rounded-lg p-6 bg-white shadow-xl w-[80%] text-center">
        {
            payment === "mpesa" ?
                <>
                    <div className="flex justify-between items-center border-b pb-2 mb-4">
                        <h2 className="text-lg font-semibold">MPESA PAYMENT</h2>
                        {/* <Image src = {load} alt="late-developers" className="w-[30%] object-contain"/> */}

                    </div>
                    <p className="mb-4">The payment prompt is sent to your phone.</p>
                    <p className="mb-4">Enter PIN number</p>
                    <p className="mb-4">Then wait for confirmation</p>
                </>
            :
                payment === "paypal" ?
                    <>
                        <div className="flex justify-between items-center border-b pb-2 mb-4 w-[100%]">
                            <h2 className="text-lg font-semibold text-center">PAYPAL PAYMENT</h2>
                            <button
                                className="text-gray-700 text-2xl font-bold ml-auto"
                                onClick={() => {
                                    modalRef.current?.close();
                                    setPayment(null);
                                    setLoading({...loading,paypal:false})
                                }}
                                aria-label="Close"
                                type="button"
                            >
                                &times;
                            </button>
                        </div>
                        <PayPalScriptProvider options={initialOptions}>

                            <PayPalButtons

                                style={{

                                    shape: "pill",

                                    layout: "vertical",

                                    color: "gold",

                                    label: "pay",

                                }} 

                                createOrder={async () => {

                                    try {

                                        const response = await fetch(process.env.REACT_APP_init_paypal_orders, {
                                            method: "POST",
                                            credentials: "include",
                                            headers: {
                                                "Content-Type": "application/json",
                                            },
                                            body: JSON.stringify({
                                                amount:usd.toString(),
                                                cart: [
                                                    {
                                                        id: "uko_credits",
                                                        quantity: credits,
                                                    },
                                                ],
                                            }),

                                        });
                                        const orderData = await response.json();
                                        console.log(orderData,"orderData")
                                        if (orderData && orderData.id) {
                                            return orderData.id;
                                        } else {
                                            const errorDetail = orderData?.details?.[0];
                                            const errorMessage = errorDetail
                                                ? `${errorDetail.issue} ${errorDetail.description} (${orderData.debug_id})`

                                                : JSON.stringify(orderData);
                                            Swal.fire({
                                                icon: 'error',
                                                title: 'Oops...',
                                                text: errorMessage,
                                                showConfirmButton: false,
                                                timer: 2500
                                            })
                                            throw new Error(errorMessage);

                                        }

                                    } catch (error) {

                                        console.error(error);
                                        Swal.fire({
                                            icon: 'error',
                                            title: 'Oops...',
                                            text: error,
                                            showConfirmButton: false,
                                            timer: 2500
                                        })
                                        throw error;
                                    }

                                }} 
                                onApprove={async (data, actions) => {
                                    try {
                                        // console.log(data,"approve data")
                                        const response = await fetch(process.env.REACT_APP_init_paypal_capture,
                                            {
                                                method: "POST",
                                                headers: {
                                                    "Content-Type": "application/json",
                                                },
                                                body : JSON.stringify({
                                                    orderID:data.orderID
                                                })

                                            });
                                            
                                        const orderData = await response.json();
                                        // console.log(orderData,"approve order data")

                                        const errorDetail = orderData?.details?.[0];
                                        if (errorDetail?.issue === "INSTRUMENT_DECLINED") {
                                            return actions.restart();
                                        } else if (errorDetail) {
                                            throw new Error(
                                                `${errorDetail.description} (${orderData.debug_id})`
                                            );

                                        } else {
                                            const transaction = orderData.jsonResponse.purchase_units[0].payments.captures[0];
                                                    
                                            runPurchase({success:`Transaction ${transaction.status}: ${transaction.id}`,payment:"paypal", data:{...orderData,app:"uko"}})

                                        }

                                    } catch (error) {
                                        Swal.fire({
                                            icon: 'error',
                                            title: 'Oops...',
                                            text: `Sorry, your transaction could not be processed...${error.message}`,
                                            showConfirmButton: false,
                                            timer: 2500
                                        })
                                        console.error(error);

                                    }

                                }} 

                            />

                            </PayPalScriptProvider>
                        </>
                    :
                        ""
                        
                    }

                </dialog>
            </div>
        </div>
    )
}

export default SUBSCRIBE
import SOCKETS from "../midlleware/sockets"
import { useEffect } from "react"

const TESTSOCKETS = () => {

    useEffect(() => {
        SOCKETS.connect().then(socket => {
            socket.emit("user", "BRIAN")
            socket.on("callback", async data => {
                //check if payment was cancelled
                console.log(data)
                
            })
        })


    },[])
    return (
        <>
        <h2>HELLO SOCKETS</h2>
        </>
    )
}

export default TESTSOCKETS
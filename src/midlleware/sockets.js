import { io } from "socket.io-client"


const SOCKETS = new (function(){
    this.socketModule = null
    this.connect = async() => {
        this.socketModule = await new Promise((resolve) => {
            resolve(io(process.env.SOCKET_API))
        });

        return this.socketModule
    }
    this.disconnect = async() => {
        if (this.socketModule) {
            if (!this.socketModule.connected) {
                this.socketModule.disconnect()
            }
            console.log('Socket disconnected');
        }
    }
    this.socketConnect = () => {
        if(this.socketModule) {
            if (!this.socketModule.connected) {
                this.socketModule.connect()
            }
        }
    }
    this.checkSocket = (data) => {
        if(this.socketModule) {
            this.socketModule.emit('in', data.portal, (isInGroup) => {
                console.log(data)
                console.log(isInGroup)
                if (isInGroup) {
                    // this.socketResponse = true;
                    return true;
                } else
                    return false;

            });
        }
        return false;
    }
})()

export default SOCKETS
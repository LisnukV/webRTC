const http = require("http")
const Socket = require("websocket").server
const server = http.createServer(()=>{})

server.listen(3000,()=>{
    
})

const webSocket = new Socket({httpServer:server})

const users = []

webSocket.on('request',(req)=>{
    const connection = req.accept()
   

    connection.on('message',(message)=>{
        const data = JSON.parse(message.utf8Data)
        console.log(data);
        const user = findUser(data.name)
       
        switch(data.type){
            case "store_user":
                if(user !=null){
                    //our user exists
                    connection.send(JSON.stringify({
                        type:'user already exists'
                    }))
                    return

                }

                const newUser = {
                    name:data.name, conn: connection
                }
                users.push(newUser)

                webSocket.connections.forEach(function each(client) {
                    client.send(JSON.stringify({
                        type: "server_working", data: "ON"
                    }));
                });

            break

            case "start_call":
                let userToCall = findUser(data.target)

                if(userToCall){
                    console.log("start_call - SEND");
                    connection.send(JSON.stringify({
                        type:"call_response", data:"user is ready for call"
                    }))
                } else{
                    connection.send(JSON.stringify({
                        type:"call_response", data:"user is not online"
                    }))
                }

            break
            
            case "create_offer":
                let userToReceiveOffer = findUser(data.target)

                if (userToReceiveOffer){
                    userToReceiveOffer.conn.send(JSON.stringify({
                        type:"offer_received",
                        name:data.name,
                        data:data.data.sdp
                    }))
                }
            break
                
            case "create_answer":
                let userToReceiveAnswer = findUser(data.target)
                if(userToReceiveAnswer){
                    userToReceiveAnswer.conn.send(JSON.stringify({
                        type:"answer_received",
                        name: data.name,
                        data:data.data.sdp
                    }))
                }
            break

            case "ice_candidate":
                let userToReceiveIceCandidate = findUser(data.target)
                if(userToReceiveIceCandidate){
                    userToReceiveIceCandidate.conn.send(JSON.stringify({
                        type:"ice_candidate",
                        name:data.name,
                        data:{
                            sdpMLineIndex:data.data.sdpMLineIndex,
                            sdpMid:data.data.sdpMid,
                            sdpCandidate: data.data.sdpCandidate
                        }
                    }))
                }
            break


//////////////////////////////////
            case "send_stop":

            webSocket.connections.forEach(function each(client) {
                client.send(JSON.stringify({
                    type: "received_stop", data: "stop"
                }));
            });
            break

            case "send_light":
            webSocket.connections.forEach(function each(client) {
                client.send(JSON.stringify({
                    type: "received_light", data: "light"
                }));
            });
            break

            case "send_back":
            webSocket.connections.forEach(function each(client) {
                client.send(JSON.stringify({
                    type: "received_back", data: "back"
                }));
            });
            break

            case "send_forvard":
            webSocket.connections.forEach(function each(client) {
                client.send(JSON.stringify({
                    type: "received_forvard", data: "forvard"
                }));
            });
            break



case "send_left":
// Broadcast всем подключенным клиентам
webSocket.connections.forEach(function each(client) {
    client.send(JSON.stringify({
        type: "received_left", data: "left"
    }));
});

break;

case "send_right":
// Broadcast всем подключенным клиентам
webSocket.connections.forEach(function each(client) {
    client.send(JSON.stringify({
        type: "received_right", data: "right"
    }));
});

break;

case "send_cameraleft":
// Broadcast всем подключенным клиентам
webSocket.connections.forEach(function each(client) {
    client.send(JSON.stringify({
        type: "received_cameraleft", data: "cameraleft"
    }));
});

break;

case "send_cameraright":
// Broadcast всем подключенным клиентам
webSocket.connections.forEach(function each(client) {
    client.send(JSON.stringify({
        type: "received_cameraright", data: "cameraright"
    }));
});

break;

case "send_speed":
const speed = data.data;
webSocket.connections.forEach(function each(client) {
    client.send(JSON.stringify({
        type: "send_speed", data: speed
    }));
});

break;
////////////////////////////////////
case "send_one":

webSocket.connections.forEach(function each(client) {
    client.send(JSON.stringify({
        type: "received_one", data: "one"
    }));
});
break

case "send_two":

webSocket.connections.forEach(function each(client) {
    client.send(JSON.stringify({
        type: "received_two", data: "two"
    }));
});
break
        
       
        }

    })
    
    connection.on('close', () =>{
        users.forEach( user => {
            if(user.conn === connection){
                users.splice(users.indexOf(user),1)
            }
        })
    })





})

const findUser = username =>{
    for(let i=0; i<users.length;i++){
        if(users[i].name === username)
        return users[i]
    }
}
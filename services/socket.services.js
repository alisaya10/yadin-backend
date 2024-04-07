const connectionModel = require("../models/connectionModel");
const { checkToken } = require("../security");
// const sockets = require("../socket");
const { getRequestInfo } = require("../utils/useful");
const { usersSessionUpdater } = require("./users.services");
const jwt = require('jsonwebtoken')

function uSocketConnected(socket) {

    getRequestInfo(socket.handshake, (requestInfo) => {
        
        // console.log(socket.id)
        
        checkToken(socket.handshake.headers, (userClaimedInfo, tokenErr) => {

                if (tokenErr) {
                    forceLogout(socket)
                    return
                }
                usersSessionUpdater(userClaimedInfo, { info: requestInfo }, (session, sessionErr) => {
                    
                    if (sessionErr) {
                        forceLogout(socket)
                        return
                    }
                    
                    if (session.user) {
                        // console.log("JOINED USER : " + session.user)
                        socket.user = session.user
                        socket.join(session.user);

                        // setTimeout(() => {

                        // console.log(session.user)
                        // UIO.emit('message', "GLOBAL EMIT")


                        // const client = UIO.sockets.sockets.get(socket.id);

                        // if (client) {
                        //     client.emit('message', "GLOBAL!!!! EMIT", (msg) => {
                        //         console.log(msg)
                        //     })
                        // }

                        // let info = TIO.sockets.adapter.rooms.get(session.user)
                        // console.log(info)
                        // console.log(typeof UIO.sockets.sockets)
                        // console.log(Object.values(UIO.sockets.sockets))

                        // }, 2000);
                        //(socket.id).emit('message', "GLOBAL11 EMIT");
                        // UIO.in(socket.id).emit('message', "EMIT EMIT", () => {
                        //     console.log("TEST")
                        // })

                    }
                    // console.log("session")
                    // console.log(session)



                })
            })

        })
        // console.log("a user connected :D");
        // console.log(socket.handshake.headers.authorization)
        // console.log(socket.id)

}

function uSocketDisconnected(socket) {

    // console.log("a user DISCONNECTED");
    // console.log(socket)

}



function subscribeTopic(socket, msg, cb) {

    // console.log("subscribeTopic")
    // console.log(msg.type)
    // console.log(msg.id)

    let object = { user: socket.user, removed: false }

    if (msg.type == 'things') {
        object.tTarget = msg.id
    }
    // connectionModel.findOne(object).then((connection) => {
    // if (connection) {
    socket.join(msg.type + '-' + msg.id);
    // }
    // }).catch(() => {})

    // console.log("Subscribe " + msg.type + '-' + msg.id);
    // console.log(socket)

}



function subscribeVisitor(socket, msg, cb) {

    console.log("msg")
    console.log(msg)

    jwt.verify(msg.token, process.env.JWT_KEY, function(err, tokenInfo) {

        if (err) {
            cb(null, err)
        } else {

            socket.join(msg.type + '-' + tokenInfo.id);
            cb(tokenInfo.id)

        }
    })




}


function unsubscribeTopic(socket, msg, cb) {

    socket.leave(msg.type + '-' + msg.id);
    // console.log("Unsubscribe " + msg.type + '-' + msg.id);

    // console.log("a user DISCONNECTED");
    // console.log(socket)

}





//////////// ******************* Things socket



function tSocketConnected(socket) {

    // console.log(socket.id)
    // console.log(socket.handshake.headers)

    getRequestInfo(socket.handshake, (requestInfo) => {

        // console.log(requestInfo)

        checkToken(socket.handshake.headers, (claimedInfo, tokenErr) => {
            // console.log("checkToken")
            if (tokenErr) {
                forceLogout(socket)
                return
            }
            thingsSessionUpdater(claimedInfo, { info: requestInfo }, (session, sessionErr) => {

                // console.log(session)

                if (sessionErr) {
                    forceLogout(socket)
                    return
                }

                if (session.thing) {
                    // console.log("session.thing")

                    // console.log(session.thing)
                    socket.join(session.thing);
                }
                // console.log("session")
                // console.log(session)

                // sockets.emitTIO('message', "GLOBAL EMIT")

                // TIO.emit('message', { type: "GLOBAL EMIT" })


                // socket.emit('message', { type: "SOCKET EMIT" }, (dataCB) => {
                //     console.log("log :" + dataCB)
                // })

                // console.log("session.thing")
                // console.log(session.thing)

                if (session.thing) {
                    // TIO.to(session.thing).emit('message', { type: "ROOM EMIT" })

                    // console.log("GATEWAY :" + session.thing)

                    // const clients = TIO.sockets.adapter.rooms.get(session.thing);
                    // console.log("CLIENTS")
                    // console.log(clients)

                    // clients.forEach(client => {
                    //     TIO.to(client).emit('message', { type: "GOT FROM ROOM EMIT" })

                    // });

                    // var roster = TIO.sockets.clients(session.thing);
                    // console.log(roster)

                }
            })
        })
    })

    // console.log("a THING connected :D");
    // console.log(socket.handshake.headers.authorization)
    // console.log(socket.id)
}

function tSocketDisconnected(socket) {

    console.log("a THING DISCONNECTED");
    // console.log(socket)
}



function forceLogout(socket) {
    if (socket) {
        socket.emit('logout', (result) => {
            // console.log(result)
        })
    }
}



function socketSecurity() {



}



module.exports = {
    uSocketConnected,
    uSocketDisconnected,
    tSocketConnected,
    tSocketDisconnected,
    subscribeTopic,
    unsubscribeTopic,
    subscribeVisitor
}
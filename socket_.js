var express = require('express');
// const { checkToken } = require('./scripts/security');
// const messageModel = require('./models/messageModel');
// const messengerModel = require('./models/messengerModel');
const http = require('http');
const { USOCKETPORT } = require('./variables');

// let server
// let io


// function test(params) {
//     console.log("TEST")
// }


var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type Authorization');
    res.header("Access-Control-Allow-Headers", 'Origin, X-Requested-With, Content-Type,Authorization, Accept');
    next();
}



function initSocket() {


    // server = http.createServer();
    var app = express();
    app.use(allowCrossDomain);

    // server = require("http").createServer(app);
    // server = require("http").createServer();


    const server = require('http').createServer(app);
    // const io = require('socket.io')(server);

    // console.log("SOCKET: " + USOCKETPORT)


    // io = require("socket.io").listen(server, {
    const io = require("socket.io")(server, {
        // 'path': '/socket.io',
        upgradeTimeout: 15000,
        cors: {
            origin: "*",
        },
        // pingInterval: 60000,
        // // wsEngine: 'ws',
        // // 'transports': ['websocket', 'polling'],
        // handlePreflightRequest: (req, res) => {
        //     const headers = {
        //         "Access-Control-Allow-Headers": "Content-Type, Authorization, authorization",
        //         "Access-Control-Allow-Origin": req.headers.origin, //or the specific origin you want to give access to,
        //         "Access-Control-Allow-Credentials": true
        //     };
        //     res.writeHead(200, headers);
        //     res.end();
        // },
        // origins: '*:*',


        // cors: {
        //     origins: '*:*'
        //         // origin: "http://localhost:3001",
        //         // credentials: true
        // }
    });


    // io.origins(["http://localhost:3000", "http://localhost:3001"]);


    // console.log("HEREEEE")
    // io.set('heartbeat timeout', 1000);
    // io.set('heartbeat interval', 2000);
    // io.set('heartbeat timeout', 60000);
    // io.set('heartbeat interval', 60000);

    // io.heartbeatTimeout = 60000;
    io.on('connection', socket => {
        // console.log("a user connected :D");

        // console.log("WELCOME")
        // io.emit("test", "WELCOME");


        // console.log(socket.handshake.headers.authorization)
        // console.log("TP1")
        // console.log(socket.id)
        // console.log("TP2")

        // io.to(socket.id).emit("test", { success: true })


        // // io.to(socket.id).emit("test", { success: true })
        // // io.to(socket).emit("test", { success: true })

        // setInterval(() => {
        //     socket.emit('test', { success: true })

        // }, 1000);
        // console.log("DONE")
        // checkToken(socket.handshake, null, (auth) => {
        //     if (!auth.id) {
        //         socket.disconnect(true)
        //     } else {
        //         // console.log(auth.id)
        //         socket.userId = auth.id
        //         socket.join(auth.id);
        //         socket.messengers = {}
        //     }
        // })

        // setInterval(() => {
        //     socket.emit("hello", { a: "b", c: [] });
        // }, 60000);



        // socket.on("heartbeat", (msg, ucb) => {
        //     console.log(msg)
        //     console.log("heartbeat")
        //     socket.emit('test', { success: true })
        //     console.log(ucb)
        //     ucb("OK")
        //         // io.to(socket.id).emit("test", { success: true })


        // })

        socket.on("messageSeen", (data) => {
            // data.userId = socket.userId
            // checkMessageSecurity(socket, data, (secure, err) => {
            //     if (secure) {
            //         messageSeen(socket, data)
            //     }
            // })
        })

        socket.on("messegerSeenUpdate", (data) => {
            // messengerUpdateSeen(socket, data)
        })

        socket.on("message", (msg, userCB) => {

            // console.log(io.sockets.adapter.rooms[socket.userId])

            // console.log('---------')
            // console.log(msg);

            // if (socket.userId == msg.userId) {

            checkMessageSecurity(socket, msg, (secure, err) => {
                // if (secure) {
                //     // console.log("SECIRITY OK")

                //     addMessage(msg, (createdMessage, messageErr) => {
                //         if (messageErr) {
                //             // console.log("MESSAGE ERR")
                //             // console.log(messageErr)
                //             userCB(null, 'Unauthorized')
                //         } else {
                //             // console.log("MESSAGE OK")
                //             userCB(createdMessage._id)
                //             sendMessageForOtherUsers(socket, createdMessage)
                //         }

                //     })
                // } else {
                //     // console.log("SECIRITY ERR")
                //     userCB(null, 'Unauthorized')
                // }
            })


            // console.log(socket.);

            // io.emit("message", msg);
        });

        socket.on('online', () => {
            console.log("Socket Online");
        })

        socket.on("disconnect", socket => {
            console.log(" user disconnected :(");
            console.log(socket)

            // disconnected = true

        });

        socket.on("connect_error", (err) => {
            console.log(`connect_error due to ${err.message}`);
        });


    });


    server.listen(USOCKETPORT)


}



// function messageSeen(socket, data) {
//     console.log("SEEN UPDATE")

//     messageModel.updateOne({ _id: data.messageId }, {
//         status: 2,
//         uDate: new Date()
//     }).then(doc => {
//         console.log(doc)
//     }).catch(err => {})

//     let messenger = socket.messengers[data.messengerId]

//     messenger.participants.forEach(participant => {
//         if (participant !== socket.userId) {
//             if (io.sockets.adapter.rooms[participant]) {
//                 io.to(participant).emit("messageSeen", data)
//             } else {
//                 console.log("USER IS OFFLINE")
//             }
//         }
//     });

// }


// function messengerUpdateSeen(socket, data) {

//     let userId = socket.userId
//     console.log("UPDATE")
//     messengerModel.updateOne({
//         _id: data.messengerId,
//         $or: [{
//             ["lastSeen." + [userId]]: { $lt: data.messageId }
//         }, {
//             ["lastSeen." + [userId]]: null
//         }]
//     }, {
//         ["lastSeen." + [userId]]: data.messageId
//     }, { new: true }).then(doc => {
//         console.log("UPDATED")
//             // console.log(socket.messageId)

//         console.log(doc)
//             // cb(messenger)
//     }).catch(err => {
//         console.log(err)
//             // cb(null, err)
//     })

// }



// function sendMessageForOtherUsers(socket, message) {

//     // console.log("sendMessageForOtherUsers")
//     let messenger = socket.messengers[message.messengerId]
//         // console.log(socket.messengers)
//         // console.log(messenger)
//     messenger.participants.forEach(participant => {
//         if (participant !== socket.userId) {
//             if (io.sockets.adapter.rooms[participant]) {
//                 console.log(io.sockets.adapter.rooms[participant])
//                     // USER IS ONLINE
//                     // console.log("USER IS ONLINE")

//                 // io.to(participant).emit("newMessage", message, (acknowledge) => {
//                 //     console.log(acknowledge)
//                 // });
//                 // console.log("EMIT TO: " + participant)
//                 io.to(participant).emit("newMessage", message)
//             } else {
//                 console.log("USER IS OFFLINE")
//                     // USER IS OFFONLINE
//             }
//         }
//     });

// }



function checkMessageSecurity(socket, msg, cb) {

    // console.log("checkMessageSecurity")

    if (socket.userId == msg.userId) {
        if (!socket.messengers || !socket.messengers[msg.messengerId]) {
            getMessenger(msg, (messenger, messengerErr) => {

                if (messengerErr) {
                    cb(false)
                } else {
                    if (Array.isArray(messenger.participants) && messenger.participants.indexOf(msg.userId) != -1) {
                        if (!socket.messengers) {
                            socket.messengers = {}
                        }
                        socket.messengers[msg.messengerId] = messenger
                        cb(true)
                    } else {
                        cb(false)
                    }
                }

            })
        } else {
            cb(true, socket.messengers[msg.messengerId])
        }

    } else {
        cb(false)
    }
}



function getMessenger(msg, cb) {
    messengerModel.findOne({ _id: msg.messengerId }).then(messenger => {
        cb(messenger)
    }).catch(err => {
        cb(null, err)
    })
}



function addMessage(rawMessage, cb) {
    let message = rawMessage
        // message.messengerId = messengerId
        // message.userId = userId
    let now = new Date()
    message.cDate = now
    message.uDate = now
    message.status = 1


    messageModel.create(message).then(doc => {
        cb(doc)
    }).catch(err => cb(null, err))

    messengerModel.updateOne({ _id: message.messengerId }, {
        uDate: now
    }).then(() => {
        // cb(doc)
    }).catch(err => cb(null, err))
}






module.exports = {
    initUSocket,
    initTSocket,
    UIO: UIO,
    TIO: TIO
}
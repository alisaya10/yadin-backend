var express = require('express');
// const { checkToken } = require('./scripts/security');
// const messageModel = require('./models/messageModel');
// const messengerModel = require('./models/messengerModel');
const http = require('http');
const { uSocketConnected, uSocketDisconnected, tSocketConnected, tSocketDisconnected, subscribeTopic, unsubscribeTopic, subscribeVisitor } = require('./services/socket.services');
const { USOCKETPORT, TSOCKETPORT, REDISADDRESS } = require('./variables');
const redis = require("socket.io-redis");
const { uSocketSendMessage, uSocketCreateMesseger, uSocketMessageSeen } = require('./routes/messenger');



var allowCrossDomain = function (req, res, next) {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type Authorization');
    res.header("Access-Control-Allow-Headers", 'Origin, X-Requested-With, Content-Type,Authorization, Accept');
    next()
}



function initUSocket() {
    console.log('initUSocket')
    var app = express();
    app.use(allowCrossDomain);
    const server = require('http').createServer(app);

    console.log("USOCKET: " + USOCKETPORT)

    global.UIO = require("socket.io")(server, {
        'path': '/users',
        upgradeTimeout: 15000,
        cors: {
            origin: "*",
        },

    });

    UIO.adapter(redis(REDISADDRESS));

    UIO.on('connection', socket => {

        uSocketConnected(socket)

        // socket.on("message", (msg, cb) => {
        //     uSocketMessage(socket, msg, cb)
        // });

        socket.on("sendMessage", (msg, cb) => {
            uSocketSendMessage(socket, msg, cb)
        });
        socket.on("createMesseger", (msg, cb) => {
            uSocketCreateMesseger(socket, msg, cb)
        });
        socket.on("messageSeen", (msg, cb) => {
            uSocketMessageSeen(socket, msg, cb)
        })
        socket.on("checkIfMessengerExists", (msg, cb) => {
            uSokcetCheckIfMessengerExists(socket, msg, cb)
        })

        socket.on("disconnect", socket => {
            uSocketDisconnected(socket)
        });

        socket.on("subscribeTopic", (msg, cb) => {
            subscribeTopic(socket, msg, cb)
        });

        socket.on("subscribeVisitor", (msg, cb) => {
            subscribeVisitor(socket, msg, cb)
        });

        socket.on("unsubscribeTopic", (msg, cb) => {
            unsubscribeTopic(socket, msg, cb)
        });


        


    });
    server.listen(USOCKETPORT)
}







function initTSocket() {

    var app = express();
    app.use(allowCrossDomain);
    const server = require('http').createServer(app);

    console.log("TSOCKET: " + TSOCKETPORT)

    global.TIO = require("socket.io")(server, {
        'path': '/things',
        upgradeTimeout: 15000,
        cors: {
            origin: "*",
        },

    });

    TIO.on('connection', socket => {

        tSocketConnected(socket)

        socket.on("message", (msg, userCB) => {

        });

        socket.on("disconnect", socket => {
            tSocketDisconnected(socket)
        });


    });
    server.listen(TSOCKETPORT)
}



module.exports = {

    // UIO: UIO,
    // TIO: TIO,

    // connect: function(server) {
    //     TIO = socketIO(server);
    // },

    // emitUIO: (event, values) => {
    //     console.log("HERE")
    //     if (UIO) {
    //         UIO.emit(event, values);
    //     }
    // },


    // emitTIO: (event, values) => {
    //     console.log("HERE")
    //     if (TIO) {
    //         TIO.emit(event, values);
    //     }
    // },

    initUSocket,
    initTSocket,

}
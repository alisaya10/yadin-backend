const jwt = require('jsonwebtoken')
const { ObjectId } = require('mongodb');
const { adminsSessionUpdater } = require('./services/admins.services');
const { usersSessionUpdater } = require('./services/users.services');


exports.decodeApiHash = (req, res, next) => {
    req.body = req.body
    next()
}


exports.requestAnalyzer = (request, securityRef, cb) => {


    let extra = request ? request : {}


    extra.route = request.body.route

    if (extra.info) {


        this.checkToken(request.headers, (userClaimedInfo, err) => {



            let sessionUpdater = usersSessionUpdater

            if (request.info.type == 'admin') {
                sessionUpdater = adminsSessionUpdater
            }

            // console.log(sessionUpdater)


            sessionUpdater(userClaimedInfo, extra, (session, sessionErr) => {

                // console.log(session)

                if (sessionErr) {
                    console.log("sessionErr")
                    cb(null, true)
                } else {
                    this.checkSecurity(request, securityRef, session, userClaimedInfo, (security, err) => {
                        // console.log("error", err)
                        if (err) {
                            // console.log(err)
                            console.log("SECURITY ERR")
                            cb(null, true)
                        } else {
                            // console.log("PASSED SECURITY")
                            // console.log(security)
                            extra.security = security
                            extra.session = session
                            cb(extra)
                        }
                    })

                }


            })
        })
    } else {
        cb(null, true)
    }

}


exports.checkSecurity = (request, securityRef, session, userClaimedInfo, cb) => {

    // console.log("CHECKED SECURITY")
    let securityList = Array.isArray(securityRef) ? securityRef : (securityRef ? [securityRef] : null)
    let isAllowed = true
    let promises = []
    let securityInfo = {}


    console.log(securityList)
    if (securityList) {
        securityList.forEach(security => {

            let securityKey = (typeof security == 'object' ? security.type : security)

            console.log(securityKey)

            if (securityKey === 'token') {
                console.log("session")
                console.log(session)

                // console.log(userClaimedInfo)
                if (!session || !session.user || session.user != userClaimedInfo.id) {
                    isAllowed = false
                }


                // promises.push(new Promise((resolve, reject)=>{

                // }))
                // checkToken(request.headers, (result, err) => {
                //     if (err) { cb(null, err); return }
                //     cb(result)
                // })
            }

            if (securityKey === 'aToken') {

                if (!session || !session.admin || session.admin != userClaimedInfo.id) {
                    isAllowed = false
                }

            }


            if (securityKey === 'roles') {

                isAllowed = false

                if (session.roles) {

                    let roles = (Array.isArray(session.roles) ? session.roles : JSON.parse(session.roles))
                    if (Array.isArray(roles)) {
                        for (let i = 0; i < security.access.length; i++) {
                            const access = security.access[i];
                            if (roles.includes(access)) {
                                isAllowed = true
                            }
                        }
                    }
                }

            }


        });
    }



    // if (security === 'adminToken') {
    //     checkToken(data.headers, (result, err) => {
    //         if (err) { cb(null, err); return }
    //         cb(result)
    //     })
    // }
    // console.log("isAllowed")
    // console.log(isAllowed)

    Promise.all(promises).then(() => {
        if (isAllowed) {
            cb(securityInfo)
        } else {
            cb(null, true)
        }
    }).catch((err) => {
        console.log(err);
        cb(null, true)
    })
    
}


exports.sendResponse = (res, data, status, extra, cb) => {

    let response

    if (extra && extra.routeInfo && extra.routeInfo.response) {
        response = extra.routeInfo.response.type
    }
    if (response == 'json' || !response) {


        simpleJson(res, data, status)
        if (cb) { cb() }
    } else {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: 'Something went wrong' }));
    }
}

exports.sendSomethingWrong = (res) => {
    if (res) {
        res.statusCode = 500;
        // res.setHeader('Content-Type', 'application/json'); //Todo
        res.end(JSON.stringify({ message: '{{lang}}errors.somethingWentWrong' }));
    }
}

exports.sendNotFound = (res) => {
    if (res) {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ message: '{{lang}}errors.notFound' }));
    }
}


exports.sendPermissionDenied = (res) => {

    if (res) {
        res.statusCode = 401;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ message: '{{lang}}errors.permissionDenied' }));
    }
}


function simpleJson(res, data, status, cb) {
    res.statusCode = status;
    // res.setHeader('Content-Type', 'application/json'); //Todo
    res.end(JSON.stringify(data))
}


exports.checkToken = (headers, next) => {

    const header = headers["authorization"];
    if (typeof header !== 'undefined' && header !== 'undefined' && header != '') {
        bearer = header.split(" ");
        if (bearer[1] && Array.isArray(bearer) && bearer[1] != 'null' && bearer[1] != 'undefined') {
            token = bearer[1];
            // console.log(token)
            jwt.verify(token, process.env.JWT_KEY, function (err, data) {

                if (err) {
                    console.log(err)
                    // req.id = null
                    next(null, '{{lang}}errors.tokenNotVerified}}')
                } else {
                    // console.log("TOKEN OK")
                    // console.log(data)
                    // console.log({ id: data.id, type: data.type, cDate: data.cDate, token })

                    next({ id: data.id, type: data.type, cDate: data.cDate, token })
                }
            })
        } else {
            // next(null, '{{lang}}errors.tokenNotVerified}}')
            next({})

        }

    } else {
        next(null, '{{lang}}errors.tokenNotVerified}}')
    }

}
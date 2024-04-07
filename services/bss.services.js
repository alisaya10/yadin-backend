const connectionModel = require('../models/connectionModel');
const userModel = require('../models/userModel');

const { bssPublisher, bssSubscriber } = require('../variables');

function init() {}

bssSubscriber.subscribe("bss.post.new");
bssSubscriber.subscribe("bss.post.rigram");
bssSubscriber.subscribe("bss.post.message");

bssSubscriber.on("message", function(channel, rawContent) {
    let content = JSON.parse(rawContent)

    if (channel == 'bss.post.new') {
        postNew(content)
    }

    if (channel == 'bss.post.rigram') {
        postRigram(content)
    }

    if (channel == 'bss.post.message') {
        postMessage(content)
    }


})

function postMessage(content) {
    // console.log("postMessage")
    // console.log(content.data.data)
    let bytes = byteLength(JSON.stringify(content.data.data))
    let rate = bytes * 1
        // console.log(rate)
    addBill(rate, content.user, content.data._id, null, 'message', content.isOwner)
}


function postRigram(content) {
    // console.log("postRigram")
    // console.log(content)
    let rate = content.count * 5
    addBill(rate, content.user, null, content.applet, 'automation', content.isOwner)
}


function postNew(content) {

    let bytes = byteLength(JSON.stringify(content.data.data))
    let rate = bytes * 1
    let price = (content.data.price ? content.data.price : 0) * bytes

    addBill(rate, content.user, content.data._id, null, 'receive', content.isOwner)

    connectionModel.find({ tTarget: content.data._id, user: { $ne: null }, isOwner: false, removed: false, status: 'A' }, { 'user': 1 }).populate('user', 'balance').lean().then((docs) => {

        // console.log(docs)
        // console.log(content.data.price)


        let validUsersArray = []
        let invalidUsersArray = []

        for (let i = 0; i < docs.length; i++) {
            const doc = docs[i];
            if (doc.user.balance >= price) {
                validUsersArray.push(doc.user._id)
            } else {
                invalidUsersArray.push(doc.user._id)
            }
        }


        addMultipleBill(rate, [...validUsersArray, ...invalidUsersArray], content.data._id, null, 'send', false)

        if (price) {
            addMultipleBill(price, validUsersArray, content.data._id, null, 'payment', false, 1, content.user)
            addMultipleBill(price, invalidUsersArray, content.data._id, null, 'payment', false, -1, content.user)
                // addBill(doc.user.balance, content.user, content.data._id, null, 'income', false)

            userModel.updateOne({ _id: content.user }, { $inc: { balance: (price * validUsersArray.length) } }).then(() => {}).catch(() => {})

        }

    }).catch(() => {})

    // console.log("BSS - New Data for: " + content.data._id + ' Owner: ' + content.user + " Total bytes: " + bytes);
}






function addMultipleBill(rate, users, device, applet, type, isOwner, status, target) {

    let documents = []
    for (let i = 0; i < users.length; i++) {
        const user = users[i];
        documents.push({ rate, user, device, applet, type, status, target })

    }

    billingModel.insertMany(documents).then(() => {

        let object = { $inc: { balance: (-1 * rate) } }

        userModel.updateMany({ _id: { $in: users } }, object).then(() => {}).catch(() => {})

    }).catch(() => {})
}



function addBill(rate, user, device, applet, type, isOwner, status) {
    billingModel.create({
        rate,
        user,
        device,
        applet,
        type,
        status
    }).then(() => {

        let promises = []
        let object = { $inc: { balance: (-1 * rate) } }

        if (isOwner) {
            promises.push(new Promise((resolve, reject) => {
                userModel.findOne({ _id: user }).then((foundUser) => {

                    if (foundUser.selfBalance >= rate) {
                        object = { $inc: { selfBalance: (-1 * rate) } }
                    }
                    resolve()
                }).catch(() => { reject() })
            }))
        }

        Promise.all(promises).then(() => {

            userModel.findOneAndUpdate({ _id: user }, object, { new: true }).then((newInfo) => {

                UIO.to(user).emit('changebalance', { balance: newInfo.balance, selfBalance: newInfo.selfBalance })

            }).catch(() => {})

        }).catch(() => {

        })

    }).catch(() => {})
}




function byteLength(str) {
    // returns the byte length of an utf8 string
    var s = str.length;
    for (var i = str.length - 1; i >= 0; i--) {
        var code = str.charCodeAt(i);
        if (code > 0x7f && code <= 0x7ff) s++;
        else if (code > 0x7ff && code <= 0xffff) s += 2;
        if (code >= 0xDC00 && code <= 0xDFFF) i--; //trail surrogate
    }
    return s;
}


module.exports = {
    bssInit: init
}
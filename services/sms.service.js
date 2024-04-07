require('dotenv').config()
let accountSid = process.env.TWILIO_ACCOUNT_SID; // Your Account SID from www.twilio.com/console
let authToken = process.env.TWILIO_AUTH_TOKEN; // Your Auth Token from www.twilio.com/console
const client = require('twilio')(accountSid, authToken);


send = (number, text, cb) => {
    console.log("SEND SMS")
    client.verify.services('VAa5365cecf40f504b1125e366fcda4311')
        .verifications
        .create({ to: phoneStandardView(number), channel: 'sms' })
        .then(verification => console.log(verification))
        .catch(err => console.log(err));

    // customCode: text, customCodeEnabled: true
}



verify = (number, text, cb) => {

    console.log("Verify SMS")
    client.verify.services('VAa5365cecf40f504b1125e366fcda4311')
        .verificationChecks
        .create({ to: phoneStandardView(number), code: text })
        .then(verification_check => {
            cb(verification_check.valid)
            console.log(verification_check)
        });

}


function phoneStandardView(number) {
    let phone = number
    if (number) {

        let counter = 0
        while (number[counter] === "0") {
            counter++
        }
        phone = phone.substring(counter, number.length)
        return '+' + phone
    }
}


module.exports = {
    send,
    verify
}
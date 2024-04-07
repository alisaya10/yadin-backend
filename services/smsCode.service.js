var request = require('request-promise');


exports.send = async(number, text, cb) => {
    const tokenKey = await getToken();

    request.post({
        url: 'https://RestfulSms.com/api/VerificationCode',
        headers: {
            'Content-Type': 'application/json',
            'x-sms-ir-secure-token': tokenKey
        },


        body: JSON.stringify({
            "Code": String(text),
            "MobileNumber": number
        })
    }, function(err, ress, body) {
        console.log(err)
        const jres = JSON.parse(body);
        console.log(jres)
        if (cb) {
            cb(jres)
        }
    });
}


async function getToken() {
    let token = '';
    await request.post({
        url: 'http://RestfulSms.com/api/Token',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "UserApiKey": "",
            "SecretKey": ""
        })
    }, function(err, ress, body) {
        console.log(err)
        console.log(body)
        const jres = JSON.parse(body);
        token = jres.TokenKey;
    });

    return token;
}
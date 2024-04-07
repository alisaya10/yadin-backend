var request = require('request-promise');

exports.send = async(number, text, cb) => {
    if (number && number != '') {
        const tokenKey = await getToken();
        let phone = number
        if (number.includes('-')) {
            phone = number.substring(4, number.length)
        }
        let counter = 0
        while (number[counter] == "0") {
            counter++
        }
        phone = phone.substring(counter, number.length)
            // console.log(phone)
        request.post({
            url: 'http://RestfulSms.com/api/MessageSend',
            headers: {
                'Content-Type': 'application/json',
                'x-sms-ir-secure-token': tokenKey
            },
            body: JSON.stringify({
                "Messages": [text],
                "MobileNumbers": [phone],
                "LineNumber": "30005680000275",

                "SendDateTime": "",
                "CanContinueInCaseOfError": "false",
            })
        }, function(err, ress, body) {
            const jres = JSON.parse(body);
            console.log(err)
            if (cb) {
                if (err) {
                    cb(null, { error: err })
                } else {
                    cb(jres)
                }
            }

        });
    } else {
        if (cb) {
            console.log("phone is not given")
            cb(null, { error: "phone is not given" })
        }
    }
}

async function getToken() {
    let token = '';
    await request.post({
        url: 'http://RestfulSms.com/api/Token',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({

            "UserApiKey": "d28ccd6671b5aec6c478db51",
            "SecretKey": "iotsmile123"
        })
    }, function(err, ress, body) {
        const jres = JSON.parse(body);
        token = jres.TokenKey;
    });

    return token;
}
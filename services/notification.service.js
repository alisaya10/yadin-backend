var request = require('request-promise');


exports.send = async(device, title, body, data, cb) => {

    request.post({
        url: 'https://fcm.googleapis.com/fcm/send',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'key=AAAAzHm5L2k:APA91bFkAyd5bsYTqCtQf_3TgAl_IFpK3PpCmVE9tsAco0b15sIR3Gxvb1wgSEPOoHhKSqAHbVYWBOdghYXpXW0SeWU3IJjV-41LQsxk4ehxL0xKXy-2mNsFL16lvLCk3YSyLh3CBAZO'
        },


        body: JSON.stringify({

            "to": device,
            // "priority": "high",
            "notification": {
                "body": body,
                "title": title,
                "sound": "default"
            },
            "data": data

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
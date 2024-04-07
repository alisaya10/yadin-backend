const { redisSequence } = require("../variables");

exports.activationCode = () => {
    return (Math.floor(Math.random() * (9999 - 1000)) + 1000).toString();
};


exports.invitationCode = () => {
    const str = '*AB0CDE1FG2HIJ3KL4MNO5PQ6RST7UV8WXY9Z';
    let code = '';

    for (let i = 0; i < 6; i++) {
        const index = Math.floor(Math.random() * (36 - 1)) + 1;

        code += str.substring(index, index + 1);
    }
    return code;
}
exports.sequenceGenerator = (key, cb) => {

    redisSequence.HGETALL( key, (err, sequence) => {
        if (err) {
            console.log(err)
            cb(null, err)
            return
        }
        let promises = []
        if (sequence == null) {
            promises.push(new Promise((resolve, reject) => {
                resolve()
                // Find Conversation (By Id) - Activity (By applet Id) - Feed (By Hub) - Applet (Id) - Applet Data (Data Id ??) - Conversation Activity - Hubs (Relation?) 

            }))
        }

        Promise.all(promises).then(() => {

            let newSequence = sequence?.pts ? (Number(sequence?.pts) + 1) : 1

            redisSequence.HMSET( key, { pts: newSequence }, (err, result) => {
                console.log(err)
                cb(newSequence)

            })

        })




    })
    // return code;
}
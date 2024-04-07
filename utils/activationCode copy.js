const generator = require("../utils/generator");
//? sms code ../services
const smsCode = require('../services/smsCode.service');
const moment = require("jalali-moment")

const {Smsir} = require('smsir-js')

//* activation code function  ###
/**
 * send activation code function
 * @param {*} userIndicator this is the type of data that you send for example data.phone data.email 
 * @param {*} activationCode this is callback that give you the activation code 
 * @param {*} indicatorType this is phone or email it should be string
*/

exports.sendActivationCode = async (userIndicator, activationCode, indicatorType) => {
const sms_ir = new Smsir('UQSpLcMhzab877b4AYog3kPBpVoaGOsJTq6RLejMPv1NK6sTfWb4YaQ5TuqI2q5q', 9901963408)
    if (indicatorType == "phone") {
        console.log('-------------------------',activationCode)
        console.log('-------------------------',userIndicator)
    // smsir(userIndicator, activationCode, () => { })
    sms_ir.send_bulk_sms(
        [userIndicator],
        activationCode,
        9901963408,
        )
    }
    if (indicatorType == "email") {
    }
}

/**
 * updateActivationCode function
 * @param {*} model pass the mongoose model 
 * @param {*} indicatorType this is phone or email it should be string
 * @param {*} userIndicator this is the type of data that you send for example data.phone data.email 
 * @param {*} cb its give you the activation code 
 */
exports.updateActivationCode = async (model, indicatorType, userIndicator, cb) => {
    model.findOne({
        phone : userIndicator,
        removed: false
    }).then(async (user) => {
        console.log('--------------------------',user);
        if (!user || !user.codeLastTry || user.codeLastTry <= moment(new Date()).subtract(1, 'minutes')) {
            var activationCode = await generator.activationCode();
            model.updateOne({
                phone : userIndicator,
                removed: false
            }, {
                codeLastTry: new Date(),
                activationCode: activationCode,
            }, { upsert: true }).then(async () => {
                cb({ user, activationCode })
            }).catch(err => {
                console.log('errrrrrrr',err);
                cb(null, { code: '{{lang}}errors.somethingWentWrong' })
            });
        } else {
            cb(null, { code: '{{lang}}errors.lastTryTime' })
        }
    })

}
exports.updateForgetPassActivationCode = async (model, indicatorType, userIndicator, cb) => {
    model.findOne({
        phone : userIndicator, removed:false
    }).then(async (user) => {
        console.log('--------------------------',user);

        if (!user || !user.codeLastTry || user.codeLastTry <= moment(new Date()).subtract(1, 'minutes')) {
            var activationCode = await generator.activationCode();
            model.updateOne({
                phone : userIndicator,  removed:false
            }, {
                codeLastTry: new Date(),
                activationCode: activationCode,
            }, { upsert: true }).then(async () => {
                cb({ user, activationCode })
            }).catch(err => {
                cb(null, { code: '{{lang}}errors.somethingWentWrong' })
            });
        } else {
            cb(null, { code: '{{lang}}errors.lastTryTime' })
        }
    })

}


//* activation code function ###
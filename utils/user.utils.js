const validator = require('validator');
const crypto = require('crypto');


exports.getUserPublicData = (data) => {

    return {
        _id: data._id,
        id: data._id,
        role: data.role,
        dataname: data.dataname,
        verified: data.verified,
        name: data.name,
        family: data.family,
        fullname: data.fullname,
        image: data.image,
        // roles: data.roles,

    }
};


exports.getUserPrivateData = (data) => {

    return {
        _id: data._id,
        id: data._id,
        role: data.role,
        cDate: data.cDate,
        roles: data.roles,
        dataname: data.dataname,
        verified: data.verified,
        name: data.name,
        credit: data.credit,
        family: data.family,
        fullname: data.fullname,
        image: data.image,
        status: data.status,
        phone: data.phone,
        email: data.email,
        balance: data.balance,
        wallet: data.wallet,
        selfBalance: data.selfBalance,
        username: data.username,
        partner: data.partner,


    }
};


exports.validateUser = (data, cb) => {

    isValid = true
    errors = {}

    console.log(data.email)
    console.log(data.name)
    console.log(data.family)

    // console.log(validator.isEmpty(data.email))
    if (data.email && !validator.isEmail(data.email)) {
        isValid = false;
        errors['email'] = '{{lang}}errors.emailNotValid'
    }
    if (!data.name || !validator.isLength(data.name, { min: 2, max: 30 })) {
        isValid = false;
        errors["name"] = '{{lang}}errors.nameNotValid'
    }
    if (data.family && !validator.isLength(data.family, { min: 2, max: 30 })) {
        isValid = false;
        errors["family"] = '{{lang}}errors.familyNotValid'
    }
    console.log('TP1')

    // console.log(errors)

    cb(isValid, errors)
};




exports.getAppletPublicData = (data) => {

    return {
        name: data.name,
        description: data.description,
        image: data.image,
        verified: data.verified,

    }
};



exports.compareHash = (password, hash) => {
    console.log("hash" ,hash)
    var derivedKey = crypto.scryptSync(password, "salt", 64).toString('hex');
    console.log("password",derivedKey)
    return (hash == derivedKey)
}

var finantialModel = require('../models/finantialModel');

var useful = require('../utils/useful');

var security = require('../security');
const userModel = require('../models/userModel');

var apisList = {

    'finantial/getAll': { function: getAllFinantials, security: null }, // REMOVE
    'finantial/getMyFinantials': { function: getMyFinantials, security: null }, // REMOVE
    'finantial/getOneFinantial': { function: getOneFinantial, security: null }, // REMOVE
    'finantial/postFinantial': { function: postFinantial, security: null },
    'finantial/removeFinantial': { function: removeFinantial, security: null }, // REMOVE
    'finantial/setCredit': { function: setCredit, security: null }, // REMOVE

};

function myApiSwitcher(data, res) {
    useful.apiSwitcher(data, res, apisList);
}


//! getOneFinantial
function getOneFinantial(data, res, extra) {
    let filter = data

    finantialModel.findOne(filter).populate('teacher','name family fullname image email description rating commission  credit').lean().then((doc) => {

        security.sendResponse(res, { info: doc }, 200, 'simpleJson')

    }).catch(() => { security.sendSomethingWrong(res) })
}


//! postFinantial
function postFinantial(data, res, extra) {
    console.log('object', data);
    let isNew = true
    if (data._id) {
        isNew = false
    }

    if (isNew) {
        finantialModel.create({
            title: data.title,
            description: data.description,
            amount: data.amount,
            payDate: data.payDate,
            id: data.id,
            teacher: data.teacher,
            creator: extra.session.user,
            cDate: new Date(),
            uDate: new Date(),
            removed: false
        }).then((result) => {
            console.log('dddddd',result);
            userModel.updateOne({ _id: data.teacher}, {

                $inc: { credit: (data.amount * -1 )}
            }).then(() => {
            security.sendResponse(res, { done: true, info: result }, 200, 'simpleJson')
            })
        }).catch((err) => { console.log('err',err); security.sendSomethingWrong(res) })

    } else {

        finantialModel.findOneAndUpdate({ _id: data._id }, {
            title: data.title,
            description: data.description,
            amount: data.amount,
            payDate: data.payDate,
            id: data.id,
            teacher: data.teacher,
            uDate: new Date(),
        }, { new: true }).then((result) => {
            security.sendResponse(res, { done: true, info: result }, 200, 'simpleJson')
        }).catch(() => { security.sendSomethingWrong(res) })
    }
}


async function checkSlug(data, cb) {

    let slug = useful.convertToSlug(data.values.title)
    // console.log(slug)
    data.values.slug = slug
    cb()
}

//! getAllFinantials
async function getAllFinantials(data, res, extra) {


    useful.getWrapper(data, res, extra, (getWrapper) => {

        getWrapper.filter.removed = false

        getWrapper.populates = [{ path: 'teacher', select: 'name family fullname image email description rating commission  credit' }]

        useful.findQuery(data, res, extra, "finantials", getWrapper, (docs, count, err) => {
            if (err) {
                console.log(err)
                security.sendSomethingWrong(res)
            } else {
                security.sendResponse(res, { info: docs, count }, 200, 'simpleJson')
            }
        })


    })


}

//! getMyFinantials
async function getMyFinantials(data, res, extra) {

console.log('--------------', data);
useful.getWrapper(data, res, extra, (getWrapper) => {
    
    getWrapper.filter.removed = false
    getWrapper.filter.teacher = extra.session.user
    console.log('--------------', getWrapper);

        getWrapper.populates = [{ path: 'teacher', select: 'name family fullname image email description rating commission  credit' }]

        useful.findQuery(data, res, extra, "finantials", getWrapper, (docs, count, err) => {
            if (err) {
                console.log(err)
                security.sendSomethingWrong(res)
            } else {
                security.sendResponse(res, { info: docs, count }, 200, 'simpleJson')
            }
        })


    })


}

//! removeFinantial
function removeFinantial(data, res, extra) {

    useful.removeQuery(data, res, extra, "finantials", () => { })

}
async function setCredit(data, res, extra) {
 
        console.log('tp3');
        userModel.updateMany({}, { credit: 0 }).then(dddocs => {
          console.log("country add to all users successfuly.")
          security.sendResponse(res, { success: true }, 200, "simpleJson");
        }).catch(err => {
          if (err) {console.log("err in add singaopre city: ", err)
          security.sendSomethingWrong(res)}
        })

   
  }

module.exports = myApiSwitcher;
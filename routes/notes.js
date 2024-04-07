const notesModel = require('../models/notesModel');
const useful = require('../utils/useful')
const security = require('../security');


let apisList = {

    'notes/getNotes': { function: getNotes, security: null },
    // 'notes/getOnenote': { function: getOnenote, security: null },

    'notes/postNote': { function: postNote, security: null },
    'notes/removeNote': { function: removeNote, security: null },

    'notes/getOne': { function: getOne, security: null },




}


function myApiSwitcher(data, res) {
    useful.apiSwitcher(data, res, apisList)
}





// async function getOne(data, res, extra) {
   

//     notesModel.findOne({_id:data.id}).then((doc)=>{
//         security.sendResponse(res, { info: doc }, 200, 'simpleJson')
//     })

// }


async function getOne(data, res, extra) {

    let filter = data

    notesModel.findOne(filter).populate('course', 'lesson').lean().then((doc) => {

        security.sendResponse(res, { info: doc }, 200, 'simpleJson')

    }).catch(() => { security.sendSomethingWrong(res) })

}





// async function getSpecialnotes(data, res, extra) {
//     // console.log("getSpecialnotes")
//     let filter = { special: { $exists: true, $not: { $size: 0 } } }
//     filter.removed = false

//     if (data.lng != null) {
//         filter['lng'] = data.lng
//     }


//     notesModel.find(filter).lean().select({ body: 0 }).then((docs) => {


//         security.sendResponse(res, { info: docs }, 200, 'simpleJson')

//     }).catch(() => { security.sendSomethingWrong(res) })


// }




// async function getRecommendednotes(data, res, extra) {


//     let filter = data.filter ? data.filter : {}
//     filter.removed = false
//     if (data.lng != null) {
//         filter['lng'] = data.lng
//     }


//     notesModel.findOne({ _id: data._id }).then((note) => {

//         if (note && note._id) {
//             filter['_id'] = { $ne: note._id }
//             filter['categories'] = { $in: note.categories }

//         }

//         notesModel.aggregate([
//             { $match: filter },
//             { $sample: { size: 4 } },
//             { $project: { body: 0 } }
//         ]).then((docs) => {

//             security.sendResponse(res, { info: docs }, 200, 'simpleJson')

//         }).catch(() => { security.sendSomethingWrong(res) })
//     }).catch(() => { security.sendSomethingWrong(res) })


// }


// async function searchnotes(data, res, extra) {

//     let myRegex = new RegExp([data.search].join(""), "i")

//     let filter = { 'title': { $regex: myRegex } }
//     filter.removed = false
//     if (data.lng != null) {
//         filter['lng'] = data.lng
//     }

//     notesModel.find(filter).lean().limit(20).select({ body: 0 }).then((docs) => {

//         security.sendResponse(res, { info: docs }, 200, 'simpleJson')

//     }).catch(() => { security.sendSomethingWrong(res) })

// }




// async function getOnenote(data, res, extra) {

//     let filter = data

//     notesModel.findOne(filter).populate('teacher').lean().then((doc) => {

//         security.sendResponse(res, { info: doc }, 200, 'simpleJson')

//     }).catch(() => { security.sendSomethingWrong(res) })

// }

async function postNote(data, res, extra) {

    // console.log("postnote")
    let isNew = true
    if (data._id) {
        isNew = false
    }

    // checkSlug(data, () => {

    if (isNew) {
        let slug = useful.convertToSlug(data.title)
        data.slug = slug
        notesModel.create({
            user: extra.session.user,
            noteTime: data.noteTime,
            title: data.title,
            description: data.description,
            lesson: data.lesson,
            course: data.course,

            cDate: new Date(),
            uDate: new Date(),
            removed: false
        }).then((result) => {
            security.sendResponse(res, { done: true, info: result }, 200, 'simpleJson')
        }).catch(() => { security.sendSomethingWrong(res) })

    } else {
        let slug = useful.convertToSlug(data.slug)
        data.slug = slug

        notesModel.findOneAndUpdate({ _id: data._id }, {
            user: extra.session.user,
            noteTime: data.noteTime,
            title: data.title,
            lesson: data.lesson,
            course: data.course,
            description: data.description,

            cDate: new Date(),
            uDate: new Date(),
            removed: false
        }, { new: true }).then((result) => {
            security.sendResponse(res, { done: true, info: result }, 200, 'simpleJson')
        }).catch(() => { security.sendSomethingWrong(res) })
    }
    // })
}




// async function checkSlug(data, cb) {

//     let slug = useful.convertToSlug(data.title)
//     console.log(slug)
//     data.slug = slug
//     cb()
// }

async function getNotes(data, res, extra) {
    // console.log("getLessons")

    useful.getWrapper(data, res, extra, (wrapperRes) => {

        wrapperRes.filter.removed = false
        if (data.lng) {
            wrapperRes.filter['lng'] = data.lng
        }
        wrapperRes.filter.user = extra.session.user

        wrapperRes.populates = [{ path: 'lesson', select: 'title currentLessonTime ' }]


        useful.findQuery(data, res, extra, "notes", wrapperRes, (docs, count, err) => {
            if (err) {
                console.log(err)
                security.sendSomethingWrong(res)
            } else {
                security.sendResponse(res, { info: docs, count }, 200, 'simpleJson')
            }
        })
    })
}


async function removeNote(data, res, extra) {

    // console.log(data)
    notesModel.updateOne({ _id: data.id }, {
        removed: true
    }, { upsert: false }).then(() => {

        security.sendResponse(res, { done: true }, 200, 'simpleJson')

    }).catch((err) => {
        console.log(err);
        security.sendSomethingWrong(res)
    })

}






module.exports = myApiSwitcher
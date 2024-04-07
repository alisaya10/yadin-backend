const wishListModel = require('../models/wishListModel');
const useful = require('../utils/useful')
const security = require('../security');
const courseModel = require('../models/courseModel');


let apisList = {

    'wishList/getWishLists': { function: getWishLists, security: null },

    'wishList/postWishList': { function: postWishList, security: null },
    'wishList/removeWishList': { function: removeWishList, security: null },

}


function myApiSwitcher(data, res) {
    useful.apiSwitcher(data, res, apisList);
} ///////////////////// API Functions


async function postWishList(data, res, extra) {

    console.log('postWL',data);


    if (data.status == true) {
        wishListModel.findOne({ user: extra.session.user, lesson: data.lesson, course: data.course }).then((doc) => {
            console.log('tp1',doc)
            if (doc) {
                security.sendResponse(res, { done: true }, 200, 'simpleJson')
                return
            }

            wishListModel.create({
                user: extra.session.user,
                lesson: data.lesson,
                course: data.course,
                cDate: new Date(),
                uDate: new Date(),
                removed: false
            }).then((result) => {
                security.sendResponse(res, { done: true }, 200, 'simpleJson')
            }).catch(() => { security.sendSomethingWrong(res) })

        })

    } else {
        console.log('tp2', data)

        wishListModel.remove({ user: extra.session.user, lesson: data.lesson, course: data.course }).then((doc) => {

            security.sendResponse(res, { done: true }, 200, 'simpleJson')

        }).catch(() => { security.sendSomethingWrong(res) })

    }
    // })
}
async function getWishLists(data, res, extra) {

    let filter = data.filter ? useful.filterCreator(data.filter) : {}
    let sort = data.sort ? data.sort : { cDate: -1 }
    let limit = data.limit ? data.limit : null
    let skip = data.skip ? data.limit * data.skip : null

    // if (data.lng != null) {
    //     filter['lng'] = data.lng
    // }

    filter.user = extra.session.user
// filter['course.removed'] = false
    // filter.lesson = {$ne :null}

    wishListModel.find(filter).lean().sort(sort).limit(limit).skip(skip).populate('lesson').populate('course').then((docs) => {
 let promises = []
if(docs && Array.isArray(docs)){

    // console.log('heree111eeeeeeeeeee')
    
    
    docs.forEach(doc => {
        
        // console.log('heree1112222eeeeeeeeee1111111111111e',doc)
        promises.push(new Promise((resolve, reject) => {
            
            
            courseModel.findOne({ _id:doc.course._id, removed: false }).populate('teacher').lean().then((courses) => {
                // console.log('heree1112222eeeeeee333333eee1111111111111e',courses)

            if(courses){
                // console.log('hereeeeeeeeeeeee')
                doc['teacher']= courses.teacher

            }
         
                resolve()
           
        })
        }))
        
    });

    Promise.all(promises).then(() => {
        
        if (data.getCount) {
            wishListModel.find(filter).count().then((count) => {
                security.sendResponse(res, { info: docs, count }, 200, 'simpleJson')
            })
        } else {
            console.log('object',docs);
            security.sendResponse(res, { info: docs }, 200, 'simpleJson')
        }

        // security.sendResponse(res, { info: docs }, 200, 'simpleJson')
    })}
    }).catch(() => { security.sendSomethingWrong(res) })

}


async function removeWishList(data, res, extra) {

    // console.log(data)
    wishListModel.updateOne({ _id: data.id }, {
        removed: true
    }, { upsert: false }).then(() => {

        security.sendResponse(res, { done: true }, 200, 'simpleJson')

    }).catch((err) => {
        console.log(err);
        security.sendSomethingWrong(res)
    })

}





module.exports = myApiSwitcher;
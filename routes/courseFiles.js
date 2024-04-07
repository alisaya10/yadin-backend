const useful = require('../utils/useful')
const security = require('../security');

const courseFilesModel = require('../models/courseFilesModel');

// const contentModel = require('../models/contentModel');


let apisList = {


    'coursefiles/getCourseFiles': { function: getCourseFiles, security: null },
    'coursefiles/getOneCourseFile': { function: getOneCourseFile, security: null },
    'coursefiles/postCourseFile': { function: postCourseFile, security: null },
    // 'coursefiles/getSpecialCourseFiles': { function: getSpecialCourses, security: null }, 
    'coursefiles/removeCourseFile': { function: removeCourseFile, security: null },


}


function myApiSwitcher(data, res) {
    useful.apiSwitcher(data, res, apisList)
}


///////////////////// API Functions


// async function getMainCategories(data, res, extra) {

//     contentModel.find({}).lean().then((categories) => {

//     })


// }


async function getOneCourseFile(data, res, extra) {

    let filter = data

    courseFilesModel.findOne(filter).populate('course').lean().then((doc) => {

        security.sendResponse(res, { info: doc }, 200, 'simpleJson')

    }).catch(() => { security.sendSomethingWrong(res) })

}







async function postCourseFile(data, res, extra) {

    let object = {

        image: data.image,
        title: data.title,
        description: data.description,
        course: data.course,
        files: data.files,


    }

    let populates = [{ path: 'course', select: 'title image' }]

    useful.postQuery(data, res, extra, "courseFiles", object, populates, (queryResult, err) => {
        // console.log(err)

        if (!err) {
            security.sendResponse(res, { done: true, info: queryResult }, 200, 'simpleJson')
        }

    }).catch(() => {
        security.sendSomethingWrong(res)
        // })

    })
}


async function getCourseFiles(data, res, extra) {
            // console.log("getLessons", data)
            
            useful.getWrapper(data, res, extra, (wrapperRes) => {
                
                wrapperRes.filter.removed = false
                if(data.course){

                    wrapperRes.filter.course = data.course
                }
                
                wrapperRes.populates = [{ path: 'course', select: 'title image' }]
                
                // console.log("wrapperRessssss", wrapperRes)

                useful.findQuery(data, res, extra, "courseFiles", wrapperRes, (docs, count, err) => {
                    if (err) {
                        console.log(err)
                        security.sendSomethingWrong(res)
                    } else {
                        security.sendResponse(res, { info: docs, count }, 200, 'simpleJson')
                    }
                })
            })
        }


async function removeCourseFile(data, res, extra) {

            // console.log(data)
            courseFilesModel.updateOne({ _id: data.id }, {
                removed: true
            }, { upsert: false }).then(() => {

                security.sendResponse(res, { done: true }, 200, 'simpleJson')
                // courseModel.updateOne({ _id: data.course }, { $inc: { lessons: -1 } }).then(() => { })

            }).catch((err) => {
                console.log(err);
                security.sendSomethingWrong(res)
            })

        }






module.exports = myApiSwitcher


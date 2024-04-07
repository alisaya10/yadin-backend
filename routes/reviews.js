



//? model
const reviewsModel = require("../models/reviewsModel")
const courseModel = require("../models/courseModel");
const userModel = require("../models/userModel");


//? useful
const useful = require('../utils/useful')

//? security
const security = require('../security');
// const userModel = require("../models/userModel");


//! codes

// {{lang}}errors.somethingWentWrong //! code 128

// {{lang}}errors.userDoesNotExists //! code 129

//{{lang}}errors.userOrPasswordWrong //! code 130

// {{lang}}errors.passwordPattern //! code 131

// status 200 //! code 132

// status 500 //! code 134

// {{lang}}errors.wrongCredentials //! code 133 

// {{lang}}errors.userExists //! code 135

// {{lang}}errors.userIsInactive //! code 136

// {{lang}}errors.invalidInputs //! code 137


//Todo dont forget to set model and functions


let apisList = {

    //! Add Review
    'reviews/addReviews': { function: addReview, security: null },

    //! Get All Reviews
    'reviews/getAllReviews': { function: getAllReviews, security: null },

    //! Get one Review
    'reviews/getOneReview': { function: getOneReview, security: null },

    //! Remove Review
    'reviews/removeReviews': { function: removeReview, security: null },

}

//* myApiSwitcher
function myApiSwitcher(data, res) {
    useful.apiSwitcher(data, res, apisList)
}
//* myApiSwitcher



//! create/update Review
async function addReview(data, res, extra) {
let writer = {}
    // console.log("data", data)
    // console.log("extra.session.user", extra.session.user)
if(data.writer){
    
}
    let object = {
        title: data.title,
        description: data.description,
        ratings: data.ratings,
        writer: extra.session.user,
        course: data.course,
        verified: data.verified,
        cDate: new Date(),
        uDate: new Date()
    }
    if (Array.isArray(object.ratings) && object.ratings.length == 5) {
        for (let i = 0; i < object.ratings.length; i++) {
            if (object.ratings[i] > 5 || object.ratings[i] < 0) {
                // console.log("wrong rating")
                security.sendResponse(res, { status: 500, Message: "wrong rating input" }, 500, extra, "simpleJson")
                return
            }

            let newTotalCount
            let newTotalStar
            let newOneStarCount
            let newOneStarPercent
            let newTwoStarCount
            let newTwoStarPercent
            let newThreeStarCount
            let newThreeStarPercent

            let newFourStarCount
            let newFourStarPercent
            let newFiveStarCount
            let newFiveStarPercent

            await courseModel.findOne({ _id: data.course, removed: false }).lean().then(async course => {
                // console.log("__________________new cycle-----------------")

                switch (object.ratings[i]) {

                    case 1: {

                        // console.log("case 1")

                        let totalCount = course.rating[i].total.count
                        let oneStarCount = course.rating[i].oneStar.count

                        newTotalCount = totalCount + 1
                        newOneStarCount = oneStarCount + 1
                        newTotalStar = (((newOneStarCount) + (2 * (course.rating[i].twoStar.count)) + (3 * (course.rating[i].threeStar.count)) + (4 * (course.rating[i].fourStar.count)) + (5 * (course.rating[i].fiveStar.count))) / newTotalCount)
                        newOneStarPercent = (newOneStarCount / newTotalCount) * 100

                        newTwoStarPercent = (course.rating[i].twoStar.count / newTotalCount) * 100
                        newThreeStarPercent = (course.rating[i].threeStar.count / newTotalCount) * 100
                        newFourStarPercent = (course.rating[i].fourStar.count / newTotalCount) * 100
                        newFiveStarPercent = (course.rating[i].fiveStar.count / newTotalCount) * 100

                        let newRating = course.rating
                        newRating[i].total.count = newTotalCount
                        newRating[i].total.star = newTotalStar
                        newRating[i].oneStar.count = newOneStarCount
                        newRating[i].oneStar.percent = newOneStarPercent
                        newRating[i].twoStar.percent = newTwoStarPercent
                        newRating[i].threeStar.percent = newThreeStarPercent
                        newRating[i].fourStar.percent = newFourStarPercent
                        newRating[i].fiveStar.percent = newFiveStarPercent

                        // console.log("newRating: ", newRating)
                        // console.log("updating rating number", i)
                        await courseModel.findOneAndUpdate({ _id: data.course }, { rating: newRating, uDate: new Date() }, { upsert: false }).then((oldcourse) => {
                            // console.log(`course's rating[${i}] update successfully`)
                        })




                        break;
                    }

                    case 2: {

                        // console.log("case 2")

                        let totalCount = course.rating[i].total.count
                        let twoStarCount = course.rating[i].twoStar.count

                        newTotalCount = totalCount + 1
                        newTwoStarCount = twoStarCount + 1
                        newTotalStar = (((course.rating[i].oneStar.count) + (2 * (newTwoStarCount)) + (3 * (course.rating[i].threeStar.count)) + (4 * (course.rating[i].fourStar.count)) + (5 * (course.rating[i].fiveStar.count))) / newTotalCount)
                        newTwoStarPercent = (newTwoStarCount / newTotalCount) * 100

                        newOneStarPercent = (course.rating[i].oneStar.count / newTotalCount) * 100
                        newThreeStarPercent = (course.rating[i].threeStar.count / newTotalCount) * 100
                        newFourStarPercent = (course.rating[i].fourStar.count / newTotalCount) * 100
                        newFiveStarPercent = (course.rating[i].fiveStar.count / newTotalCount) * 100

                        let newRating = course.rating
                        newRating[i].total.count = newTotalCount
                        newRating[i].total.star = newTotalStar
                        newRating[i].twoStar.count = newTwoStarCount
                        newRating[i].oneStar.percent = newOneStarPercent
                        newRating[i].twoStar.percent = newTwoStarPercent
                        newRating[i].threeStar.percent = newThreeStarPercent
                        newRating[i].fourStar.percent = newFourStarPercent
                        newRating[i].fiveStar.percent = newFiveStarPercent

                        // console.log("newRating: ", newRating)
                        // console.log("updating rating number", i)
                        await courseModel.findOneAndUpdate({ _id: data.course }, { rating: newRating, uDate: new Date() }, { upsert: false }).then((oldcourse) => {
                            // console.log(`course's rating[${i}] update successfully`)
                        })



                        break;
                    }
                    case 3: {

                        // console.log("case 3")

                        let totalCount = course.rating[i].total.count
                        let threeStarCount = course.rating[i].threeStar.count

                        newTotalCount = totalCount + 1
                        newThreeStarCount = threeStarCount + 1
                        newTotalStar = (((course.rating[i].oneStar.count) + (2 * (course.rating[i].twoStar.count)) + (3 * (newThreeStarCount)) + (4 * (course.rating[i].fourStar.count)) + (5 * (course.rating[i].fiveStar.count))) / newTotalCount)
                        newThreeStarPercent = (newThreeStarCount / newTotalCount) * 100

                        newOneStarPercent = (course.rating[i].oneStar.count / newTotalCount) * 100
                        newTwoStarPercent = (course.rating[i].twoStar.count / newTotalCount) * 100
                        newFourStarPercent = (course.rating[i].fourStar.count / newTotalCount) * 100
                        newFiveStarPercent = (course.rating[i].fiveStar.count / newTotalCount) * 100

                        let newRating = course.rating
                        newRating[i].total.count = newTotalCount
                        newRating[i].total.star = newTotalStar
                        newRating[i].threeStar.count = newThreeStarCount
                        newRating[i].oneStar.percent = newOneStarPercent
                        newRating[i].twoStar.percent = newTwoStarPercent
                        newRating[i].threeStar.percent = newThreeStarPercent
                        newRating[i].fourStar.percent = newFourStarPercent
                        newRating[i].fiveStar.percent = newFiveStarPercent

                        // console.log("newRating: ", newRating)
                        // console.log("updating rating number", i)
                        await courseModel.findOneAndUpdate({ _id: data.course }, { rating: newRating, uDate: new Date() }, { upsert: false }).then((oldcourse) => {
                            // console.log(`course's rating[${i}] update successfully`)
                        })


                        break;
                    }
                    case 4: {

                        // console.log("case 4")

                        let totalCount = course.rating[i].total.count
                        let fourStarCount = course.rating[i].fourStar.count

                        newTotalCount = totalCount + 1
                        newFourStarCount = fourStarCount + 1
                        newTotalStar = (((course.rating[i].oneStar.count) + (2 * (course.rating[i].twoStar.count)) + (3 * (course.rating[i].threeStar.count)) + (4 * (newFourStarCount)) + (5 * (course.rating[i].fiveStar.count))) / newTotalCount)
                        newFourStarPercent = (newFourStarCount / newTotalCount) * 100

                        newOneStarPercent = (course.rating[i].oneStar.count / newTotalCount) * 100
                        newTwoStarPercent = (course.rating[i].twoStar.count / newTotalCount) * 100
                        newThreeStarPercent = (course.rating[i].threeStar.count / newTotalCount) * 100
                        newFiveStarPercent = (course.rating[i].fiveStar.count / newTotalCount) * 100

                        let newRating = course.rating
                        newRating[i].total.count = newTotalCount
                        newRating[i].total.star = newTotalStar
                        newRating[i].fourStar.count = newFourStarCount
                        newRating[i].oneStar.percent = newOneStarPercent
                        newRating[i].twoStar.percent = newTwoStarPercent
                        newRating[i].threeStar.percent = newThreeStarPercent
                        newRating[i].fourStar.percent = newFourStarPercent
                        newRating[i].fiveStar.percent = newFiveStarPercent

                        // console.log("newRating: ", newRating)
                        // console.log("updating rating number", i)
                        await courseModel.findOneAndUpdate({ _id: data.course }, { rating: newRating, uDate: new Date() }, { upsert: false }).then((oldcourse) => {
                            // console.log(`course's rating[${i}] update successfully`)
                        })


                        break;
                    }
                    case 5: {


                        // console.log("case 4")

                        let totalCount = course.rating[i].total.count
                        let fiveStarCount = course.rating[i].fiveStar.count

                        newTotalCount = totalCount + 1
                        newFiveStarCount = fiveStarCount + 1
                        newTotalStar = (((course.rating[i].oneStar.count) + (2 * (course.rating[i].twoStar.count)) + (3 * (course.rating[i].threeStar.count)) + (4 * (course.rating[i].fourStar.count)) + (5 * (newFiveStarCount))) / newTotalCount)
                        newFiveStarPercent = (newFiveStarCount / newTotalCount) * 100

                        newOneStarPercent = (course.rating[i].oneStar.count / newTotalCount) * 100
                        newTwoStarPercent = (course.rating[i].twoStar.count / newTotalCount) * 100
                        newThreeStarPercent = (course.rating[i].threeStar.count / newTotalCount) * 100
                        newFourStarPercent = (course.rating[i].fourStar.count / newTotalCount) * 100


                        let newRating = course.rating
                        newRating[i].total.count = newTotalCount
                        newRating[i].total.star = newTotalStar
                        newRating[i].fiveStar.count = newFiveStarCount
                        newRating[i].oneStar.percent = newOneStarPercent
                        newRating[i].twoStar.percent = newTwoStarPercent
                        newRating[i].threeStar.percent = newThreeStarPercent
                        newRating[i].fourStar.percent = newFourStarPercent
                        newRating[i].fiveStar.percent = newFiveStarPercent

                        // console.log("newRating: ", newRating)
                        // console.log("updating rating number", i)
                        await courseModel.findOneAndUpdate({ _id: data.course }, { rating: newRating, uDate: new Date() }, { upsert: false }).then((oldcourse) => {
                            // console.log(`course's rating[${i}] update successfully`)
                        })

                        break;
                    }
                    default:
                        break;
                }
            })


        }

        let finalScore = 0
        courseModel.findOne({ _id: data.course, removed: false }).lean().then((course) => {
            let score = 0
            for (let i = 0; i < course.rating.length; i++) {

                score += course.rating[i].total.star
            }
            finalScore = score / course.rating.length

            courseModel.findOneAndUpdate({ _id: data.course }, { score: finalScore, uDate: new Date() }).then(old => {
                // console.log("final score record succesfuly")
            })
        })



    } else {
        // console.log("wrong rating");
        security.sendSomethingWrong(res)
    }




    let isNew = true
    if (data._id) {
        isNew = false
    }

    if (isNew) {
        let slug = useful.convertToSlug(data.title)
        data.slug = slug
        reviewsModel.create(object).then((result) => {
            security.sendResponse(res, { done: true, info: result }, 200, 'simpleJson')
        }).catch(() => { security.sendSomethingWrong(res) })

    } else {
        let slug = useful.convertToSlug(data.title)
        data.slug = slug

        reviewsModel.findOneAndUpdate({ _id: data._id }, {
            title: data.title,
            description: data.description,
            ratings: data.ratings,
            course: data.course,
            verified: data.verified,

            uDate: new Date(),
        }, { new: true }).then((result) => {
            security.sendResponse(res, { done: true, info: result }, 200, 'simpleJson')
        }).catch(() => { security.sendSomethingWrong(res) })
    }
}


//! Get All Reviews
async function getAllReviews(data, res, extra) {

    useful.getWrapper(data, res, extra, (getWrapper) => {

        // console.log("wraper", getWrapper)

        getWrapper.filter.removed = false
        getWrapper.filter["$and"] = [{ description : { $ne: '' } }, { description : { $ne: null } },{ description : { $ne: undefined } }]

        getWrapper.populates = [{ path: 'course', select: 'title' }, { path: 'writer', select: 'name image fullname' }]

        useful.findQuery(data, res, extra, "reviews", getWrapper, (docs, count, err) => {
            if (err) {
                console.log(err)
                security.sendSomethingWrong(res)
            } else {
                security.sendResponse(res, { info: docs, count }, 200, 'simpleJson')
            }
        })


    })


}


//! get one Review
async function getOneReview(data, res, extra) {
    let filter = data
    filter.removed = false
    // console.log(filter)
    reviewsModel.findOne(filter).lean().then((doc) => {
        security.sendResponse(res, { info: doc }, 200, 'simpleJson')
    }).catch((err) => {
        console.log(err)
        security.sendSomethingWrong(res)
    })
}


//! remove Review
async function removeReview(data, res, extra) {

    useful.removeQuery(data, res, extra, "reviews", () => { })

}


module.exports = myApiSwitcher
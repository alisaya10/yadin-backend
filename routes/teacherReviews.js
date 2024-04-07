//? model
const teacherReviewsModel = require("../models/teacherReviewsModel")
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
    'teacherReviews/addTeacherReviews': { function: addReview, security: null },

    //! Get All Reviews
    'teacherReviews/getAllTeacherReviews': { function: getAllReviews, security: null },

    //! Get one Review
    'teacherReviews/getOneTeacherReview': { function: getOneReview, security: null },

    //! Remove Review
    'teacherReviews/removeTeacherReviews': { function: removeReview, security: null },

}

//* myApiSwitcher
function myApiSwitcher(data, res) {
    useful.apiSwitcher(data, res, apisList)
}
//* myApiSwitcher



//! create/update Review
async function addReview(data, res, extra) {

    // console.log("data", data)
    // console.log("extra.session.user", extra.session.user)

    let object = {
        title: data.title,
        description: data.description,
        rating: data.rating,
        writer: extra.session.user,
        teacher: data.teacher,
    verified: data.verified,
        cDate: new Date(),
        uDate: new Date()
    }

    if (object.rating > 5 || object.rating < 0) {
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
    switch (object.rating) {

        case 1: {

            userModel.findOne({ _id: data.teacher }).lean().then((ad) => {
                let totalCount = ad.rating.total.count
                let oneStarCount = ad.rating.oneStar.count

                newTotalCount = totalCount + 1
                newOneStarCount = oneStarCount + 1
                newTotalStar = (((newOneStarCount) + (2 * (ad.rating.twoStar.count)) + (3 * (ad.rating.threeStar.count)) + (4 * (ad.rating.fourStar.count)) + (5 * (ad.rating.fiveStar.count))) / newTotalCount)
                newOneStarPercent = (newOneStarCount / newTotalCount) * 100

                newTwoStarPercent = (ad.rating.twoStar.count / newTotalCount) * 100
                newThreeStarPercent = (ad.rating.threeStar.count / newTotalCount) * 100
                newFourStarPercent = (ad.rating.fourStar.count / newTotalCount) * 100
                newFiveStarPercent = (ad.rating.fiveStar.count / newTotalCount) * 100

                userModel.findOneAndUpdate({ _id: data.teacher },
                    {
                        'rating.total.count': newTotalCount,
                        'rating.total.star': newTotalStar,
                        'rating.oneStar.count': newOneStarCount,
                        'rating.oneStar.percent': newOneStarPercent,
                        'rating.twoStar.percent': newTwoStarPercent,
                        'rating.threeStar.percent': newThreeStarPercent,
                        'rating.fourStar.percent': newFourStarPercent,
                        'rating.fiveStar.percent': newFiveStarPercent,
                    }, { upsert: false }).then((oldAd) => {
                        // console.log("teacher's rating update successfully")
                    })
            })


            break;
        }

        case 2: {

            userModel.findOne({ _id: data.teacher }).lean().then((ad) => {
                let totalCount = ad.rating.total.count
                let twoStarCount = ad.rating.twoStar.count

                newTotalCount = totalCount + 1
                newTwoStarCount = twoStarCount + 1
                newTotalStar = (((ad.rating.oneStar.count) + (2 * (newTwoStarCount)) + (3 * (ad.rating.threeStar.count)) + (4 * (ad.rating.fourStar.count)) + (5 * (ad.rating.fiveStar.count))) / newTotalCount)
                newTwoStarPercent = (newTwoStarCount / newTotalCount) * 100

                newOneStarPercent = (ad.rating.oneStar.count / newTotalCount) * 100
                newThreeStarPercent = (ad.rating.threeStar.count / newTotalCount) * 100
                newFourStarPercent = (ad.rating.fourStar.count / newTotalCount) * 100
                newFiveStarPercent = (ad.rating.fiveStar.count / newTotalCount) * 100


                userModel.findOneAndUpdate({ _id: data.teacher },
                    {
                        'rating.total.count': newTotalCount,
                        'rating.total.star': newTotalStar,
                        'rating.twoStar.count': newTwoStarCount,
                        'rating.oneStar.percent': newOneStarPercent,
                        'rating.twoStar.percent': newTwoStarPercent,
                        'rating.threeStar.percent': newThreeStarPercent,
                        'rating.fourStar.percent': newFourStarPercent,
                        'rating.fiveStar.percent': newFiveStarPercent,
                    }, { upsert: false }).then((oldAd) => {
                        // console.log("teacher's rating update successfully")
                    })

            })



            break;
        }
        case 3: {

            userModel.findOne({ _id: data.teacher }).lean().then((ad) => {
                // console.log("ad.rating: ", ad.rating)
                // console.log("ad.rating.total: ", ad.rating.total)
                let totalCount = ad.rating.total.count
                let threeStarCount = ad.rating.threeStar.count
                // console.log("totalCount", totalCount)
                // console.log("threeStarCount", threeStarCount)

                newTotalCount = totalCount + 1
                newThreeStarCount = threeStarCount + 1
                newTotalStar = (((ad.rating.oneStar.count) + (2 * (ad.rating.twoStar.count)) + (3 * (newThreeStarCount)) + (4 * (ad.rating.fourStar.count)) + (5 * (ad.rating.fiveStar.count))) / newTotalCount)
                newThreeStarPercent = (newThreeStarCount / newTotalCount) * 100

                newOneStarPercent = (ad.rating.oneStar.count / newTotalCount) * 100
                newTwoStarPercent = (ad.rating.twoStar.count / newTotalCount) * 100
                newFourStarPercent = (ad.rating.fourStar.count / newTotalCount) * 100
                newFiveStarPercent = (ad.rating.fiveStar.count / newTotalCount) * 100


                // console.log("newTotalCount", newTotalCount)
                // console.log("newThreeStarCount", newThreeStarCount)
                // console.log("newTotalStar", newTotalStar)
                // console.log("newThreeStarPercent", newThreeStarPercent)

                userModel.findOneAndUpdate({ _id: data.teacher },
                    {
                        'rating.total.count': newTotalCount,
                        'rating.total.star': newTotalStar,
                        'rating.threeStar.count': newThreeStarCount,
                        'rating.oneStar.percent': newOneStarPercent,
                        'rating.twoStar.percent': newTwoStarPercent,
                        'rating.threeStar.percent': newThreeStarPercent,
                        'rating.fourStar.percent': newFourStarPercent,
                        'rating.fiveStar.percent': newFiveStarPercent,
                    }, { upsert: false }).then((oldAd) => {
                        // console.log("teacher's rating update successfully")
                    })
            })


            break;
        }
        case 4: {

            userModel.findOne({ _id: data.teacher }).lean().then((ad) => {
                let totalCount = ad.rating.total.count
                let fourStarCount = ad.rating.fourStar.count

                newTotalCount = totalCount + 1
                newFourStarCount = fourStarCount + 1
                newTotalStar = (((ad.rating.oneStar.count) + (2 * (ad.rating.twoStar.count)) + (3 * (ad.rating.threeStar.count)) + (4 * (newFourStarCount)) + (5 * (ad.rating.fiveStar.count))) / newTotalCount)
                newFourStarPercent = (newFourStarCount / newTotalCount) * 100

                newOneStarPercent = (ad.rating.oneStar.count / newTotalCount) * 100
                newTwoStarPercent = (ad.rating.twoStar.count / newTotalCount) * 100
                newThreeStarPercent = (ad.rating.threeStar.count / newTotalCount) * 100
                newFiveStarPercent = (ad.rating.fiveStar.count / newTotalCount) * 100


                userModel.findOneAndUpdate({ _id: data.teacher },
                    {
                        'rating.total.count': newTotalCount,
                        'rating.total.star': newTotalStar,
                        'rating.fourStar.count': newFourStarCount,
                        'rating.oneStar.percent': newOneStarPercent,
                        'rating.twoStar.percent': newTwoStarPercent,
                        'rating.threeStar.percent': newThreeStarPercent,
                        'rating.fourStar.percent': newFourStarPercent,
                        'rating.fiveStar.percent': newFiveStarPercent,
                    }, { upsert: false }).then((oldAd) => {
                        // console.log("teacher's rating update successfully")
                    })
            })


            break;
        }
        case 5: {

            userModel.findOne({ _id: data.teacher }).lean().then((ad) => {
                let totalCount = ad.rating.total.count
                let fiveStarCount = ad.rating.fiveStar.count

                newTotalCount = totalCount + 1
                newFiveStarCount = fiveStarCount + 1
                newTotalStar = (((ad.rating.oneStar.count) + (2 * (ad.rating.twoStar.count)) + (3 * (ad.rating.threeStar.count)) + (4 * (ad.rating.fourStar.count)) + (5 * (newFiveStarCount))) / newTotalCount)
                newFiveStarPercent = (newFiveStarCount / newTotalCount) * 100

                newOneStarPercent = (ad.rating.oneStar.count / newTotalCount) * 100
                newTwoStarPercent = (ad.rating.twoStar.count / newTotalCount) * 100
                newThreeStarPercent = (ad.rating.threeStar.count / newTotalCount) * 100
                newFourStarPercent = (ad.rating.fourStar.count / newTotalCount) * 100


                userModel.findOneAndUpdate({ _id: data.teacher },
                    {
                        'rating.total.count': newTotalCount,
                        'rating.total.star': newTotalStar,
                        'rating.fiveStar.count': newFiveStarCount,
                        'rating.oneStar.percent': newOneStarPercent,
                        'rating.twoStar.percent': newTwoStarPercent,
                        'rating.threeStar.percent': newThreeStarPercent,
                        'rating.fourStar.percent': newFourStarPercent,
                        'rating.fiveStar.percent': newFiveStarPercent,
                    }, { upsert: false }).then((oldAd) => {
                        // console.log("teacher's rating update successfully")
                    })
            })


            break;
        }
        default:
            break;
    }

    // useful.calculateRating(data.course, (rrating) => {
    //     courseModel.findOneAndUpdate({ _id: data.course },
    //         {
    //             'rating.total.count': rrating.total,
    //             'rating.total.star': (((rrating.oneStar / rrating.total) + (2 * (rrating.twoStar / rrating.total)) + (3 * (rrating.threeStar / rrating.total)) + (4 * (rrating.fourStar / rrating.total)) + (5 * (rrating.fiveStar / rrating.total))) / rrating.total),
    //             'rating.oneStar.count': rrating.oneStar,
    //             'rating.oneStart.percent': (rrating.oneStar / rrating.total),
    //             'rating.twoStar.count': rrating.twoStar,
    //             'rating.twoStart.percent': (rrating.twoStar / rrating.total),
    //             'rating.threeStar.count': rrating.threeStar,
    //             'rating.threeStart.percent': (rrating.threeStar / rrating.total),
    //             'rating.fourStar.count': rrating.fourStar,
    //             'rating.fourStart.percent': (rrating.fourStar / rrating.total),
    //             'rating.fiveStar.count': rrating.fiveStar,
    //             'rating.fiveStart.percent': (rrating.fiveStar / rrating.total),
    //         }, { upsert: false }).then((oldAd) => {
                // console.log("course's rating update successfully")
    //         })
    // })


    let isNew = true
    if (data._id) {
        isNew = false
    }

    if (isNew) {
        let slug = useful.convertToSlug(data.title)
        data.slug = slug
        teacherReviewsModel.create(object).then((result) => {
            security.sendResponse(res, { done: true, info: result }, 200, 'simpleJson')
            console.log('tttttttttttttt',result);

        }).catch(() => { security.sendSomethingWrong(res) })

    } else {
        let slug = useful.convertToSlug(data.title)
        data.slug = slug

        teacherReviewsModel.findOneAndUpdate({ _id: data._id }, {
            title: data.title,
            description: data.description,
            writer: data.writer,
            rating: data.rating,
            teacher: data.teacher,
            verified: data.verified,

            uDate: new Date(),
        }, { new: true }).then((result) => {
            security.sendResponse(res, { done: true, info: result }, 200, 'simpleJson')
            console.log('tttttttttttttt',result);
        }).catch(() => { security.sendSomethingWrong(res) })
    }
}


//! Get All Reviews
async function getAllReviews(data, res, extra) {

    // console.log("wwwwwwwwww", data)
    useful.getWrapper(data, res, extra, (getWrapper) => {

        // console.log("wrappppppppppper", getWrapper)

        getWrapper.filter.removed = false
        getWrapper.filter["$and"] = [{ description : { $ne: '' } }, { description : { $ne: null } },{ description : { $ne: undefined } }]

        getWrapper.populates = [{ path: 'teacher', select: 'name fullname' }, { path: 'writer', select: 'name image fullname' }]

        useful.findQuery(data, res, extra, "teacherReviews", getWrapper, (docs, count, err) => {
            if (err) {
                console.log(err)
                security.sendSomethingWrong(res)
            } else {
                // console.log('aaaaaaaaaaaaaa',docs);
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
    teacherReviewsModel.findOne(filter).lean().then((doc) => {
        security.sendResponse(res, { info: doc }, 200, 'simpleJson')
    }).catch((err) => {
        console.log(err)
        security.sendSomethingWrong(res)
    })
}


//! remove Review
async function removeReview(data, res, extra) {

    useful.removeQuery(data, res, extra, "teacherReviews", () => { })

}


module.exports = myApiSwitcher
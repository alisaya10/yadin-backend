//? model
const blogsModel = require('../models/blogsModel');

//? useful
const useful = require('../utils/useful');

//? security
const security = require('../security');


let apisList = {

    'blogs/getBlogs': { function: getBlogs, security: null }, // REMOVE

    // 'blogs/getOneBlog': { function: getOneBlog, security: null }, // REMOVE

    'blogs/postBlog': { function: postBlog, security: null },

    'blogs/removeBlog': { function: removeBlog, security: null }, 

    'blogs/searchBlogs': { function: searchBlogs, security: null }, 

    'blogs/getRecommendedBlogs': { function: getRecommendedBlogs, security: null }, 

    'blogs/getSpecialBlogs': { function: getSpecialBlogs, security: null }, 

    'blogs/getOne': { function: getOne, security: null }, 



}


function myApiSwitcher(data, res) {
    useful.apiSwitcher(data, res, apisList)
}


///////////////////// API Functions



// async function getOne(data, res, extra) {
   

//     blogsModel.findOne({_id:data.id}).then((doc)=>{
//         security.sendResponse(res, { info: doc }, 200, 'simpleJson')
//     })

// }






async function getSpecialBlogs(data, res, extra) {
    // console.log("getSpecialBlogs")
    let filter = { special: { $exists: true, $not: { $size: 0 } } }
    filter.removed = false

    if (data.lng != null) {
        filter['lng'] = data.lng
    }


    blogsModel.find(filter).lean().select({ body: 0 }).then((docs) => {


        security.sendResponse(res, { info: docs }, 200, 'simpleJson')

    }).catch(() => { security.sendSomethingWrong(res) })


}




async function getRecommendedBlogs(data, res, extra) {


    let filter = data.filter ? data.filter : {}
    filter.removed = false
    if (data.lng != null) {
        filter['lng'] = data.lng
    }


    blogsModel.findOne({ _id: data._id }).then((blog) => {

        if (blog && blog._id) {
            filter['_id'] = { $ne: blog._id }
            filter['categories'] = { $in: blog.categories }

        }

        blogsModel.aggregate([
            { $match: filter },
            { $sample: { size: 4 } },
            { $project: { body: 0 } }
        ]).then((docs) => {

            security.sendResponse(res, { info: docs }, 200, 'simpleJson')

        }).catch(() => { security.sendSomethingWrong(res) })
    }).catch(() => { security.sendSomethingWrong(res) })


}


async function searchBlogs(data, res, extra) {

    let myRegex = new RegExp([data.search].join(""), "i")

    let filter = { 'title': { $regex: myRegex } }
    filter.removed = false
    if (data.lng != null) {
        filter['lng'] = data.lng
    }

    blogsModel.find(filter).lean().limit(20).select({ body: 0 }).then((docs) => {

        security.sendResponse(res, { info: docs }, 200, 'simpleJson')

    }).catch(() => { security.sendSomethingWrong(res) })

}




async function getOne(data, res, extra) {

    let filter = data

    blogsModel.findOne(filter).lean().then((doc) => {

        security.sendResponse(res, { info: doc }, 200, 'simpleJson')

    }).catch(() => { security.sendSomethingWrong(res) })

}

async function postBlog(data, res, extra) {

    // console.log("postBlog")
    let isNew = true
    if (data._id) {
        isNew = false
    }

    // checkSlug(data, () => {

    if (isNew) {
        let slug = useful.convertToSlug(data.title)
        data.slug = slug
        blogsModel.create({
            image: data.image,
            title: data.title,
            slug: slug,
            categories: data.categories,
            description: data.description,
            body: data.body,
            lng: data.lng,
            tags: data.tags,
            special: data.special,
            teacher: data.teacher,
            cDate: new Date(),
            uDate: new Date(),
            creator: extra.session.user,
            removed: false
        }).then((result) => {
            security.sendResponse(res, { done: true, info: result }, 200, 'simpleJson')
        }).catch(() => { security.sendSomethingWrong(res) })

    } else {
        let slug = useful.convertToSlug(data.slug)
        data.slug = slug

        blogsModel.findOneAndUpdate({ _id: data._id }, {
            image: data.image,
            title: data.title,
            slug: slug,
            categories: data.categories,
            description: data.description,
            body: data.body,
            lng: data.lng,
            tags: data.tags,
            special: data.special,
            teacher: data.teacher,
            uDate: new Date(),
        }, { new: true }).then((result) => {
            security.sendResponse(res, { done: true, info: result }, 200, 'simpleJson')
        }).catch(() => { security.sendSomethingWrong(res) })
    }
    // })
}




async function checkSlug(data, cb) {

    let slug = useful.convertToSlug(data.title)
    // console.log(slug)
    data.slug = slug
    cb()
}


async function getBlogs(data, res, extra) {

    let filter = data.filter ? useful.filterCreator(data.filter) : {}
    let sort = data.sort ? data.sort : { cDate: -1 }
    let limit = data.limit ? data.limit : null
    let skip = data.skip ? data.limit * data.skip : null

    if (data.lng != null) {
        filter['lng'] = data.lng
    }

    filter.removed = false

    blogsModel.find(filter).lean().sort(sort).limit(limit).skip(skip).then((docs) => {

        if (data.getCount) {
            blogsModel.find(filter).count().then((count) => {
                security.sendResponse(res, { info: docs, count }, 200, 'simpleJson')
            })
        } else {
            security.sendResponse(res, { info: docs }, 200, 'simpleJson')
        }

        // security.sendResponse(res, { info: docs }, 200, 'simpleJson')

    }).catch(() => { security.sendSomethingWrong(res) })

}


async function removeBlog(data, res, extra) {

    // console.log(data)
    blogsModel.updateOne({ _id: data.id }, {
        removed: true
    }, { upsert: false }).then(() => {

        security.sendResponse(res, { done: true }, 200, 'simpleJson')

    }).catch((err) => {
        console.log(err);
        security.sendSomethingWrong(res)
    })

}



module.exports = myApiSwitcher
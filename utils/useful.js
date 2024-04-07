var geoip = require('geoip-lite');
const Excel = require('exceljs')
const flat = require('flat');
const moment = require('moment');
const jwt = require("jsonwebtoken");
var slugify = require('slugify')
const mongoose = require('mongoose');
const fs = require('fs');


const { customAlphabet, customRandom, urlAlphabet } = require('nanoid')
const connectionModel = require('../models/connectionModel');
const { alphanumeric } = require('nanoid-dictionary');
const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 10)
const userUtils = require("../utils/user.utils");
const { publisher } = require("../variables");
const security = require('../security');
const { assetsAddress } = require('../variables');


const users = require('../models/userModel');
const employees = require("../models/employeeModel");
const contents = require("../models/contentModel");
const permissionsModel = require('../models/permissionsModel');
const autoGensModel = require('../models/autoGensModel');



//* token genrator
/**
 * function jwt maker
 * @param {*} model model that you have
 * @returns return jsonwebtoken
 */
function generatToken(model) {
    return jwt.sign(model, process.env.JWT_KEY);
}

//*token genrator

//* login user function

/**
 * this function genrate token and give it to you
 * @param {*} user pass the parametr from model 
 * @param {*} res this is the response
 * @param {*} extra this is extra incloud headers and sessions an token
 */
exports.loginProcess = (user, res, extra) => {
    let token = generatToken({ id: user._id });
    // console.log("token", token);
    let userInfo = userUtils.getUserPrivateData(user);
    userInfo.token = token;
    security.sendResponse(res, { authorized: true, user: user, auth: { token } }, 200, extra);
    publisher.publish(
        "user.singin",
        JSON.stringify({ user: userInfo, requestInfo: extra }),
        function () { }
    );
}

exports.adminLoginProcess = (employee, res, extra) => {
    const token = jwt.sign({ id: employee._id, type: 'admin' }, process.env.JWT_KEY)
    delete employee.password

    let adminInfo = employee
    adminInfo.id = employee._id
    permissionsModel.find({ users: employee._id, removed: false }).select("permissions").lean().then((permissions) => {
        // console.log("permissions")
        // console.log(permissions)
        adminInfo.permissions = permissions
        console.log("adminInfo: ", adminInfo)
        security.sendResponse(res, { auth: { token }, user: adminInfo, authorized: true }, 200, extra);
        publisher.publish(
            "admin.singin",
            JSON.stringify({ user: adminInfo, requestInfo: extra }),
            function () { }
        );

    })
}

//* login user function



//* check user exist

/**
 * this function check if user is exist in the database
 * @param {*} authParam pass the parameter that you want to check like "username" it should be string
 * @param {*} authUser this is parameter that you get from the data that user send like data.username
 * @param {*} cb this is callback that give you if user exist or not
 */
exports.checkUserExist = (authParam, authUser, model, cb) => {
    console.log("authParam: ", authParam)
    console.log("authUser: ", authUser)
    mongoose.model(model).findOne({
        [authParam]: authUser,
        removed: false
    })
        .then((result) => {
            console.log("result0: ", result)
            if (result) {
                console.log("reuslt: ", result)
                cb(true);
                return;
            }
            cb(false);
        })
        .catch((err) => cb(null, err.message));
}




//* check user exist



/**
 * this function get you the filtred parametrs
 * @param {*} data this is data that you get from user
 * @param {*} res this is response
 * @param {*} extra this is extra incloud headers and sessions an token
 * @param {*} cb this is callback that give you the result of the filtred parameters
 */
exports.getWrapper = (data, res, extra, cb) => {

    let filter = data.filter ? this.filterCreator(data.filter) : {}
    let limit = data.limit ? data.limit : null
    let skip = data.skip ? data.limit * data.skip : null
    let sort = data.sort ? data.sort : { cDate: -1 }



    cb({ filter, limit, skip, sort })
}


//* check Slug
exports.checkSlug = (data, cb) => {

    let slug = this.convertToSlug(data.values.title)
    console.log(slug)
    data.values.slug = slug
    cb()
}
//* check Slug



exports.postQuery = (data, res, extra, model, object, populates, cb) => {

    // console.log("dd" ,data.image)

    console.log("postQuery")

    let isNew = true
    if (data._id) {
        isNew = false
    }

    if (isNew) {

   

        if (data.values && data.values.title != undefined ) {
            let slug = this.convertToSlug(data.values.title)
            data.values.slug = slug  //Todo contents
        }

        object.values = data.values
        object.cDate = new Date()
        object.uDate = new Date()
        object.creator = extra?.session?.user
        object.removed = false
        object.image = object.image


        // console.log("---------------" ,object)

        mongoose.model(model).create(object).then((result) => {
            // security.sendResponse(res , {success : true} , 200)
            if (populates) {

                // console.log("sjdfklasjdf;" , populates[0])

                mongoose.model(model).findOne({ _id: result._id }).populate((populates ? populates[0] : null)).populate((populates ? populates[1] : null)).then((nresult) => {
                    cb(nresult)
                    // security.sendResponse(res, { success: 200, info: nresult }, 200)
                }).catch((err) => {
                    console.log(err)
                    cb(null,err)
                    // console.log(err);
                    // security.sendSomethingWrong(res)
                })
            } else {
                cb(result)
            }
        }).catch((err) => {
            cb(err)
            console.log(null,err);
            // security.sendSomethingWrong(res)
        })

    } else {

        object.uDate = new Date()

        mongoose.model(model).findOneAndUpdate({ _id: data._id }, object, { new: true }).populate((populates ? populates[0] : null)).populate((populates ? populates[1] : null)).populate((populates ? populates[2] : null)).then((result) => {
            cb(result)
        }).catch((err) => {
            console.log(err);
            cb(null,err)
            // security.sendSomethingWrong(res)
        })
    }
}



exports.findQuery = (data, res, extra, model, findInfo, cb) => {

    // console.log(data)


    mongoose.model(model).find(findInfo.filter).lean().sort(findInfo.sort).limit(findInfo.limit).skip(findInfo.skip).select(findInfo.select).populate(findInfo.populates ? findInfo.populates[0] : null).populate(findInfo.populates ? findInfo.populates[1] : null).populate(findInfo.populates ? findInfo.populates[2] : null).then((docs) => {

        if (data.getCount) {
            mongoose.model(model).find(findInfo.filter).countDocuments().then((count) => {
                cb(docs, count)
            })
        } else {
            cb(docs)
        }

    }).catch((err) => { cb(null, null, err) })
}


/**
 * this is the function for remove query
 * @param {*} data this is data that you get from user
 * @param {*} res this is response
 * @param {*} extra this is extra incloud headers and sessions an token
 * @param {*} model pass your model it should be string
 * @param {*} cb this is callback that give you true or null
 */
exports.removeQuery = (data, res, extra, model, cb) => {

    let date = new Date();

    console.log(typeof model)

    mongoose.model(model).updateOne({ _id: data.id }, {
        removed: true,
        uDate: date
    }, { upsert: false }).then(() => {

        security.sendResponse(res, { success: true }, 200, 'simpleJson')
        cb(true)

    }).catch((err) => {
        security.sendSomethingWrong(res)
        cb(null, err);

    })
}





exports.generateAutoNumber = (section, preText, cb) => {

    autoGensModel.findOneAndUpdate({ type: section, section: 'shop', trashed: false }, { $inc: { number: 1 } }, { new: true }).lean().then(async (doc) => {

        if (doc) {
            cb(preText + doc.number)

        } else {
            autoGensModel.create({ type: section, section: 'shop', trashed: false, number: 1 })
            cb(preText + 1)


        }

    }).catch(err => {
        console.log(err)
        cb(null)
    })
}




exports.excelExport = (rawData, headers, cb) => {

    flatData(rawData, (srcData) => {
        normalizeData(srcData, headers, (newData) => {

            let fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
            let fileExtension = '.xlsx';


            // let rawData = data

            // let Heading = [
            //     ["FirstName", "Last Name", "Email"],
            // ];

            // console.log(rawData)

            // let testData = [{
            //         // _id: null,
           
            //     {

            //         username: 'test.business',
            //         name: 'Test business',
            //         fullname: 'Test business',

            //     },
            //     {

            //         phone: '00989351797429',
            //         name: 'Maryam',
            //         family: 'Ghasemi',
            //         fullname: 'Maryam Ghasemi',
            //         username: 'ghasemi.maryam',
            //         phone: '00011234565433'

            //     },
            //     {

            //         username: 'new.business',
            //         name: 'New business',
            //         fullname: 'New business',
            //         phone: '00011234565433'

            //     },
            //     {

            //         username: 'otherbusiness',
            //         name: 'Other business',
            //         fullname: 'Other business'
            //     },
            //     {

            //         username: 'opia',
            //         name: 'Opia1',
            //         fullname: 'Opia home',
            //         family: 'home',
            //         phone: '00011234565433'
            //     }
            // ]

            // let rawData = XLSX.utils.json_to_sheet(srcData)

            // const wb = { Sheets: { "Result": rawData }, SheetNames: ['Result'] };
            // console.log(srcData)

            // let ws = XLSX.utils.json_to_sheet(srcData, { defval: "" });
            // console.log(ws)
            // let wb = XLSX.utils.book_new();
            // console.log('TP2')

            // XLSX.utils.book_append_sheet(wb, ws, "Export");
            // let excelBuffer = xlsx.build([{ name: "result", data: srcData }]); // Returns a buffer

            // console.log('TP3')

            // XLSX.utils.sheet_add_aoa(wb, Heading)

            // const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

            // console.log('TP4')

            // console.log(excelBuffer)
            // let buffer = Buffer.from(excelBuffer);
            // const data = new Blob([excelBuffer], { type: fileType });
            let name = nanoid() + fileExtension
            let path = assetsAddress + '/' + name
            // console.log(path)
            // fs.writeFile(path, buffer, function(err) {
            //     //     console.log(err);
            //     cb(name)
            // });


            let workbook = new Excel.Workbook()
            let worksheet = workbook.addWorksheet('Codes')
            worksheet.columns = headers

            for (let i = 0; i < srcData.length; i++) {
                const e = srcData[i];
                worksheet.addRow(e)
            }

            worksheet.columns.forEach(column => {
                column.width = 30
            })

            // let fileName = uuid4() + '.xlsx'
            workbook.xlsx.writeFile(path)
            cb(name)

        })

    })
}



flatData = (srcData, cb) => {

    let newData = [...srcData]
    srcData.forEach((oneRow, index) => {
        let oneRowW = flat(oneRow)
        newData[index] = oneRowW
    })
    cb(newData)


}



normalizeData = (srcData, headers, cb) => {
    let promises = []
    if (Array.isArray(srcData)) {
        let newData = [...srcData]
        headers.forEach(header => {

            if (header.type == 'DateInput') {
                srcData.forEach((oneRow, index) => {
                    let oneRowW = flat(oneRow)

                    promises.push(new Promise(async (resolve, reject) => {

                        let format = 'YYYY/MM/DD'

                        if (header.fullHeader && header.fullHeader.information && header.fullHeader.information.includeTime) {
                            format = 'YYYY/MM/DD HH:mm'
                        }
                        oneRowW[header.key] = moment(oneRowW[header.key]).format(format)
                        // console.log(oneRowW[header.key])
                        newData[index][header.key] = oneRowW[header.key]
                        resolve()
                    }))
                });
            }

            if (header.type == 'SelectInput' && header.fullHeader.information.type == 'local') {

                srcData.forEach((oneRow, index) => {
                    let oneRowW = flat(oneRow)

                    promises.push(new Promise(async (resolve, reject) => {
                        itemValue = header.fullHeader.information.items.filter(word => word.value == oneRowW[(isUser ? header.key.replace('values.', '') : header.key)]) //moment(oneRowW[header.key]).format('YYYY/MM/DD')
                        // console.log(itemValue)
                        if (itemValue[0]) {
                            itemValue = itemValue[0]
                        }
                        if (itemValue) {
                            console.log(itemValue.value)
                            newData[index][header.key] = itemValue.title
                        }
                        resolve()
                    }))
                });
            }



        });


        Promise.all(promises).then(() => {
            // console.log(newData)
            cb(newData)

        }).catch(err => {
            cb([])
        })
    } else {
        cb([])
    }
}


exports.apiSwitcher = (request, res, apisList) => {
    // console.log(request)
    if (apisList[request.body.route]) {
        // checkUserStatus(request, (result, err) => {
        // if (apisList[request.body.route].security) {
        security.requestAnalyzer(request, apisList[request.body.route].security, (extra, err) => {
            console.log(err)
            if (err) {
                // res.end(JSON.stringify({ message: 'errors.securityCheckFailed' }));
                security.sendResponse(res, { message: 'errors.securityCheckFailed' }, 400, 'simpleJson')

                return
            }
            extra.routeInfo = apisList[request.body.route]
            let data = request.body.content
            if (!data) {
                data = {}
            }
            apisList[request.body.route].function(data, res, extra)
        })
        // } 
        // else {
        //     apisList[request.body.route].function(data.body.content, res, data.body.route)
        // }
        // })
    } else {
        // console.log("errors.dataIsCorrupted")
        // console.log(request.body.route)
        security.sendResponse(res, { message: 'errors.dataIsCorrupted' }, 400, 'simpleJson')

    }
}



exports.getPinStatus = (object, cb) => {

    // console.log("getPinStatus")
    // console.log(object)

    pinsModel.findOne(object).then((pin) => {

        if (pin) {
            cb(true)
        } else {
            cb(false)
        }

    }).catch((err) => {
        console.log(err);
        cb(null, true)
    })

}



exports.filterCreator = (filter) => {
    let finalFilter = {}
    if (filter && typeof filter == 'object') {
        for (const [key, value] of Object.entries(filter)) {

            if (!value || !value.operator || value.operator == '' || value.operator == 'exact' || value.operator == '=') {
                finalFilter[key] = (value && value.value) ? value.value : value
            }

            if (value && value.operator == 'contains') {
                finalFilter[key] = { $regex: new RegExp(['.*', value.value, '.*'].join(""), "i") }
            }

            if (value && value.operator == 'in') {
                finalFilter[key] = { $in: value.value }
            }

            if (value && value.operator == 'between' && Array.isArray(value.value)) {
                finalFilter[key] = {}

                if (value.value[0]) {
                    finalFilter[key]["$gte"] = value.value[0]
                }
                if (value.value[1]) {
                    finalFilter[key]["$lte"] = value.value[1]
                }
            }
        }

    }

    return finalFilter

}



this.convertToSlug = (text) => {
    if (text) {
        return slugify(text, { lower: true, locale: 'fa' })
    } else {
        return null
    }
    // return Text
    //     .toLowerCase()
    //     .replace(/[^\w ]+/g, '')
    //     .replace(/ +/g, '-');
}


exports.getRequestInfo = (req, cb) => {
    let info = {}
    info.ip = req.headers['x-forwarded-for'] ||
        req.connection?.remoteAddress ||
        req.socket?.remoteAddress ||
        (req.connection?.socket ? req.connection.socket?.remoteAddress : null);

    info.userAgent = req.headers['user-agent'] //req.get('User-Agent')


    let geo = geoip.lookup(info.ip);

    info.geo = geo
    // console.log(geo);

    // console.log(req.headers)
    // if (/mobile/i.test(info.userAgent)) {
    //     console.log("mobibe")
    // }

    cb(info)
}



exports.createConnection = (info, settings, cb) => {

    info.removed = false

    delete info.cDate
    delete info.uDate

    // console.log(info)

    connectionModel.findOne(info).then((oldConnection) => {

        // console.log(oldConnection)
        let now = new Date()
        info.cDate = now
        info.uDate = now
        if (!info.status) {
            info.status = 'A'
        }

        if (oldConnection) {
            // console.log("CONNECTION UPDATE")
            connectionModel.findOneAndUpdate({ _id: oldConnection._id }, info, { new: true }).then((doc) => {

                if (doc) {
                    cb(doc)
                } else {
                    cb(null, 404)
                }

            }).catch((err) => { cb(null, err) })

        } else {

            connectionModel.create(info).then((doc) => {

                if (doc) {
                    cb(doc)
                } else {
                    cb(null, 404)
                }

            }).catch((err) => { cb(null, err) })
        }

    })
}



exports.findConnection = (info, settings, cb) => {

    info.removed = false

    connectionModel.findOne(info).then((doc) => {

        if (doc) {
            cb(doc)
        } else {
            cb(null)
        }

    }).catch((err) => { cb(null, err) })

}






exports.removeConnection = (info, settings, cb) => {


    connectionModel.updateMany(info, {
        removed: true
    }).then((doc) => {

        if (doc) {
            cb(doc)
        } else {
            cb(null)
        }

    }).catch((err) => { cb(null, err) })

}



exports.getObject = (data, key, splitLevel, level, index) => {


    if (data && key) {

        if (key.includes('.') && (splitLevel == null || level == null || splitLevel > (level ? level : 0))) {
            let pList = key.split('.');
            let newKey = [...pList]
            newKey.splice(0, 1).join('.')
            newKey = newKey.join('.')
            return this.getObject(data[pList[0]], newKey, splitLevel, level ? level + 1 : 1, index)

        } else {
            // console.log("KEY")
            // console.log(key)

            // console.log(data)
            return data[key]
        }
    } else {
        return null
    }
}


exports.createUniqueId = (model, key, cb) => {

    let id = nanoid()

    model.findOne({
        [key]: id
    }).then((doc) => {
        if (doc) {
            this.createUniqueId(model, key, cb)
        } else {
            cb(id)
        }
    })
}



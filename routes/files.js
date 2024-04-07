const useful = require('../utils/useful')
const security = require('../security');
const sharp = require('sharp');
const fs = require('fs');
// const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
// ffmpeg.setFfmpegPath(ffmpegPath);
var sizeOf = require('image-size');
const { v4: uuidv4 } = require('uuid');
const { v1: uuidv1 } = require('uuid');

const shell = require('shelljs');
const formidable = require('formidable');
const variables = require('../variables');
const assetsAddress = variables.assetsAddress

let apisList = {

    'files/fileuploader': { function: fileuploader, security: null }, // REMOVE

}


function myApiSwitcher(data, res, path) {
    if (apisList[path]) {
        apisList[path].function(data, res, {})
    } else {
        security.sendSomethingWrong(res)
    }
    // useful.apiSwitcher(data, res, apisList)
}


///////////////////// API Functions


async function fileuploader(data, res, extra) {

    // console.log("data" , data)

    console.log("fileuploader")
    let info = {}
    let promises = []
    parseFormData(data, async (fields, files, err) => {

        console.log("files")
        // console.log(files)

        if (err) {
            console.log(err)
            security.sendSomethingWrong(res)
        } else {
            // console.log(files)

            // console.log(fields)
            // console.log(files.file)
            if (files.file) {

                let file = files.file
                let info = {}

                // console.log(file.size)
                info.address = file.name
                info.storage = file.storage
                info.mime = file.type
                info.size = file.size
                info.extension = file.name.split('.')
                info.extension = info.extension[info.extension.length - 1]




                console.log("filetype" , file.type)
                // console.log("file.type")
                // console.log(file.type)


                if (file.type == 'image/jpg' || file.type == 'image/jpeg' || file.type == 'image/png') {

                    console.log("Image")
                    var dimensions = sizeOf(file.path);

                    info.width = dimensions.width
                    info.height = dimensions.height
                    info.sizes = {}
                    let sizes = [
                        { size: 70, name: 'mini', address: 'mini' },
                        { size: 400, name: 'thumb', address: 'thumb' },
                        { size: 700, name: 'small', address: 'small' },
                        { size: 1024, name: 'medium', address: 'medium' },
                        { size: 1440, name: 'large', address: 'large' },
                    ]


                    for (let i = 0; i < sizes.length; i++) {
                        const oneItem = sizes[i];
                        promises.push(new Promise((resolve, reject) => {
                            resizeImage(file, oneItem, (name, item) => {
                                // console.log("name")
                                // console.log(name)

                                if (!name) {
                                    reject()
                                } else {
                                    info.sizes[item.name] = { address: item.address + '/' + name, size: item.size }
                                    resolve()
                                }
                            })
                        }))
                    }


                    Promise.all(promises).then(() => {
                        console.log(info)
                        security.sendResponse(res, { info: info }, 200, 'simpleJson')

                    }).catch(err => {

                        console.log(err)

                        security.sendSomethingWrong(res)

                        // res.status(500).send({ status: 500, code: '#1005', message: err.message });
                    })


                } else if (file.type == 'video/mp4' || file.type == 'video/m4v' || file.type == 'video/x-m4v') {
                    console.log("video")

                    // console.log("this is file type" ,file.type)

                    // console.log(file.name)

                    // console.log(assetsAddress)

                    let thumb
                    let coverTime = data.coverTime ? data.coverTime : '00:00:00'
                    let destination = file.name
                    let duration

                    console.log("tt", thumb, coverTime, destination, duration)

                    thumb = destination.split('.')[0] + '.png'

                    // console.log(thumb)

                    if (!shell.test('-e', assetsAddress + '/uploads/videos/thumbnails')) {
                        shell.mkdir('-p', assetsAddress + '/uploads/videos/thumbnails')

                    }

                    var proc = new ffmpeg(file.path)
                        .takeScreenshots({
                            count: 1,
                            timemarks: [coverTime],
                            filename: thumb
                        }, assetsAddress + '/uploads/videos/thumbnails', function (err) {
                            if (err) {
                                console.log("ERROR!")
                                console.log(err)
                            }
                        })

                    await ffmpeg.ffprobe(file.path, function (err, metadata) {
                        console.log(err)
                        // console.log("formdata" ,metadata)
                        duration = metadata.format.duration
                        // console.log("dddddd" ,duration)

                        let info = { address: destination, coverTime: coverTime, cover: thumb, duration: duration }
                        // info.mime = req.file.mimetype

                        info = info

                        // console.log("iiiiiiiii" , info)

                        // console.log("info" ,info)

                        // console.log("Video HEREEE!!")
                        security.sendResponse(res, { info: info }, 200, 'simpleJson')
                    });


                } else {
                    console.log("Other")
                    console.log(info)

                    security.sendResponse(res, { info: info }, 200, 'simpleJson')
                }

                // let filePath = files.file.path
            } else {
                security.sendSomethingWrong(res)
            }
            // saveFile(files)
        }
    })
    // console.log(data)
    // if (data.file) {

    //     info.address = req.file.filename
    //     info.mime = req.file.mimetype
    //     info.size = req.file.size
    //     info.extension = req.file.filename.split('.')
    //     info.extension = info.extension[info.extension.length - 1]

    //     if (req.file.mimetype == 'image/jpeg' || req.file.mimetype == 'image/png') {

    //         var dimensions = sizeOf(req.file.path);

    //         info.width = dimensions.width
    //         info.height = dimensions.height
    //         info.sizes = {}
    //         let sizes = [
    //             { size: 70, name: 'mini', address: 'mini' },
    //             { size: 400, name: 'thumb', address: 'thumb' },
    //             { size: 700, name: 'small', address: 'small' },
    //             { size: 1024, name: 'medium', address: 'medium' },
    //             { size: 1440, name: 'large', address: 'large' },
    //         ]


    //         for (let i = 0; i < sizes.length; i++) {
    //             const oneItem = sizes[i];
    //             promises.push(new Promise((resolve, reject) => {
    //                 resizeImage(req.file, oneItem, (name, item) => {
    //                     if (!name) {
    //                         reject()
    //                     } else {
    //                         info.sizes[item.name] = { address: item.address + '/' + name, size: item.size }
    //                         resolve()
    //                     }
    //                 })
    //             }))
    //         }



    //         Promise.all(promises).then(() => {
    //             res.send({ status: 200, info: info })
    //         }).catch(err => {
    //             res.status(500).send({ status: 500, code: '#1005', message: err.message });
    //         })
    //     }


    // } else { security.sendSomethingWrong(res) }

}











////////////////


function parseFormData(req, cb) {

    const form = formidable({ multiples: true, maxFieldsSize: 1000000000000, maxFileSize: 1000000000 });

    console.log('parseFormData')
    form.on('fileBegin', function (name, file) {

        // let file = files.file

        console.log(name)
        console.log(file)

        if (!shell.test('-e', assetsAddress + '/uploads')) {
            shell.mkdir('-p', assetsAddress + '/uploads')
        }

        let newName = merge(uuidv1(), uuidv4()) + (Math.floor(Math.random() * (9999999 - 1))).toString();

        let fileName
        if (file.name) {
            fileName = file.name.split('.')
        } else {
            fileName = file.newFilename.split('.')
        }

        console.log(fileName)

        let extension = file.originalFilename ? file.originalFilename.split('.')[1] : null
        // let extension = fileName.length > 1 ? fileName[fileName.length - 1] : null
        // if (extension == 'blob' || !extension) {
        //   extension = 'jpg'
        // }

        // if (!extension && file.mimetype) {
        //   extension = file.mimetype.split('/')[1]
        // }

        // let extension = fileName.length > 1 ? fileName[fileName.length - 1] : null
        // if (extension == 'blob' || !extension) {
        //     switch (file.mimetype) {
        //         case 'video/mp4': {
        //             extension = 'mp4'
        //             break;
        //         }
        //         case 'image/jpeg' : {
        //             extension = 'jpg'
        //             break;
        //         }
        //         case 'image/png' : {
        //             extension = 'png'
        //             break;
        //         }
        //         case 'audio/mpeg' || 'mp3' : {
        //             extension = 'mp3'
        //             break;
        //         }
        //     }
        // }

        if (!extension && file.mimetype) {
            extension = file.mimetype.split('/')[1]
        }

        console.log(extension)

        newName = newName + '.' + extension
        file.newFilename = newName
        file.name = newName

        file.storage = "uploads"
        file.path = assetsAddress + '/uploads/' + newName;
        file.filepath = assetsAddress + '/uploads/' + newName;

        if (!file.type) {
            file.type = file.mimetype
        }


        console.log(newName)

    });

    form.parse(req, (err, fields, files) => {

        if (err) {
            cb(null, null, err)
        } else {
            cb(fields, files)
        }
    });

}



function resizeImage(file, item, cb) {
    console.log("resizeImage")
    try {
        sharp(file.path).resize({ width: item.size, background: "#fff" }).flatten({ background: { r: 255, g: 255, b: 255, alpha: 1 } }).toFormat('jpg').toBuffer(async (err, buf) => {
            if (err) {
                console.log(err);
                cb(null)
            }
            let imageName = merge(uuidv1(), uuidv4()) + (Math.floor(Math.random() * (9999999 - 1))).toString() + '.jpg';

            // console.log("resizeImage Done")
            // console.log(imageName)

            // console.log(assetsAddress + '/uploads/' + item.address)

            if (!fs.existsSync(assetsAddress + '/uploads/' + item.address)) {
                fs.mkdirSync(assetsAddress + '/uploads/' + item.address, { recursive: true });
            }
            if (!shell.test('-e', assetsAddress + '/uploads/' + item.address)) {
                shell.mkdir('-p', assetsAddress + '/uploads/' + item.address)
            }


            fs.writeFile(assetsAddress + '/uploads/' + item.address + '/' + imageName, buf, function (err) {
                if (err) {
                    console.log(err)
                    cb(null, null, err)
                }
                cb(imageName, item)
            });
        })
    } catch (err) {
        console.log(err);
        cb(null)
    }
}


function merge(str1, str2) {

    var a = str1.split("").filter(Boolean);
    var b = str2.split("");
    var mergedString = '';

    for (var i = 0; i < a.length || i < b.length; i++) { //loop condition checks if i is less than a.length or b.length
        if (i < a.length) //if i is less than a.length add a[i] to string first.
            mergedString += a[i];
        if (i < b.length) //if i is less than b.length add b[i] to string.
            mergedString += b[i];
    }
    return mergedString;
}


module.exports = myApiSwitcher
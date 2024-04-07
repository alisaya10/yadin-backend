var multer = require('multer');
var uuid = require('uuid/v1');
const fs = require('fs')
    // var shell = require('shelljs');


exports.upload = (address) => {
    // console.log("HERE")
    if (!fs.existsSync(address)) {
        // console.log(address)
        // console.log("BUILD")
        fs.mkdirSync(address, { recursive: true });
    }
    // if (!shell.test('-e', address)) {
    //     console.log(address)
    //     shell.mkdir('-p', address)
    //         //fs.mkdirSync(address, { recursive: true });
    // }

    // console.log("UPLOAD")

    var Storage = multer.diskStorage({
        destination: function(req, file, callback) {
            callback(null, address);
        },
        filename: function(req, file, callback) {
            // console.log(file)

            var imageName = uuid();
            // console.log(imageName)
            let fileName = file.originalname.split('.')
                // console.log(file.originalname)
                // console.log(fileName[fileName.length - 1])
            let extension = fileName[fileName.length - 1]
            if (extension == 'blob') {
                extension = 'jpg'
            }
            // console.log(imageName.split('-').join('') + '.' + extension)

            callback(null, imageName.split('-').join('') + '.' + extension);
        }
    });

    var fileFilter = (req, file, cb) => {
        if (file.mimetype === 'image/jpeg') {
            cb(null, true);
        } else {
            cb(null, false)
        }
    }

    var uploader = multer({
        storage: Storage,
        limits: { fileSize: 100000000 },
        // fileFilter: fileFilter
    });

    return uploader;
}
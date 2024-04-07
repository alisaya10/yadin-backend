const useful = require('../utils/useful')
const security = require('../security');
const sharp = require('sharp');
const fs = require('fs');
const PATH = require('path');
// const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
// ffmpeg.setFfmpegPath('C:\\ffmpeg\\bin\\ffmpeg.exe');
// ffmpeg.setFfmpegPath(ffmpegPath);
// var ffmpeg = require('ffmpeg');

var sizeOf = require('image-size');
const { v4: uuidv4 } = require('uuid');
const { v1: uuidv1 } = require('uuid');

const shell = require('shelljs');
const formidable = require('formidable');
const variables = require('../variables');
const assetsAddress = variables.assetsAddress


//! Stream Video
function streamVideo(data, res, path) {
    // console.log("path: ", path)
    // console.log("data.headers:", data.headers)
    // console.log("steaming...")
    const range = data.headers.range;
    // console.log("data.headers.range: ", range)
    if (!range) {
        res.end("Requires Range header")
    }
    let name = path.split('/')[2]
    // console.log("video name: ", name)
    const videoPath = PATH.join(`../../html/yadin`, `/assets/${name}`);
    // console.log("videoPath: ", videoPath)
    const videoSize = fs.statSync(PATH.join(`../../html/yadin`, `/assets/${name}`)).size;
    // console.log("videoSize: ", videoSize)
    const CHUNK_SIZE = 10 ** 5;
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
    const contentLength = end - start + 1;
    const headers = {
        "Content-Range": `bytes ${start}-${end}/${videoSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Type": "video/mp4",
    };
    res.writeHead(206, headers);
    // console.log("PT)", start, end)
    const videoStream = fs.createReadStream(videoPath, { start, end });
    videoStream.pipe(res);
}


module.exports = streamVideo

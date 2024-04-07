const http = require('http');
const fs = require('fs');
const url = require('url');
const md5 = require("md5");
const formidable = require('formidable');
const path = require('path');
const server = http.createServer((req, res) => {

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET , POST , DELET');
    res.setHeader('Access-Control-Max-Age', 2592000); // 30 days



    // console.log()



    const makeUrl = req.url.split("?")[0]

    if (makeUrl == "/uploadFile") {


        const { name, currentChunkIndex, totalChunks } = url.parse(req.url, true).query;
        console.log(name, currentChunkIndex, totalChunks);

        const firstChunk = parseInt(currentChunkIndex) === 0;
        console.log(firstChunk)
        const lastChunk = parseInt(currentChunkIndex) === parseInt(totalChunks) - 1;
        console.log(lastChunk)
        const ext = name.split('.').pop();
        console.log(ext)

        const body = [];
        req.on('data', chank => {
            console.log(chank)
            try {
                body.push(chank)
                console.log(body)
            }
            catch (e) {
                console.log(e)
            }
        }).on('end', () => {
            const data = Buffer.concat(body).toString().split(',')[1];
            console.log(data)
            const buffer = new Buffer.from(data, 'base64');
            const tmpFilename = 'tmp_' + md5(name + req.ip) + '.' + ext;
            if (firstChunk && fs.existsSync('./uploads/' + tmpFilename)) {
                fs.unlinkSync('./uploads/' + tmpFilename);
            }
            fs.appendFileSync('./uploads/' + tmpFilename, buffer);
            if (lastChunk) {
                const finalFilename = md5(Date.now()).substr(0, 6) + '.' + ext;
                fs.renameSync('./uploads/' + tmpFilename, './uploads/' + finalFilename);
                let filename = {
                    finalFilename: finalFilename
                }
                res.end(JSON.stringify(filename));
            } else {
                let success = {
                    ok: "ok"
                }
                res.end(JSON.stringify(success));
            }
        })




    } else if (req.url === "/upload") {
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            console.log(files.voice.originalFilename)
            var oldpath = files.voice.filepath;
            var newpath = path.join(__dirname, '/uploads', files.voice.originalFilename);
            fs.rename(oldpath, newpath, function (err) {
                if (err) throw err;
                res.end('File uploaded and moved!');
            });
        });

    } else if (req.url === "/stream") {



        // const videos = [
        //     {
        //         id : 0,
        //         poster : "/video/0/poster",
        //         duration : "3 min",
        //         name : "flipping"
        //     }, {
        //         id : 1,
        //         poster : "/video/1/poster",
        //         duration : "4 min",
        //         name : "flipping"
        //     }, {
        //         id : 2,
        //         poster : "/video/2/poster",
        //         duration : "3 min",
        //         name : "flipping"
        //     }
        // ]

        // res.end(JSON.stringify(videos))


        const range = req.headers.range;
        if (!range) {
            res.end("Requires Range header")
        }
        const videoPath = path.join(__dirname ,"/assets/Flipping.mp4");
        const videoSize = fs.statSync(path.join(__dirname ,"/assets/Flipping.mp4")).size;
        const CHUNK_SIZE = 10 ** 6;
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
        const videoStream = fs.createReadStream(videoPath, { start, end });
        videoStream.pipe(res);
        
    }
})


server.listen(5000, () => console.log("server runs on port 5000"))
var express = require("express");
var bodyParser = require("body-parser");


const mongoose = require("mongoose");
const crypto = require("crypto");
const http = require("http");
const url = require("url");

const contents = require("./models/contentModel");
const employees = require("./models/employeeModel")

const routes = require("./routes");
var users = require("./models/userModel");
const variables = require("./variables");
const { getRequestInfo } = require("./utils/useful");
const { bssInit } = require("./services/bss.services");
const { initUSocket, initTSocket } = require("./socket");
const security = require("./security");
const { postData } = require("./routes/receiveTest");
const { stream } = require("xlsx");
// const { initMQTT } = require("./mqtt");
// const usersServices = require("./services/users.services");

// const redisDB = variables.redisDB
// const elasticDB = variables.elasticDB
// const cassandraDB = variables.cassandraDB
// const neo4jSession = variables.neo4jSession
const subscriber = variables.subscriber;
// const publisher = variables.publisher
// const kafkaService = variables.kafkaService

require("dotenv").config();

bssInit();
initUSocket();
initTSocket();

function handleRequest(req, res) {
  // console.log("HERE")
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type Authorization");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type,Authorization, Accept"
  );

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method == "POST") {
    let parsedUrl = url.parse(req.url, true);
    let path = parsedUrl.pathname;
    path = path.replace(/^\/+|\/+$/g, "");
    // console.log(path)
    if (path == "yadin/apiv1") {
      apiDecoder(path, req, res);
    } else if (path == "yadin/apiv2") {
      apiDecoder(path, req, res);
    } else if (path.startsWith("yadin/files")) {
      handelFile(req, res, path);
    } else {
      res.statusCode = 404;
      res.end(JSON.stringify({ error: "Bad Request" }));
    }
  } else if (req.method == 'GET') {
    let parsedUrl = url.parse(req.url, true);
    let path = parsedUrl.pathname;
    path = path.replace(/^\/+|\/+$/g, "");
    if (path.startsWith("yadin/stream")) {
      routes['stream'](req, res, path);
    }
  } else {
    res.statusCode = 400;
    //! make sure your request is post in postman
    // console.log(req.method);
    res.end(JSON.stringify({ error: "Bad Request" }));
  }
}

function handelFile(req, res, path) {
  // console.log("handelFile");
  let newPath = path.replace("yadin/", "");
  let section = newPath.split("/")[0];
  console.log("newPath: ", newPath);
  console.log("section: ", section)
  // console.log(section);
  // console.log(newPath);
  if (routes[section]) {
    console.log("routes[section]: ", routes[section])
    // console.log("req: ", req)
    routes[section](req, res, newPath);
  } else {
    console.log("ERRR");
    res.statusCode = 400;
    res.end(JSON.stringify({ error: "{{lang}}errors.dataIsCrrupted0" }));
  }
}




//! decode api
function apiDecoder(type, req, res) {
  let body = "";
  let hasError = false;

  req.on("data", (chunk) => {
    try {
      body += chunk.toString();
    } catch (e) {
      res.statusCode = 400;
      res.end(JSON.stringify({ message: "{{lang}}errors.somethingWentWrong" }));
      hasError = true;
      return;
    }
    // console.log(typeof body)
  });

  req.on("end", () => {
    if (!hasError) {
      try {
        body = JSON.parse(body);
        // console.log(body)
        let request = {
          body: body,
          headers: req.headers,
        };

        getRequestInfo(req, (info) => {
          if (type == "yadin/apiv1") {
            info.type = "user";
          }

          if (type == "yadin/apiv2") {
            info.type = "admin";
          }

          request.info = info;

          // console.log(request.body.route)
          if (request.body.route) {
            //! check route
            // console.log("This is route ", request.body.route)

            let route = request.body.route.split("/")[0];

            // console.log("route", route)

            if (routes[route]) {
              routes[route](request, res);
            } else {

              // console.log("err 0");

              res.statusCode = 400;
              res.end(
                JSON.stringify({ error: "{{lang}}errors.dataIsCrrupted0" })
              );
            }
          } else {
            res.statusCode = 400;
            res.end(
              JSON.stringify({ error: "{{lang}}errors.dataIsCrrupted1" })
            );
          }
        });
      } catch (e) {
        console.log(e)
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "{{lang}}errors.dataIsCrrupted2" }));
      }
    }
  });
}


//! create server http
const server = http.createServer(handleRequest);
server.listen(variables.PORT, variables.HOSTNAME, () => {
  console.log(
    `Server running at http://${variables.HOSTNAME}:${variables.PORT}/`
  );
});


//! express
var xapp = express();
xapp.use(bodyParser.urlencoded({ extended: true }));
xapp.use(bodyParser.json());


//! modleware for allow all access to the browser
var allowCrossDomain = function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type Authorization");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type,Authorization, Accept"
  );
  next();
};

xapp.use(allowCrossDomain);

xapp.post("/rira/postdata1", (req, res) => {
  security.sendResponse(
    res,
    { info: { success: true }, success: true },
    200,
    "simpleJson"
  );
});

xapp.post("/rira/postdata", (req, res) => {
  postData(req.body.content, res, { session: { thing: "test" } });
});

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
};



//! mongodb connect Database
mongoose.connect(
  variables.MONGOADDRESS + variables.DATABSENAME,
  options,
  (err, db) => {

    if (err) {
      console.log(err);
    }

    employees
      .find()
      .countDocuments()
      .then((count) => {

        let date = new Date();

        if (count == 0) {
          crypto.scrypt("admin", "salt", 64, (err, hash) => {


            if (err) throw err;
            // users.create({
            //   username: "admin",
            //   name: "admin",
            //   family: "user",
            //   fullname: "admin user",
            //   password: hash.toString("hex"),
            //   role: "admin",
            //   type: "user",
            //   roles: ["admin", "superadmin"],
            // }, {
            //   username: "reza",
            //   name: "reza",
            //   family: "user",
            //   fullname: "admin user",
            //   password: hash.toString("hex"),
            //   role: "admin",
            //   type: "user",
            //   roles: ["admin", "superadmin"],
            // }
            // ).then((user) => {
            employees.create({
              name: "admin",
              email: "aliphm4@gmail.com",
              phone: "9385991925",
              username: "admin",
              password: hash.toString("hex"),
              removed: false,
              uDate: date,
            });
          });
          // });
        }
      });
  }
);

//? Model
const vouchersModel = require("../models/vouchersModel");

//? Useful
const useful = require("../utils/useful");
// const moment = require('moment-timezone');


//? Security
const security = require("../security");

const apisList = {
  //! Create / Update voucher
  "vouchers/add": { function: vouchersCreate, security: null, Response: { type: "json" }, },

  // //! Get All vouchers
  // "vouchers/getAll": { function: vouchersGetAll, security: null, Response: { type: "json" }, },

  //! Get One voucher
  "vouchers/getOne": { function: vouchersGetOne, security: null, Response: { type: "json" }, },

  //! Remove voucher
  "vouchers/remove": { function: vouchersRemove, security: null, Response: { type: "json" }, },

  //!validata voucher
  "vouchers/validate": { function: vouchersValidate, security: null, Response: { type: "json" }, },

  "vouchers/getAllAdmin": { function: vouchersGetAllAdmin, security: null, Response: { type: "json" }, },

  
};

//* My Api Switcher
function myApiSwitcher(data, res) {
  useful.apiSwitcher(data, res, apisList);
}

//! Create / Update voucher
async function vouchersCreate(data, res, extra) {
  let object = {
    id: data.id,
  
    amount: data.amount,
    min: data.min,
    status: data.status,
    description: data.description,
    
  };

  useful.postQuery(data, res, extra, "vouchers", object, null, (data) => {
    security.sendResponse(
      res,
      { info: data, success: true },
      200,
      "simpleJson"
    );
  });
}




//! Get All vouchers
async function vouchersGetAllAdmin(data, res, extra) {
  useful.getWrapper(data, res, extra, (wrapperRes) => {
    wrapperRes.filter.removed = false;
   
    wrapperRes.populates = [{ path: "user" }]


    useful.findQuery(data, res, extra, "vouchers", wrapperRes, (docs, count, err) => {
      if (err) {
        console.log(err);
        security.sendSomethingWrong(res);
      } else {
       
        security.sendResponse(res, { info: docs, count }, 200, "simpleJson");
      }
    }
    );
  });
}

// //! Get All vouchers
// async function vouchersGetAll(data, res, extra) {
//   useful.getWrapper(data, res, extra, (wrapperRes) => {
//     wrapperRes.filter.removed = false;
//     if (data.lng) {
//       wrapperRes.filter["lng"] = data.lng;
//     }
//     if (data.filter.user) {
//       wrapperRes.filter['user'] = data.filter.user
//     }
//     if (data.filter.status) {
//       wrapperRes.filter['status'] = data.filter.status
//     }

//     useful.findQuery(data, res, extra, "vouchers", wrapperRes, (docs, count, err) => {
//       if (err) {
//         console.log(err);
//         security.sendSomethingWrong(res);
//       } else {
//         let finalDoc = []
//         let finalCount = 0
//         docs.forEach((doc) => {
//           if (moment(doc?.eDate).valueOf() >= moment(new Date).valueOf()) {
//             finalDoc.push(doc)
//             finalCount++
//           }
//         })
//         security.sendResponse(res, { info: finalDoc, finalCount }, 200, "simpleJson");
//       }
//     }
//     );
//   });
// }

//! Get One voucher

async function vouchersGetOne(data, res, extra) {
  vouchersModel.findOne({ _id: data.id, removed: false }).lean().then((doc) => {
    security.sendResponse(res, { info: doc }, 200, "simpleJson");
  });
}

//! Remove voucher

async function vouchersRemove(data, res, extra) {
  useful.removeQuery(data, res, extra, "vouchers", (success) => {
    // security.sendResponse(res, { success }, 200, "simpleJson");
  });
}

// //! validate voucher

// async function vouchersValidate(data, res, extra) {
//   console.log("data voucher: ", data)
//   if (extra.session.user && data.voucher) {
//     let voucher = data.voucher;
//     voucher = voucher.toUpperCase();

//     vouchersModel.findOne({ "id": voucher, "user": extra.session.user }).then((doc) => {
//       if (doc) {
//         if (doc.status == "1") {
//           security.sendResponse(res, { status: 401, code: "#104", message: "This voucher is used previously" }, 401, extra, 'simpleJson');
//         } else {
//           security.sendResponse(res, { status: 200, info: doc }, 200, extra, 'simpleJson');
//         }
//       } else {
//         security.sendResponse(res, { status: 401, code: "#104", message: "Voucher is not valid" }, 401, extra, 'simpleJson');
//       }
//     })
//       .catch((err) => {
//         security.sendResponse(res, { status: 500, code: "#104", message: err.message }, 500, extra, 'simpleJson');
//       });
//   } else {
//     security.sendResponse(res, { status: 401, code: "#104", message: "Privilege error" }, 401, extra, 'simpleJson');
//   }
// }
//! validate voucher

async function vouchersValidate(data, res, extra) {
  console.log("data voucher: ", data)
  if (extra.session.user && data.voucher) {
    let voucher = data.voucher;
    voucher = voucher.toUpperCase();

    vouchersModel.findOne({ "id": voucher}).then((doc) => {
      if (doc) {
        if (doc.status == "1") {
          security.sendResponse(res, { status: 401, code: "#104", message: "This voucher is used previously" }, 401, extra, 'simpleJson');
        } else {
          security.sendResponse(res, { status: 200, info: doc }, 200, extra, 'simpleJson');
        }
      } else {
        security.sendResponse(res, { status: 401, code: "#104", message: "Voucher is not valid" }, 401, extra, 'simpleJson');
      }
    })
      .catch((err) => {
        security.sendResponse(res, { status: 500, code: "#104", message: err.message }, 500, extra, 'simpleJson');
      });
  } else {
    security.sendResponse(res, { status: 401, code: "#104", message: "Privilege error" }, 401, extra, 'simpleJson');
  }
}

module.exports = myApiSwitcher;

//? Model
const permissionsModel = require("../models/permissionsModel");

//? Useful
const useful = require("../utils/useful");

//? Security
const security = require("../security");

const apisList = {
  //! Create / Update permission
  "permissions/add": {
    function: permissionsCreate,
    security: null,
    Response: { type: "json" },
  },

  //! Get All permissions
  "permissions/getAll": {
    function: permissionsGetAll,
    security: null,
    Response: { type: "json" },
  },

  //! Get One permission
  "permissions/getOne": {
    function: permissionsGetOne,
    security: null,
    Response: { type: "json" },
  },

  //! Remove permission
  "permissions/remove": {
    function: permissionsRemove,
    security: null,
    Response: { type: "json" },
  },
};

//* My Api Switcher
function myApiSwitcher(data, res) {
  useful.apiSwitcher(data, res, apisList);
}

//! Create / Update permission
async function permissionsCreate(data, res, extra) {
  console.log('here');
  let object = {
    description: data.description,
    permissions: data.permissions,
    users: data.users,
  };

  useful.postQuery(data, res, extra, "permissions", object, null, (data) => {
    security.sendResponse(
      res,
      { info: data, success: true },
      200,
      "simpleJson"
    );
  });
}

//! Get All permissions
async function permissionsGetAll(data, res, extra) {
  useful.getWrapper(data, res, extra, (wrapperRes) => {
    wrapperRes.filter.removed = false;
    if (data.lng) {
      wrapperRes.filter["lng"] = data.lng;
    }

    wrapperRes.populates = [{ path: 'users', select: ['image', 'username', 'name'] }]


    useful.findQuery(data, res, extra, "permissions", wrapperRes, (docs, count, err) => {
      if (err) {
        console.permission(err);
        security.sendSomethingWrong(res);
      } else {
        security.sendResponse(res, { info: docs, count }, 200, "simpleJson");
      }
    }
    );
  });
}

//! Get One permission

async function permissionsGetOne(data, res, extra) {
  permissionsModel.findOne({ _id: data.id, removed: false }).populate('users', 'name username image').lean().then((doc) => {
    security.sendResponse(res, { info: doc }, 200, "simpleJson");
  });
}

//! Remove permission

async function permissionsRemove(data, res, extra) {
  useful.removeQuery(data, res, extra, "permissions", (success) => {
    security.sendResponse(res, { success }, 200, "simpleJson");
  });
}

module.exports = myApiSwitcher;

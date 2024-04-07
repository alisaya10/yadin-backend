const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({

    // permissions : {type : Object},
    // users : {type : Array},
    // description : {type : String}
    permissions: { type: Object },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "employees" }],
    description: { type: String },
    active: { type: Number, default: 1 },
    removed: { type: Boolean, default: false },
    cDate: { type: Date },
    uDate: { type: Date },

})

module.exports = mongoose.model('permissions' , permissionSchema)
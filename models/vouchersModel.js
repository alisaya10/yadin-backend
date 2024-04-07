//done

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const valueSchema = new Schema({
  id: { type: String },
  amount: { type: Number },
  min: { type: Number },
  status: { type: String , default: '0' },
  description: { type: String },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },

  active: { type: Number, default: 1 },
  removed: { type: Boolean, default: false },
  archived: { type: Boolean, default: false },
  uDate: { type: Date },
  eDate: { type: Date },
  cDate: { type: Date },
});

module.exports = mongoose.model("vouchers", valueSchema);

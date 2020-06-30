const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
  image: { type: String, required: true },
  notifCreator: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  postAuthor: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
});

notificationSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Notification", notificationSchema);

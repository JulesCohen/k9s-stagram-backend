const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const commentSchema = new Schema({
  author: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  message: { type: String, required: true },
});

module.exports = mongoose.model("Comment", commentSchema);

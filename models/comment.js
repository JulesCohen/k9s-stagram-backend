const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const commentSchema = new Schema({
  author: {
    id: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
    userName: { type: String, required: true },
  },
  message: { type: String, required: true },
});

module.exports = mongoose.model("Comment", commentSchema);

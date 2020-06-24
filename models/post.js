const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const postSchema = new Schema({
  author: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  location: { type: String, required: true },
  date: { type: String },
  description: { type: String, required: true },
  likes: {
    count: { type: Number, default: 0 },
    users: [{ type: String, required: true }],
  },
  image: { type: String, required: true },
  comments: [{ type: mongoose.Types.ObjectId, required: true, ref: "Comment" }],
});

module.exports = mongoose.model("Post", postSchema);

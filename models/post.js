const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const postSchema = new Schema({
  author: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  location: { type: String, required: true },
  date: { type: Date, default: new Date() },
  description: { type: String, required: true },
  hashtags: { type: String },
  likes: { type: Number, default: 0 },
  image: { type: String, required: true },
  comments: [{ type: mongoose.Types.ObjectId, required: true, ref: "Comment" }],
});

module.exports = mongoose.model("Post", postSchema);

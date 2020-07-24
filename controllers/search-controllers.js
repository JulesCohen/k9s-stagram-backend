const HttpError = require("../models/http-error");
const mongoose = require("mongoose");
const Post = require("../models/post");
const User = require("../models/user");
const Comment = require("../models/comment");

const searchUser = async (req, res, next) => {
  const query = req.params.query;
  let users;
  try {
    var regexp = new RegExp(`^${query}`, "i");
    users = await User.find({ userName: regexp }, "userName image");
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find a user.",
      500
    );
    return next(error);
  }

  res.json({ users: users.map((user) => user.toObject({ getters: true })) });
};

const searchHashtags = async (req, res, next) => {
  const query = req.params.query;
  let posts;
  try {
    var regexp = new RegExp(`\#${query}`, "i");
    posts = await Post.find({ description: regexp }, "description");
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find posts.",
      500
    );
    return next(error);
  }

  let hashtags = [];
  console.log(posts);

  if (posts) {
    for (post in posts) {
      console.log(post);
      // var regexp = new RegExp(`\#\\w+`, "i");
      var regexp = new RegExp(`\#[${query}]\\w+`, "i");
      let result = posts[post].description.match(regexp);
      hashtags.push(result[0]);
    }
  }

  const hashSet = new Set(hashtags);
  hashtags = [...hashSet];

  res.json({ hashtags });
};

exports.searchUser = searchUser;
exports.searchHashtags = searchHashtags;

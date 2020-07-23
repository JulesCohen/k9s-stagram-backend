const HttpError = require("../models/http-error");
const mongoose = require("mongoose");
const Post = require("../models/post");
const User = require("../models/user");
const Comment = require("../models/comment");

const search = async (req, res, next) => {
  //   console.log("SEARCH");
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

exports.search = search;

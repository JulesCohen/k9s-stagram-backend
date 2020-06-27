const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const AWS = require("aws-sdk");
const deleteImage = require("../middleware/file-delete");
const mongoose = require("mongoose");

const HttpError = require("../models/http-error");
const User = require("../models/user");

const getUserById = async (req, res, next) => {
  const userId = req.params.uid;

  let user;

  try {
    user = await User.findById(userId, "-password -email").populate({
      path: "posts",
      populate: {
        path: "comments",
      },
    });
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find a user.",
      500
    );
    return next(error);
  }

  if (!user) {
    const error = new HttpError(
      "Could not find a user for the provided id.",
      404
    );
    return next(error);
  }

  res.json({ user: user.toObject({ getters: true }) });
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );

    return next(err);
  }

  const {
    userName,
    firstName,
    lastName,
    email,
    password,
    imageLocation,
  } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      "Signing up failed, please try again later.",
      500
    );
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError(
      "User exists already, please login instead.",
      422
    );
    return next(error);
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError(
      "Could not create user, please try again.",
      500
    );
    return next(error);
  }

  const createdUser = new User({
    userName,
    firstName,
    lastName,
    email,
    image: imageLocation,
    password: hashedPassword,
    places: [],
    followers: [],
    followings: [],
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError(
      "Signing up failed, please try again later.",
      500
    );
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new HttpError(
      "Signing up failed [token failed], please try again later.",
      500
    );
    return next(error);
  }

  res
    .status(201)
    .json({ userId: createdUser.id, email: createdUser.email, token: token });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;

  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      "Logging in failed, please try again later.",
      500
    );
    return next(error);
  }

  if (!existingUser) {
    const error = new HttpError(
      "Invalid credentials, could not log you in.",
      403
    );
    return next(error);
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    const error = new HttpError(
      "Could not log you in, please check your credentials and try again.",
      500
    );
    return next(error);
  }

  if (!isValidPassword) {
    const error = new HttpError(
      "Invalid credentials, could not log you in.",
      401
    );
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new HttpError(
      "Logging in failed, please try again later.",
      500
    );
    return next(error);
  }
  console.log("LOGIN OK");
  res.json({
    userId: existingUser.id,
    email: existingUser.email,
    token: token,
  });
};
const followUser = async (req, res, next) => {
  const userId = req.params.uid;

  let user;
  try {
    user = await User.findById(userId);
  } catch (err) {
    const error = new HttpError("Follow failed, please try again later.", 500);
    return next(error);
  }

  let followedUser;
  try {
    followedUser = await User.findById(req.body.followUserId);
  } catch (err) {
    const error = new HttpError("Follow failed, please try again later.", 500);
    return next(error);
  }

  if (!user || !followedUser) {
    const error = new HttpError("User not found, please try again later.", 404);
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();

    followedUser.followers.push(user);
    await followedUser.save({ session: sess });

    user.followings.push(followedUser);
    await user.save({ session: sess });

    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError("Follow failed, please try again.", 500);
    console.log(err);
    return next(error);
  }

  res.status(201).json({ message: "User followed" });
};

const unFollowUser = async (req, res, next) => {
  const userId = req.params.uid;

  let user;
  try {
    user = await User.findById(userId);
  } catch (err) {
    const error = new HttpError(
      "Unfollow failed, please try again later.",
      500
    );
    return next(error);
  }

  let followedUser;
  try {
    followedUser = await User.findById(req.body.followUserId);
  } catch (err) {
    const error = new HttpError(
      "Unfollow failed, please try again later.",
      500
    );
    return next(error);
  }

  if (!user || !followedUser) {
    const error = new HttpError("User not found, please try again later.", 404);
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();

    followedUser.followers.pull(user);
    await followedUser.save({ session: sess });

    user.followings.pull(followedUser);
    await user.save({ session: sess });

    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError("Unfollow failed, please try again.", 500);
    console.log(err);
    return next(error);
  }

  res.status(201).json({ message: "User unfollowed" });
};

exports.getUserById = getUserById;
exports.signup = signup;
exports.login = login;
exports.followUser = followUser;
exports.unFollowUser = unFollowUser;

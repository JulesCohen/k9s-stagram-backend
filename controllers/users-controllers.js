const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const AWS = require("aws-sdk");
const deleteImage = require("../middleware/file-delete");

const HttpError = require("../models/http-error");
const User = require("../models/user");

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      deleteImage(req),
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
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
    // deleteImage(req);
    const error = new HttpError(
      "Signing up failed, please try again later.",
      500
    );
    return next(error);
  }

  if (existingUser) {
    deleteImage.deleteImage(req);
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
    deleteImage(req);
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
  });

  try {
    await createdUser.save();
  } catch (err) {
    deleteImage(req);
    const error = new HttpError(
      "Signing up failed, please try again later.",
      500
    );
    return next(error);
  }

  //   let token;
  //   try {
  //     token = jwt.sign(
  //       { userId: createdUser.id, email: createdUser.email },
  //       process.env.JWT_KEY,
  //       { expiresIn: "1h" }
  //     );
  //   } catch (err) {
  //     const error = new HttpError(
  //       "Signing up failed, please try again later.",
  //       500
  //     );
  //     return next(error);
  //   }

  //   res
  //     .status(201)
  //     .json({ userId: createdUser.id, email: createdUser.email, token: token });

  res.status(201).json(createdUser);
};

exports.signup = signup;

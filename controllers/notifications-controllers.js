const HttpError = require("../models/http-error");
const Post = require("../models/post");
const mongoose = require("mongoose");
const User = require("../models/user");
const Comment = require("../models/comment");
const Notification = require("../models/notification");
const pusher = require("../util/notifications");

const getNotifications = async (req, res, next) => {
  const userId = req.params.uid;
  console.log("BACK NOTIF");
  let user;

  try {
    user = await User.findById(userId, "notifications").populate({
      path: "notifications",
      populate: {
        path: "postAuthor",
      },
      populate: {
        path: "notifCreator",
        select: "userName id",
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

  res.json({ user: user.notifications.toObject({ getters: true }) });
};

const createNotification = async (req, res, next) => {
  const { type, notifCreator, postAuthor, image, data } = req.body;

  //   pusher.push(type, notifCreator.userName, postAuthor, image);

  var message;
  switch (type) {
    case "like":
      message = ` liked your photo!`;
      break;
    case "comment":
      message = ` has commented your photo!`;
      break;
    case "follow":
      message = ` followed you!`;
      break;

    default:
      break;
  }

  const notif = new Notification({
    image: image,
    notifCreator: notifCreator,
    postAuthor: postAuthor,
    message: message,
    read: false,
  });

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await notif.save({ session: sess });
    postAuthor.notifications.push(notif);
    await postAuthor.save({ session: sess });
    await sess.commitTransaction();
    await notif.save();

    if (notifCreator.id !== postAuthor.id) {
      pusher.push(message, notifCreator.userName, postAuthor, image);
    }
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      "Creating notification failed, please try again.",
      500
    );
    return next(error);
  }

  if (type === "follow") {
    res.status(201).json({
      data: data,
    });
  } else {
    res.status(201).json({
      data: data.toObject({ getters: true }),
    });
  }
};

const deleteNotification = async (req, res, next) => {
  const notifId = req.body.notifId;

  let notif;
  try {
    notif = await await Notification.findById(notifId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete notification.",
      500
    );
    return next(error);
  }

  if (!notif) {
    const error = new HttpError(
      "Could not find a notification for this id.",
      404
    );
    return next(error);
  }
  let user;
  console.log(req.params.uid);
  try {
    user = await await User.findById(req.params.uid);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete notifications.",
      500
    );
    return next(error);
  }

  console.log(user);

  if (!user) {
    const error = new HttpError("Could not find a user for this id.", 404);
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await notif.remove({ session: sess });
    user.notifications.pull(notif);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete notifications.",
      500
    );
    return next(error);
  }

  res.status(200).json({ message: "Notifications deleted." });
};

exports.getNotifications = getNotifications;
exports.createNotification = createNotification;
exports.deleteNotification = deleteNotification;

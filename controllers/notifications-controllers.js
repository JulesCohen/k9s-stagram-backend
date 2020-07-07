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

    pusher.push(message, notifCreator.userName, postAuthor, image);
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

exports.getNotifications = getNotifications;
exports.createNotification = createNotification;

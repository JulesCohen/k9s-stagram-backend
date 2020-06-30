const HttpError = require("../models/http-error");
const Post = require("../models/post");
const mongoose = require("mongoose");
const User = require("../models/user");
const Comment = require("../models/comment");
const notification = require("../util/notifications");

const createComment = async (req, res, next) => {
  const { userId, comment } = req.body;
  const postId = req.params.pid;
  let user;
  try {
    user = await User.findById(userId);
  } catch (err) {
    const error = new HttpError(
      "Commenting post failed, please try again.",
      500
    );
    return next(error);
  }

  if (!user) {
    const error = new HttpError("Could not find user for provided id..", 404);
    return next(error);
  }

  const createdComment = new Comment({
    author: {
      id: userId,
      userName: user.userName,
    },
    comment,
  });

  let post;
  try {
    post = await Post.findById(postId).populate("author");
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not add your comment.",
      500
    );
    return next(error);
  }

  if (!post) {
    const error = new HttpError("Could not find a post for provided id.", 404);
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdComment.save({ session: sess });
    post.comments.push(createdComment);
    await post.save({ session: sess });
    await sess.commitTransaction();
    await createdComment.save();
  } catch (err) {
    const error = new HttpError(
      "Creating comment failed, please try again.",
      500
    );
    return next(error);
  }

  req.body.data = createdComment;
  req.body.type = "comment";
  req.body.notifCreator = user;
  req.body.postAuthor = post.author;
  req.body.image = post.image;

  next();
};

const deleteComment = async (req, res, next) => {
  const postId = req.params.pid;

  let post;
  try {
    post = await await Post.findById(postId).populate("comments");
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete comment.",
      500
    );
    return next(error);
  }

  if (!post) {
    const error = new HttpError("Could not find a post for this id.", 404);
    return next(error);
  }
  let comment;
  try {
    comment = await await Comment.findById(req.body.commentId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete comment.",
      500
    );
    return next(error);
  }

  if (!comment) {
    const error = new HttpError("Could not find a comment for this id.", 404);
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await comment.remove({ session: sess });
    post.comments.pull(comment);
    await post.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete comment.",
      500
    );
    return next(error);
  }

  res.status(200).json({ message: "Deleted comment." });
};

exports.createComment = createComment;
exports.deleteComment = deleteComment;

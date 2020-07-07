const HttpError = require("../models/http-error");
const Post = require("../models/post");
const User = require("../models/user");
const notification = require("../util/notifications");

const updateLikes = async (req, res, next) => {
  const { likeAction, userId } = req.body;
  const postId = req.params.pid;

  let post;
  try {
    post = await Post.findById(postId).populate("author");
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not handle your action.",
      500
    );
    return next(error);
  }

  if (!post) {
    const error = new HttpError("Could not find a post for provided id.", 404);
    return next(error);
  }

  let user;
  try {
    user = await User.findById(userId, "userName");
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not handle your action.",
      500
    );
    return next(error);
  }

  if (!user) {
    const error = new HttpError("Could not find a user for provided id.", 404);
    return next(error);
  }

  if (likeAction === "add") {
    post.likes.count += 1;
    post.likes.users.push(user.id);
  }
  if (likeAction === "sub") {
    if (post.likes === 0) {
      const error = new HttpError("Could sub a like, already at 0.", 404);
      return next(error);
    }
    post.likes.count -= 1;
    post.likes.users = post.likes.users.filter((userid) => userid !== user.id);
  }

  try {
    await post.save();
    if (likeAction === "add") {
      req.body.data = post.likes.count;
      req.body.type = "like";
      req.body.notifCreator = user;
      req.body.postAuthor = post.author;
      req.body.image = post.image;

      next();
      // notification.push("like", user.userName, post.author, post.image);
    }
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update likes.",
      500
    );
    return next(error);
  }
  res.status(200).json({ count: post.likes.count });
};

exports.updateLikes = updateLikes;

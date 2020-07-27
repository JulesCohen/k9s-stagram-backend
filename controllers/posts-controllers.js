const HttpError = require("../models/http-error");
const deleteImage = require("../middleware/file-delete");
const Post = require("../models/post");
const mongoose = require("mongoose");
const User = require("../models/user");

var moment = require("moment");

const getPosts = async (req, res, next) => {
  let posts;
  try {
    posts = await Post.find()
      .populate("author", "-password -email -posts -followers")
      .populate({
        path: "comments",
        populate: {
          path: "author",
          select: "userName id",
        },
      });
  } catch (err) {
    const error = new HttpError(
      "Fetching posts failed, please try again later.",
      500
    );
    return next(error);
  }
  res.json({ posts: posts.map((post) => post.toObject({ getters: true })) });
};

const getFollowedPosts = async (req, res, next) => {
  const userId = req.params.uid;

  let user;
  try {
    user = await User.findById(userId);
  } catch (err) {
    const error = new HttpError(
      "Fetching posts failed, please try again later.",
      500
    );
    return next(error);
  }

  let posts;
  try {
    posts = await Post.find()
      .where("author")
      .in(user.followings)
      .populate("author", "-password -email -posts -followers")
      .populate({
        path: "comments",
        populate: {
          path: "author",
          select: "userName id",
        },
      });
  } catch (err) {
    const error = new HttpError(
      "Fetching posts failed, please try again later.",
      500
    );
    return next(error);
  }

  res.json({ posts: posts.map((post) => post.toObject({ getters: true })) });
};

const getPostsByHashtag = async (req, res, next) => {
  let posts;
  try {
    // posts = await Post.find({ hastags: `#${req.params.hashtag}` })
    posts = await Post.find({
      description: { $regex: `#${req.params.hashtag}`, $options: "i" },
    })
      // .sort("-date")
      .populate("comments")
      .populate("author", "-password -email -posts -followers -followings");
  } catch (err) {
    const error = new HttpError(
      "Fetching posts failed, please try again later.",
      500
    );
    return next(error);
  }
  res.json({ posts: posts.map((post) => post.toObject({ getters: true })) });
};

const getPostsByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  let posts;
  try {
    posts = await Post.find({ author: userId })
      .populate("author", "-password -email -posts -followers")
      .populate({
        path: "comments",
        populate: {
          path: "author",
          select: "userName id",
        },
      });
  } catch (err) {
    const error = new HttpError(
      "Fetching posts failed, please try again later.",
      500
    );
    return next(error);
  }

  res.json({ posts: posts.map((post) => post.toObject({ getters: true })) });
};

const createPost = async (req, res, next) => {
  const { userId, location, description, hashtags, imageLocation } = req.body;

  const createdPost = new Post({
    author: userId,
    location,
    description,
    date: moment().format("MMMM Do YYYY"),
    image: imageLocation,
    likes: {
      count: 0,
      users: [],
    },
    comments: [],
  });

  let user;
  try {
    user = await User.findById(userId);
  } catch (err) {
    deleteImage.deleteImage(req.body.key);
    const error = new HttpError("Creating post failed, please try again.", 500);
    return next(error);
  }

  if (!user) {
    deleteImage.deleteImage(req.body.key);
    const error = new HttpError("Could not find user for provided id.", 404);
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPost.save({ session: sess });
    user.posts.push(createdPost);
    await user.save({ session: sess });
    await sess.commitTransaction();
    await createdPost.save();
  } catch (err) {
    deleteImage.deleteImage(req.body.key);
    const error = new HttpError("Creating post failed, please try again.", 500);
    return next(error);
  }

  res.status(201).json({ post: createdPost.toObject({ getters: true }) });
};

const deletePost = async (req, res, next) => {
  const postId = req.params.pid;

  let post;
  try {
    post = await await Post.findById(postId)
      .populate("author")
      .populate("comments");
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete post.",
      500
    );
    return next(error);
  }

  if (!post) {
    const error = new HttpError("Could not find a post for this id.", 404);
    return next(error);
  }

  // if (place.creator.id !== req.userData.userId) {
  //   const error = new HttpError(
  //     "You're are not allowed to delete this place..",
  //     401
  //   );
  //   return next(error);
  // }

  let key = post.image.split("/");
  key = key[key.length - 1];

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await post.remove({ session: sess });
    post.author.posts.pull(post);
    await post.comments.map((comment) => comment.remove({ session: sess }));
    await post.author.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update place.",
      500
    );
    return next(error);
  }

  deleteImage.deleteImage(key);

  res.status(200).json({ message: "Deleted post." });
};

exports.getPosts = getPosts;
exports.getFollowedPosts = getFollowedPosts;
exports.getPostsByHashtag = getPostsByHashtag;
exports.getPostsByUserId = getPostsByUserId;
exports.createPost = createPost;
exports.deletePost = deletePost;

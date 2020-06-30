const express = require("express");
const { check } = require("express-validator");
const fileUpload = require("../middleware/file_upload");
const postsControllers = require("../controllers/posts-controllers");
const commentsControllers = require("../controllers/comments-controllers");
const likesControllers = require("../controllers/likes-controllers");
const imagesControllers = require("../controllers/images-controllers");
const notificationsControllers = require("../controllers/notifications-controllers");
const router = express.Router();

router.get("/", postsControllers.getPosts);
router.post(
  "/",
  fileUpload.single("image"),
  imagesControllers.uploadImage,
  postsControllers.createPost
);
router.get("/followed/:uid", postsControllers.getFollowedPosts);
router.get("/users/:uid", postsControllers.getPostsByUserId);
router.get("/hashtag/:hashtag", postsControllers.getPostsByHashtag);

router.post(
  "/:pid/comments",
  commentsControllers.createComment,
  notificationsControllers.createNotification
);
router.delete("/:pid/comments", commentsControllers.deleteComment);
router.patch("/:pid/likes", likesControllers.updateLikes);

router.delete("/:pid", postsControllers.deletePost);

module.exports = router;

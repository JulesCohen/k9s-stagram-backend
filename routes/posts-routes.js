const express = require("express");
const { check } = require("express-validator");
const fileUpload = require("../middleware/file_upload");
const postsControllers = require("../controllers/posts-controllers");
const imagesControllers = require("../controllers/images-controllers");
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

router.post("/:pid/comments", postsControllers.createComment);
router.patch("/:pid/likes", postsControllers.updateLikes);

router.delete("/:pid", postsControllers.deletePost);

module.exports = router;

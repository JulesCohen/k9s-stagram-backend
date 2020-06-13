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

module.exports = router;

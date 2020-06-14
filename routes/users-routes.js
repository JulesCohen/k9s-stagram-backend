const express = require("express");
const { check } = require("express-validator");
const fileUpload = require("../middleware/file_upload");
const usersControllers = require("../controllers/users-controllers");
const imagesControllers = require("../controllers/images-controllers");
const router = express.Router();

// router.get("/", postsControllers.getPosts);

router.post(
  "/signup",
  fileUpload.single("image"),
  imagesControllers.uploadImage,
  [
    check("userName").not().isEmpty(),
    check("firstName").not().isEmpty(),
    check("lastName").not().isEmpty(),
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({ min: 6 }),
  ],
  usersControllers.signup
);

module.exports = router;

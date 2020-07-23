const express = require("express");
const { check } = require("express-validator");
const fileUpload = require("../middleware/file_upload");
const usersControllers = require("../controllers/users-controllers");
const imagesControllers = require("../controllers/images-controllers");
const notificationsControllers = require("../controllers/notifications-controllers");
const router = express.Router();

router.get("/:uid", usersControllers.getUserById);

router.get("/:uid/notifications", notificationsControllers.getNotifications);
router.delete(
  "/:uid/notifications/",
  notificationsControllers.deleteNotification
);

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

router.post("/login", usersControllers.login);

router.patch(
  "/:uid/follow",
  usersControllers.followUser,
  notificationsControllers.createNotification
);
router.patch("/:uid/unfollow", usersControllers.unFollowUser);

module.exports = router;

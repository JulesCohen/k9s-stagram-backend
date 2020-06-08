const express = require("express");
const { check } = require("express-validator");

const postsControllers = require("../controllers/posts-controller");
const router = express.Router();

router.get("/", postsControllers.getPosts);

module.exports = router;

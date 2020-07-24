const express = require("express");
const { check } = require("express-validator");
const router = express.Router();
const searchControllers = require("../controllers/search-controllers");

router.get("/user/:query", searchControllers.searchUser);
router.get("/hashtags/:query", searchControllers.searchHashtags);

module.exports = router;

const express = require("express");
const { check } = require("express-validator");
const router = express.Router();
const searchControllers = require("../controllers/search-controllers");

router.get("/:query", searchControllers.search);

module.exports = router;

const multer = require("multer");

const storage = multer.memoryStorage({
  destination: function (req, file, callback) {
    callback(null, "");
  },
});

const fileUpload = multer({ storage });

module.exports = fileUpload;

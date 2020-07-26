const AWS = require("aws-sdk");
const HttpError = require("../models/http-error");
const deleteImage = async (key) => {
  const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.AWS_SECRET,
  });

  var params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
  };

  await s3.deleteObject(params, function (err, data) {
    if (err) {
      const error = new HttpError("Could not delete image", 500);
      return next(error);
    } else {
      console.log("Image Deleted", data);
    }
  });
};

exports.deleteImage = deleteImage;

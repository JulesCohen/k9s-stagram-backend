const AWS = require("aws-sdk");

const deleteImage = async (key) => {
  const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.AWS_SECRET,
  });

  var params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
  };
  s3.deleteObject(params, function (err, data) {
    if (data) {
      console.log("File deleted successfully");
    } else {
      console.log("Check if you have sufficient permissions : " + err);
    }
  });
};

exports.deleteImage = deleteImage;

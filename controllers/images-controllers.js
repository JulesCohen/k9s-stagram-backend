const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");
const HttpError = require("../models/http-error");
const isJpg = require("is-jpg");

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ID,
  secretAccessKey: process.env.AWS_SECRET,
});

const uploadImage = async (req, res, next) => {
  let img;
  try {
    img = await sharp(req.file.buffer)
      .jpeg({
        quality: 40,
        chromaSubsampling: "4:4:4",
        progressive: true,
        optimizeScans: true,
        force: true,
      })
      .resize({ width: 1080 })
      .rotate()
      .toBuffer();
  } catch (error) {
    console.log(error);
    const err = new HttpError(error, 500);
    return next(err);
  }

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `${uuidv4()}.jpeg`,
    Body: img,
    ACL: "public-read",
  };

  s3.upload(params, (error, data) => {
    if (error) {
      const err = new HttpError(error, 500);
      return next(err);
    }

    req.body.imageLocation = data.Location;
    req.body.imgKey = params.Key;
    next();
  });
};

exports.uploadImage = uploadImage;

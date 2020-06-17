const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");
const HttpError = require("../models/http-error");

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ID,
  secretAccessKey: process.env.AWS_SECRET,
});

const uploadImage = async (req, res, next) => {
  let img;
  try {
    img = await sharp(req.file.buffer)
      .toFormat("png")
      .png({ compressionLevel: 9 })
      // .resize({ width: 700 })
      .rotate()
      .toBuffer();
  } catch (error) {
    console.log(error);
    const err = new HttpError(error, 500);
    return next(err);
  }

  console.log(req.file);
  console.log(img);

  let myFile = req.file.originalname.split(".");
  const fileType = myFile[myFile.length - 1];

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    // Key: `${uuidv4()}.${fileType}`,
    Key: `${uuidv4()}.png`,
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
    // console.log(req.body);
    next();
  });
};

exports.uploadImage = uploadImage;

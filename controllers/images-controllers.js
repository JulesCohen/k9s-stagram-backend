const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ID,
  secretAccessKey: process.env.AWS_SECRET,
});

const uploadImage = (req, res, next) => {
  console.log(req.file);
  let myFile = req.file.originalname.split(".");
  const fileType = myFile[myFile.length - 1];

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `${uuidv4()}.${fileType}`,
    Body: req.file.buffer,
    ACL: "public-read",
  };

  s3.upload(params, (error, data) => {
    if (error) {
      res.status(500).send(error);
    }

    req.body.imageLocation = data.Location;
    req.body.key = data.key;
    console.log(req.body);
    // res.status(200).send(data);
    next();
  });
};

exports.uploadImage = uploadImage;

const HttpError = require("../models/http-error");
const AWS = require("aws-sdk");
const DUMMY_POSTS = [
  {
    name: "julescohen",
    location: "Montreal, Canada",
    image:
      "https://scontent.fymq2-1.fna.fbcdn.net/v/t1.0-9/65536355_10157078253581675_2979088538840072192_o.jpg?_nc_cat=105&_nc_sid=05277f&_nc_ohc=V5Zpu_GKSdcAX94ONrj&_nc_ht=scontent.fymq2-1.fna&oh=86a516470af7d6c540e0e70e8797b3a2&oe=5F00D82A",
    likes: 16,
    text: "They're so cute!!",
    hashtags: "#pinscher #doglife #chihuahua",
    comments: [
      {
        author: "nicco12",
        comment: "Amazing pic! :)",
      },
    ],
  },
  {
    name: "julescohen",
    location: "Montreal, Canada",
    image:
      "https://scontent.fymq2-1.fna.fbcdn.net/v/t1.0-9/53618325_10156823673116675_584088085940142080_o.jpg?_nc_cat=110&_nc_sid=05277f&_nc_ohc=7Q0xQcSzZWUAX-Iy2KC&_nc_ht=scontent.fymq2-1.fna&oh=2390b14f5d6f0907588d180d3a77a609&oe=5F00170F",
    likes: 42,
    text: "L'aventurier!!",
    hashtags: "#neige #montreal #dog #pinscher #bodeguero",
    comments: [],
  },
  {
    name: "julescohen",
    location: "Montreal, Canada",
    image:
      "https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/dog-puppy-on-garden-royalty-free-image-1586966191.jpg",
    likes: 23,
    text: "Look at my puppy!!",
    hashtags: "#puppy #doglife",
    comments: [],
  },
];

const getPosts = (req, res, next) => {
  res.json(DUMMY_POSTS);
};

const createPost = (req, res, next) => {
  // try {
  DUMMY_POSTS.push({
    name: req.body.name,
    key: req.body.key,
    image: req.body.imageLocation,
  });

  console.log("PUSHED");

  // } catch (error) {
  deleteImage(req);
  // }

  res.json(DUMMY_POSTS);
  next();
};

const deleteImage = (req) => {
  const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.AWS_SECRET,
  });

  var params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: "0aa146bb-e538-489a-bd05-cc5133fd4f9c.jpg",
  };
  s3.deleteObject(params, function (err, data) {
    if (data) {
      console.log("File deleted successfully");
    } else {
      console.log("Check if you have sufficient permissions : " + err);
    }
  });
};

exports.getPosts = getPosts;
exports.createPost = createPost;

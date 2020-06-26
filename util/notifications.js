var Pusher = require("pusher");

const push = (type, liker, postAuthor, image) => {
  var pusher = new Pusher({
    appId: "1019702",
    key: "c65d3bc16b3b7905efb1",
    secret: "6c4b3bc7fbcdd3084174",
    cluster: "us2",
  });

  var message;
  switch (type) {
    case "like":
      message = `${liker} liked your photo!`;
      break;
    case "comment":
      message = `${liker} has commented your photo!`;
      break;
    case "follow":
      message = `${liker} followed you!`;
      break;

    default:
      break;
  }

  pusher.trigger(`user${postAuthor.id}`, "notification", {
    message: message,
    image: image,
  });

  return;
};

exports.push = push;

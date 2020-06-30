var Pusher = require("pusher");

const push = (message, notifCreator, postAuthor, image) => {
  var pusher = new Pusher({
    appId: "1019702",
    key: "c65d3bc16b3b7905efb1",
    secret: "6c4b3bc7fbcdd3084174",
    cluster: "us2",
  });

  pusher.trigger(`user${postAuthor.id}`, "notification", {
    notifCreator: { id: notifCreator, userName: notifCreator },
    message: message,
    image: image,
  });

  return;
};

exports.push = push;

var Pusher = require("pusher");

const push = (message, notifCreator, postAuthor, image) => {
  var pusher = new Pusher({
    appId: process.env.PUSHER_ID,
    key: process.env.PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
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

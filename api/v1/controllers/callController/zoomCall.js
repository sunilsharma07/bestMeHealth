const Zoom = require("zoomus")({
  key: 'PYe-Qj5hQ4ymwyy3SAoNVA',
  secret: 'GvIcPwgTKT2pThOXKLHXHbj3Z7f0YYxDoLWd'
});

module.exports = {
  createCall: (req, res) => {
    Zoom._config.basePath = '/v2';

    var user = {
      email: "user@company.com",
      type: 1
    }

    Zoom.user.create(user, function (result) {
      res.sendToEncode(result);
    });

    // Zoom.user.create(user, function (result) {
    //   res.sendToEncode(result);
    //   // if (res.error) {
    //   //   //handle error
    //   // } else {
    //   //   console.log(res);
    //   // }
    // });

    // var meeting = {
    //   host_id: "unique_id",
    //   type: 1,
    //   topic: "Meeting Topic"
    // }

    // Zoom.meeting.create(meeting, function (res) {
    //   if (res.error) {
    //     //handle error
    //   } else {
    //     console.log(res);
    //   }
    // });
  }
}

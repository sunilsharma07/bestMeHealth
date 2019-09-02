import DB from '../../../db'
import message from '../../../config/message'
const config = rootRequire('config')

module.exports = function (req, res, next) {
  if (!config.jwtTokenVerificationEnable) { // skip user verification
    return next()
  } else {
    let token = req.headers.authorization;
    DB.User.findOne({
      "_id": req.userInfo.id
    }, (err, userInfo) => {
      if (err) {
        return res.status(400).json({
          status: 400,
          message: message.UNAUTH_USR,
          data: {}
        })
      } else if (!userInfo) {
        return res.status(400).json({
          status: 400,
          message: message.NO_USR_FND,
          data: {}
        })
      } else if (userInfo && userInfo.accessToken != token) {
        return res.status(402).json({
          status: 402,
          message: message.SESSION_EXP,
          data: {}
        })
      } else if (userInfo && userInfo.isActive == false) {
        return res.status(423).json({
          status: 423,
          message: message.USER_INACTIVE,
          data: {}
        });
      } else {
        return next()
      }
    });
  }
}

import logger from '../../../utils/logger'
import jwt from 'jsonwebtoken'
import DB from '../../../db'
import message from '../../../config/message'
const config = rootRequire('config')

module.exports = function (req, res, next) {
  if (!config.adminAuthentication.enable) { // skip token verification
    return next()
  }

  // Get token from headers
  var reqToken = req.headers ? req.headers['authorization'] : ''

  // verify a token symmetric
  jwt.verify(reqToken, config.secret, function (err, decoded) {
    if (err) {
      // logger.info('ERROR: ' + err.message)
      res.status(401).json({
        status: 401,
        message: message.SESSION_EXP,
        data: {}
      })
    } else if (decoded) {
      DB.SystemUser.findOne({
        "_id": decoded.id
      }, (err, user) => {
        if (err) {
          res.status(401).json({
            status: 401,
            message: message.SESSION_EXP,
            data: {}
          })
        } else if (user && user.accessToken == '') {
          res.status(401).json({
            status: 401,
            message: message.SESSION_EXP,
            data: {}
          })
        } else {
          // logger.info('DECODED:', decoded)

          // store userInfo in request (userInfo)
          req.userInfo = decoded
          next()
        }
      });
    } else {
      // send Unauthorized response
      res.status(401).json({
        status: 401,
        message: 'Unauthorized user',
        data: {}
      })
    }
  })
}

import jwt from 'jsonwebtoken'
import message from '../../../config/message'
const config = rootRequire('config')

module.exports = function (req, res, next) {
  if (!config.jwtTokenVerificationEnable) { // skip token verification
    return next()
  }

  // Get token from headers
  var reqToken = req.headers ? req.headers['authorization'] : ''

  // verify a token symmetric
  jwt.verify(reqToken, config.secret, function (err, decoded) {
    if (err && err.message == "invalid signature") {
      res.status(403).json({
        status: 403,
        message: message.TOKN_MIS_MTCH,
        data: {}
      })
    } else if (err && err.message == "jwt must be provided") {
      res.status(401).json({
        status: 401,
        message: message.MISS_ACC_TKN,
        data: {}
      })
    } else if (decoded) {
      req.userInfo = decoded
      next()
    } else {
      // send Unauthorized response
      res.status(401).json({
        status: 401,
        message: message.UNAUTH_USR,
        data: {}
      })
    }
  })
}

import logger from '../../../utils/logger'
const config = rootRequire('config')
const AESCrypt = rootRequire('utils/aes')

module.exports = function (CB, result) {
  logger.info('SOCKET RESPONSES:', result)

  if (!config.cryptoEnable) {
    if (typeof CB === 'function') {
      CB(result)
    }
    return
  }

  // send server error if response does not exit
  if (!result || typeof result !== 'object') {
    if (typeof CB === 'function') {
      return CB({
        status: 400,
        message: 'Oops! Server Error.',
        data: {}
      })
    }
    return
  }

  // send response with encryption
  if (typeof result.data !== 'undefined') {
    result.data = JSON.stringify(result.data)
    result.data = AESCrypt.encrypt(result.data)
  } else {
    result.data = ''
  }

  if (typeof CB === 'function') {
    CB(result)
  }
}

import async from 'async'
import DB from '../../../../db'
import message from '../../../../config/message'

module.exports = {
  addAddress: (req, res) => {
    async.waterfall([
      (nextCall) => {
        req.checkBody('userId', 'User Id is required').notEmpty()
        req.checkBody('type', 'Type is required').notEmpty()
        req.checkBody('address', 'Address is required').notEmpty()
        req.checkBody('fullName', 'FullName is required').notEmpty()
        req.checkBody('phoneNumber', 'Phone number is required').notEmpty()
        req.checkBody('landmark', 'Landmark is required').notEmpty()
        req.checkBody('city', 'City is required').notEmpty()
        req.checkBody('state', 'State is required').notEmpty()
        req.checkBody('country', 'Country is required').notEmpty()
        req.checkBody('zipCode', 'Zip Code is required').notEmpty()
        var error = req.validationErrors()
        if (error && error.length) {
          return nextCall({
            message: error[0].msg
          })
        }
        nextCall(null, req.body)
      },
      async (body, nextCall) => {
          let checkUser = await DB.User.findOne({
            "_id": body.userId
          });
          if (!checkUser) {
            return nextCall({
              "message": message.NO_USR_FND
            });
          } else {
            nextCall(null, body);
          }
        },
        async (body, nextCall) => {
          await DB.Address.create(body);
          nextCall(null, null);
        }
    ], (err, response) => {
      if (err) {
        return res.sendToEncode({
          status: 400,
          message: (err && err.message) || message.SOMETHING_WRONG,
          data: {}
        })
      }
      return res.sendToEncode({
        status: 200,
        message: message.ADD_ADDED_SUCC,
        data: {}
      })
    });
  },

  getAddress: (req, res) => {
    async.waterfall([
      (nextCall) => {
        req.checkBody('userId', 'User Id is required').notEmpty()
        var error = req.validationErrors()
        if (error && error.length) {
          return nextCall({
            message: error[0].msg
          })
        }
        nextCall(null, req.body)
      },
      async (body, nextCall) => {
          let checkUser = await DB.User.findOne({
            "_id": body.userId
          });
          if (!checkUser) {
            return nextCall({
              "message": message.NO_USR_FND
            });
          } else {
            nextCall(null, body);
          }
        },
        async (body, nextCall) => {
          let finalRes = {};
          let getAddress = await DB.Address.find({
            "userId": body.userId
          });
          if (getAddress.length) {
            finalRes.address = getAddress;
            nextCall(null, finalRes);
          } else {
            return nextCall({
              "message": message.NO_ADD_FND
            });
          }
        }
    ], (err, response) => {
      if (err) {
        return res.sendToEncode({
          status: 400,
          message: (err && err.message) || message.SOMETHING_WRONG,
          data: {}
        })
      }
      return res.sendToEncode({
        status: 200,
        message: message.SUCC,
        data: response
      })
    });
  },

  deleteAddress: (req, res) => {
    async.waterfall([
      (nextCall) => {
        req.checkBody('userId', 'User Id is required').notEmpty()
        req.checkBody('addressId', 'Address Id is required').notEmpty()
        var error = req.validationErrors()
        if (error && error.length) {
          return nextCall({
            message: error[0].msg
          })
        }
        nextCall(null, req.body)
      },
      async (body, nextCall) => {
        await DB.Address.destroy({
          "_id": body.addressId,
          "userId": body.userId
        });
        nextCall(null, null);
      }
    ], (err, response) => {
      if (err) {
        return res.sendToEncode({
          status: 400,
          message: (err && err.message) || message.SOMETHING_WRONG,
          data: {}
        })
      }
      return res.sendToEncode({
        status: 200,
        message: message.ADD_DLT_SUCC,
        data: {}
      })
    });
  },

  updateAddress: (req, res) => {
    async.waterfall([
      (nextCall) => {
        req.checkBody('addressId', 'Address Id is required').notEmpty()
        req.checkBody('userId', 'User Id is required').notEmpty()
        req.checkBody('type', 'Type is required').notEmpty()
        req.checkBody('address', 'Address is required').notEmpty()
        req.checkBody('fullName', 'FullName is required').notEmpty()
        req.checkBody('phoneNumber', 'phone number is required').notEmpty()
        req.checkBody('landmark', 'Landmark is required').notEmpty()
        req.checkBody('city', 'City is required').notEmpty()
        req.checkBody('state', 'State is required').notEmpty()
        req.checkBody('country', 'Country is required').notEmpty()
        req.checkBody('zipCode', 'Zip Code is required').notEmpty()
        var error = req.validationErrors()
        if (error && error.length) {
          return nextCall({
            message: error[0].msg
          })
        }
        nextCall(null, req.body)
      },
      async (body, nextCall) => {
          let checkUser = await DB.User.findOne({
            "_id": body.userId
          });
          if (!checkUser) {
            return nextCall({
              "message": message.NO_USR_FND
            });
          } else {
            nextCall(null, body);
          }
        },
        async (body, nextCall) => {
          let updateData = {
            type: body.type,
            address: body.address,
            fullName: body.fullName,
            phoneNumber: body.phoneNumber,
            landmark: body.landmark,
            city: body.city,
            state: body.state,
            country: body.country,
            zipCode: body.zipCode
          };
          await DB.Address.update({
            "_id": body.addressId,
            "userId": body.userId
          }).set(updateData);
          nextCall(null, null);
        }
    ], (err, response) => {
      if (err) {
        return res.sendToEncode({
          status: 400,
          message: (err && err.message) || message.SOMETHING_WRONG,
          data: {}
        })
      }
      return res.sendToEncode({
        status: 200,
        message: message.ADD_UPDT_SUCC,
        data: {}
      })
    });
  }
}

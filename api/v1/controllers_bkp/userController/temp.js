import async from 'async'
import DB from '../../../../db'
import message from '../../../../config/message'

module.exports = {
  addTempReportRecord: (req, res) => {
    async.waterfall([
      (nextCall) => {
        req.checkBody('userId', 'User Id is required').notEmpty()
        req.checkBody('RowID', 'rowID is required').notEmpty()
        req.checkBody('CreatedDate', 'createdDate is required').notEmpty()
        req.checkBody('CreatedBy', 'createdBy is required').notEmpty()
        req.checkBody('FrequencyID', 'frequencyID is required').notEmpty()
        req.checkBody('AntigenID', 'antigenID is required').notEmpty()
        req.checkBody('AntigenName', 'antigenName is required').notEmpty()
        req.checkBody('TestID', 'testID is required').notEmpty()
        req.checkBody('category', 'category is required').notEmpty()
        req.checkBody('Plate', 'plate is required').notEmpty()
        req.checkBody('Lot', 'lot is required').notEmpty()
        req.checkBody('Rev', 'rev is required').notEmpty()
        req.checkBody('ODValue', 'ODValue is required').notEmpty()
        req.checkBody('TestNum', 'testNum is required').notEmpty()
        var error = req.validationErrors()
        if (error && error.length) {
          return nextCall({
            message: error[0].msg
          })
        }
        nextCall(null, req.body)
      },
      async (body, nextCall) => {
          let checkUser = await DB.SystemUser.findOne({
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
          await DB.TempReport.create(body);
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
        message: message.SUCC,
        data: {}
      })
    });
  },

  getTempReportRecord: (req, res) => {
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
        let finalRes = {};
        let tempReport = await DB.TempReport.find({
          "userId": body.userId
        });
        if (tempReport.length) {
          finalRes.report = tempReport;
          nextCall(null, finalRes);
        } else {
          return nextCall({
            "message": message.NO_REC_FOUND
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

  deleteTempReportRecord: (req, res) => {
    async.waterfall([
      (nextCall) => {
        req.checkBody('_id', "ID is required").notEmpty();
        var error = req.validationErrors();
        if (error && error.length) {
          return nextCall({
            message: error[0].msg
          });
        }
        nextCall(null, req.body);
      },
      async (body, nextCall) => {
        await DB.TempReport.destroy({
          "_id": body._id
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
        message: message.SUCC,
        data: {}
      })
    });
  },
}

import async from 'async'
import DB from '../../../../db'
import message from '../../../../config/message'

module.exports = {

  getAllTipListing: (req, res) => {
    var response = {
      "draw": req.body.draw,
      "recordsTotal": 0,
      "recordsFiltered": 0,
      "data": []
    };
    async.waterfall([
      (nextCall) => {
        let matchObj = {};
        let sort = {};
        let sorts = [];
        if (req.body.order && req.body.order.length > 0) {
          req.body.order = req.body.order[0];
          sort[req.body.columns[req.body.order.column].data] = req.body.order.dir === 'asc' ? 'ASC' : 'DESC';
          sorts.push(sort)
        }
        if (req.body.search && req.body.search.value) {
          let search_value = req.body.search.value;
          matchObj.or = [{
            title: {
              contains: search_value
            }
          }, {
            tipType: {
              contains: search_value
            }
          }, {
            whoAdded: {
              contains: search_value
            }
          }];
        }
        nextCall(null, matchObj, sorts);
      },
      (matchObj, sorts, nextCall) => {
        DB.Tips.count(matchObj).then(totalNoOfTips => {
          response.recordsTotal = totalNoOfTips;
          response.recordsFiltered = totalNoOfTips
          nextCall(null, matchObj, sorts);
        }).error(error => {
          return nextCall({
            "message": message.SOMETHING_WRONG
          });
        });
      },
      (matchObj, sorts, nextCall) => {
        DB.Tips.find(matchObj).limit(Number(req.body.length) || 10).skip(Number(req.body.start) || 0).sort(sorts).then(tips => {
          response.data = tips;
          nextCall(null, response);
        }).error(error => {
          return nextCall({
            "message": message.SOMETHING_WRONG
          });
        });
      }
    ], (err, response) => {
      if (err) {
        return res.sendToEncode({
          status_code: 400,
          message: (err && err.message) || message.SOMETHING_WRONG,
          data: {}
        })
      }
      res.sendToEncode({
        status_code: 200,
        message: message.SUCC,
        data: response
      })
    });
  },

  addNewTip: (req, res) => {
    async.waterfall([
      (nextCall) => {
        req.checkBody('title', 'Title is required').notEmpty()
        req.checkBody('tipType', 'Tip type is required').notEmpty()
        req.checkBody('description', 'Description is required').notEmpty()
        req.checkBody('fromDate', 'From date is required').notEmpty()
        req.checkBody('toDate', 'To date is required').notEmpty()
        req.checkBody('type', 'Type is required').notEmpty()
        req.checkBody('addedBy', 'Added by is required').notEmpty()
        var error = req.validationErrors()
        if (error && error.length) {
          return nextCall({
            message: error[0].msg
          })
        }
        nextCall(null, req.body)
      },
      async (body, nextCall) => {
        body.isActive = true;
        await DB.Tips.create(body);
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
        message: message.NEW_TP_ADDED,
        data: {}
      })
    });
  },

  deleteTip: (req, res) => {
    async.waterfall([
      (nextCall) => {
        req.checkBody('_id', 'ID is required').notEmpty()
        req.checkBody('adminId', 'Admin id is required').notEmpty()
        var error = req.validationErrors()
        if (error && error.length) {
          return nextCall({
            message: error[0].msg
          })
        }
        nextCall(null, req.body)
      },
      async (body, nextCall) => {
          let chekAuthAdmin = await DB.Tips.findOne({
            "_id": body._id,
            "addedBy": body.adminId
          });
          if (!chekAuthAdmin) {
            return nextCall({
              "message": message.YOU_NOT_AUTH_TO_DLT_TP
            })
          } else {
            nextCall(null, body);
          }
        },
        async (body, nextCall) => {
          await DB.Tips.destroy({
            "_id": body._id,
            "addedBy": body.adminId
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
        message: message.TP_DLT_SUCC,
        data: {}
      })
    });
  },

  viewTipDetails: (req, res) => {
    async.waterfall([
      (nextCall) => {
        req.checkBody('_id', 'ID is required').notEmpty()
        var error = req.validationErrors()
        if (error && error.length) {
          return nextCall({
            message: error[0].msg
          })
        }
        nextCall(null, req.body)
      },
      async (body, nextCall) => {
        let getTipDetails = await DB.Tips.findOne({
          "_id": body._id
        });
        if (!getTipDetails) {
          return nextCall({
            "message": message.NO_TIPS_FOUND
          })
        } else {
          nextCall(null, getTipDetails);
        }
      }
    ], (err, response) => {
      if (err) {
        return res.sendToEncode({
          status_code: 400,
          message: (err && err.message) || message.SOMETHING_WRONG,
          data: {}
        })
      }
      res.sendToEncode({
        status_code: 200,
        message: message.SUCC,
        data: response
      })
    });
  },

  updateTip: (req, res) => {
    async.waterfall([
      (nextCall) => {
        req.checkBody('title', 'Title is required').notEmpty()
        req.checkBody('tipType', 'Tip type is required').notEmpty()
        req.checkBody('description', 'Description is required').notEmpty()
        req.checkBody('fromDate', 'From date is required').notEmpty()
        req.checkBody('toDate', 'To date is required').notEmpty()
        req.checkBody('_id', 'Tip Id is required').notEmpty()
        req.checkBody('addedBy', 'Added by is required').notEmpty()
        var error = req.validationErrors()
        if (error && error.length) {
          return nextCall({
            message: error[0].msg
          })
        }
        nextCall(null, req.body)
      },
      async (body, nextCall) => {
          let chekAuthAdmin = await DB.Tips.findOne({
            "_id": body._id,
            "addedBy": body.addedBy
          });
          if (!chekAuthAdmin) {
            return nextCall({
              "message": message.YOU_NOT_AUTH_TO_UPDT_TP
            })
          } else {
            nextCall(null, body);
          }
        },
        async (body, nextCall) => {
          let updateData = {
            "tipType": body.tipType,
            "title": body.title,
            "fromDate": body.fromDate,
            "toDate": body.toDate,
            "description": body.description
          }
          await DB.Tips.update({
            "_id": body._id
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
      res.sendToEncode({
        status: 200,
        message: message.TP_UPDT_SUCC,
        data: {}
      })
    });
  }
}

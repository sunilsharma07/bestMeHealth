import async from 'async'
import DB from '../../../../db'
import message from '../../../../config/message'

module.exports = {
  getAllContentListing: (req, res) => {
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
            description: {
              contains: search_value
            }
          }];
        }
        nextCall(null, matchObj, sorts);
      },
      (matchObj, sorts, nextCall) => {
        DB.Content.count(matchObj).then(totalNoOfContent => {
          response.recordsTotal = totalNoOfContent;
          response.recordsFiltered = totalNoOfContent
          nextCall(null, matchObj, sorts);
        }).error(error => {
          return nextCall({
            "message": message.SOMETHING_WRONG
          });
        });
      },
      (matchObj, sorts, nextCall) => {
        DB.Content.find(matchObj).limit(Number(req.body.length) || 10).skip(Number(req.body.start) || 0).sort(sorts).then(contents => {
          response.data = contents;
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

  getContentDetails: (req, res) => {
    async.waterfall([
      (nextCall) => {
        req.checkBody('_id', 'Id is required').notEmpty()
        var error = req.validationErrors()
        if (error && error.length) {
          return nextCall({
            message: error[0].msg
          })
        }
        nextCall(null, req.body)
      },
      async (body, nextCall) => {
        let getContentDetails = await DB.Content.findOne({
          "_id": body._id
        });
        if (!getContentDetails) {
          return nextCall({
            "message": message.NO_CONT_FND
          })
        } else {
          nextCall(null, getContentDetails);
        }
      },
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

  updateContent: (req, res) => {
    async.waterfall([
      (nextCall) => {
        req.checkBody('_id', "Id is required").notEmpty();
        req.checkBody('description', "Description is required").notEmpty();
        var error = req.validationErrors();
        if (error && error.length) {
          return nextCall({
            message: error[0].msg
          });
        }
        nextCall(null, req.body);
      },
      async (body, nextCall) => {
        await DB.Content.update({
          "_id": body._id
        }).set({
          "description": body.description
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
      res.sendToEncode({
        status: 200,
        message: message.CONT_UPDT_SUCC,
        data: {}
      })
    });
  }
}

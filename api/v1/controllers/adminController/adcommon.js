import async from 'async'
import DB from '../../../../db'
import message from '../../../../config/message'

module.exports = {
  getPermission: (req, res) => {
    async.waterfall([
      async (nextCall) => {
        let finalRes = {};
        let PermissionList = await DB.Permission.find({});
        if (PermissionList.length) {
          finalRes.allPermission = PermissionList;
          nextCall(null, finalRes);
        } else {
          return nextCall({
            "message": message.NO_REC_FOUND
          });
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

  getIngredients: (req, res) => {
    async.waterfall([
      async (nextCall) => {
        let finalRes = {};
        let allIngredients = await DB.Ingredients.find({});
        if (allIngredients.length) {
          finalRes.ingredients = allIngredients;
          nextCall(null, finalRes);
        } else {
          return nextCall({
            "message": message.NO_INGR_FND
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

  getFoodCategory: (req, res) => {
    let finalRes = {};
    async.waterfall([
      async (nextCall) => {
        let getAllFoodCategory = await DB.Category.find({
          "isActive": true,
          "catType": "food"
        });
        if (getAllFoodCategory.length) {
          finalRes.foodCategory = getAllFoodCategory
          nextCall(null, finalRes);
        } else {
          return nextCall({
            "message": message.NO_CAT_FND
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

  getAllFeedbackListing: (req, res) => {
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
            reaction: {
              contains: search_value
            }
          }, {
            type: {
              contains: search_value
            }
          }];
        }
        nextCall(null, matchObj, sorts);
      },
      (matchObj, sorts, nextCall) => {
        DB.Feedback.count(matchObj).then(totalNoOfFeedbacks => {
          response.recordsTotal = totalNoOfFeedbacks;
          response.recordsFiltered = totalNoOfFeedbacks
          nextCall(null, matchObj, sorts);
        }).error(error => {
          return nextCall({
            "message": message.SOMETHING_WRONG
          });
        });
      },
      (matchObj, sorts, nextCall) => {
        DB.Feedback.find(matchObj).limit(Number(req.body.length) || 10).skip(Number(req.body.start) || 0).sort(sorts).then(feedbacks => {
          nextCall(null, feedbacks);
        }).error(error => {
          return nextCall({
            "message": message.SOMETHING_WRONG
          });
        });
      },
      (feedbacks, nextCall) => {
        async.mapSeries(feedbacks, (feedback, nextObj) => {
          DB.User.findOne({
            "_id": feedback.userId
          }, (err, getUserInfo) => {
            if (err) {
              nextObj({
                "message": message.SOMETHING_WRONG
              });
            } else if (!getUserInfo) {
              feedback.userName = ''
            } else {
              feedback.userName = getUserInfo.firstName + ' ' + getUserInfo.lastName
            }
            nextObj(null, null);
          });
        }, (loopErr, loopSucc) => {
          if (loopErr) {
            nextCall(err);
          } else {
            response.data = feedbacks;
            nextCall(null, response);
          }
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
  }
}

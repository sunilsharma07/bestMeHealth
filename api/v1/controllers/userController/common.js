import async from 'async'
import DB from '../../../../db'
import message from '../../../../config/message'
import DS from '../../../../services/date'
import moment from 'moment';

module.exports = {
  getCookingVideo: (req, res) => {
    async.waterfall([
      (nextCall) => {
        req.checkBody('categoryId', 'Category Id is required').notEmpty()
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
          let getUser = await DB.User.findOne({
            "_id": body.userId
          }).select([
            "currentPlanId"
          ]);
          if (!getUser) {
            return nextCall({
              "message": message.NO_USR_FND
            });
          } else {
            nextCall(null, body, getUser);
          }
        },
        (body, getUser, nextCall) => {
          let aggregateQuery = [];
          aggregateQuery.push({
            $match: {
              "categoryId": body.categoryId
            }
          });
          if (getUser.currentPlanId == 0 || getUser.currentPlanId == 1) {
            aggregateQuery.push({
              $match: {
                "type": "public"
              }
            });
          }
          aggregateQuery.push({
            $addFields: {
              "uploadedBy": {
                "$toObjectId": "$uploadedBy"
              }
            }
          });
          aggregateQuery.push({
            $lookup: {
              "from": "tbl_users",
              "localField": "uploadedBy",
              "foreignField": "_id",
              "as": "userDetails"
            }
          });
          aggregateQuery.push({
            $unwind: {
              path: "$userDetails",
              preserveNullAndEmptyArrays: true
            }
          });
          aggregateQuery.push({
            $addFields: {
              "userDetails.mediaId": {
                "$toObjectId": "$userDetails.mediaId"
              }
            }
          });
          aggregateQuery.push({
            $lookup: {
              "from": "tbl_media",
              "localField": "userDetails.mediaId",
              "foreignField": "_id",
              "as": "mediaDetails"
            }
          });
          aggregateQuery.push({
            $unwind: {
              path: "$mediaDetails",
              preserveNullAndEmptyArrays: true

            }
          });
          aggregateQuery.push({
            $project: {
              "_id": 1,
              "categoryId": 1,
              "title": 1,
              "url": 1,
              "calories": 1,
              "type": 1,
              "uploaderName": {
                $concat: ["$userDetails.firstName", " ", "$userDetails.lastName"]
              },
              "uploaderImage": "$mediaDetails.mediaName",
              "uploaderType": "$userDetails.userType"
            }
          });
          nextCall(null, aggregateQuery);
        },
        async (aggregateQuery, nextCall) => {
          let finalRes = {};
          DB.CookingVideo._adapter.datastores.databaseConn.manager
            .collection(DB.CookingVideo.identity)
            .aggregate(aggregateQuery)
            .toArray(function (err, allCookingVideo) {
              if (err) {
                return nextCall({
                  "message": message.SOMETHING_WRONG
                });
              } else if (allCookingVideo.length) {
                finalRes.cookingVideo = allCookingVideo;
                nextCall(null, finalRes);
              } else {
                return nextCall({
                  "message": message.NO_VDO_FND
                });
              }
            });
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

  getTipsOfDay: (req, res) => {
    async.waterfall([
      (nextCall) => {
        req.checkBody('userId', 'User Id is required').notEmpty()
        req.checkBody('currentPlanId', 'Tier is required').notEmpty()
        req.checkBody('date', 'Date is required').notEmpty()
        var error = req.validationErrors()
        if (error && error.length) {
          return nextCall({
            message: error[0].msg
          })
        }
        nextCall(null, req.body)
      },
      (body, nextCall) => {
        let aggregateQuery = [];

        if (body.currentPlanId == "2" || body.currentPlanId == "3") {
          aggregateQuery.push({
            $match: {
              $or: [{
                  "tipType": "day",
                  "fromDate": {
                    "$gte": DS.isoString(body.date),
                    "$lte": moment(body.date).utc().add(((24 * 60 * 60) - 1), 's').format()
                  }
                },
                {
                  "tipType": "week",
                  "fromDate": {
                    "$gte": DS.isoString(body.date)
                  },
                  "toDate": {
                    "$lte": moment(body.date).utc().add(7, 'days').format()
                  }
                }
              ]
            }
          });
        } else {
          aggregateQuery.push({
            $match: {
              "tipType": "day",
              // "fromDate": {
              //   ">=": DS.isoString(body.date + " 00:00:00"),
              //   "<=": DS.isoString(body.date + " 23:59:59")
              // }
              "fromDate": {
                "$gte": DS.isoString(body.date),
                "$lte": moment(body.date).utc().add(((24 * 60 * 60) - 1), 's').format()
              }
            }
          });
        }

        aggregateQuery.push({
          $addFields: {
            "addedBy": {
              "$toObjectId": "$addedBy"
            }
          }
        });

        aggregateQuery.push({
          $lookup: {
            "from": "tbl_users",
            "localField": "addedBy",
            "foreignField": "_id",
            "as": "userDetails"
          }
        });

        aggregateQuery.push({
          $unwind: {
            path: "$userDetails",
            preserveNullAndEmptyArrays: true
          }
        });

        aggregateQuery.push({
          $group: {
            _id: {
              type: "$type",
              tipType: "$tipType"
            },
            tipType: {
              "$first": "$tipType"
            },
            tipBy: {
              "$first": "$type"
            },
            firstName: {
              "$first": "$userDetails.firstName"
            },
            lastName: {
              "$first": "$userDetails.lastName"
            },
            mediaName: {
              "$first": "$userDetails.mediaName"
            },
            title: {
              "$first": "$title"
            },
            description: {
              "$first": "$description"
            },
          }
        });

        aggregateQuery.push({
          $sort: {
            tipType: 1,
            tipBy: 1
          }
        });

        aggregateQuery.push({
          $project: {
            _id: 0,
            tipType: "$tipType",
            tipBy: "$tipBy",
            addedBy: {
              $concat: ["$firstName", " ", "$lastName"]
            },
            mediaName: "$mediaName",
            title: "$title",
            description: "$description",
          }
        });

        nextCall(null, aggregateQuery);

      },
      async (aggregateQuery, nextCall) => {
        let finalRes = {};
        DB.Tips._adapter.datastores.databaseConn.manager
          .collection(DB.Tips.identity)
          .aggregate(aggregateQuery)
          .toArray(function (err, allTips) {
            if (err) {
              return nextCall({
                "message": message.SOMETHING_WRONG
              });
            } else if (allTips.length) {
              finalRes.tips = allTips;
              nextCall(null, finalRes);
            } else {
              return nextCall({
                "message": message.NO_TIPS_FOUND
              });
            }
          });
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

  getIngredients: (req, res) => {
    async.waterfall([
      async (nextCall) => {
        let finalRes = {};
        let allIngredients = await DB.Ingredients.find({});
        finalRes.ingredients = allIngredients;
        nextCall(null, finalRes);
      }
    ], function (err, response) {
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
    })
  },

  searchIngredients: (req, res) => {
    async.waterfall([
      (nextCall) => {
        req.checkBody('searchText', 'Search text is required').notEmpty()
        var error = req.validationErrors()
        if (error && error.length) {
          return nextCall({
            message: error[0].msg
          })
        }
        nextCall(null, req.body)
      },
      async (body, nextCall) => {
        let matchObj = {};
        matchObj.or = [{
          name: {
            contains: body.searchText
          }
        }];
        let finalRes = {};
        let allIngredients = await DB.Ingredients.find(matchObj);
        finalRes.ingredients = allIngredients;
        nextCall(null, finalRes);
      }
    ], function (err, response) {
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
    })
  },
  test: (req, res) => {
    async.waterfall([
      (nextCall) => {
        req.checkBody('tipsId', 'Id is required').notEmpty()
        var error = req.validationErrors()
        if (error && error.length) {
          return nextCall({
            message: error[0].msg
          })
        }
        nextCall(null, req.body)
      },
      async (body, nextCall) => {
          let checkUser = await DB.Tips.findOne({
            "_id": body.tipsId
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
            "fromDate": DS.now(),
            "toDate": DS.now()
          };
          await DB.Tips.update({
            "_id": body.tipsId
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
        message: message.SUCC,
        data: {}
      })
    });
  }
}

import async from 'async'
import DB from '../../../../db'
import message from '../../../../config/message'

module.exports = {
  getMyTest: (req, res) => {
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
      (body, nextCall) => {
        let aggregateQuery = [];
        aggregateQuery.push({
          $match: {
            "userId": body._id
          }
        });

        aggregateQuery.push({
          $addFields: {
            "testId": {
              "$toObjectId": "$testId"
            }
          }
        });

        aggregateQuery.push({
          $lookup: {
            "from": "tbl_test",
            "localField": "testId",
            "foreignField": "_id",
            "as": "fit132testDetails"
          }
        });

        aggregateQuery.push({
          $unwind: {
            path: "$fit132testDetails",
            preserveNullAndEmptyArrays: true
          }
        });

        aggregateQuery.push({
          $addFields: {
            "fit132testDetails.mediaId": {
              "$toObjectId": "$fit132testDetails.mediaId"
            }
          }
        });
        aggregateQuery.push({
          $lookup: {
            "from": "tbl_media",
            "localField": "fit132testDetails.mediaId",
            "foreignField": "_id",
            "as": "mediaFit132"
          }
        });
        aggregateQuery.push({
          $unwind: {
            path: "$mediaFit132",
            preserveNullAndEmptyArrays: true
          }
        });

        aggregateQuery.push({
          $lookup: {
            "from": "tbl_testmicronutrient",
            "localField": "userId",
            "foreignField": "userId",
            "as": "microNutritionTestDetails"
          }
        });
        aggregateQuery.push({
          $unwind: {
            path: "$microNutritionTestDetails",
            preserveNullAndEmptyArrays: true
          }
        });
        aggregateQuery.push({
          $addFields: {
            "microNutritionTestDetails.testId": {
              "$toObjectId": "$microNutritionTestDetails.testId"
            }
          }
        });
        aggregateQuery.push({
          $lookup: {
            "from": "tbl_test",
            "localField": "microNutritionTestDetails.testId",
            "foreignField": "_id",
            "as": "microTestDetails"
          }
        });
        aggregateQuery.push({
          $unwind: {
            path: "$microTestDetails",
            preserveNullAndEmptyArrays: true
          }
        });

        aggregateQuery.push({
          $addFields: {
            "microTestDetails.mediaId": {
              "$toObjectId": "$microTestDetails.mediaId"
            }
          }
        });
        aggregateQuery.push({
          $lookup: {
            "from": "tbl_media",
            "localField": "microTestDetails.mediaId",
            "foreignField": "_id",
            "as": "mediaMicroNutrition"
          }
        });
        aggregateQuery.push({
          $unwind: {
            path: "$mediaMicroNutrition",
            preserveNullAndEmptyArrays: true
          }
        });

        aggregateQuery.push({
          $project: {
            "_id": "$userId",
            "fit132._id": "$_id",
            "fit132.testId": "$testId",
            "fit132.testMediaName": "$mediaFit132.mediaName",
            "fit132.status": "$status",
            "fit132.title": "$fit132testDetails.title",
            "fit132.description": "$fit132testDetails.description",
            "microNutrition._id": "$microNutritionTestDetails._id",
            "microNutrition.testId": "$microNutritionTestDetails.testId",
            "microNutrition.testMediaName": "$mediaMicroNutrition.mediaName",
            "microNutrition.title": "$microTestDetails.title",
            "microNutrition.status": "$microTestDetails.status",
            "microNutrition.description": "$microTestDetails.description",
          }
        });

        nextCall(null, aggregateQuery);
      },
      (aggregateQuery, nextCall) => {
        let finalRes = {};
        DB.TestFit132._adapter.datastores.databaseConn.manager
          .collection(DB.TestFit132.identity)
          .aggregate(aggregateQuery)
          .toArray(function (err, allTest) {
            if (err) {
              return nextCall({
                "message": message.SOMETHING_WRONG
              });
            } else if (allTest.length) {
              finalRes.myTest = allTest;
              nextCall(null, finalRes);
            } else {
              return nextCall({
                "message": message.NO_TEST_FOUND
              });
            }
          });
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
  getAllTest: (req, res) => {
    async.waterfall([
      async (nextCall) => {
          let aggregateQuery = [];
          aggregateQuery.push({
            $match: {
              "isActive": true
            }
          });
          aggregateQuery.push({
            $addFields: {
              "mediaId": {
                "$toObjectId": "$mediaId"
              }
            }
          });
          aggregateQuery.push({
            $lookup: {
              "from": "tbl_media",
              "localField": "mediaId",
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
              "title": 1,
              "description": 1,
              "isActive": 1,
              "aLaCartPrice": 1,
              "mediaName": "$mediaDetails.mediaName"
            }
          });
          nextCall(null, aggregateQuery);
        },
        (aggregateQuery, nextCall) => {
          let finalRes = {};
          DB.Test._adapter.datastores.databaseConn.manager
            .collection(DB.Test.identity)
            .aggregate(aggregateQuery)
            .toArray(function (err, allTest) {
              if (err) {
                return nextCall({
                  "message": message.SOMETHING_WRONG
                });
              } else {
                finalRes.allTest = allTest;
                nextCall(null, finalRes);
              }
            });
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
  }
}

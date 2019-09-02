import async from 'async'
import DB from '../../../../db'
import message from '../../../../config/message'

module.exports = {
  getAllExerciseListing: (req, res) => {
    async.waterfall([
      (nextCall) => {
        let aggregateQuery = [];
        aggregateQuery.push({
          $addFields: {
            "categoryId": {
              "$toObjectId": "$categoryId"
            }
          }
        });
        aggregateQuery.push({
          $lookup: {
            "from": "tbl_category_exercise",
            "localField": "categoryId",
            "foreignField": "_id",
            "as": "categoryDetails"
          }
        });
        aggregateQuery.push({
          $unwind: {
            path: "$categoryDetails",
            preserveNullAndEmptyArrays: true
          }
        });
        aggregateQuery.push({
          $project: {
            "_id": 1,
            "name": "$name_original",
            "categoryName": "$categoryDetails.name",
            "isActive": true
          }
        });
        nextCall(null, aggregateQuery);
      },
      (aggregateQuery, nextCall) => {
        DB.Exercise._adapter.datastores.databaseConn.manager
          .collection(DB.Exercise.identity)
          .aggregate(aggregateQuery)
          .toArray(function(err, allExercise) {
            if (err) {
              return nextCall({
                "message": message.SOMETHING_WRONG
              });
            } else if (allExercise.length) {
              nextCall(null, allExercise);
            } else {
              return nextCall({
                "message": message.NO_EXER_FND
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
      res.sendToEncode({
        status: 200,
        message: message.SUCC,
        data: response
      })
    });
  },

  changedExerciseStatus: (req, res) => {
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
        let findExercise = await DB.Exercise.findOne({
          "_id": body._id
        });
        if (!findExercise) {
          return nextCall({
            "message": message.NO_USR_FND
          });
        } else {
          nextCall(null, findExercise);
        }
      },
      async (findExercise, nextCall) => {
        await DB.Exercise.update({
          "_id": findExercise._id
        }).set({
          "isActive": findExercise.isActive === true ? false : true
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

  viewExerciseDetails: (req, res) => {
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
          $addFields: {
            "exerciseId": {
              "$toString": "$_id"
            },
            "categoryId": {
              "$toObjectId": "$categoryId"
            }
          }
        });
        aggregateQuery.push({
          $match: {
            "exerciseId": body._id
          }
        });
        aggregateQuery.push({
          $lookup: {
            "from": "tbl_category_exercise",
            "localField": "categoryId",
            "foreignField": "_id",
            "as": "categoryDetails"
          }
        });
        aggregateQuery.push({
          $unwind: {
            path: "$categoryDetails",
            preserveNullAndEmptyArrays: true
          }
        });
        aggregateQuery.push({
          $unwind: {
            path: "$muscles",
            preserveNullAndEmptyArrays: true
          }
        });
        aggregateQuery.push({
          $addFields: {
            "muscles": {
              "$toObjectId": "$muscles"
            }
          }
        });
        aggregateQuery.push({
          $lookup: {
            "from": "tbl_muscle",
            "localField": "muscles",
            "foreignField": "_id",
            "as": "musclesDetails"
          }
        });
        aggregateQuery.push({
          $unwind: {
            path: "$musclesDetails",
            preserveNullAndEmptyArrays: true
          }
        });
        aggregateQuery.push({
          $group: {
            "_id": "$_id",
            "name": {
              "$first": "$name_original"
            },
            "muscles_secondary": {
              "$first": "$muscles_secondary"
            },
            "equipment": {
              "$first": "$equipment"
            },
            "category": {
              "$first": "$categoryDetails.name"
            },
            "muscles": {
              "$push": "$musclesDetails.name"
            },
            "description": {
              "$first": "$description"
            }
          }
        });
        aggregateQuery.push({
          $unwind: {
            path: "$muscles_secondary",
            preserveNullAndEmptyArrays: true
          }
        });
        aggregateQuery.push({
          $addFields: {
            "muscles_secondary": {
              "$toObjectId": "$muscles_secondary"
            }
          }
        });
        aggregateQuery.push({
          $lookup: {
            "from": "tbl_muscle",
            "localField": "muscles_secondary",
            "foreignField": "_id",
            "as": "muscleSecondaryDetails"
          }
        });
        aggregateQuery.push({
          $unwind: {
            path: "$muscleSecondaryDetails",
            preserveNullAndEmptyArrays: true
          }
        });
        aggregateQuery.push({
          $group: {
            "_id": "$_id",
            "name": {
              "$first": "$name"
            },
            "equipment": {
              "$first": "$equipment"
            },
            "category": {
              "$first": "$category"
            },
            "muscles": {
              "$first": "$muscles"
            },
            "muscleSecondary": {
              "$push": "$muscleSecondaryDetails.name"
            },
            "description": {
              "$first": "$description"
            }
          }
        });
        aggregateQuery.push({
          $unwind: {
            path: "$equipment",
            preserveNullAndEmptyArrays: true
          }
        });
        aggregateQuery.push({
          $addFields: {
            "equipment": {
              "$toObjectId": "$equipment"
            }
          }
        });
        aggregateQuery.push({
          $lookup: {
            "from": "tbl_equipment",
            "localField": "equipment",
            "foreignField": "_id",
            "as": "equipmentDetails"
          }
        });
        aggregateQuery.push({
          $unwind: {
            path: "$equipmentDetails",
            preserveNullAndEmptyArrays: true
          }
        });
        aggregateQuery.push({
          $group: {
            "_id": "$_id",
            "name": {
              "$first": "$name"
            },
            "category": {
              "$first": "$category"
            },
            "muscles": {
              "$first": "$muscles"
            },
            "muscleSecondary": {
              "$first": "$muscleSecondary"
            },
            "equipment": {
              "$push": "$equipmentDetails.name"
            },
            "description": {
              "$first": "$description"
            }
          }
        });
        nextCall(null, aggregateQuery);
      },
      (aggregateQuery, nextCall) => {
        DB.Exercise._adapter.datastores.databaseConn.manager
          .collection(DB.Exercise.identity)
          .aggregate(aggregateQuery)
          .toArray(function(err, exerciseDetails) {
            if (err) {
              return nextCall({
                "message": message.SOMETHING_WRONG
              });
            } else if (exerciseDetails.length) {
              nextCall(null, exerciseDetails[0]);
            } else {
              return nextCall({
                "message": message.NO_EXER_FND
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
      res.sendToEncode({
        status: 200,
        message: message.SUCC,
        data: response
      })
    });
  }
}

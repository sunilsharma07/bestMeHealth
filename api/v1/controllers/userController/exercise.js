import async from 'async'
import DB from '../../../../db'
import message from '../../../../config/message'

module.exports = {
  getExercise: (req, res) => {
    async.waterfall([
      (nextCall) => {
        let aggregateQuery = [];

        if (typeof req.body.exerciseId != 'undefined' && req.body.exerciseId != '') {
          aggregateQuery.push({
            $addFields: {
              "_id": {
                "$toString": "$_id"
              }
            }
          });
          aggregateQuery.push({
            $match: {
              "_id": req.body.exerciseId
            }
          });
        }

        if (typeof req.body.categoryId != 'undefined' && req.body.categoryId != '') {
          aggregateQuery.push({
            $match: {
              "categoryId": req.body.categoryId
            }
          });
        }

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
            preserveNullAndEmptyArrays: true // optional
          }
        });
        aggregateQuery.push({
          $lookup: {
            "from": "tbl_exercise_image",
            "localField": "apiPrimaryId",
            "foreignField": "exercise",
            "as": "imageDetails"
          }
        });
        aggregateQuery.push({
          $unwind: {
            path: "$muscles",
            preserveNullAndEmptyArrays: true // optional
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
            preserveNullAndEmptyArrays: true // optional
          }
        });
        aggregateQuery.push({
          $group: {
            "_id": "$_id",
            "name": {
              "$first": "$name"
            },
            "description": {
              "$first": "$description"
            },
            "category": {
              "$first": "$categoryDetails.name"
            },
            "images": {
              "$first": "$imageDetails"
            },
            "muscles": {
              "$push": "$musclesDetails"
            },
            "muscles_secondary": {
              "$first": "$muscles_secondary"
            },
            "equipment": {
              "$first": "$equipment"
            }
          }
        });
        aggregateQuery.push({
          $unwind: {
            path: "$muscles_secondary",
            preserveNullAndEmptyArrays: true // optional
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
            "as": "SecondaryMusclesDetails"
          }
        });
        aggregateQuery.push({
          $unwind: {
            path: "$SecondaryMusclesDetails",
            preserveNullAndEmptyArrays: true // optional
          }
        });
        aggregateQuery.push({
          $group: {
            "_id": "$_id",
            "name": {
              "$first": "$name"
            },
            "description": {
              "$first": "$description"
            },
            "category": {
              "$first": "$category"
            },
            "images": {
              "$first": "$images"
            },
            "muscles": {
              "$first": "$muscles"
            },
            "muscles_secondary": {
              "$push": "$SecondaryMusclesDetails"
            },
            "equipment": {
              "$first": "$equipment"
            }
          }
        });
        aggregateQuery.push({
          $unwind: {
            path: "$equipment",
            preserveNullAndEmptyArrays: true // optional
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
            preserveNullAndEmptyArrays: true // optional
          }
        });
        aggregateQuery.push({
          $group: {
            "_id": "$_id",
            "name": {
              "$first": "$name"
            },
            "description": {
              "$first": "$description"
            },
            "category": {
              "$first": "$category"
            },
            "images": {
              "$first": "$images"
            },
            "muscles": {
              "$first": "$muscles"
            },
            "muscles_secondary": {
              "$first": "$muscles_secondary"
            },
            "equipment": {
              "$push": "$equipmentDetails"
            }
          }
        });
        nextCall(null, aggregateQuery);
      },
      (aggregateQuery, nextCall) => {
        let finalRes = {};
        DB.Exercise._adapter.datastores.databaseConn.manager
          .collection(DB.Exercise.identity)
          .aggregate(aggregateQuery)
          .toArray(function (err, ExerciseList) {
            if (err) {
              return nextCall({
                "message": message.SOMETHING_WRONG
              });
            } else if (ExerciseList.length) {
              finalRes.allExercise = ExerciseList;
              nextCall(null, finalRes);
            } else {
              return nextCall({
                "message": message.NO_REC_FOUND
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
  getExerciseCategory: (req, res) => {
    async.waterfall([
      (nextCall) => {
        let aggregateQuery = [];

        aggregateQuery.push({
          $addFields: {
            "_id": {
              "$toString": "$_id"
            }
          }
        });
        aggregateQuery.push({
          $lookup: {
            "from": "tbl_exercise",
            "localField": "_id",
            "foreignField": "categoryId",
            "as": "exercises"
          }
        });

        // aggregateQuery.push({
        //   $addFields: {
        //     "exercise_name": "$exercises.name"
        //   }
        // });

        // aggregateQuery.push({
        //   $match: {
        //     exercise_name: { "$ne": "" }
        //   }
        // });

        aggregateQuery.push({
          $project: {
            "_id": "$_id",
            "name": "$name",
            "exercises": "$exercises",
          }
        });
        nextCall(null, aggregateQuery);
      },
      (aggregateQuery, nextCall) => {
        let finalRes = {};
        DB.ExerciseCategory._adapter.datastores.databaseConn.manager
          .collection(DB.ExerciseCategory.identity)
          .aggregate(aggregateQuery)
          .toArray(function (err, Categorylist) {
            if (err) {
              return nextCall({
                "message": message.SOMETHING_WRONG
              });
            } else if (Categorylist.length) {
              finalRes.allCategory = Categorylist;
              nextCall(null, finalRes);
            } else {
              return nextCall({
                "message": message.NO_REC_FOUND
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
}

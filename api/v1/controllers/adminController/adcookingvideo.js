import async from 'async'
import DB from '../../../../db'
import message from '../../../../config/message'

module.exports = {
  getCookingVideoListing: (req, res) => {
    async.waterfall([
      (nextCall) => {
        let aggregateQuery = [];
        aggregateQuery.push({
          $addFields: {
            "categoryId": {
              "$toObjectId": "$categoryId"
            },
            "uploadedBy": {
              "$toObjectId": "$uploadedBy"
            }
          }
        });
        aggregateQuery.push({
          $lookup: {
            "from": "tbl_category",
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
          $lookup: {
            "from": "tbl_users",
            "localField": "uploadedBy",
            "foreignField": "_id",
            "as": "uploadedByDetails"
          }
        });
        aggregateQuery.push({
          $unwind: {
            path: "$uploadedByDetails",
            preserveNullAndEmptyArrays: true
          }
        });
        aggregateQuery.push({
          $project: {
            "_id": 1,
            "categoryName": "$categoryDetails.name",
            "title": 1,
            "url": 1,
            "type": 1,
            "isActive": 1,
            "addedBy": {
              "$concat": ["$uploadedByDetails.firstName", " ", "$uploadedByDetails.lastName"]
            }
          }
        });
        nextCall(null, aggregateQuery);
      },
      (aggregateQuery, nextCall) => {
        DB.CookingVideo._adapter.datastores.databaseConn.manager
          .collection(DB.CookingVideo.identity)
          .aggregate(aggregateQuery)
          .toArray(function (err, allCookingVideo) {
            if (err) {
              return nextCall({
                "message": message.SOMETHING_WRONG
              });
            } else if (allCookingVideo.length) {
              nextCall(null, allCookingVideo);
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
      res.sendToEncode({
        status: 200,
        message: message.SUCC,
        data: response
      })
    });
  },

  addNewCookingVideo: (req, res) => {
    async.waterfall([
      (nextCall) => {
        req.checkBody('categoryId', 'Category Id is required').notEmpty()
        req.checkBody('isActive', 'Is Active is required').notEmpty()
        req.checkBody('title', 'Title is required').notEmpty()
        req.checkBody('type', 'Type is required').notEmpty()
        req.checkBody('uploadedBy', 'Uploaded By is required').notEmpty()
        req.checkBody('url', 'Video Url is required').notEmpty()
        var error = req.validationErrors()
        if (error && error.length) {
          return nextCall({
            message: error[0].msg
          })
        }
        nextCall(null, req.body)
      },
      async (body, nextCall) => {
        await DB.CookingVideo.create(body);
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
        message: message.NEW_COKVID_ADDED,
        data: {}
      })
    });
  }
}

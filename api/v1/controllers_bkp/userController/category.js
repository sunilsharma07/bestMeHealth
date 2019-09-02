import async from 'async'
import DB from '../../../../db'
import message from '../../../../config/message'

module.exports = {
  getCategory: (req, res) => {
    async.waterfall([
      (nextCall) => {
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
            "name": 1,
            "mediaName": "$mediaDetails.mediaName"
          }
        });
        nextCall(null, aggregateQuery);
      },
      (aggregateQuery, nextCall) => {
        let finalRes = {};
        DB.Category._adapter.datastores.databaseConn.manager
          .collection(DB.Category.identity)
          .aggregate(aggregateQuery)
          .toArray(function (err, allCategory) {
            if (err) {
              return nextCall({
                "message": message.SOMETHING_WRONG
              });
            } else if (allCategory.length) {
              finalRes.category = allCategory;
              nextCall(null, finalRes);
            } else {
              return nextCall({
                "message": message.NO_CAT_FND
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
  }
}

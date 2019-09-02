import async from 'async'
import DB from '../../../../db'
import message from '../../../../config/message'
import _ from 'lodash'

module.exports = {
  getBlog: (req, res) => {
    async.waterfall([
      (nextCall) => {
        req.checkBody('limit', 'Limit is required').notEmpty()
        req.checkBody('offset', 'Offset is required').notEmpty()
        req.checkBody('userId', 'User Id is required').notEmpty()
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
            "isActive": true
          }
        });
        aggregateQuery.push({
          $addFields: {
            "blogId": {
              "$toString": "$_id"
            },
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
          $lookup: {
            "from": "tbl_favouriteblog",
            "let": {
              "bId": "$blogId",
              "uId": body.userId
            },
            "pipeline": [{
              "$match": {
                "$expr": {
                  "$and": [{
                      "$eq": ["$blogId", "$$bId"]
                    },
                    {
                      "$eq": ["$userId", "$$uId"]
                    }
                  ]
                }
              }
            }],
            "as": "favBlogDetails"
          }
        });
        aggregateQuery.push({
          $project: {
            "_id": 1,
            "blogId": 1,
            "title": 1,
            "details": 1,
            "isActive": 1,
            "viewsCount": 1,
            "mediaName": "$mediaDetails.mediaName",
            "isFavourite": {
              $cond: {
                if: {
                  $gt: [{
                    $size: "$favBlogDetails"
                  }, 0]
                },
                then: true,
                else: false
              }
            }
          }
        });
        aggregateQuery.push({
          $limit: Number(body.offset) + Number(body.limit)
        });
        aggregateQuery.push({
          $skip: Number(body.offset)
        });
        nextCall(null, aggregateQuery);
      },
      (aggregateQuery, nextCall) => {
        let finalRes = {};
        DB.Blog._adapter.datastores.databaseConn.manager
          .collection(DB.Blog.identity)
          .aggregate(aggregateQuery)
          .toArray(function (err, allBlogs) {
            if (err) {
              return nextCall({
                "message": message.SOMETHING_WRONG
              });
            } else {
              finalRes.blogs = allBlogs;
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
  },

  favouriteUnfavouriteBlog: (req, res) => {
    async.waterfall([
      (nextCall) => {
        req.checkBody('userId', 'Customer Id is required').notEmpty()
        req.checkBody('blogId', 'Blog Id is required').notEmpty()
        req.checkBody('type', 'Type Id is required').notEmpty()
        var error = req.validationErrors()
        if (error && error.length) {
          return nextCall({
            message: error[0].msg
          })
        }
        nextCall(null, req.body)
      },
      async (body, nextCall) => {
          let checkUser = await DB.User.findOne({
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
            let findFavBlog = await DB.FavouriteBlog.findOne({
              "userId": body.userId,
              "blogId": body.blogId
            });
            if (findFavBlog && body.type === 'fav') {
              return nextCall({
                "message": message.ALRDY_FAV
              });
            } else if (findFavBlog && body.type === 'unfav') {
              nextCall(null, body, 'unfavourite');
            } else if (!findFavBlog && body.type === 'fav') {
              nextCall(null, body, 'favourite');
            } else if (!findFavBlog && body.type === 'unfav') {
              return nextCall({
                "message": message.ALRDY_UNFAV
              });
            } else {
              return nextCall({
                "message": message.INV_TYP
              });
            }
          },
          async (body, type, nextCall) => {
            if (type === 'unfavourite') {
              await DB.FavouriteBlog.destroy({
                "userId": body.userId,
                "blogId": body.blogId
              });
              nextCall(null, null, message.UNFV_BLG_SUCC);
            } else if (type === 'favourite') {
              await DB.FavouriteBlog.create({
                "userId": body.userId,
                "blogId": body.blogId
              });
              nextCall(null, null, message.FAV_BLG_SUCC);
            } else {
              return nextCall({
                "message": message.INV_TYP
              });
            }
          }
    ], (err, response, msg) => {
      if (err) {
        return res.sendToEncode({
          status: 400,
          message: (err && err.message) || message.SOMETHING_WRONG,
          data: {}
        })
      }
      return res.sendToEncode({
        status: 200,
        message: msg,
        data: {}
      })
    });
  },

  createBlogDetails: (req, res) => {
    async.waterfall([
      (nextCall) => {
        req.checkBody('blogId', 'Blog Id is required').notEmpty()
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
          let aggregateQuery = [];
          aggregateQuery.push({
            $addFields: {
              "blogId": {
                "$toString": "$_id"
              }
            }
          });
          aggregateQuery.push({
            $match: {
              "blogId": body.blogId
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
              "as": "mediaDetials"
            }
          });
          aggregateQuery.push({
            $unwind: {
              path: "$mediaDetials",
              preserveNullAndEmptyArrays: true
            }
          });
          aggregateQuery.push({
            $project: {
              "_id": 1,
              "title": 1,
              "details": 1,
              "isActive": 1,
              "viewsCount": 1,
              "mediaName": "$mediaDetials.mediaName"
            }
          });
          nextCall(null, aggregateQuery, body);
        },
        (aggregateQuery, body, nextCall) => {
          DB.Blog._adapter.datastores.databaseConn.manager
            .collection(DB.Blog.identity)
            .aggregate(aggregateQuery)
            .toArray(function (err, blogDetails) {
              if (err) {
                return nextCall({
                  "message": message.SOMETHING_WRONG
                });
              } else if (blogDetails.length) {
                nextCall(null, blogDetails[0], body);
              } else {
                return nextCall({
                  "message": message.NO_BLG_FND
                });
              }
            });
        },
        async (blogDetails, body, nextCall) => {
          let findFavouriteBlog = await DB.FavouriteBlog.findOne({
            "blogId": body.blogId,
            "userId": body.userId
          });
          if (!findFavouriteBlog) {
            blogDetails.isFavourite = false
          } else {
            blogDetails.isFavourite = true
          }
          nextCall(null, blogDetails);
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

  getUsersFavouriteBlog: (req, res) => {
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
          let checkUser = await DB.User.findOne({
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
        (body, nextCall) => {
          let aggregateQuery = [];
          aggregateQuery.push({
            $match: {
              "userId": body.userId
            }
          });
          aggregateQuery.push({
            $addFields: {
              "blogIdAsObjectId": {
                "$toObjectId": "$blogId"
              }
            }
          });
          aggregateQuery.push({
            $lookup: {
              "from": "tbl_blog",
              "localField": "blogIdAsObjectId",
              "foreignField": "_id",
              "as": "blogDetails"
            }
          });
          aggregateQuery.push({
            $unwind: {
              path: "$blogDetails",
              preserveNullAndEmptyArrays: true
            }
          });
          aggregateQuery.push({
            $addFields: {
              "mediaIdAsObjectId": {
                "$toObjectId": "$blogDetails.mediaId"
              }
            }
          });
          aggregateQuery.push({
            $lookup: {
              "from": "tbl_media",
              "localField": "mediaIdAsObjectId",
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
              "_id": "$blogDetails._id",
              "details": "$blogDetails.details",
              "isActive": "$blogDetails.isActive",
              "isFavourite": "$blogDetails.isFavourite",
              "mediaName": "$mediaDetails.mediaName",
              "title": "$blogDetails.title",
              "viewsCount": "$blogDetails.viewsCount",
            }
          });
          aggregateQuery.push({
            $match: {
              "isActive": true
            }
          });
          nextCall(null, aggregateQuery);
        },
        (aggregateQuery, nextCall) => {
          let finalRes = {};
          DB.FavouriteBlog._adapter.datastores.databaseConn.manager
            .collection(DB.FavouriteBlog.identity)
            .aggregate(aggregateQuery)
            .toArray(function (err, allBlogs) {
              if (err) {
                return nextCall({
                  "message": message.SOMETHING_WRONG
                });
              } else if (allBlogs.length) {
                finalRes.favouriteBlogs = allBlogs;
                nextCall(null, finalRes);
              } else {
                return nextCall({
                  "message": message.NO_BLG_FND
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
}

import async from 'async'
import DB from '../../../../db'
import message from '../../../../config/message'
import config from '../../../../config/index'
import Mailer from '../../../../support/mailer'
import ED from '../../../../services/encry_decry'
import Uploader from '../../../../support/uploader'
import path from 'path'
import DS from '../../../../services/date'
import fs from 'fs';
import jwt from 'jsonwebtoken'
import * as json2csv from "json2csv"
import csvtojson from "csvtojson"
import _ from 'lodash'
import moment from 'moment'

module.exports = {
  getAllBlogListing: (req, res) => {
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

        if (req.body.order && req.body.order.length > 0) 
        {
          req.body.order = req.body.order[0];
          sort[req.body.columns[req.body.order.column].data] = req.body.order.dir === 'asc' ? 'ASC' : 'DESC';
          sorts.push(sort)
        }
        if (req.body.search && req.body.search.value) 
        {
          let search_value = req.body.search.value;
          matchObj.or = [{
            title: {
              contains: search_value
            }
          }, {
            details: {
              contains: search_value
            }
          }];
        }
        nextCall(null, matchObj, sorts);
      },
      (matchObj, sorts, nextCall) => 
      {
          DB.Blog.count(matchObj).then(totalNoOfBlog => 
            {
              response.recordsTotal = totalNoOfBlog;
              response.recordsFiltered = totalNoOfBlog
              nextCall(null, matchObj, sorts);
              
          }).error(error => {
            return nextCall({
              "message": message.SOMETHING_WRONG
            });
          });
      },
      (matchObj, sorts, nextCall) => {
        DB.Blog.find(matchObj).limit(Number(req.body.length) || 10).skip(Number(req.body.start) || 0).sort(sorts).then(blogs => {
          response.data = blogs;
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

  changedBlogStatus: (req, res) => {
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
          let findBlog = await DB.Blog.findOne({
            "_id": body._id
          });
          if (!findBlog) {
            return nextCall({
              "message": message.NO_BLG_FND
            });
          } else {
            nextCall(null, findBlog);
          }
        },
        async (findBlog, nextCall) => {
          await DB.Blog.update({
            "_id": findBlog._id
          }).set({
            "isActive": findBlog.isActive === true ? false : true
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

  addNewBlog: (req, res) => {
    async.waterfall([
      (nextCall) => {
        Uploader.getFormFields(req, nextCall);
      },
      (fields, files, nextCall) => {
        if (fields && (!fields.title || !fields.details)) {
          return nextCall({
            "message": message.MISSING_PARAMS
          });
        }
        nextCall(null, fields, files);
      },
      (fields, files, nextCall) => {
        if (!files.media || (files.media && (files.media.type.indexOf('image') === -1))) {
          return nextCall(null, "", fields);
        } else {
          var extension = path.extname(files.media.name);
          var filename = DS.getTime() + extension;
          var large_image = 'uploads/blog/' + filename;
          async.series([
            function (nextProc) {
              Uploader.upload({
                src: files.media.path,
                dst: rootPath + '/' + large_image
              }, nextProc);
            },
            function (nextProc) { // remove from temp
              Uploader.remove({
                filepath: files.media.path
              }, nextProc);
            }
          ], function (err) {
            nextCall(null, filename, fields);
          });
        }
      },
      async (filename, fields, nextCall) => {
          if (filename != "") {
            let insertData = {
              "mediaName": filename,
              "mediaType": "image"
            };
            let insertProfilePicture = await DB.Media.create(insertData).fetch();
            fields.mediaId = insertProfilePicture.mediaId
            nextCall(null, fields);
          } else {
            nextCall(null, fields)
          }
        },
        async (fields, nextCall) => {
          let insertData = {
            title: fields.title,
            details: fields.details,
            mediaId: fields.mediaId,
            addedBy: fields.createdBy,
            isActive: true,
          };
          await DB.Blog.create(insertData);
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
        message: message.NEW_BLG_ADDED,
        data: {}
      })
    });
  },

  updateBlog: (req, res) => {
    async.waterfall([
      (nextCall) => {
        Uploader.getFormFields(req, nextCall);
      },
      (fields, files, nextCall) => {
        if (fields && (!fields.title || !fields.details || !fields.blogId)) {
          return nextCall({
            "message": message.MISSING_PARAMS
          });
        }
        nextCall(null, fields, files);
      },
      (fields, files, nextCall) => {
        if (!files.media || (files.media && (files.media.type.indexOf('image') === -1))) {
          return nextCall(null, "", fields);
        } else {
          var extension = path.extname(files.media.name);
          var filename = DS.getTime() + extension;
          var large_image = 'uploads/blog/' + filename;
          async.series([
            function (nextProc) {
              Uploader.upload({
                src: files.media.path,
                dst: rootPath + '/' + large_image
              }, nextProc);
            },
            function (nextProc) { // remove from temp
              Uploader.remove({
                filepath: files.media.path
              }, nextProc);
            }
          ], function (err) {
            nextCall(null, filename, fields);
          });
        }
      },
      async (filename, fields, nextCall) => {
          if (filename != "") {
            let modelData = {
              "mediaName": filename,
              "mediaType": "image"
            };
            if (fields.mediaId != '') {
              await DB.Media.update({
                "mediaId": fields.mediaId
              }).set(modelData);

            } else {
              let insertMedia = await DB.Media.create(modelData).fetch();
              fields.mediaId = insertMedia.mediaId
            }
            nextCall(null, fields);
          } else {
            nextCall(null, fields)
          }
        },
        async (fields, nextCall) => {
          let updateData = {
            title: fields.title,
            details: fields.details
          };
          if (fields.mediaId && fields.mediaId != '') {
            updateData.mediaId = fields.mediaId;
          }
          await DB.Blog.update({
            "_id": fields.blogId
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
        message: message.BLG_UPDT_SUCC,
        data: {}
      })
    });
  },

  getBlogDetails: (req, res) => {
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
            "_id": {
              "$toString": "$_id"
            }
          }
        });
        aggregateQuery.push({
          $match: {
            "_id": body._id
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
            preserveNullAndEmptyArrays: true // optional
          }
        });
        aggregateQuery.push({
          $project: {
            "_id": "$_id",
            "title": "$title",
            "details": "$details",
            "isActive": "$isActive",
            "viewsCount": "$viewsCount",
            "mediaId": "$mediaId",
            "mediaName": "$mediaDetails.mediaName"
          }
        });

        nextCall(null, aggregateQuery);
      },
      async (aggregateQuery, nextCall) => {
        DB.Blog._adapter.datastores.databaseConn.manager
          .collection(DB.Blog.identity)
          .aggregate(aggregateQuery)
          .toArray(function (err, blogDetails) {
            if (err) {
              return nextCall({
                "message": message.SOMETHING_WRONG
              });
            } else if (blogDetails.length) {
              nextCall(null, blogDetails[0]);
            } else {
              return nextCall({
                "message": message.NO_BLG_FND
              });
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

  deleteBlog: (req, res) => {
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
          let findBlog = await DB.Blog.findOne({
            "_id": body._id
          });
          if (!findBlog) {
            return nextCall({
              "message": message.NO_BLG_FND
            });
          } else {
            nextCall(null, findBlog, body);
          }
        },
        async (findBlog, body, nextCall) => {

          // let old_image = 'uploads/blog/' + body.oldMedia;
          // Uploader.remove({
          //   filepath: rootPath + '/' + old_image
          // }, nextProc);

          await DB.Blog.destroy({
            "_id": findBlog._id
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
}

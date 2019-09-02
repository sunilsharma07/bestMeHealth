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
  getAllCategoryListing: (req, res) => {
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
            name: {
              contains: search_value
            }
          }];
        }
        nextCall(null, matchObj, sorts);
      },
      (matchObj, sorts, nextCall) => {
        DB.Category.count(matchObj).then(totalNoOfCategory => {
          response.recordsTotal = totalNoOfCategory;
          response.recordsFiltered = totalNoOfCategory
          nextCall(null, matchObj, sorts);
        }).error(error => {
          return nextCall({
            "message": message.SOMETHING_WRONG
          });
        });
      },
      (matchObj, sorts, nextCall) => {
        DB.Category.find(matchObj).limit(Number(req.body.length) || 10).skip(Number(req.body.start) || 0).sort(sorts).then(category => {
          response.data = category;
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

  changedCategoryStatus: (req, res) => {
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
        let findCategory = await DB.Category.findOne({
          "_id": body._id
        });
        if (!findCategory) {
          return nextCall({
            "message": message.NO_CAT_FND
          });
        } else {
          nextCall(null, findCategory);
        }
      },
      async (findCategory, nextCall) => {
        await DB.Category.update({
          "_id": findCategory._id
        }).set({
          "isActive": findCategory.isActive === true ? false : true
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

  addNewCategory: (req, res) => {
    async.waterfall([
      (nextCall) => {
        Uploader.getFormFields(req, nextCall);
      },
      (fields, files, nextCall) => {
        if (fields && (!fields.name || !fields.catType)) {
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
          var large_image = 'uploads/category/' + filename;
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
        let insertData = {
          name: fields.name,
          catType: fields.catType,
          mediaName: filename,
          isActive: true
        };
        await DB.Category.create(insertData);
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
        message: message.NEW_CAT_ADDED,
        data: {}
      })
    });
  },

  updateCategory: (req, res) => {
    async.waterfall([
      (nextCall) => {
        Uploader.getFormFields(req, nextCall);
      },
      (fields, files, nextCall) => {
        if (fields && (!fields.name || !fields.catType || !fields.categoryId)) {
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
          var large_image = 'uploads/category/' + filename;
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
        let updateData = {
          name: fields.name,
          catType: fields.catType
        };
        if (filename && typeof filename != 'undefined' && filename != '') {
          updateData.mediaName = filename;
        }
        await DB.Category.update({
          "_id": fields.categoryId
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
        message: message.CAT_UPDT_SUCC,
        data: {}
      })
    });
  },

  getCategoryDetails: (req, res) => {
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
        let categoryDetails = await DB.Category.find({
          '_id': body._id
        });
        if (categoryDetails.length) {
          nextCall(null, categoryDetails[0]);
        } else {
          return nextCall({
            "message": message.NO_CAT_FND
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

  deleteCategory: (req, res) => {
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

        // let old_image = 'uploads/category/' + body.oldMedia;
        // Uploader.remove({
        //   filepath: rootPath + '/' + old_image
        // }, nextProc);

        await DB.Category.destroy({
          "_id": body._id
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

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
  addRecipe: (req, res) => {
    async.waterfall([
      (nextCall) => {
        Uploader.getFormFields(req, nextCall);
      },
      (fields, files, nextCall) => {
        if (fields && (!fields.title || !fields.category || !fields.prepTime || !fields.serves || !fields.directions || !fields.foodType || !fields.ingredients)) {
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
          var large_image = 'uploads/recipe/' + filename;
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
            category: fields.category,
            prepTime: fields.prepTime,
            serves: fields.serves,
            directions: fields.directions,
            foodType: fields.foodType,
            ingredients: JSON.parse(fields.ingredients),
            mediaId: fields.mediaId,
            isActive: true
          }
          await DB.Recipe.create(insertData);
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
        message: message.REC_ADD_SUCC,
        data: {}
      })
    });
  },

  getAllRecipeListing: (req, res) => {
    let response = {
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
            title: {
              contains: search_value
            }
          }, {
            category: {
              contains: search_value
            }
          }, {
            directions: {
              contains: search_value
            }
          }, {
            foodType: {
              contains: search_value
            }
          }];
        }
        nextCall(null, matchObj, sorts);
      },
      (matchObj, sorts, nextCall) => {
        DB.Recipe.count(matchObj).then(totalNoOfUsers => {
          response.recordsTotal = totalNoOfUsers;
          response.recordsFiltered = totalNoOfUsers
          nextCall(null, matchObj, sorts);
        }).error(error => {
          return nextCall({
            "message": message.SOMETHING_WRONG
          });
        });
      },
      (matchObj, sorts, nextCall) => {
        DB.Recipe.find(matchObj).limit(Number(req.body.length) || 10).skip(Number(req.body.start) || 0).sort(sorts).then(users => {
          response.data = users;
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

  getRecipeDetails: (req, res) => {
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
            "isActive": true,
            "_id": body._id
          }
        });
        aggregateQuery.push({
          $addFields: {
            "mediaId": {
              "$toObjectId": "$mediaId"
            },
            "_id": {
              "$toObjectId": "$_id"
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
          $unwind: {
            path: "$ingredients",
            preserveNullAndEmptyArrays: true
          }
        });
        aggregateQuery.push({
          $addFields: {
            "ingredients.title": {
              "$toObjectId": "$ingredients.title"
            }
          }
        });
        aggregateQuery.push({
          $lookup: {
            "from": "tbl_ingredients",
            "localField": "ingredients.title",
            "foreignField": "_id",
            "as": "ingredientsDetails"
          }
        });
        aggregateQuery.push({
          $unwind: {
            path: "$ingredientsDetails",
            preserveNullAndEmptyArrays: true
          }
        });
        aggregateQuery.push({
          $project: {
            "_id": 1,
            "title": 1,
            "category": 1,
            "prepTime": 1,
            "serves": 1,
            "directions": 1,
            "foodType": 1,
            "ingredients.title": "$ingredientsDetails.name",
            "ingredients.qty": "$ingredients.qty",
            "ingredients.measure": "$ingredients.measure",
            "mediaName": "$mediaDetails.mediaName",
            "isActive": 1,
          }
        });
        aggregateQuery.push({
          $group: {
            "_id": "$_id",
            "title": {
              "$first": "$title"
            },
            "category": {
              "$first": "$category"
            },
            "prepTime": {
              "$first": "$prepTime"
            },
            "serves": {
              "$first": "$serves"
            },
            "directions": {
              "$first": "$directions"
            },
            "foodType": {
              "$first": "$foodType"
            },
            "ingredients": {
              "$push": "$ingredients"
            },
            "mediaName": {
              "$first": "$mediaName"
            },
            "isActive": {
              "$first": "$isActive"
            },
          }
        });
        nextCall(null, aggregateQuery);
      },
      (aggregateQuery, nextCall) => {
        DB.Recipe._adapter.datastores.databaseConn.manager
          .collection(DB.Recipe.identity)
          .aggregate(aggregateQuery)
          .toArray(function (err, recipeDetails) {
            if (err) {
              return nextCall({
                "message": message.SOMETHING_WRONG
              });
            } else if (recipeDetails.length) {
              nextCall(null, recipeDetails[0]);
            } else {
              return nextCall({
                "message": message.NO_RECP_FND
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

  changedRecipeStatus: (req, res) => {
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
          let findRecipe = await DB.Recipe.findOne({
            "_id": body._id
          });
          if (!findRecipe) {
            return nextCall({
              "message": message.NO_RECP_FND
            });
          } else {
            nextCall(null, findRecipe);
          }
        },
        async (findRecipe, nextCall) => {
          await DB.Recipe.update({
            "_id": findRecipe._id
          }).set({
            "isActive": findRecipe.isActive === true ? false : true
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

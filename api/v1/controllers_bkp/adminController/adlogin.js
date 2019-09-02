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
  adminLogin: (req, res) => {
    async.waterfall([
      (nextCall) => {
        req.checkBody('email', 'Email is required').notEmpty()
        req.checkBody('email', 'Email is not a valid').isEmail()
        req.checkBody('password', 'Password is required').notEmpty()
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
            email: body.email
          }
        });
        aggregateQuery.push({
          $unwind: {
            path: "$permissions",
            preserveNullAndEmptyArrays: true
          }
        });
        aggregateQuery.push({
          $addFields: {
            "permissions": {
              "$toObjectId": "$permissions"
            }
          }
        });
        aggregateQuery.push({
          $lookup: {
            "from": "tbl_permission",
            "localField": "permissions",
            "foreignField": "_id",
            "as": "permissionDetails"
          }
        });
        aggregateQuery.push({
          $unwind: {
            path: "$permissionDetails",
            preserveNullAndEmptyArrays: true
          }
        });
        aggregateQuery.push({
          $group: {
            "_id": "$_id",
            "firstName": {
              "$first": "$firstName"
            },
            "lastName": {
              "$first": "$lastName"
            },
            "email": {
              "$first": "$email"
            },
            "password": {
              "$first": "$password"
            },
            "contactNumber": {
              "$first": "$contactNumber"
            },
            "userType": {
              "$first": "$userType"
            },
            "accessToken": {
              "$first": "$accessToken"
            },
            "permissions": {
              "$push": "$permissionDetails.permissionValue"
            },
            "isActive": {
              "$first": "$isActive"
            }
          }
        });
        aggregateQuery.push({
          $addFields: {
            "_id": {
              "$toString": "$_id"
            }
          }
        });
        nextCall(null, aggregateQuery, body);
      },
      (aggregateQuery, body, nextCall) => {
        let finalRes = {};
        DB.SystemUser._adapter.datastores.databaseConn.manager
          .collection(DB.SystemUser.identity)
          .aggregate(aggregateQuery)
          .toArray(function (err, findAdmin) {
            if (err) {
              return nextCall({
                "message": message.SOMETHING_WRONG
              });
            } else if (findAdmin.length && findAdmin[0].password != ED.encrypt(body.password)) {
              return nextCall({
                "message": message.INV_PASS
              });
            } else if (findAdmin.length && findAdmin[0].isActive != true) {
              return nextCall({
                "message": message.DEACT_USR_ACCT
              });
            } else if (findAdmin.length) {
              nextCall(null, findAdmin[0]);
            } else {
              return nextCall({
                "message": message.EMAIL_NOT_REG
              });
            }
          });
      },
      (findAdmin, nextCall) => {
        var jwtData = {
          id: findAdmin._id,
          email: findAdmin.email
        }

        findAdmin.accessToken = jwt.sign(jwtData, config.secret, {
          expiresIn: 60 * 60 * 24 // expires in 24 hours
        })
        nextCall(null, findAdmin)
      },
      async (findAdmin, nextCall) => {
        await DB.SystemUser.update({
          "_id": findAdmin._id
        }).set({
          "accessToken": findAdmin.accessToken
        });
        nextCall(null, findAdmin);
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
        message: message.LOGIN_SUCC,
        data: response
      })
    })
  },

  changePassword: (req, res) => {
    async.waterfall([
      (nextCall) => {
        req.checkBody('_id', 'Id is required').notEmpty()
        req.checkBody('newPassword', 'New Password is required').notEmpty()
        req.checkBody('currPassword', 'Current Password is required').notEmpty()
        var error = req.validationErrors()
        if (error && error.length) {
          return nextCall({
            message: error[0].msg
          })
        }
        nextCall(null, req.body)
      },
      async (body, nextCall) => {
          let checkAdminExistOrNot = await DB.SystemUser.findOne({
            "_id": body._id
          });
          if (!checkAdminExistOrNot) {
            return nextCall({
              "message": message.NO_USR_FND
            });
          } else if (ED.encrypt(body.currPassword) != checkAdminExistOrNot.password) {
            return nextCall({
              "message": message.CUR_PASS_NOT_MTCH
            });
          } else {
            nextCall(null, body);
          }
        },
        async (body, nextCall) => {
          await DB.SystemUser.update({
            "_id": body._id
          }).set({
            "password": ED.encrypt(body.newPassword)
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
        message: message.PASSWORD_UPDATE_SUCCESS,
        data: {}
      })
    });
  },

  test: (req, res) => {
    res.sendToEncode({
      status: 1,
      message: 'TEST MESSAGE',
      data: {
        message: 'test'
      }
    })
  }
}

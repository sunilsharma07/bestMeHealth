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
  addUsersNotes: (req, res) => {
    async.waterfall([
      (nextCall) => {
        req.checkBody('addedBy', "Added By Id is required").notEmpty();
        req.checkBody('notes', "Notes is required").notEmpty();
        req.checkBody('userId', "User Id is required").notEmpty();
        req.checkBody('whoAdded', "Who Added is required").notEmpty();
        var error = req.validationErrors();
        if (error && error.length) {
          return nextCall({
            message: error[0].msg
          });
        }
        nextCall(null, req.body);
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
            let checkAdmin = await DB.SystemUser.findOne({
              "_id": body.addedBy
            });
            if (!checkAdmin) {
              return nextCall({
                "message": message.NO_ADMN_FND
              });
            } else {
              nextCall(null, body);
            }
          },
          async (body, nextCall) => {
            await DB.Notes.create(body);
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
        message: message.NOT_ADDED_SUCC,
        data: {}
      })
    });
  },

  getNotes: (req, res) => {
    var response = {
      "draw": req.body.draw,
      "recordsTotal": 0,
      "recordsFiltered": 0,
      "data": []
    };
    async.waterfall([
      (nextCall) => {
        let matchObj = {
          "userId": req.body.userId
        };
        if (req.body.addedBy && req.body.addedBy != "") {
          matchObj.addedBy = req.body.addedBy
        }
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
            notes: {
              contains: search_value
            }
          }, {
            whoAdded: {
              contains: search_value
            }
          }];
        }
        nextCall(null, matchObj, sorts);
      },
      (matchObj, sorts, nextCall) => {
        DB.Notes.count(matchObj).then(totalNoOfNotes => {
          response.recordsTotal = totalNoOfNotes;
          response.recordsFiltered = totalNoOfNotes
          nextCall(null, matchObj, sorts);
        }).error(error => {
          return nextCall({
            "message": message.SOMETHING_WRONG
          });
        });
      },
      (matchObj, sorts, nextCall) => {
        DB.Notes.find(matchObj).limit(Number(req.body.length) || 10).skip(Number(req.body.start) || 0).sort(sorts).then(notes => {
          response.data = notes;
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

  updateNotes: (req, res) => {
    async.waterfall([
      (nextCall) => {
        req.checkBody('_id', "Id is required").notEmpty();
        req.checkBody('addedBy', "Added By Id is required").notEmpty();
        req.checkBody('notes', "Notes is required").notEmpty();
        req.checkBody('userId', "User Id is required").notEmpty();
        var error = req.validationErrors();
        if (error && error.length) {
          return nextCall({
            message: error[0].msg
          });
        }
        nextCall(null, req.body);
      },
      async (body, nextCall) => {
        await DB.Notes.update({
          "_id": body._id,
          "addedBy": body.addedBy,
          "userId": body.userId
        }).set({
          "notes": body.notes
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
      res.sendToEncode({
        status: 200,
        message: message.NOT_UPDT_SUCC,
        data: {}
      })
    });
  },

  deleteNotes: (req, res) => {
    async.waterfall([
      (nextCall) => {
        req.checkBody('addedBy', "Added By Id is required").notEmpty();
        req.checkBody('_id', "Note Id is required").notEmpty();
        req.checkBody('userId', "User Id is required").notEmpty();
        var error = req.validationErrors();
        if (error && error.length) {
          return nextCall({
            message: error[0].msg
          });
        }
        nextCall(null, req.body);
      },
      async (body, nextCall) => {
        await DB.Notes.destroy({
          "_id": body._id,
          "addedBy": body.addedBy,
          "userId": body.userId
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
      res.sendToEncode({
        status: 200,
        message: message.NOT_DLT_SUCC,
        data: {}
      })
    });
  }
}

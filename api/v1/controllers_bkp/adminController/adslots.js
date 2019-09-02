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
  changedSlots: (req, res) => {
    async.waterfall([
      (nextCall) => {
        req.checkBody('_id', 'Doctor ID is required').notEmpty()
        req.checkBody('slots', 'Slots is required').notEmpty()
        var error = req.validationErrors()
        if (error && error.length) {
          return nextCall({
            message: error[0].msg
          })
        }
        nextCall(null, req.body)
      },
      async (body, nextCall) => {
          let checkDoctor = await DB.SystemUser.findOne({
            "_id": body._id,
            or: [{
              "userType": "superDoctor"
            }, {
              or: [{
                "userType": "subDoctor"
              }]
            }]
          });
          if (!checkDoctor) {
            return nextCall({
              "message": message.NO_DOCT_FND
            });
          } else {
            nextCall(null, body);
          }
        },
        async (body, nextCall) => {
          let doctorId = body._id;
          delete body._id
          await DB.SystemUser.update({
            "_id": doctorId
          }).set(body);
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
        message: message.SLOTS_UPD_SUCC,
        data: {}
      })
    });
  },

  getOldSelectedSlots: (req, res) => {
    async.waterfall([
      (nextCall) => {
        req.checkBody('_id', 'Doctor ID is required').notEmpty()
        var error = req.validationErrors()
        if (error && error.length) {
          return nextCall({
            message: error[0].msg
          })
        }
        nextCall(null, req.body)
      },
      async (body, nextCall) => {
        let getSlots = await DB.SystemUser.findOne({
          "_id": body._id,
          or: [{
            "userType": "superDoctor"
          }, {
            or: [{
              "userType": "subDoctor"
            }]
          }]
        });
        if (!getSlots) {
          return nextCall({
            "message": message.NO_DOCT_FND
          });
        } else {
          nextCall(null, getSlots);
        }
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

  addHolidayDate: (req, res) => {
    async.waterfall([
      (nextCall) => {
        req.checkBody('_id', 'Doctor ID is required').notEmpty()
        req.checkBody('holidayDate', 'Holiday Date is required').notEmpty()
        var error = req.validationErrors()
        if (error && error.length) {
          return nextCall({
            message: error[0].msg
          })
        }
        nextCall(null, req.body)
      },
      async (body, nextCall) => {
          let checkDoctor = await DB.SystemUser.findOne({
            "_id": body._id,
            or: [{
              "userType": "superDoctor"
            }, {
              or: [{
                "userType": "subDoctor"
              }]
            }]
          });
          if (!checkDoctor) {
            return nextCall({
              "message": message.NO_DOCT_FND
            });
          } else {
            nextCall(null, body, checkDoctor);
          }
        },
        (body, checkDoctor, nextCall) => {
          if (checkDoctor.holidayDate == null) {
            checkDoctor.holidayDate = [];
          }
          let formattedDate = moment(body.holidayDate).format("YYYY-MM-DD");
          if (checkDoctor.holidayDate.length) {
            async.mapSeries(checkDoctor.holidayDate, (hdDate, nextObj) => {
              if (hdDate == formattedDate.toString()) {
                nextObj({
                  "message": message.HLD_DT_ALRDY_EXIST
                });
              } else {
                nextObj(null, "success");
              }
            }, (loopErr, loopSucc) => {
              if (loopErr) {
                return nextCall(loopErr);
              } else {
                checkDoctor.holidayDate.push(formattedDate);
                nextCall(null, checkDoctor);
              }
            });
          } else {
            checkDoctor.holidayDate.push(formattedDate);
            nextCall(null, checkDoctor);
          }
        },
        async (checkDoctor, nextCall) => {
          await DB.SystemUser.update({
            "_id": checkDoctor._id
          }).set({
            "holidayDate": checkDoctor.holidayDate
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
        message: message.HOL_DT_ADD_SUCC,
        data: {}
      })
    });
  },

  getHolidayDate: (req, res) => {
    async.waterfall([
      (nextCall) => {
        req.checkBody('_id', 'Doctor ID is required').notEmpty()
        var error = req.validationErrors()
        if (error && error.length) {
          return nextCall({
            message: error[0].msg
          })
        }
        nextCall(null, req.body)
      },
      async (body, nextCall) => {
        let checkDoctor = await DB.SystemUser.findOne({
          "_id": body._id,
          or: [{
            "userType": "superDoctor"
          }, {
            or: [{
              "userType": "subDoctor"
            }]
          }]
        }).select([
          "holidayDate"
        ]);
        if (!checkDoctor) {
          return nextCall({
            "message": message.NO_DOCT_FND
          });
        } else {
          nextCall(null, checkDoctor);
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

  deleteHolidayDate: (req, res) => {
    async.waterfall([
      (nextCall) => {
        req.checkBody('_id', 'Doctor ID is required').notEmpty()
        req.checkBody('holidayDate', 'Holiday Date is required').notEmpty()
        var error = req.validationErrors()
        if (error && error.length) {
          return nextCall({
            message: error[0].msg
          })
        }
        nextCall(null, req.body)
      },
      async (body, nextCall) => {
          let checkDoctor = await DB.SystemUser.findOne({
            "_id": body._id,
            or: [{
              "userType": "superDoctor"
            }, {
              or: [{
                "userType": "subDoctor"
              }]
            }]
          });
          if (!checkDoctor) {
            return nextCall({
              "message": message.NO_DOCT_FND
            });
          } else {
            nextCall(null, body, checkDoctor);
          }
        },
        async (body, checkDoctor, nextCall) => {
          body.holidayDate = moment(body.holidayDate).format("YYYY-MM-DD");
          body.holidayDate = _.without(checkDoctor.holidayDate, body.holidayDate);
          await DB.SystemUser.update({
            "_id": body._id
          }).set({
            "holidayDate": body.holidayDate
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
        message: message.HOLD_DT_DLT_SUCC,
        data: {}
      })
    });
  },
}

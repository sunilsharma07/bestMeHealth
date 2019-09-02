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
  addTestReport: (req, res) => {
    async.waterfall([
      (nextCall) => {
        req.checkBody('userId', 'User ID is required').notEmpty()
        req.checkBody('customerId', 'Customer ID is required').notEmpty()
        req.checkBody('reportType', 'Report Type is required').notEmpty()
        req.checkBody('reportData', 'Report data is required').notEmpty()
        var error = req.validationErrors()
        if (error && error.length) {
          return nextCall({
            message: error[0].msg
          })
        }
        nextCall(null, req.body)
      },
      (body, nextCall) => {
        async.mapSeries(body.reportData, (reportData, nextObj) => {
          if (reportData.category == 1) {
            reportData['1+'] = 1;
            reportData['2+'] = 0;
            reportData['3+'] = 0;
            reportData['4+'] = 0;
          } else if (reportData.category == 2) {
            reportData['1+'] = 0;
            reportData['2+'] = 1;
            reportData['3+'] = 0;
            reportData['4+'] = 0;
          } else if (reportData.category == 3) {
            reportData['1+'] = 0;
            reportData['2+'] = 0;
            reportData['3+'] = 1;
            reportData['4+'] = 0;
          } else if (reportData.category == 4) {
            reportData['1+'] = 0;
            reportData['2+'] = 0;
            reportData['3+'] = 0;
            reportData['4+'] = 1;
          } else {
            reportData['1+'] = 0;
            reportData['2+'] = 0;
            reportData['3+'] = 0;
            reportData['4+'] = 0;
          }
          reportData.CreatedDate = moment(reportData.CreatedDate).format('DD-MMM-YY');
          nextObj(null, null);
        }, (err, succ) => {
          nextCall(null, body);
        });
      },
      (body, nextCall) => {
        let tmpVar = body.reportData[0];
        let fields = Object.keys(tmpVar);
        fields.splice(0, 2);
        fields.splice(7, 1);

        let Json2csvParser = json2csv.Parser;
        let json2csvParser = new Json2csvParser({
          fields
        });
        let csvData = json2csvParser.parse(body.reportData);
        var filename = DS.getTime() + '.csv';
        var filePath = rootPath + '/uploads/testReport/' + filename;

        fs.writeFile(filePath, csvData, (err) => {
          if (err) {
            return nextCall({
              message: err
            })
          } else {
            nextCall(null, filename, body);
          }
        });
      },
      async (filename, body, nextCall) => {
          var reportData = body.reportData;

          var reducedReport = _.reduce(reportData, function (result, report) {
            (result[report.category] || (result[report.category] = [])).push(report.AntigenID);
            return result;
          }, {});

          let insertData = {
            userId: body.userId,
            customerId: body.customerId,
            reportType: body.reportType,
            reportFileName: filename.toString(),
            result: JSON.stringify(reducedReport)
          };
          await DB.TestReport.create(insertData);
          nextCall(null, body);
        },
        async (body, nextCall) => {
          await DB.TempReport.destroy({
            userId: body.userId
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
        message: message.NEW_REPORT_ADDED,
        data: {}
      })
    });
  },

  uploadTestReport: (req, res) => {
    async.waterfall([
      (nextCall) => {
        Uploader.getFormFields(req, nextCall);
      },
      (fields, files, nextCall) => {
        if (fields && (!fields.userId || !fields.customerId || !fields.reportType)) {
          return nextCall({
            "message": message.MISSING_PARAMS
          });
        }
        nextCall(null, fields, files);
      },
      (fields, files, nextCall) => {
        if (!files.reportFile || (files.reportFile && (files.reportFile.type.indexOf('csv') === -1))) {
          return nextCall(null, "", fields);
        } else {
          var extension = path.extname(files.reportFile.name);
          var filename = DS.getTime() + extension;
          var filepath = 'uploads/testReport/' + filename;
          async.series([
            function (nextProc) {
              Uploader.upload({
                src: files.reportFile.path,
                dst: rootPath + '/' + filepath
              }, nextProc);
            },
            function (nextProc) { // remove from temp
              Uploader.remove({
                filepath: files.reportFile.path
              }, nextProc);
            }
          ], function (err) {
            nextCall(null, filename, fields);
          });
        }
      },
      async (filename, fields, nextCall) => {
          if (filename != "") {
            // let reportFilePath = rootPath + '/uploads/testReport/' + filename;
            let reportFilePath = rootPath + '/uploads/testReport/report.csv';
            const reportData = await csvtojson().fromFile(reportFilePath);

            var reducedReport = _.reduce(reportData, function (result, report) {

              if (report['1+'] == 1) {
                (result['1'] || (result['1'] = [])).push(report.AntigenID);
              } else if (report['2+'] == 1) {
                (result['2'] || (result['2'] = [])).push(report.AntigenID);
              } else if (report['3+'] == 1) {
                (result['3'] || (result['3'] = [])).push(report.AntigenID);
              } else if (report['4+'] == 1) {
                (result['4'] || (result['4'] = [])).push(report.AntigenID);
              }

              return result;
            }, {});

            fields.filename = filename;
            nextCall(null, reducedReport, fields);
          } else {
            nextCall({
              message: 'File upload error'
            })
          }
        },
        async (reducedReport, fields, nextCall) => {
          let insertData = {
            userId: fields.userId,
            customerId: fields.customerId,
            reportType: fields.reportType,
            reportFileName: fields.filename.toString(),
            result: JSON.stringify(reducedReport)
          };
          await DB.TestReport.create(insertData);
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
        message: message.NEW_REPORT_ADDED,
        data: {}
      })
    });
  },

  getMicronutrientsReportCategory: (req, res) => {
    async.waterfall([
      async (nextCall) => {
        let finalRes = {};
        let CategoryList = await DB.MicronutrientsReportCategory.find({
          'isActive': true
        });
        if (CategoryList.length) {
          finalRes.allCategory = CategoryList;
          nextCall(null, finalRes);
        } else {
          return nextCall({
            "message": message.NO_REC_FOUND
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

  getMicronutrientsReportCategoryContent: (req, res) => {
    async.waterfall([
      async (nextCall) => {
        let finalRes = {};
        let ContentList = await DB.MicronutrientsReportCategoryContent.find({
          'isActive': true
        });
        if (ContentList.length) {
          finalRes.allContent = ContentList;
          nextCall(null, finalRes);
        } else {
          return nextCall({
            "message": message.NO_REC_FOUND
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

  addMicronutrientsTestReport: (req, res) => {
    async.waterfall([
      (nextCall) => {
        req.checkBody('userId', 'User ID is required').notEmpty()
        req.checkBody('customerId', 'Customer ID is required').notEmpty()
        req.checkBody('formData', 'Report data is required').notEmpty()
        var error = req.validationErrors()
        if (error && error.length) {
          return nextCall({
            message: error[0].msg
          })
        }
        nextCall(null, req.body)
      },
      async (body, nextCall) => {
        var reportData = body.formData;

        let insertData = {
          userId: body.userId,
          customerId: body.customerId,
          reportType: 'micronutrients',
          result: JSON.stringify(reportData)
        };
        await DB.TestReport.create(insertData);
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
        message: message.NEW_REPORT_ADDED,
        data: {}
      })
    });
  },
}

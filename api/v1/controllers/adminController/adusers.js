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
  getAllUserListing: (req, res) => {
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
            firstName: {
              contains: search_value
            }
          }, {
            lastName: {
              contains: search_value
            }
          }, {
            email: {
              contains: search_value
            }
          }];
        }
        nextCall(null, matchObj, sorts);
      },
      (matchObj, sorts, nextCall) => {
        DB.User.count(matchObj).then(totalNoOfUsers => {
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
        DB.User.find(matchObj).limit(Number(req.body.length) || 10).skip(Number(req.body.start) || 0).sort(sorts).then(users => {
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

  getUsersDetails: (req, res) => {
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
        let getUsersDetails = await DB.User.findOne({
          "_id": body._id
        });
        if (!getUsersDetails) {
          return nextCall({
            "message": message.NO_USR_FND
          });
        } else {
          nextCall(null, getUsersDetails);
        }
      },
      async (getUsersDetails, nextCall) => {
        if (getUsersDetails && getUsersDetails.mediaId != "") {
          let getProfilePic = await DB.Media.find({
            "mediaId": getUsersDetails.mediaId
          }).limit(1);
          if (!getProfilePic) {
            getUsersDetails.mediaId = '';
          } else {
            delete getUsersDetails.mediaId
            getUsersDetails.mediaId = getProfilePic[0].mediaName
          }
          nextCall(null, getUsersDetails);
        } else {
          nextCall(null, getUsersDetails);
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

  changedUserStatus: (req, res) => {
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
        let findUser = await DB.User.findOne({
          "_id": body._id
        });
        if (!findUser) {
          return nextCall({
            "message": message.NO_USR_FND
          });
        } else {
          nextCall(null, findUser);
        }
      },
      async (findUser, nextCall) => {
        await DB.User.update({
          "_id": findUser._id
        }).set({
          "isActive": findUser.isActive === true ? false : true
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

  getAllDoctorListing: (req, res) => {
    var response = {
      "draw": req.body.draw,
      "recordsTotal": 0,
      "recordsFiltered": 0,
      "data": []
    };
    async.waterfall([
      (nextCall) => {
        let matchObj = {
          "_id": {
            "!=": req.userInfo.id
          }
        };

        matchObj.and = [{
          or: [{
            "userType": "superDoctor"
          },
          {
            "userType": "subDoctor"
          }
          ]
        }];

        let sort = {};
        let sorts = [];
        if (req.body.order && req.body.order.length > 0) {
          req.body.order = req.body.order[0];
          sort[req.body.columns[req.body.order.column].data] = req.body.order.dir === 'asc' ? 'ASC' : 'DESC';
          sorts.push(sort)
        }
        if (req.body.search && req.body.search.value) {
          let search_value = req.body.search.value;
          matchObj.and.push({
            or: [{
              firstName: {
                contains: search_value
              }
            }, {
              lastName: {
                contains: search_value
              }
            }, {
              email: {
                contains: search_value
              }
            }, {
              userType: {
                contains: search_value
              }
            }]
          });
        }
        nextCall(null, matchObj, sorts);
      },
      (matchObj, sorts, nextCall) => {
        DB.SystemUser.count(matchObj).then(totalNoOfDoctor => {
          response.recordsTotal = totalNoOfDoctor;
          response.recordsFiltered = totalNoOfDoctor
          nextCall(null, matchObj, sorts);
        }).error(error => {
          return nextCall({
            "message": message.SOMETHING_WRONG
          });
        });
      },
      (matchObj, sorts, nextCall) => {
        DB.SystemUser.find(matchObj).limit(Number(req.body.length) || 10).skip(Number(req.body.start) || 0).sort(sorts).then(doctors => {
          response.data = doctors;
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

  changedDoctorstatus: (req, res) => {
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
        let findDoctor = await DB.SystemUser.findOne({
          "_id": body._id
        });
        if (!findDoctor) {
          return nextCall({
            "message": message.NO_DOCT_FND
          });
        } else {
          nextCall(null, findDoctor);
        }
      },
      async (findDoctor, nextCall) => {
        await DB.SystemUser.update({
          "_id": findDoctor._id
        }).set({
          "isActive": findDoctor.isActive === true ? false : true
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

  getDoctorDetails: (req, res) => {
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
        let getDoctorsDetails = await DB.SystemUser.findOne({
          "_id": body._id
        });
        if (!getDoctorsDetails) {
          return nextCall({
            "message": message.NO_DOCT_FND
          });
        } else {
          nextCall(null, getDoctorsDetails);
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

  addNewDoctor: (req, res) => {
    async.waterfall([
      (nextCall) => {
        req.checkBody('firstName', 'First Name is required').notEmpty()
        req.checkBody('lastName', 'Last Name is required').notEmpty()
        req.checkBody('email', 'Email is required').notEmpty()
        req.checkBody('contactNumber', 'Phone Number is required').notEmpty()
        req.checkBody('createdBy', 'Created By is required').notEmpty()
        req.checkBody('userType', 'User type is required').notEmpty()
        var error = req.validationErrors()
        if (error && error.length) {
          return nextCall({
            message: error[0].msg
          })
        }
        nextCall(null, req.body)
      },
      async (body, nextCall) => {
        let checkEmail = await DB.SystemUser.findOne({
          "email": body.email
        });
        if (checkEmail) {
          return nextCall({
            "message": message.EMAIL_ALRDY
          });
        } else {
          nextCall(null, body);
        }
      },
      (body, nextCall) => {
        var randStr = Math.random().toString(36).slice(2);
        var html = '<center>Hello ' + body.firstName + ' ' + body.lastName +
          ' Please click below link to set your password!</center>' +
          '<div style="min-height: 20px;margin-top:30px;margin-bottom:30px;">' +
          '<center>' +
          '<a href="' + config.setNewPasswordLink + randStr + '">Click Here to reset password...</a>' +
          '</center>' +
          '</div>';
        Mailer.mail({
          to: body.email,
          from: 'Best Me Health Team<noreplay@bestMeHealth.com>',
          subject: 'Best Me Health :: Set password link',
          html: html
        }, function (err, info) {
          if (err) {
            return nextCall({
              "message": 'Sorry! Please use valid email address.'
            });
          }
          nextCall(null, randStr, body);
        });
      },
      async (randStr, body, nextCall) => {
        let insertData = {
          firstName: body.firstName,
          lastName: body.lastName,
          email: body.email,
          contactNumber: body.contactNumber,
          addedBy: body.createdBy,
          permissions: body.permissions,
          setPassToken: randStr,
          isActive: true,
          userType: body.userType
        };
        await DB.SystemUser.create(insertData);
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
        message: message.NEW_DOCT_ADDED,
        data: {}
      })
    });
  },

  setUserPassword: (req, res) => {
    async.waterfall([
      (nextCall) => {
        req.checkBody('password', 'Password is required').notEmpty()
        req.checkBody('setPassToken', 'Set Password Token is required').notEmpty()
        var error = req.validationErrors()
        if (error && error.length) {
          return nextCall({
            message: error[0].msg
          })
        }
        nextCall(null, req.body)
      },
      async (body, nextCall) => {
        let findDoctor = await DB.SystemUser.findOne({
          setPassToken: body.setPassToken
        });
        if (!findDoctor) {
          return nextCall({
            "message": message.LINK_EXP
          });
        } else {
          nextCall(null, body);
        }
      },
      async (body, nextCall) => {
        let updateData = {
          password: ED.encrypt(body.password),
          setPassToken: ""
        };
        await DB.SystemUser.update({
          setPassToken: body.setPassToken
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
        message: message.PASS_SET_SUCC,
        data: {}
      })
    });
  },

  getUserProfile: (req, res) => {
    async.waterfall([
      (nextCall) => {
        req.checkBody('_id', 'ID is required').notEmpty()
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
            _id: body._id
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
        DB.SystemUser._adapter.datastores.databaseConn.manager
          .collection(DB.SystemUser.identity)
          .aggregate(aggregateQuery)
          .toArray(function (err, findAdmin) {
            if (err) {
              return nextCall({
                "message": message.SOMETHING_WRONG
              });
            } else if (findAdmin.length) {
              nextCall(null, findAdmin[0]);
            } else {
              return nextCall({
                "message": message.NO_USR_FND
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

  updateUserProfile: (req, res) => {
    async.waterfall([
      (nextCall) => {
        req.checkBody('_id', 'ID is required').notEmpty()
        req.checkBody('firstName', 'First Name is required').notEmpty()
        req.checkBody('lastName', 'Last Name is required').notEmpty()
        req.checkBody('phoneNumber', 'Phone Number is required').notEmpty()
        var error = req.validationErrors()
        if (error && error.length) {
          return nextCall({
            message: error[0].msg
          })
        }
        nextCall(null, req.body)
      },
      async (body, nextCall) => {
        let adminId = body._id;
        body.contactNumber = body.phoneNumber;
        delete body.phoneNumber;
        delete body._id;
        await DB.SystemUser.update({
          "_id": adminId
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
        message: message.PRO_UPDT_SUCC,
        data: {}
      })
    });
  },

  getAllNutritionListing: (req, res) => {
    var response = {
      "draw": req.body.draw,
      "recordsTotal": 0,
      "recordsFiltered": 0,
      "data": []
    };
    async.waterfall([
      (nextCall) => {
        let matchObj = {
          "_id": {
            "!=": req.userInfo.id
          }
        };

        matchObj.and = [{
          or: [{
            "userType": "superNutrition"
          },
          {
            "userType": "subNutrition"
          }
          ]
        }];

        let sort = {};
        let sorts = [];
        if (req.body.order && req.body.order.length > 0) {
          req.body.order = req.body.order[0];
          sort[req.body.columns[req.body.order.column].data] = req.body.order.dir === 'asc' ? 'ASC' : 'DESC';
          sorts.push(sort)
        }
        if (req.body.search && req.body.search.value) {
          let search_value = req.body.search.value;
          matchObj.and.push({
            or: [{
              firstName: {
                contains: search_value
              }
            }, {
              lastName: {
                contains: search_value
              }
            }, {
              email: {
                contains: search_value
              }
            }, {
              userType: {
                contains: search_value
              }
            }]
          });
        }
        nextCall(null, matchObj, sorts);
      },
      (matchObj, sorts, nextCall) => {
        DB.SystemUser.count(matchObj).then(totalNoOfNutrition => {
          response.recordsTotal = totalNoOfNutrition;
          response.recordsFiltered = totalNoOfNutrition
          nextCall(null, matchObj, sorts);
        }).error(error => {
          return nextCall({
            "message": message.SOMETHING_WRONG
          });
        });
      },
      (matchObj, sorts, nextCall) => {
        DB.SystemUser.find(matchObj).limit(Number(req.body.length) || 10).skip(Number(req.body.start) || 0).sort(sorts).then(nutritions => {
          response.data = nutritions;
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

  changedNutritionStatus: (req, res) => {
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
        let findNutrition = await DB.SystemUser.findOne({
          "_id": body._id
        });
        if (!findNutrition) {
          return nextCall({
            "message": message.NO_NUTRI_FND
          });
        } else {
          nextCall(null, findNutrition);
        }
      },
      async (findNutrition, nextCall) => {
        await DB.SystemUser.update({
          "_id": findNutrition._id
        }).set({
          "isActive": findNutrition.isActive === true ? false : true
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

  addNewNutrition: (req, res) => {
    async.waterfall([
      (nextCall) => {
        req.checkBody('firstName', 'First Name is required').notEmpty()
        req.checkBody('lastName', 'Last Name is required').notEmpty()
        req.checkBody('email', 'Email is required').notEmpty()
        req.checkBody('contactNumber', 'Phone Number is required').notEmpty()
        req.checkBody('createdBy', 'Created By is required').notEmpty()
        req.checkBody('userType', 'User type is required').notEmpty()
        var error = req.validationErrors()
        if (error && error.length) {
          return nextCall({
            message: error[0].msg
          })
        }
        nextCall(null, req.body)
      },
      async (body, nextCall) => {
        let checkEmail = await DB.SystemUser.findOne({
          "email": body.email
        });
        if (checkEmail) {
          return nextCall({
            "message": message.EMAIL_ALRDY
          });
        } else {
          nextCall(null, body);
        }
      },
      (body, nextCall) => {
        var randStr = Math.random().toString(36).slice(2);
        var html = '<center>Hello ' + body.firstName + ' ' + body.lastName +
          ' Please click below link to set your password!</center>' +
          '<div style="min-height: 20px;margin-top:30px;margin-bottom:30px;">' +
          '<center>' +
          '<a href="' + config.setNewPasswordLink + randStr + '">Click Here to reset password...</a>' +
          '</center>' +
          '</div>';
        Mailer.mail({
          to: body.email,
          from: 'Best Me Health Team<noreplay@bestMeHealth.com>',
          subject: 'Best Me Health :: Set password link',
          html: html
        }, function (err, info) {
          if (err) {
            return nextCall({
              "message": 'Sorry! Please use valid email address.'
            });
          }
          nextCall(null, randStr, body);
        });
      },
      async (randStr, body, nextCall) => {
        let insertData = {
          firstName: body.firstName,
          lastName: body.lastName,
          email: body.email,
          contactNumber: body.contactNumber,
          addedBy: body.createdBy,
          permissions: body.permissions,
          setPassToken: randStr,
          userType: body.userType,
          isActive: true,
        };
        await DB.SystemUser.create(insertData);
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
        message: message.NEW_NUTRTN_ADDED,
        data: {}
      })
    });
  },

  getNutritionDetails: (req, res) => {
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
        let getNutritionsDetails = await DB.SystemUser.findOne({
          "_id": body._id
        });
        if (!getNutritionsDetails) {
          return nextCall({
            "message": message.NO_NUTRI_FND
          });
        } else {
          nextCall(null, getNutritionsDetails);
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

  getAllChefListing: (req, res) => {
    var response = {
      "draw": req.body.draw,
      "recordsTotal": 0,
      "recordsFiltered": 0,
      "data": []
    };
    async.waterfall([
      (nextCall) => {

        let matchObj = {
          "_id": {
            "!=": req.userInfo.id
          }
        };

        matchObj.and = [{
          or: [{
            "userType": "superChef"
          },
          {
            "userType": "subChef"
          }
          ]
        }];

        let sort = {};
        let sorts = [];
        if (req.body.order && req.body.order.length > 0) {
          req.body.order = req.body.order[0];
          sort[req.body.columns[req.body.order.column].data] = req.body.order.dir === 'asc' ? 'ASC' : 'DESC';
          sorts.push(sort)
        }
        if (req.body.search && req.body.search.value) {
          let search_value = req.body.search.value;
          matchObj.and.push({
            or: [{
              firstName: {
                contains: search_value
              }
            }, {
              lastName: {
                contains: search_value
              }
            }, {
              email: {
                contains: search_value
              }
            }, {
              userType: {
                contains: search_value
              }
            }]
          });
        }
        nextCall(null, matchObj, sorts);
      },
      (matchObj, sorts, nextCall) => {
        DB.SystemUser.count(matchObj).then(totalNoOfChef => {
          response.recordsTotal = totalNoOfChef;
          response.recordsFiltered = totalNoOfChef
          nextCall(null, matchObj, sorts);
        }).error(error => {
          return nextCall({
            "message": message.SOMETHING_WRONG
          });
        });
      },
      (matchObj, sorts, nextCall) => {
        DB.SystemUser.find(matchObj).limit(Number(req.body.length) || 10).skip(Number(req.body.start) || 0).sort(sorts).then(chef => {
          response.data = chef;
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

  addNewChef: (req, res) => {
    async.waterfall([
      (nextCall) => {
        req.checkBody('firstName', 'First Name is required').notEmpty()
        req.checkBody('lastName', 'Last Name is required').notEmpty()
        req.checkBody('email', 'Email is required').notEmpty()
        req.checkBody('contactNumber', 'Phone Number is required').notEmpty()
        req.checkBody('createdBy', 'Created By is required').notEmpty()
        req.checkBody('userType', 'User type is required').notEmpty()
        var error = req.validationErrors()
        if (error && error.length) {
          return nextCall({
            message: error[0].msg
          })
        }
        nextCall(null, req.body)
      },
      async (body, nextCall) => {
        let checkEmail = await DB.SystemUser.findOne({
          "email": body.email
        });
        if (checkEmail) {
          return nextCall({
            "message": message.EMAIL_ALRDY
          });
        } else {
          nextCall(null, body);
        }
      },
      (body, nextCall) => {
        var randStr = Math.random().toString(36).slice(2);
        var html = '<center>Hello ' + body.firstName + ' ' + body.lastName +
          ' Please click below link to set your password!</center>' +
          '<div style="min-height: 20px;margin-top:30px;margin-bottom:30px;">' +
          '<center>' +
          '<a href="' + config.setNewPasswordLink + randStr + '">Click Here to reset password...</a>' +
          '</center>' +
          '</div>';
        Mailer.mail({
          to: body.email,
          from: 'Best Me Health Team<noreplay@bestMeHealth.com>',
          subject: 'Best Me Health :: Set password link',
          html: html
        }, function (err, info) {
          if (err) {
            return nextCall({
              "message": 'Sorry! Please use valid email address.'
            });
          }
          nextCall(null, randStr, body);
        });
      },
      async (randStr, body, nextCall) => {
        let insertData = {
          firstName: body.firstName,
          lastName: body.lastName,
          email: body.email,
          contactNumber: body.contactNumber,
          addedBy: body.createdBy,
          permissions: body.permissions,
          setPassToken: randStr,
          userType: body.userType,
          isActive: true,
        };
        await DB.SystemUser.create(insertData);
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
        message: message.NEW_CHEF_ADDED,
        data: {}
      })
    });
  },

  getChefDetails: (req, res) => {
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
        let getChefDetails = await DB.SystemUser.findOne({
          "_id": body._id
        });
        if (!getChefDetails) {
          return nextCall({
            "message": message.NO_CHF_FND
          });
        } else {
          nextCall(null, getChefDetails);
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

  changedChefStatus: (req, res) => {
    async.waterfall([
      (nextCall) => {
        req.checkBody('userId', "ID is required").notEmpty();
        var error = req.validationErrors();
        if (error && error.length) {
          return nextCall({
            message: error[0].msg
          });
        }
        nextCall(null, req.body);
      },
      async (body, nextCall) => {
        let findChef = await DB.SystemUser.findOne({
          "_id": body.userId
        });
        if (!findChef) {
          return nextCall({
            "message": message.NO_NUTRI_FND
          });
        } else {
          nextCall(null, findChef);
        }
      },
      async (findChef, nextCall) => {
        await DB.SystemUser.update({
          "_id": findChef._id
        }).set({
          "isActive": findChef.isActive === true ? false : true
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

  getAllLabAssistantListing: (req, res) => {
    var response = {
      "draw": req.body.draw,
      "recordsTotal": 0,
      "recordsFiltered": 0,
      "data": []
    };
    async.waterfall([
      (nextCall) => {
        let matchObj = {
          "_id": {
            "!=": req.userInfo.id
          }
        };

        matchObj.and = [{
          or: [{
            "userType": "superLabAssistant"
          },
          {
            "userType": "subLabAssistant"
          }
          ]
        }];

        let sort = {};
        let sorts = [];
        if (req.body.order && req.body.order.length > 0) {
          req.body.order = req.body.order[0];
          sort[req.body.columns[req.body.order.column].data] = req.body.order.dir === 'asc' ? 'ASC' : 'DESC';
          sorts.push(sort)
        }
        if (req.body.search && req.body.search.value) {
          let search_value = req.body.search.value;
          matchObj.and.push({
            or: [{
              firstName: {
                contains: search_value
              }
            }, {
              lastName: {
                contains: search_value
              }
            }, {
              email: {
                contains: search_value
              }
            }, {
              userType: {
                contains: search_value
              }
            }]
          });
        }
        nextCall(null, matchObj, sorts);
      },
      (matchObj, sorts, nextCall) => {
        DB.SystemUser.count(matchObj).then(totalNoOfLabAssistant => {
          response.recordsTotal = totalNoOfLabAssistant;
          response.recordsFiltered = totalNoOfLabAssistant;
          nextCall(null, matchObj, sorts);
        }).error(error => {
          return nextCall({
            "message": message.SOMETHING_WRONG
          });
        });
      },
      (matchObj, sorts, nextCall) => {
        DB.SystemUser.find(matchObj).limit(Number(req.body.length) || 10).skip(Number(req.body.start) || 0).sort(sorts).then(labAssistants => {
          response.data = labAssistants;
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

  changedLabAssistantStatus: (req, res) => {
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
        let findLabAssistant = await DB.SystemUser.findOne({
          "_id": body._id
        });
        if (!findLabAssistant) {
          return nextCall({
            "message": message.NO_NUTRI_FND
          });
        } else {
          nextCall(null, findLabAssistant);
        }
      },
      async (findLabAssistant, nextCall) => {
        await DB.SystemUser.update({
          "_id": findLabAssistant._id
        }).set({
          "isActive": findLabAssistant.isActive === true ? false : true
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

  addNewLabAssistant: (req, res) => {
    async.waterfall([
      (nextCall) => {
        req.checkBody('firstName', 'First Name is required').notEmpty()
        req.checkBody('lastName', 'Last Name is required').notEmpty()
        req.checkBody('email', 'Email is required').notEmpty()
        req.checkBody('contactNumber', 'Phone Number is required').notEmpty()
        req.checkBody('createdBy', 'Created By is required').notEmpty()
        req.checkBody('userType', 'User type is required').notEmpty()
        var error = req.validationErrors()
        if (error && error.length) {
          return nextCall({
            message: error[0].msg
          })
        }
        nextCall(null, req.body)
      },
      async (body, nextCall) => {
        let checkEmail = await DB.SystemUser.findOne({
          "email": body.email
        });
        if (checkEmail) {
          return nextCall({
            "message": message.EMAIL_ALRDY
          });
        } else {
          nextCall(null, body);
        }
      },
      (body, nextCall) => {
        var randStr = Math.random().toString(36).slice(2);
        var html = '<center>Hello ' + body.firstName + ' ' + body.lastName +
          ' Please click below link to set your password!</center>' +
          '<div style="min-height: 20px;margin-top:30px;margin-bottom:30px;">' +
          '<center>' +
          '<a href="' + config.setNewPasswordLink + randStr + '">Click Here to reset password...</a>' +
          '</center>' +
          '</div>';
        Mailer.mail({
          to: body.email,
          from: 'Best Me Health Team<noreplay@bestMeHealth.com>',
          subject: 'Best Me Health :: Set password link',
          html: html
        }, function (err, info) {
          if (err) {
            return nextCall({
              "message": 'Sorry! Please use valid email address.'
            });
          }
          nextCall(null, randStr, body);
        });
      },
      async (randStr, body, nextCall) => {
        let insertData = {
          firstName: body.firstName,
          lastName: body.lastName,
          email: body.email,
          contactNumber: body.contactNumber,
          addedBy: body.createdBy,
          permissions: body.permissions,
          setPassToken: randStr,
          userType: body.userType,
          isActive: true,
        };
        await DB.SystemUser.create(insertData);
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
        message: message.NEW_LABASSTNT_ADDED,
        data: {}
      })
    });
  },

  getLabAssistantDetails: (req, res) => {
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
        let getLabAssistantDetails = await DB.SystemUser.findOne({
          "_id": body._id
        });
        if (!getLabAssistantDetails) {
          return nextCall({
            "message": message.NO_NUTRI_FND
          });
        } else {
          nextCall(null, getLabAssistantDetails);
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

  updateUserPermissions: (req, res) => {
    async.waterfall([
      (nextCall) => {
        req.checkBody('userId', "User ID is required").notEmpty();
        req.checkBody('permissions', "Role is required").notEmpty();
        req.checkBody('updatedBy', "Updated by is required").notEmpty();
        var error = req.validationErrors();
        if (error && error.length) {
          return nextCall({
            message: error[0].msg
          });
        }
        nextCall(null, req.body);
      },
      async (body, nextCall) => {
        let updateData = {
          "permissions": body.permissions,
          "updatedBy": body.updatedBy,
          "accessToken": ""
        }
        await DB.SystemUser.update({
          "_id": body.userId
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
        message: message.USR_PERMSN_UPDT_SUCC,
        data: {}
      })
    });
  },

  getAllAdminListing: (req, res) => {
    var response = {
      "draw": req.body.draw,
      "recordsTotal": 0,
      "recordsFiltered": 0,
      "data": []
    };
    async.waterfall([
      (nextCall) => {

        let matchObj = {
          "_id": {
            "!=": req.userInfo.id
          }
        };

        matchObj.and = [{
          or: [{
            "userType": "superAdmin"
          },
          {
            "userType": "subAdmin"
          }
          ]
        }];

        let sort = {};
        let sorts = [];
        if (req.body.order && req.body.order.length > 0) {
          req.body.order = req.body.order[0];
          sort[req.body.columns[req.body.order.column].data] = req.body.order.dir === 'asc' ? 'ASC' : 'DESC';
          sorts.push(sort)
        }
        if (req.body.search && req.body.search.value) {
          let search_value = req.body.search.value;
          matchObj.and.push({
            or: [{
              firstName: {
                contains: search_value
              }
            }, {
              lastName: {
                contains: search_value
              }
            }, {
              email: {
                contains: search_value
              }
            }, {
              userType: {
                contains: search_value
              }
            }]
          });
        }
        nextCall(null, matchObj, sorts);
      },
      (matchObj, sorts, nextCall) => {
        DB.SystemUser.count(matchObj).then(totalNoOfAdmin => {
          response.recordsTotal = totalNoOfAdmin;
          response.recordsFiltered = totalNoOfAdmin
          nextCall(null, matchObj, sorts);
        }).error(error => {
          return nextCall({
            "message": message.SOMETHING_WRONG
          });
        });
      },
      (matchObj, sorts, nextCall) => {
        DB.SystemUser.find(matchObj).limit(Number(req.body.length) || 10).skip(Number(req.body.start) || 0).sort(sorts).then(admin => {
          response.data = admin;
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

  addNewAdmin: (req, res) => {
    async.waterfall([
      (nextCall) => {
        req.checkBody('firstName', 'First Name is required').notEmpty()
        req.checkBody('lastName', 'Last Name is required').notEmpty()
        req.checkBody('email', 'Email is required').notEmpty()
        req.checkBody('contactNumber', 'Phone Number is required').notEmpty()
        req.checkBody('createdBy', 'Created By is required').notEmpty()
        req.checkBody('userType', 'User type is required').notEmpty()
        var error = req.validationErrors()
        if (error && error.length) {
          return nextCall({
            message: error[0].msg
          })
        }
        nextCall(null, req.body)
      },
      async (body, nextCall) => {
        let checkEmail = await DB.SystemUser.findOne({
          "email": body.email
        });
        if (checkEmail) {
          return nextCall({
            "message": message.EMAIL_ALRDY
          });
        } else {
          nextCall(null, body);
        }
      },
      (body, nextCall) => {
        var randStr = Math.random().toString(36).slice(2);
        var html = '<center>Hello ' + body.firstName + ' ' + body.lastName +
          ' Please click below link to set your password!</center>' +
          '<div style="min-height: 20px;margin-top:30px;margin-bottom:30px;">' +
          '<center>' +
          '<a href="' + config.setNewPasswordLink + randStr + '">Click Here to reset password...</a>' +
          '</center>' +
          '</div>';
        Mailer.mail({
          to: body.email,
          from: 'Best Me Health Team<noreplay@bestMeHealth.com>',
          subject: 'Best Me Health :: Set password link',
          html: html
        }, function (err, info) {
          if (err) {
            return nextCall({
              "message": 'Sorry! Please use valid email address.'
            });
          }
          nextCall(null, randStr, body);
        });
      },
      async (randStr, body, nextCall) => {
        let insertData = {
          firstName: body.firstName,
          lastName: body.lastName,
          email: body.email,
          contactNumber: body.contactNumber,
          addedBy: body.createdBy,
          permissions: body.permissions,
          setPassToken: randStr,
          userType: body.userType,
          isActive: true,
        };
        await DB.SystemUser.create(insertData);
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
        message: message.NEW_ADMN_ADDED,
        data: {}
      })
    });
  },

  getAdminDetails: (req, res) => {
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
        let getAdminDetails = await DB.SystemUser.findOne({
          "_id": body._id
        });
        if (!getAdminDetails) {
          return nextCall({
            "message": message.NO_ADMN_FND
          });
        } else {
          nextCall(null, getAdminDetails);
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

  changedAdminStatus: (req, res) => {
    async.waterfall([
      (nextCall) => {
        req.checkBody('userId', "ID is required").notEmpty();
        var error = req.validationErrors();
        if (error && error.length) {
          return nextCall({
            message: error[0].msg
          });
        }
        nextCall(null, req.body);
      },
      async (body, nextCall) => {
        let findAdmin = await DB.SystemUser.findOne({
          "_id": body.userId
        });
        if (!findAdmin) {
          return nextCall({
            "message": message.NO_ADMN_FND
          });
        } else {
          nextCall(null, findAdmin);
        }
      },
      async (findAdmin, nextCall) => {
        await DB.SystemUser.update({
          "_id": findAdmin._id
        }).set({
          "isActive": findAdmin.isActive === true ? false : true
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

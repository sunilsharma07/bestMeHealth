import jwt from 'jsonwebtoken'
import async from 'async'
import DB from '../../../../db'
import message from '../../../../config/message'
import config from '../../../../config/index'
import Mailer from '../../../../support/mailer'
import ED from '../../../../services/encry_decry'
import Uploader from '../../../../support/uploader'
import path from 'path'
import DS from '../../../../services/date'
import _ from 'lodash'
import customStr from '../../../../services/randomString'
import moment from 'moment'

var _self = {
  login: (req, res) => {
    async.waterfall([
      (nextCall) => {
        req.checkBody('email', 'Email is required').notEmpty()
        req.checkBody('password', 'Password is required').notEmpty()
        req.checkBody('fcmToken', 'FCM Token is required').notEmpty()
        req.checkBody('deviceId', 'Device Id is required').notEmpty()
        req.checkBody('deviceType', 'Device Type is required').notEmpty()
        var error = req.validationErrors()
        if (error && error.length) {
          return nextCall({
            message: error[0].msg
          })
        }
        nextCall(null, req.body)
      },
      (body, nextCall) => {
        DB.User.findOne({
          "email": body.email
        }, (err, user) => {
          if (err) {
            return nextCall({
              "message": message.SOMETHING_WRONG
            });
          } else if (!user) {
            return nextCall({
              "message": message.NO_USR_FND
            });
          } else if (user && user.password != ED.encrypt(body.password)) {
            return nextCall({
              "message": message.INV_PASS
            });
          } else if (user && user.isActive === false) {
            return nextCall({
              "message": message.USER_INACTIVE
            });
          } else {
            nextCall(null, user, body);
          }
        });
      },
      (user, body, nextCall) => {
        var jwtData = {
          id: user._id,
          email: user.email
        }

        user.accessToken = jwt.sign(jwtData, config.secret, {
          // expiresIn: 60 * 60 * 24 // expires in 24 hours
        })
        nextCall(null, user, body)
      },
      async (user, body, nextCall) => {
          let updatedUser = await DB.User.update({
            "_id": user._id
          }).set({
            "accessToken": user.accessToken,
            "fcmToken": body.fcmToken,
            "deviceId": body.deviceId,
            "deviceType": body.deviceType
          }).fetch();
          // set blank user fileds
          updatedUser[0].unfavoriteFood = [];
          updatedUser[0].favoriteFood = [];
          updatedUser[0].dailyEatFood = [];

          nextCall(null, updatedUser[0]);
        },
        async (updatedUser, nextCall) => {
          if (updatedUser && updatedUser.mediaId != "") {
            let getProfilePic = await DB.Media.find({
              "mediaId": updatedUser.mediaId
            }).limit(1);
            if (!getProfilePic) {
              updatedUser.mediaId = '';
            } else {
              delete updatedUser.mediaId
              updatedUser.mediaId = getProfilePic[0].mediaName
            }
            nextCall(null, updatedUser);
          } else {
            nextCall(null, updatedUser);
          }
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

  signup: (req, res) => {
    async.waterfall([
      (nextCall) => {
        Uploader.getFormFields(req, nextCall);
      },
      (fields, files, nextCall) => {
        if (fields && (!fields.firstName || !fields.lastName || !fields.phoneNumber || !fields.address || !fields.email || !fields.password || !fields.dateOfBirth || !fields.gender || !fields.height || !fields.weight || !fields.physicalDisabilitiies || !fields.allergies || !fields.rmr || !fields.goal || !fields.activityLevel || !fields.dietaryRequirement || !fields.unfavoriteFood || !fields.favoriteFood || !fields.dailyEatFood || !fields.currentPlanId || !fields.isWaitingForTopTier || !fields.isReferred || !fields.profileType || !fields.fcmToken || !fields.deviceId || !fields.deviceType)) {
          return nextCall({
            "message": message.MISSING_PARAMS
          });
        }
        nextCall(null, fields, files);
      },
      async (fields, files, nextCall) => {
          let checkUser = await DB.User.findOne({
            "email": fields.email
          });
          if (checkUser) {
            return nextCall({
              "message": message.USR_ALRDY_EXIST
            });
          } else {
            nextCall(null, fields, files);
          }
        },
        (fields, files, nextCall) => {
          if (!files.profilePicture || (files.profilePicture && (files.profilePicture.type.indexOf('image') === -1))) {
            return nextCall(null, "", fields);
          } else {
            var extension = path.extname(files.profilePicture.name);
            var filename = DS.getTime() + extension;
            var large_image = 'uploads/customer/' + filename;
            async.series([
              function (nextProc) {
                Uploader.upload({
                  src: files.profilePicture.path,
                  dst: rootPath + '/' + large_image
                }, nextProc);
              },
              function (nextProc) { // remove from temp
                Uploader.remove({
                  filepath: files.profilePicture.path
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
          (fields, nextCall) => {
            let assignUsers = {};
            _self.getAvailableDoctor((err, response) => {
              if (err) {
                return nextCall(err);
              } else {
                assignUsers.doctorId = response._id.toString()
                fields.assignedUsers = assignUsers;
                nextCall(null, fields);
              }
            });
          },
          async (fields, nextCall) => {
              let insertData = {
                firstName: fields.firstName,
                lastName: fields.lastName,
                phoneNumber: fields.phoneNumber,
                address: fields.address,
                email: fields.email,
                password: ED.encrypt(fields.password),
                dateOfBirth: Number(fields.dateOfBirth),
                gender: fields.gender,
                height: Number(fields.height),
                weight: Number(fields.weight),
                physicalDisabilitiies: JSON.parse(fields.physicalDisabilitiies),
                allergies: JSON.parse(fields.allergies),
                rmr: Number(fields.rmr),
                goal: Number(fields.goal),
                activityLevel: Number(fields.activityLevel),
                dietaryRequirement: fields.dietaryRequirement,
                unfavoriteFood: JSON.parse(fields.unfavoriteFood),
                favoriteFood: JSON.parse(fields.favoriteFood),
                dailyEatFood: JSON.parse(fields.dailyEatFood),
                currentPlanId: Number(fields.currentPlanId),
                isWaitingForTopTier: fields.isWaitingForTopTier,
                isReferred: fields.isReferred,
                isNotificationOn: fields.isNotificationOn,
                profileType: fields.profileType,
                mediaId: fields.mediaId,
                isActive: true,
                fcmToken: fields.fcmToken,
                deviceId: fields.deviceId,
                deviceType: fields.deviceType,
                assignedUsers: fields.assignedUsers
              };
              // Static user profile
              if (!insertData.mediaId || insertData.mediaId == '') {
                insertData.mediaId = "5c640c1ac1d27a5e277944e0";
              }
              let insertUserData = await DB.User.create(insertData).fetch();

              // set blank user fileds
              insertUserData.unfavoriteFood = [];
              insertUserData.favoriteFood = [];
              insertUserData.dailyEatFood = [];

              nextCall(null, insertUserData);
            },
            (newUser, nextCall) => {
              var jwtData = {
                id: newUser._id,
                email: newUser.email
              }
              newUser.accessToken = jwt.sign(jwtData, config.secret, {
                // expiresIn: 60 * 60 * 24
              })
              nextCall(null, newUser)
            },
            async (newUser, nextCall) => {
                await DB.User.update({
                  "_id": newUser._id
                }).set({
                  "accessToken": newUser.accessToken
                });
                nextCall(null, newUser);
              },
              async (newUser, nextCall) => {
                if (newUser && newUser.mediaId != "") {
                  let getProfilePic = await DB.Media.find({
                    "mediaId": newUser.mediaId
                  }).limit(1);
                  if (getProfilePic.length) {
                    delete newUser.mediaId
                    newUser.mediaId = getProfilePic[0].mediaName
                  } else {
                    newUser.mediaId = '';
                  }
                  nextCall(null, newUser);
                } else {
                  nextCall(null, newUser);
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
        message: message.SIGNUP_SUCC,
        data: response
      })
    });
  },

  changePassword: (req, res) => {
    async.waterfall([
      (nextCall) => {
        req.checkBody('_id', 'Id is required').notEmpty()
        req.checkBody('currentPassword', 'Current Password is required').notEmpty()
        req.checkBody('newPassword', 'New Password is required').notEmpty()
        var error = req.validationErrors()
        if (error && error.length) {
          return nextCall({
            message: error[0].msg
          })
        }
        nextCall(null, req.body)
      },
      async (body, nextCall) => {
          let getUser = await DB.User.findOne({
            "_id": body._id
          });
          if (!getUser) {
            return nextCall({
              "message": message.NO_USR_FND
            });
          } else if (ED.encrypt(body.currentPassword) != getUser.password) {
            return nextCall({
              "message": message.CUR_PASS_NOT_MTCH
            });
          } else {
            nextCall(null, body);
          }
        },
        async (body, nextCall) => {
          await DB.User.update({
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
        message: message.CHG_PASS_SUCC,
        data: {}
      })
    });
  },

  deactiveAccount: (req, res) => {
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
          let getUser = await DB.User.findOne({
            "_id": body._id
          });
          if (!getUser) {
            return nextCall({
              "message": message.NO_USR_FND
            });
          } else {
            nextCall(null, getUser);
          }
        },
        async (getUser, nextCall) => {
          await DB.User.update({
            "_id": getUser._id
          }).set({
            "isActive": false
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
        message: message.DEACT_SUCC,
        data: {}
      })
    });
  },

  getMetaData: (req, res) => {
    async.waterfall([
      (nextCall) => {
        let aggregateQuery = [];
        aggregateQuery.push({
          $match: {
            "isActive": true
          }
        });

        aggregateQuery.push({
          $unwind: {
            path: "$planFeatures",
            preserveNullAndEmptyArrays: true
          }
        });

        aggregateQuery.push({
          $lookup: {
            "from": "tbl_media",
            "localField": "planFeatures.mediaId",
            "foreignField": "_id",
            "as": "planFeatures.planImages"
          }
        });

        aggregateQuery.push({
          $unwind: {
            path: "$planFeatures.planImages",
            preserveNullAndEmptyArrays: true
          }
        });

        aggregateQuery.push({
          $project: {
            "_id": 1,
            "planName": 1,
            "planInfo": 1,
            "planFeatures.desc": "$planFeatures.desc",
            "planFeatures.desc": "$planFeatures.desc",
            "planFeatures.icon": "$planFeatures.planImages.mediaName",
            "planAmount": {
              "$sum": ["$upfrontPrice", "$initialPrice", "$testPrice"]
            }
          }
        });

        aggregateQuery.push({
          $group: {
            "_id": "$_id",
            "planName": {
              "$first": "$planName"
            },
            "planInfo": {
              "$first": "$planInfo"
            },
            "planFeatures": {
              "$push": "$planFeatures"
            },
            "planAmount": {
              "$first": "$planAmount"
            }
          }
        });
        nextCall(null, aggregateQuery);
      },
      (aggregateQuery, nextCall) => {
        let finalRes = {};
        DB.Plan._adapter.datastores.databaseConn.manager
          .collection(DB.Plan.identity)
          .aggregate(aggregateQuery)
          .toArray(function (err, allPlan) {
            if (err) {
              return nextCall({
                "message": message.SOMETHING_WRONG
              });
            } else {
              finalRes.plans = allPlan;
              nextCall(null, finalRes);
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

  changeNotificationStatus: (req, res) => {
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
          let getUser = await DB.User.findOne({
            "_id": body._id
          });
          if (!getUser) {
            return nextCall({
              "message": message.NO_USR_FND
            });
          } else {
            nextCall(null, getUser);
          }
        },
        async (getUser, nextCall) => {
          await DB.User.update({
            "_id": getUser._id
          }).set({
            "isNotificationOn": getUser.isNotificationOn === true ? false : true
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

  forgotPassword: (req, res) => {
    async.waterfall([
      (nextCall) => {
        req.checkBody('email', 'Email is required').notEmpty()
        var error = req.validationErrors()
        if (error && error.length) {
          return nextCall({
            message: error[0].msg
          })
        }
        nextCall(null, req.body)
      },
      async (body, nextCall) => {
          let getUser = await DB.User.findOne({
            'email': body.email
          });
          if (!getUser) {
            return nextCall({
              "message": message.NO_USR_FND
            });
          } else if (getUser && getUser.isActive == false) {
            return nextCall({
              "message": message.USER_INACTIVE
            });
          } else {
            nextCall(null, getUser);
          }
        },
        (getUser, nextCall) => {
          var randStr = customStr.randomString(10, "A");
          var html = '<center>Hello ' + getUser.firstName + ' ' + getUser.lastName +
            ' To reset your password, please click below link to reset your password!</center>' +
            '<div style="min-height: 20px;margin-top:30px;margin-bottom:30px;">' +
            '<center>' +
            '<a href="' + config.appHost + '/' + config.apiVersion + '/reset/' + randStr + '">Click Here to reset password...</a>' +
            '</center>' +
            '</div>';
          Mailer.mail({
            to: getUser.email,
            from: 'Best Me Health Team<noreplay@bestMeHealth.com>',
            subject: 'Best Me Health :: Reset password link',
            html: html
          }, function (err, info) {
            if (err) {
              return nextCall({
                "message": 'Sorry! Please use valid email address.'
              });
            }
            nextCall(null, getUser, randStr);
          });
        },
        async (getUser, randStr, nextCall) => {
          await DB.User.update({
            "_id": getUser._id
          }).set({
            "resetToken": randStr
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
        message: message.LINK_SEND_SUCC,
        data: {}
      })
    });
  },

  renderResetHtmlTemplate: (req, res) => {
    if (req.params && req.params.token) {
      res.render('reset', {
        reset_token: req.params.token
      })
    } else {
      res.send('Invalid parameters');
    }
  },

  resetPassword: (req, res) => {
    async.waterfall([
      (nextCall) => {
        req.checkBody('reset_token', 'Invalid parameters').notEmpty(); // Name is required
        req.checkBody('password', 'Invalid password').notEmpty();
        req.checkBody('confirm_password', 'Invalid confirm password').notEmpty();
        req.checkBody('confirm_password', 'Password and confirm password are different').equals(req.body.password);
        var error = req.validationErrors();
        if (error && error.length) {
          return nextCall({
            code: 400,
            status: 0,
            message: error[0].msg
          });
        }
        nextCall(null, req.body);
      },
      async (body, nextCall) => {
          let findUser = await DB.User.findOne({
            "resetToken": body.reset_token
          });
          if (!findUser) {
            return nextCall({
              "message": message.ONE_TIME_LINK_EXPIRE
            });
          }
          nextCall(null, body, findUser);
        },
        async (body, findUser, nextCall) => {
          await DB.User.update({
            "_id": findUser._id
          }).set({
            "resetToken": '',
            "password": ED.encrypt(body.password)
          });
          nextCall(null, null);
        }
    ], (err, response) => {
      if (err) {
        return res.sendToEncode({
          status_code: 400,
          message: (err && err.message) || message.SOMETHING_WRONG,
          data: {}
        });
      }
      return res.sendToEncode({
        status_code: 200,
        message: message.PASSWORD_UPDATE_SUCCESS,
        data: {}
      });
    });
  },

  getUserProfile: (req, res) => {
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
          $unwind: {
            path: "$unfavoriteFood",
            preserveNullAndEmptyArrays: true // optional
          }
        });
        aggregateQuery.push({
          $addFields: {
            "unfavoriteFood": {
              "$toObjectId": "$unfavoriteFood"
            }
          }
        });
        aggregateQuery.push({
          $lookup: {
            "from": "tbl_ingredients",
            "localField": "unfavoriteFood",
            "foreignField": "_id",
            "as": "unfavoriteFoodDetails"
          }
        });
        aggregateQuery.push({
          $unwind: {
            path: "$unfavoriteFoodDetails",
            preserveNullAndEmptyArrays: true // optional
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
            "phoneNumber": {
              "$first": "$phoneNumber"
            },
            "address": {
              "$first": "$address"
            },
            "email": {
              "$first": "$email"
            },
            "dateOfBirth": {
              "$first": "$dateOfBirth"
            },
            "gender": {
              "$first": "$gender"
            },
            "height": {
              "$first": "$height"
            },
            "weight": {
              "$first": "$weight"
            },
            "physicalDisabilitiies": {
              "$first": "$physicalDisabilitiies"
            },
            "allergies": {
              "$first": "$allergies"
            },
            "rmr": {
              "$first": "$rmr"
            },
            "goal": {
              "$first": "$goal"
            },
            "activityLevel": {
              "$first": "$activityLevel"
            },
            "dietaryRequirement": {
              "$first": "$dietaryRequirement"
            },
            "unfavoriteFood": {
              "$push": "$unfavoriteFoodDetails"
            },
            "favoriteFood": {
              "$first": "$favoriteFood"
            },
            "dailyEatFood": {
              "$first": "$dailyEatFood"
            },
            "currentPlanId": {
              "$first": "$currentPlanId"
            },
            "isWaitingForTopTier": {
              "$first": "$isWaitingForTopTier"
            },
            "isReferred": {
              "$first": "$isReferred"
            },
            "isNotificationOn": {
              "$first": "$isNotificationOn"
            },
            "profileType": {
              "$first": "$profileType"
            },
            "mediaId": {
              "$first": "$mediaDetails.mediaName"
            },
            "mediaPrimaryId": {
              "$first": "$mediaId"
            },
            "accessToken": {
              "$first": "$accessToken"
            },
            "fcmToken": {
              "$first": "$fcmToken"
            },
            "deviceId": {
              "$first": "$deviceId"
            },
            "deviceType": {
              "$first": "$deviceType"
            },
            "assignedUsers": {
              "$first": "$assignedUsers"
            }
          }
        });
        aggregateQuery.push({
          $unwind: {
            path: "$favoriteFood",
            preserveNullAndEmptyArrays: true // optional
          }
        });
        aggregateQuery.push({
          $addFields: {
            "favoriteFood": {
              "$toObjectId": "$favoriteFood"
            }
          }
        });
        aggregateQuery.push({
          $lookup: {
            "from": "tbl_ingredients",
            "localField": "favoriteFood",
            "foreignField": "_id",
            "as": "favoriteFoodDetails"
          }
        });
        aggregateQuery.push({
          $unwind: {
            path: "$favoriteFoodDetails",
            preserveNullAndEmptyArrays: true // optional
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
            "phoneNumber": {
              "$first": "$phoneNumber"
            },
            "address": {
              "$first": "$address"
            },
            "email": {
              "$first": "$email"
            },
            "dateOfBirth": {
              "$first": "$dateOfBirth"
            },
            "gender": {
              "$first": "$gender"
            },
            "height": {
              "$first": "$height"
            },
            "weight": {
              "$first": "$weight"
            },
            "physicalDisabilitiies": {
              "$first": "$physicalDisabilitiies"
            },
            "allergies": {
              "$first": "$allergies"
            },
            "rmr": {
              "$first": "$rmr"
            },
            "goal": {
              "$first": "$goal"
            },
            "activityLevel": {
              "$first": "$activityLevel"
            },
            "dietaryRequirement": {
              "$first": "$dietaryRequirement"
            },
            "unfavoriteFood": {
              "$first": "$unfavoriteFood"
            },
            "favoriteFood": {
              "$push": "$favoriteFoodDetails"
            },
            "dailyEatFood": {
              "$first": "$dailyEatFood"
            },
            "currentPlanId": {
              "$first": "$currentPlanId"
            },
            "isWaitingForTopTier": {
              "$first": "$isWaitingForTopTier"
            },
            "isReferred": {
              "$first": "$isReferred"
            },
            "isNotificationOn": {
              "$first": "$isNotificationOn"
            },
            "profileType": {
              "$first": "$profileType"
            },
            "mediaId": {
              "$first": "$mediaId"
            },
            "mediaPrimaryId": {
              "$first": "$mediaPrimaryId"
            },
            "accessToken": {
              "$first": "$accessToken"
            },
            "fcmToken": {
              "$first": "$fcmToken"
            },
            "deviceId": {
              "$first": "$deviceId"
            },
            "deviceType": {
              "$first": "$deviceType"
            },
            "assignedUsers": {
              "$first": "$assignedUsers"
            }
          }
        });
        aggregateQuery.push({
          $unwind: {
            path: "$dailyEatFood",
            preserveNullAndEmptyArrays: true // optional
          }
        });
        aggregateQuery.push({
          $addFields: {
            "dailyEatFood": {
              "$toObjectId": "$dailyEatFood"
            }
          }
        });
        aggregateQuery.push({
          $lookup: {
            "from": "tbl_ingredients",
            "localField": "dailyEatFood",
            "foreignField": "_id",
            "as": "dailyFoodDetails"
          }
        });
        aggregateQuery.push({
          $unwind: {
            path: "$dailyFoodDetails",
            preserveNullAndEmptyArrays: true // optional
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
            "phoneNumber": {
              "$first": "$phoneNumber"
            },
            "address": {
              "$first": "$address"
            },
            "email": {
              "$first": "$email"
            },
            "dateOfBirth": {
              "$first": "$dateOfBirth"
            },
            "gender": {
              "$first": "$gender"
            },
            "height": {
              "$first": "$height"
            },
            "weight": {
              "$first": "$weight"
            },
            "physicalDisabilitiies": {
              "$first": "$physicalDisabilitiies"
            },
            "allergies": {
              "$first": "$allergies"
            },
            "rmr": {
              "$first": "$rmr"
            },
            "goal": {
              "$first": "$goal"
            },
            "activityLevel": {
              "$first": "$activityLevel"
            },
            "dietaryRequirement": {
              "$first": "$dietaryRequirement"
            },
            "unfavoriteFood": {
              "$first": "$unfavoriteFood"
            },
            "favoriteFood": {
              "$first": "$favoriteFood"
            },
            "dailyEatFood": {
              "$push": "$dailyFoodDetails"
            },
            "currentPlanId": {
              "$first": "$currentPlanId"
            },
            "isWaitingForTopTier": {
              "$first": "$isWaitingForTopTier"
            },
            "isReferred": {
              "$first": "$isReferred"
            },
            "isNotificationOn": {
              "$first": "$isNotificationOn"
            },
            "profileType": {
              "$first": "$profileType"
            },
            "mediaId": {
              "$first": "$mediaId"
            },
            "mediaPrimaryId": {
              "$first": "$mediaPrimaryId"
            },
            "accessToken": {
              "$first": "$accessToken"
            },
            "fcmToken": {
              "$first": "$fcmToken"
            },
            "deviceId": {
              "$first": "$deviceId"
            },
            "deviceType": {
              "$first": "$deviceType"
            },
            "assignedUsers": {
              "$first": "$assignedUsers"
            }
          }
        });
        nextCall(null, aggregateQuery);
      },
      (aggregateQuery, nextCall) => {
        let finalRes = {};
        DB.User._adapter.datastores.databaseConn.manager
          .collection(DB.User.identity)
          .aggregate(aggregateQuery)
          .toArray(function (err, userProfile) {
            if (err) {
              return nextCall({
                "message": message.SOMETHING_WRONG
              });
            } else if (userProfile.length) {
              nextCall(null, userProfile[0]);
            } else {
              return nextCall({
                "message": message.NO_USR_FND
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

  sendFeedback: (req, res) => {
    async.waterfall([
      (nextCall) => {
        req.checkBody('_id', 'Id is required').notEmpty()
        req.checkBody('reaction', 'Reaction is required').notEmpty()
        req.checkBody('message', 'Message is required').notEmpty()
        req.checkBody('type', 'Type is required').notEmpty()
        req.checkBody('appVersion', 'Appversion is required').notEmpty()
        var error = req.validationErrors()
        if (error && error.length) {
          return nextCall({
            message: error[0].msg
          })
        }
        nextCall(null, req.body)
      },
      async (body, nextCall) => {
          let getUser = await DB.User.findOne({
            "_id": body._id
          });
          if (!getUser) {
            return nextCall({
              "message": message.NO_USR_FND
            });
          } else {
            nextCall(null, body, getUser);
          }
        },
        (body, getUser, nextCall) => {
          var html = '<p>Hello Admin,</p>' +
            '<p>You have received feedback from <strong> ' + getUser.firstName + ' ' + getUser.lastName + '</strong>.</p>' +
            '<p><strong>Reaction :-</strong> ' + body.reaction + '</p>' +
            '<p><strong>Description :-</strong> ' + body.message + '</p>' +
            '<p><strong>Type :-</strong> ' + body.type + '</p>' +
            '<p><strong>App Version :-</strong> ' + body.appVersion + '</p>';
          Mailer.mail({
            to: config.adminEmail,
            from: getUser.email,
            subject: 'Feedback from ' + getUser.firstName + ' ' + getUser.lastName,
            html: html
          }, function (err, info) {
            if (err) {
              return nextCall({
                "message": 'Sorry! Please use valid email address.'
              });
            }
            nextCall(null, body, getUser);
          });
        },
        async (body, getUser, nextCall) => {
          let insertData = {
            "userId": getUser._id,
            "reaction": body.reaction,
            "message": body.message,
            "type": body.type,
            "appVersion": body.appVersion
          };
          await DB.Feedback.create(insertData);
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
        message: message.FED_SENT_SUCC,
        data: {}
      })
    });
  },

  updateBasicDetails: (req, res) => {
    async.waterfall([
      (nextCall) => {
        req.checkBody('_id', 'Id is required').notEmpty()
        req.checkBody('phoneNumber', 'Phone Number is required').notEmpty()
        req.checkBody('address', 'Address is required').notEmpty()
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
            "_id": body._id
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
          await DB.User.update({
            "_id": body._id
          }).set({
            phoneNumber: body.phoneNumber,
            address: body.address
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
        message: message.BSC_DETL_UPDT_SUCC,
        data: {}
      })
    });
  },

  updateGoal: (req, res) => {
    async.waterfall([
      (nextCall) => {
        req.checkBody('_id', 'Id is required').notEmpty()
        req.checkBody('goal', 'Goal is required').notEmpty()
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
            "_id": body._id
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
          await DB.User.update({
            "_id": body._id
          }).set({
            "goal": Number(body.goal)
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
        message: message.GOL_UPDT_SUCC,
        data: {}
      })
    });
  },

  updatePersonalDetails: (req, res) => {
    async.waterfall([
      (nextCall) => {
        req.checkBody('_id', 'Id is required').notEmpty()
        req.checkBody('dateOfBirth', 'Date Of Birth is required').notEmpty()
        req.checkBody('gender', 'Gender is required').notEmpty()
        req.checkBody('height', 'Height is required').notEmpty()
        req.checkBody('weight', 'Weight is required').notEmpty()
        // req.checkBody('physicalDisabilitiies', 'Physical Disabilitiies is required').notEmpty()
        // req.checkBody('allergies', 'Allergies is required').notEmpty()
        req.checkBody('rmr', 'RMR Value is required').notEmpty()
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
            "_id": body._id
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
          let updateData = {
            dateOfBirth: Number(body.dateOfBirth),
            gender: body.gender,
            height: Number(body.height),
            weight: Number(body.weight),
            rmr: Number(body.rmr),
            physicalDisabilitiies: JSON.parse(body.physicalDisabilitiies),
            allergies: JSON.parse(body.allergies)
          };
          await DB.User.update({
            "_id": body._id
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
        message: message.PER_DET_UPDT_SUCC,
        data: {}
      })
    });
  },

  addSingleStepsCount: (req, res) => {
    async.waterfall([
      (nextCall) => {
        req.checkBody('userId', 'Id is required').notEmpty()
        req.checkBody('stepsCount', 'Steps count is required').notEmpty()
        req.checkBody('caloriesBurned', 'Calories is required').notEmpty()
        req.checkBody('distanceWalked', 'Distance walked is required').notEmpty()
        req.checkBody('walkTime', 'Walk time is required').notEmpty()
        req.checkBody('rmrValue', 'RMR value is required').notEmpty()
        req.checkBody('activityLevel', 'Activity level value is required').notEmpty()
        req.checkBody('stepsDate', 'Steps date is required').notEmpty()
        var error = req.validationErrors()
        if (error && error.length) {
          return nextCall({
            message: error[0].msg
          })
        }
        nextCall(null, req.body)
      },
      async (body, nextCall) => {
          let userSteps = await DB.UserActivity.findOne({
            "userId": body.userId,
            "stepsDate": {
              ">=": DS.isoString(body.stepsDate),
              "<=": moment(body.stepsDate).utc().add(((24 * 60 * 60) - 1), 's').format()
            }
          });
          nextCall(null, body, userSteps)
        },
        async (body, userSteps, nextCall) => {
          let response = {};
          if (userSteps) {
            let updateData = {
              "stepsCount": body.stepsCount,
              "caloriesBurned": body.caloriesBurned,
              "distanceWalked": body.distanceWalked,
              "walkTime": body.walkTime,
              "rmrValue": body.rmrValue,
              "currentActivityLevel": body.activityLevel
            };
            await DB.UserActivity.update({
              "_id": userSteps._id
            }).set(updateData);
            response.message = message.USR_ACT_UPDT_SUCC;
          } else {
            let insertData = {
              "userId": body.userId,
              "stepsCount": body.stepsCount,
              "caloriesBurned": body.caloriesBurned,
              "distanceWalked": body.distanceWalked,
              "walkTime": body.walkTime,
              "rmrValue": body.rmrValue,
              "currentActivityLevel": body.activityLevel,
              "stepsDate": DS.utcDateFormat(body.stepsDate)
            };
            await DB.UserActivity.create(insertData);
            response.message = message.USR_ACT_ADD_SUCC;
          }
          nextCall(null, response);
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
        message: (response.message) ? response.message : message.SUCC,
        data: {}
      })
    });
  },

  addStepsCount: (req, res) => {
    async.waterfall([
      (nextCall) => {
        req.checkBody('userId', 'Users ID is required').notEmpty()
        req.checkBody('activityData', 'Activity data is required').notEmpty()
        req.checkBody('deviceType', 'Device Type is required').notEmpty()
        var error = req.validationErrors()
        if (error && error.length) {
          return nextCall({
            message: error[0].msg
          })
        }
        nextCall(null, req.body)
      },
      (body, nextCall) => {
        console.log('TCL: --------------')
        console.log('TCL: body', body)
        console.log('TCL: --------------')
        let response = {};
        let activityData = JSON.parse(body.activityData);
        async.mapSeries(activityData, async function (activity, cb) {
            let userSteps = await DB.UserActivity.findOne({
              "userId": body.userId,
              "stepsDate": {
                ">=": DS.isoString(activity.stepsDate),
                "<=": moment(activity.stepsDate).utc().add(((24 * 60 * 60) - 1), 's').format()
              }
            });
            let targetSteps = 0;
            if (activity.currentActivityLevel == 1) {
              targetSteps = config.activityLevel.sedentory; //Sedentory
            } else if (activity.currentActivityLevel == 2) {
              targetSteps = config.activityLevel.active; //Active
            } else if (activity.currentActivityLevel == 3) {
              targetSteps = config.activityLevel.veryActive; //Very Active
            } else if (activity.currentActivityLevel == 4) {
              targetSteps = config.activityLevel.superActive; //Super Active
            }
            if (userSteps) {
              let updateData = {
                "stepsCount": activity.stepsCount,
                "caloriesBurned": activity.caloriesBurned,
                "distanceWalked": activity.distanceWalked,
                "walkTime": activity.walkTime,
                "rmrValue": activity.rmrValue,
                "currentActivityLevel": activity.currentActivityLevel,
                "activityLevelTarget": targetSteps,
                "deviceType": body.deviceType
              };
              await DB.UserActivity.update({
                "_id": userSteps._id
              }).set(updateData);
              cb(null, {});
            } else {
              let insertData = {
                "userId": body.userId,
                "stepsCount": activity.stepsCount,
                "caloriesBurned": activity.caloriesBurned,
                "distanceWalked": activity.distanceWalked,
                "walkTime": activity.walkTime,
                "rmrValue": activity.rmrValue,
                "currentActivityLevel": activity.currentActivityLevel,
                "activityLevelTarget": targetSteps,
                "stepsDate": activity.stepsDate,
                "deviceType": body.deviceType
              };
              await DB.UserActivity.create(insertData);
              cb(null, {});
            }
          },
          function (err, res) {
            response.message = message.USR_ACT_ADD_SUCC;
            nextCall(null, response)
          })
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
        message: (response.message) ? response.message : message.SUCC,
        data: {}
      })
    });
  },

  getStepsCount: (req, res) => {
    async.waterfall([
      (nextCall) => {
        req.checkBody('userId', 'ID is required').notEmpty()
        req.checkBody('stepsMonth', 'Month is required').notEmpty()
        req.checkBody('stepsYear', 'Year is required').notEmpty()
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
            userId: body.userId,
            stepsDate: {
              "$ne": ""
            }
          }
        });

        aggregateQuery.push({
          $addFields: {
            stepsDate: {
              $dateFromString: {
                dateString: '$stepsDate'
              }
            },
          }
        });

        aggregateQuery.push({
          $project: {
            stepsCount: "$stepsCount",
            caloriesBurned: "$caloriesBurned",
            distanceWalked: "$distanceWalked",
            walkTime: "$walkTime",
            rmrValue: "$rmrValue",
            deviceType: "$deviceType",
            activityLevelTarget: "$activityLevelTarget",
            stepsDate: "$stepsDate",
            day: {
              $dayOfMonth: "$stepsDate"
            },
            month: {
              $month: "$stepsDate"
            },
            year: {
              $year: "$stepsDate"
            },
          }
        });

        if (typeof body.stepsDay != 'undefined' && body.stepsDay != '') {
          aggregateQuery.push({
            $match: {
              day: Number(body.stepsDay)
            }
          });
        }

        aggregateQuery.push({
          $match: {
            month: Number(body.stepsMonth),
            year: Number(body.stepsYear),
          }
        });

        aggregateQuery.push({
          $project: {
            day: 0,
            month: 0,
            year: 0,
          }
        });

        nextCall(null, aggregateQuery);

      },
      async (aggregateQuery, nextCall) => {
        let finalRes = {};
        DB.UserActivity._adapter.datastores.databaseConn.manager
          .collection(DB.UserActivity.identity)
          .aggregate(aggregateQuery)
          .toArray(function (err, allActivity) {
            if (err) {
              return nextCall({
                "message": message.SOMETHING_WRONG
              });
            } else if (allActivity.length) {
              finalRes.activity = allActivity;
              nextCall(null, finalRes);
            } else {
              return nextCall({
                "message": message.NO_USR_ACTVTY_FOUND
              });
            }
          });
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
        message: message.SUCC,
        data: response
      })
    })
  },

  updateTierPlan: (req, res) => {
    async.waterfall([
      (nextCall) => {
        req.checkBody('userId', 'Id is required').notEmpty()
        req.checkBody('newPlanId', 'Plan ID is required').notEmpty()
        req.checkBody('isWaitingForTopTier', 'Waiting for top tier required').notEmpty()
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
          let updateData = {
            currentPlanId: Number(body.newPlanId),
            isWaitingForTopTier: body.isWaitingForTopTier
          };
          await DB.User.update({
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
        message: message.USR_PLAN_UPDT_SUCC,
        data: {}
      })
    });
  },

  updateQuestionnaire: (req, res) => {
    async.waterfall([
      (nextCall) => {
        req.checkBody('userId', 'Id is required').notEmpty()
        req.checkBody('activityLevel', 'Activity level is required').notEmpty()
        req.checkBody('unfavoriteFood', 'Unfavorite food is required').notEmpty()
        req.checkBody('favoriteFood', 'Favorite food is required').notEmpty()
        req.checkBody('dailyEatFood', 'Daily eat food is required').notEmpty()
        req.checkBody('dietaryRequirement', 'Dietary requirement is required').notEmpty()
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
          let updateData = {
            activityLevel: Number(body.activityLevel),
            unfavoriteFood: JSON.parse(body.unfavoriteFood),
            favoriteFood: JSON.parse(body.favoriteFood),
            dailyEatFood: JSON.parse(body.dailyEatFood),
            dietaryRequirement: body.dietaryRequirement
          };
          await DB.User.update({
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
        message: message.USR_QUESTNR_UPDT_SUCC,
        data: {}
      })
    });
  },

  updateProfileImage: (req, res) => {
    async.waterfall([
      (nextCall) => {
        Uploader.getFormFields(req, nextCall);
      },
      (fields, files, nextCall) => {
        if (fields && (!fields.userId)) {
          return nextCall({
            "message": message.MISSING_PARAMS
          });
        }
        nextCall(null, fields, files);
      },
      (fields, files, nextCall) => {
        if (!files.profilePicture || (files.profilePicture && (files.profilePicture.type.indexOf('image') === -1))) {
          return nextCall({
            "message": message.MISSING_PARAMS
          });
        } else {
          var extension = path.extname(files.profilePicture.name);
          var filename = DS.getTime() + extension;
          var large_image = 'uploads/customer/' + filename;
          var old_image = 'uploads/customer/' + fields.oldProfilePicture;
          async.series([
            function (nextProc) {
              Uploader.upload({
                src: files.profilePicture.path,
                dst: rootPath + '/' + large_image
              }, nextProc);
            },
            function (nextProc) { // remove from temp
              Uploader.remove({
                filepath: files.profilePicture.path
              }, nextProc);
            },
            function (nextProc) { // remove old image
              if (fields.oldProfilePicture && fields.oldProfilePicture != '') {
                Uploader.remove({
                  filepath: rootPath + '/' + old_image
                }, nextProc);
              } else {
                nextProc()
              }
            }
          ], function (err) {
            nextCall(null, filename, fields);
          });
        }
      },
      async (filename, fields, nextCall) => {
          let modelData = {
            "mediaName": filename,
            "mediaType": "image"
          };
          let insertProfilePicture = await DB.Media.create(modelData).fetch();
          fields.mediaId = insertProfilePicture.mediaId
          // if (fields.mediaId != '') {
          //   await DB.Media.update({
          //     "mediaId": fields.mediaId
          //   }).set(modelData);

          // } else {
          //   let insertProfilePicture = await DB.Media.create(modelData).fetch();
          //   fields.mediaId = insertProfilePicture.mediaId
          // }
          nextCall(null, fields);
        },
        async (fields, nextCall) => {
          await DB.User.update({
            "_id": fields.userId
          }).set({
            "mediaId": fields.mediaId
          });
          nextCall(null, null);
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
        message: message.PRO_IMG_UPDT_SUCC,
        data: {}
      })
    });
  },

  tierWaiting: (req, res) => {
    async.waterfall([
      (nextCall) => {
        req.checkBody('userId', 'Id is required').notEmpty()
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
            nextCall(null, body, checkUser);
          }
        },
        async (body, userData, nextCall) => {
          await DB.User.update({
            "_id": body.userId
          }).set({
            isWaitingForTopTier: userData.isWaitingForTopTier === true ? false : true
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

  /*
    Common Function
   */

  getAvailableDoctor: (callback) => {
    async.waterfall([
      (nextCall) => {
        let aggregateQuery = [];
        aggregateQuery.push({
          $match: {
            "isActive": true,
            "$or": [{
              "userType": "superDoctor"
            }, {
              "userType": "subDoctor"
            }]
          }
        });
        aggregateQuery.push({
          $addFields: {
            "doctorId": {
              "$toString": "$_id"
            }
          }
        });
        aggregateQuery.push({
          $lookup: {
            "from": "tbl_customer",
            "localField": "doctorId",
            "foreignField": "assignedUsers.doctorId",
            "as": "customerDetails"
          }
        });
        aggregateQuery.push({
          $project: {
            "_id": 1,
            "firstName": 1,
            "lastName": 1,
            "email": 1,
            "contactNumber": 1,
            "slots": "$slots",
            "lessUserAssignCount": {
              "$cond": {
                if: {
                  "$isArray": "$customerDetails"
                },
                "then": {
                  "$size": "$customerDetails"
                },
                "else": 0
              }
            },
          }
        });
        aggregateQuery.push({
          $sort: {
            "lessUserAssignCount": 1
          }
        });
        nextCall(null, aggregateQuery);
      },
      (aggregateQuery, nextCall) => {
        DB.SystemUser._adapter.datastores.databaseConn.manager
          .collection(DB.SystemUser.identity)
          .aggregate(aggregateQuery)
          .toArray(function (err, allDoctors) {
            if (err) {
              return nextCall({
                "message": message.SOMETHING_WRONG
              });
            } else if (allDoctors.length) {
              nextCall(null, allDoctors[0]);
            } else {
              return nextCall({
                "message": message.NO_DOCT_FND
              });
            }
          });
      }
    ], (err, response) => {
      callback(err, response);
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

module.exports = _self;

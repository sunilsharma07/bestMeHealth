import async from "async";
import moment from "moment";
import DB from "../../../../db";
import message from "../../../../config/message";

module.exports = {
  getAvailableSlotsOLD: (req, res) => {
    async.waterfall(
      [
        nextCall => {
          req.checkBody("userId", "ID is required").notEmpty();
          req.checkBody("bookingDate", "Booking Date is required").notEmpty();
          var error = req.validationErrors();
          if (error && error.length) {
            return nextCall({
              message: error[0].msg
            });
          }
          nextCall(null, req.body);
        },
        (body, nextCall) => {
          let getReqDate = moment(body.bookingDate);
          let getReqDay = getReqDate.format("dddd");
          nextCall(null, body, getReqDay);
        },
        (body, getReqDay, nextCall) => {
          let aggregateQuery = [];
          aggregateQuery.push({
            $match: {
              isActive: true,
              $or: [{
                  userType: "superDoctor"
                },
                {
                  userType: "subDoctor"
                }
              ],
              holidayDate: {
                $nin: [body.bookingDate]
              }
            }
          });
          aggregateQuery.push({
            $addFields: {
              doctorId: {
                $toString: "$_id"
              }
            }
          });
          aggregateQuery.push({
            $lookup: {
              from: "tbl_appointment",
              localField: "doctorId",
              foreignField: "doctorId",
              as: "appointmentDetails"
            }
          });
          aggregateQuery.push({
            $project: {
              _id: 1,
              firstName: 1,
              lastName: 1,
              email: 1,
              contactNumber: 1,
              bookedSlots: {
                $filter: {
                  input: "$appointmentDetails",
                  as: "appoDetails",
                  cond: {
                    $eq: ["$$appoDetails.appoDate", body.bookingDate]
                  }
                }
              },
              appointmentCount: {
                $cond: {
                  if: {
                    $isArray: "$appointmentDetails"
                  },
                  then: {
                    $size: "$appointmentDetails"
                  },
                  else: 0
                }
              },
              slots: 1
            }
          });
          aggregateQuery.push({
            $unwind: {
              path: "$bookedSlots",
              preserveNullAndEmptyArrays: true
            }
          });
          aggregateQuery.push({
            $project: {
              _id: 1,
              firstName: 1,
              lastName: 1,
              email: 1,
              contactNumber: 1,
              bookedSlots: "$bookedSlots.appoTime",
              appointmentCount: 1,
              slots: "$slots." + getReqDay.toLowerCase()
            }
          });
          aggregateQuery.push({
            $group: {
              _id: "$_id",
              firstName: {
                $first: "$firstName"
              },
              lastName: {
                $first: "$lastName"
              },
              email: {
                $first: "$email"
              },
              contactNumber: {
                $first: "$contactNumber"
              },
              bookedSlots: {
                $push: "$bookedSlots"
              },
              appointmentCount: {
                $first: "$appointmentCount"
              },
              slots: {
                $first: "$slots"
              }
            }
          });
          aggregateQuery.push({
            $sort: {
              appointmentCount: 1
            }
          });
          nextCall(null, aggregateQuery);
        },
        (aggregateQuery, nextCall) => {
          DB.SystemUser._adapter.datastores.databaseConn.manager
            .collection(DB.SystemUser.identity)
            .aggregate(aggregateQuery)
            .toArray(function (err, doctors) {
              if (err) {
                return nextCall({
                  message: message.SOMETHING_WRONG
                });
              } else if (doctors.length) {
                nextCall(null, doctors[0]);
              } else {
                return nextCall({
                  message: message.NO_DOCT_FND
                });
              }
            });
        }
      ],
      (err, response) => {
        if (err) {
          return res.sendToEncode({
            status: 400,
            message: (err && err.message) || message.SOMETHING_WRONG,
            data: {}
          });
        }
        return res.sendToEncode({
          status: 200,
          message: message.SUCC,
          data: response
        });
      }
    );
  },

  getAvailableSlots: (req, res) => {
    async.waterfall([
        (nextCall) => {
          req.checkBody("userId", "ID is required").notEmpty();
          req.checkBody("doctorId", "Doctor Id is required").notEmpty();
          req.checkBody("bookingDate", "Booking Date is required").notEmpty();
          var error = req.validationErrors();
          if (error && error.length) {
            return nextCall({
              message: error[0].msg
            });
          }
          nextCall(null, req.body);
        },
        (body, nextCall) => {
          let getReqDate = moment(body.bookingDate);
          let getReqDay = getReqDate.format("dddd");
          nextCall(null, body, getReqDay);
        },
        (body, getReqDay, nextCall) => {
          let aggregateQuery = [];
          aggregateQuery.push({
            $addFields: {
              "doctorId": {
                "$toString": "$_id"
              }
            }
          });
          aggregateQuery.push({
            $match: {
              "isActive": true,
              "$or": [{
                "userType": "superDoctor"
              }, {
                "userType": "subDoctor"
              }],
              "holidayDate": {
                "$nin": [body.bookingDate]
              },
              "doctorId": body.doctorId,
            }
          });
          aggregateQuery.push({
            $lookup: {
              "from": "tbl_appointment",
              "localField": "doctorId",
              "foreignField": "doctorId",
              "as": "appointmentDetails"
            }
          });
          aggregateQuery.push({
            $project: {
              "_id": 1,
              "firstName": 1,
              "lastName": 1,
              "email": 1,
              "contactNumber": 1,
              "slots": "$slots." + getReqDay.toLowerCase(),
              "bookedSlots": {
                "$filter": {
                  "input": "$appointmentDetails",
                  "as": "appoDetails",
                  "cond": {
                    "$eq": ["$$appoDetails.appoDate", body.bookingDate]
                  }
                }
              }
            }
          });
          aggregateQuery.push({
            $unwind: {
              path: "$bookedSlots",
              preserveNullAndEmptyArrays: true
            }
          });
          aggregateQuery.push({
            $project: {
              "_id": 1,
              "firstName": 1,
              "lastName": 1,
              "email": 1,
              "contactNumber": 1,
              "bookedSlots": "$bookedSlots.appoTime",
              "slots": 1
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
              "contactNumber": {
                "$first": "$contactNumber"
              },
              "bookedSlots": {
                "$push": "$bookedSlots"
              },
              "slots": {
                "$first": "$slots"
              },
            }
          });
          nextCall(null, aggregateQuery);
        },
        (aggregateQuery, nextCall) => {
          DB.SystemUser._adapter.datastores.databaseConn.manager
            .collection(DB.SystemUser.identity)
            .aggregate(aggregateQuery)
            .toArray(function (err, doctors) {
              if (err) {
                return nextCall({
                  message: message.SOMETHING_WRONG
                });
              } else if (doctors.length) {
                nextCall(null, doctors[0]);
              } else {
                return nextCall({
                  message: message.NO_DOCT_FND
                });
              }
            });
        }
      ],
      (err, response) => {
        if (err) {
          return res.sendToEncode({
            status: 400,
            message: (err && err.message) || message.SOMETHING_WRONG,
            data: {}
          });
        }
        return res.sendToEncode({
          status: 200,
          message: message.SUCC,
          data: response
        });
      }
    );
  },

  callSchedule: (req, res) => {
    async.waterfall(
      [
        nextCall => {
          req.checkBody("zoomId", "Zoom Id is required").notEmpty();
          req.checkBody("userId", "User Id is required").notEmpty();
          req.checkBody("doctorId", "Doctor Id is required").notEmpty();
          req.checkBody("appoTime", "Appointment Time is required").notEmpty();
          req.checkBody("appoDate", "Appointment Date is required").notEmpty();
          var error = req.validationErrors();
          if (error && error.length) {
            return nextCall({
              message: error[0].msg
            });
          }
          nextCall(null, req.body);
        },
        // async (body, nextCall) => {
        //     let checkSlots = await DB.Appointment.findOne({
        //       doctorId: body.doctorId,
        //       appoTime: body.appoTime,
        //       appoDate: body.appoDate
        //     });
        //     if (checkSlots) {
        //       return nextCall({
        //         message: message.SLOTS_BUSY
        //       });
        //     } else {
        //       nextCall(null, body);
        //     }
        //   },
        async (body, nextCall) => {
            await DB.User.update({
              _id: body.userId
            }).set({
              isInitiallyAppointment: true
            });
            nextCall(null, body);
          },
          async (body, nextCall) => {
              let insertData = {
                zoomId: body.zoomId,
                userId: body.userId,
                doctorId: body.doctorId,
                appoTime: body.appoTime,
                appoDate: body.appoDate,
                status: "pending"
              };
              let createdAppointment = await DB.Appointment.create(
                insertData
              ).fetch();
              nextCall(null, createdAppointment);
            },
            (createdAppointment, nextCall) => {
              let getReqDate = moment(createdAppointment.bookingDate);
              let getReqDay = getReqDate.format("dddd");
              nextCall(null, createdAppointment, getReqDay.toLowerCase());
            },
            async (createdAppointment, getReqDay, nextCall) => {
              let aa = await DB.SystemUser.update({
                "_id": createdAppointment.doctorId
              }).set({
                "$pull": {
                  "slots": {
                    "friday": "12"
                  }
                }
              }).fetch();
              console.log('TCL: ----------')
              console.log('TCL: aa', aa)
              console.log('TCL: ----------')
            }
      ],
      (err, response) => {
        if (err) {
          return res.sendToEncode({
            status: 400,
            message: (err && err.message) || message.SOMETHING_WRONG,
            data: {}
          });
        }
        return res.sendToEncode({
          status: 200,
          message: message.APPO_SCH_SUCC,
          data: response
        });
      }
    );
  },

  reScheduledCall: (req, res) => {
    async.waterfall(
      [
        nextCall => {
          req
            .checkBody("appointmentId", "Appointment Id is required")
            .notEmpty();
          req.checkBody("doctorId", "Doctor Id is required").notEmpty();
          req.checkBody("zoomId", "Zoom Id is required").notEmpty();
          req.checkBody("userId", "User Id is required").notEmpty();
          req.checkBody("appoTime", "Appointment Time is required").notEmpty();
          req.checkBody("appoDate", "Appointment Date is required").notEmpty();
          var error = req.validationErrors();
          if (error && error.length) {
            return nextCall({
              message: error[0].msg
            });
          }
          nextCall(null, req.body);
        },
        async (body, nextCall) => {
            let checkSlots = await DB.Appointment.findOne({
              doctorId: body.doctorId,
              appoTime: body.appoTime,
              appoDate: body.appoDate
            });
            if (checkSlots) {
              return nextCall({
                message: message.SLOTS_BUSY
              });
            } else {
              nextCall(null, body);
            }
          },
          async (body, nextCall) => {
            let updateData = {
              appoTime: body.appoTime,
              appoDate: body.appoDate
            };
            let updatedAppointment = await DB.Appointment.update({
                _id: body.appointmentId
              })
              .set(updateData)
              .fetch();
            nextCall(null, updatedAppointment[0]);
          }
      ],
      (err, response) => {
        if (err) {
          return res.sendToEncode({
            status: 400,
            message: (err && err.message) || message.SOMETHING_WRONG,
            data: {}
          });
        }
        return res.sendToEncode({
          status: 200,
          message: message.APPO_RESCH_SUCC,
          data: response
        });
      }
    );
  },

  getMyAppointment: (req, res) => {
    async.waterfall(
      [
        nextCall => {
          req.checkBody("userId", "User Id is required").notEmpty();
          var error = req.validationErrors();
          if (error && error.length) {
            return nextCall({
              message: error[0].msg
            });
          }
          nextCall(null, req.body);
        },
        (body, nextCall) => {
          let aggregateQuery = [];
          aggregateQuery.push({
            $match: {
              userId: body.userId
            }
          });
          aggregateQuery.push({
            $addFields: {
              doctorId: {
                $toObjectId: "$doctorId"
              }
            }
          });
          aggregateQuery.push({
            $lookup: {
              from: "tbl_users",
              localField: "doctorId",
              foreignField: "_id",
              as: "doctorDetails"
            }
          });
          aggregateQuery.push({
            $unwind: {
              path: "$doctorDetails",
              preserveNullAndEmptyArrays: true
            }
          });
          aggregateQuery.push({
            $project: {
              _id: 1,
              zoomId: 1,
              userId: 1,
              doctorId: 1,
              appoTime: 1,
              appoDate: 1,
              status: 1,
              doctorName: {
                $concat: [
                  "$doctorDetails.firstName",
                  " ",
                  "$doctorDetails.lastName"
                ]
              }
            }
          });
          nextCall(null, aggregateQuery);
        },
        (aggregateQuery, nextCall) => {
          let finalRes = {};
          DB.Appointment._adapter.datastores.databaseConn.manager
            .collection(DB.Appointment.identity)
            .aggregate(aggregateQuery)
            .toArray(function (err, allAppointment) {
              if (err) {
                return nextCall({
                  message: message.SOMETHING_WRONG
                });
              } else if (allAppointment.length) {
                finalRes.appointments = allAppointment;
                nextCall(null, finalRes);
              } else {
                return nextCall({
                  message: message.NO_APPO_FND
                });
              }
            });
        }
      ],
      (err, response) => {
        if (err) {
          return res.sendToEncode({
            status: 400,
            message: (err && err.message) || message.SOMETHING_WRONG,
            data: {}
          });
        }
        return res.sendToEncode({
          status: 200,
          message: message.SUCC,
          data: response
        });
      }
    );
  }
};

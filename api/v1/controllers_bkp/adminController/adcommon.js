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
  getPermission: (req, res) => {
    async.waterfall([
      async (nextCall) => {
        let finalRes = {};
        let PermissionList = await DB.Permission.find({});
        if (PermissionList.length) {
          finalRes.allPermission = PermissionList;
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

  getIngredients: (req, res) => {
    async.waterfall([
      async (nextCall) => {
        let finalRes = {};
        let allIngredients = await DB.Ingredients.find({});
        if (allIngredients.length) {
          finalRes.ingredients = allIngredients;
          nextCall(null, finalRes);
        } else {
          return nextCall({
            "message": message.NO_INGR_FND
          });
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

  getFoodCategory: (req, res) => {
    let finalRes = {};
    async.waterfall([
      async (nextCall) => {
        let getAllFoodCategory = await DB.Category.find({
          "isActive": true,
          "catType": "food"
        });
        if (getAllFoodCategory.length) {
          finalRes.foodCategory = getAllFoodCategory
          nextCall(null, finalRes);
        } else {
          return nextCall({
            "message": message.NO_CAT_FND
          });
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
}

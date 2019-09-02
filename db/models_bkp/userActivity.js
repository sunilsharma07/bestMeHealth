import Waterline from 'waterline'
import DS from '../../services/date'
const userActivityCollection = Waterline.Collection.extend({
  identity: 'tbl_useractivity',
  datastore: 'databaseConn',
  primaryKey: '_id',
  migrate: 'alter',

  attributes: {
    _id: {
      type: 'string',
      autoMigrations: {
        autoIncrement: true
      }
    },
    userId: {
      type: 'string'
    },
    stepsCount: {
      type: 'number'
    },
    caloriesBurned: {
      type: 'number'
    },
    distanceWalked: {
      type: 'number'
    },
    walkTime: {
      type: 'number'
    },
    rmrValue: {
      type: 'number'
    },
    currentActivityLevel: {
      type: 'number'
    },
    activityLevelTarget: {
      type: 'number'
    },
    stepsDate: {
      type: 'string'
    },
    deviceType: {
      type: 'string'
    }
  },

  beforeCreate: function (valuesToSet, proceed) {
    valuesToSet.createdAt = valuesToSet.updatedAt = DS.now()
    proceed()
  },

  beforeUpdate: function (valuesToSet, proceed) {
    valuesToSet.updatedAt = DS.now()
    proceed()
  }
})

export default userActivityCollection

import Waterline from 'waterline'
import DS from '../../services/date'
const userCollection = Waterline.Collection.extend({
  identity: 'tbl_customer',
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
    mediaId: {
      type: 'string'
    },
    firstName: {
      type: 'string'
    },
    lastName: {
      type: 'string'
    },
    phoneNumber: {
      type: 'string'
    },
    address: {
      type: 'string'
    },
    dateOfBirth: {
      type: 'number'
    },
    gender: {
      type: 'string'
    },
    height: {
      type: 'number'
    },
    weight: {
      type: 'number'
    },
    physicalDisabilitiies: {
      type: 'json'
    },
    allergies: {
      type: 'json'
    },
    rmr: {
      type: 'number'
    },
    goal: {
      type: 'number'
    },
    activityLevel: {
      type: 'number'
    },
    dietaryRequirement: {
      type: 'string'
    },
    unfavoriteFood: {
      type: 'json'
    },
    favoriteFood: {
      type: 'json'
    },
    dailyEatFood: {
      type: 'json'
    },
    currentPlanId: {
      type: 'number'
    },
    isWaitingForTopTier: {
      type: 'boolean'
    },
    isReferred: {
      type: 'boolean'
    },
    isActive: {
      type: 'boolean',
      defaultsTo: true
    },
    isInitiallyAppointment: {
      type: 'boolean',
      defaultsTo: false
    },
    assignedUsers: {
      type: 'json'
    },
    isNotificationOn: {
      type: 'boolean'
    },
    profileType: {
      type: 'string'
    },
    resetToken: {
      type: 'string'
    },
    email: {
      type: 'string',
      required: true
    },
    password: {
      type: 'string'
    },
    accessToken: {
      type: 'string'
    },
    fcmToken: {
      type: 'string'
    },
    deviceId: {
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


export default userCollection

import Waterline from 'waterline'
import DS from '../../services/date'
const systemUserCollection = Waterline.Collection.extend({
  identity: 'tbl_users',
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
    firstName: {
      type: 'string'
    },
    mediaId: {
      type: 'string'
    },
    lastName: {
      type: 'string'
    },
    email: {
      type: 'string'
    },
    contactNumber: {
      type: 'string'
    },
    password: {
      type: 'string'
    },
    isActive: {
      type: 'boolean',
      defaultsTo: true
    },
    permissions: {
      type: 'json'
    },
    slots: {
      type: 'json'
    },
    holidayDate: {
      type: 'json',
      // columnType: 'array'
    },
    setPassToken: {
      type: 'string'
    },
    userType: {
      type: 'string'
    },
    accessToken: {
      type: 'string'
    },
    socketId: {
      type: 'string'
    },
    addedBy: {
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

export default systemUserCollection

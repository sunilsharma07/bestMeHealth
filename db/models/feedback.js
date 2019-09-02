import Waterline from 'waterline'
import DS from '../../services/date'
const feedbackCollection = Waterline.Collection.extend({
  identity: 'tbl_feedback',
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
    reaction: {
      type: 'string'
    },
    message: {
      type: 'string'
    },
    type: {
      type: 'string'
    },
    appVersion: {
      type: 'string'
    },
    createdAt: {
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

export default feedbackCollection

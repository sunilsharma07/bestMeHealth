import Waterline from 'waterline'
import DS from '../../services/date'
const planCollection = Waterline.Collection.extend({
  identity: 'tbl_plan',
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
    planName: {
      type: 'string'
    },
    planInfo: {
      type: 'string'
    },
    planFeatures: {
      type: 'json'
    },
    isActive: {
      type: 'boolean',
      defaultsTo: true
    },
    createdBy: {
      type: 'string'
    },
    updatedBy: {
      type: 'string'
    },
    isAvailableForSubscription: {
      type: 'boolean',
      defaultsTo: false
    },
    upfrontPrice: {
      type: 'number'
    },
    initialPrice: {
      type: 'number'
    },
    testPrice: {
      type: 'number'
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

export default planCollection

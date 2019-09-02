import Waterline from 'waterline'
import DS from '../../services/date'
import config from '../../config/index'
const tipsCollection = Waterline.Collection.extend({
  identity: 'tbl_tips',
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
    addedBy: {
      type: 'string',
    },
    whoAdded: {
      type: 'string',
    },
    type: {
      type: 'string',
    },
    title: {
      type: 'string',
    },
    description: {
      type: 'string'
    },
    tipType: {
      type: 'string'
    },
    fromDate: {
      type: 'string'
    },
    toDate: {
      type: 'string'
    },
    isActive: {
      type: 'boolean',
      defaultsTo: true
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

export default tipsCollection

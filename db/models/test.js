import Waterline from 'waterline'
import DS from '../../services/date'
import config from '../../config/index'
const testCollection = Waterline.Collection.extend({
  identity: 'tbl_test',
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
    mediaId : {
      type: 'string',
    },
    title: {
      type: 'string',
    },
    description: {
      type: 'string'
    },
    aLaCartPrice: {
      type: 'number'
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

export default testCollection

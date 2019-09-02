import Waterline from 'waterline'
import DS from '../../services/date'
const muscleCollection = Waterline.Collection.extend({
  identity: 'tbl_muscle',
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
    apiPrimaryId: {
      type: 'string',
    },
    name: {
      type: 'string',
    },
    is_front: {
      type: 'boolean'
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

export default muscleCollection

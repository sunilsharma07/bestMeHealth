import Waterline from 'waterline'
import DS from '../../services/date'
const equipmentCollection = Waterline.Collection.extend({
  identity: 'tbl_equipment',
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

export default equipmentCollection

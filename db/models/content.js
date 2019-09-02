import Waterline from 'waterline'
import DS from '../../services/date'
const contentCollection = Waterline.Collection.extend({
  identity: 'tbl_content',
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
    title: {
      type: 'string'
    },
    description: {
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

export default contentCollection

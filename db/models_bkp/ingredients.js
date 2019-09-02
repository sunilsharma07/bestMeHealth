import Waterline from 'waterline'
import DS from '../../services/date'
const ingredientsCollection = Waterline.Collection.extend({
  identity: 'tbl_ingredients',
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
    name: {
      type: 'string'
    },
    description: {
      type: 'string'
    },
    isActive: {
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

export default ingredientsCollection

import Waterline from 'waterline'
import DS from '../../services/date'
const exerciseCollection = Waterline.Collection.extend({
  identity: 'tbl_exercise',
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
    name_original: {
      type: 'string',
    },
    description: {
      type: 'string',
    },
    uuid: {
      type: 'string',
    },
    categoryId: {
      type: 'string',
    },
    muscles: {
      type: 'json',
    },
    muscles_secondary: {
      type: 'json',
    },
    equipment: {
      type: 'json',
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

export default exerciseCollection

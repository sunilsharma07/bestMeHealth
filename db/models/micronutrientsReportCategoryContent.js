import Waterline from 'waterline'
import DS from '../../services/date'
const exerciseCategoryCollection = Waterline.Collection.extend({
  identity: 'tbl_micronutrients_report_category_content',
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
    categoryId: {
      type: 'string',
    },
    name: {
      type: 'string',
    },
    rangeGreaterThan: {
      type: 'number',
    },
    rangeLessThan: {
      type: 'number',
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

export default exerciseCategoryCollection

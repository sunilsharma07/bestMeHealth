import Waterline from 'waterline'
import DS from '../../services/date'
const recipeCollection = Waterline.Collection.extend({
  identity: 'tbl_recipe',
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
    category: {
      type: 'string'
    },
    mediaId: {
      type: 'json'
    },
    isActive: {
      type: 'boolean',
      defaultsTo: true
    },
    foodType: {
      type: 'string'
    },
    prepTime: {
      type: 'string'
    },
    serves: {
      type: 'string'
    },
    directions: {
      type: 'string'
    },
    ingredients: {
      type: 'json'
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

export default recipeCollection

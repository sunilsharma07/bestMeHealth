import Waterline from 'waterline'
import DS from '../../services/date'
const notesCollection = Waterline.Collection.extend({
  identity: 'tbl_note',
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
    notes: {
      type: 'string'
    },
    userId: {
      type: 'string'
    },
    addedBy: {
      type: 'string'
    },
    whoAdded: {
      type: 'string'
    },
    adminRole: {
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

export default notesCollection

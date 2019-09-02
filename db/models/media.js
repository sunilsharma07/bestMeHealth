import Waterline from 'waterline'
import DS from '../../services/date'
import config from '../../config/index'
const mediaCollection = Waterline.Collection.extend({
  identity: 'tbl_media',
  datastore: 'databaseConn',
  primaryKey: 'mediaId',
  migrate: 'alter',

  attributes: {
    mediaId: {
      type: 'string',
      columnName: config.database.use === 'mongodb' ? '_id' : 'mediaId',
      autoMigrations: {
        autoIncrement: true
      }
    },
    mediaName: {
      type: 'string',
    },
    mediaType: {
      type: 'string'
    },
    medaiInfo: {
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

export default mediaCollection

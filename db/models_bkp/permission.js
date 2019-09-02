import Waterline from 'waterline'
import DS from '../../services/date'
const permissionCollection = Waterline.Collection.extend({
  identity: 'tbl_permission',
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
    permissionValue: {
      type: 'string'
    },
    permissionName: {
      type: 'string'
    }
  }
})

export default permissionCollection

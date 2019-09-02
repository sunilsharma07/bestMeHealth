import Waterline from 'waterline'
import DS from '../../services/date'
import config from '../../config/index'
const chatMessageCollection = Waterline.Collection.extend({
  identity: 'tbl_chat_message',
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
    message: {
      type: 'string',
    },
    senderId: {
      type: 'string',
    },
    senderType: {
      type: 'string',
    },
    receiverId: {
      type: 'string',
    },
    receiverType: {
      type: 'string',
    },
    isRead: {
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

export default chatMessageCollection

import Waterline from "waterline";
import DS from '../../services/date'
const addressCollection = Waterline.Collection.extend({
  identity: "tbl_address",
  datastore: "databaseConn",
  primaryKey: "_id",
  migrate: "alter",

  attributes: {
    _id: {
      type: "string",
      autoMigrations: {
        autoIncrement: true
      }
    },
    userId: {
      type: "string"
    },
    type: {
      type: "string"
    },
    address: {
      type: "string"
    },
    fullName: {
      type: "string"
    },
    phoneNumber: {
      type: "string"
    },
    landmark: {
      type: "string"
    },
    city: {
      type: 'string'
    },
    state: {
      type: 'string'
    },
    country: {
      type: 'string'
    },
    zipCode: {
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
});

export default addressCollection;

import Waterline from "waterline";
import DS from '../../services/date'
const blogCollection = Waterline.Collection.extend({
  identity: "tbl_blog",
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
    mediaId: {
      type: 'string'
    },
    title: {
      type: "string"
    },
    details: {
      type: "string"
    },
    addedBy: {
      type: 'string'
    },
    isActive: {
      type: "boolean",
      defaultsTo: true
    },
    viewsCount: {
      type: "number"
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

export default blogCollection;

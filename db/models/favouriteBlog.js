import Waterline from "waterline";
import DS from '../../services/date'
const favouriteBlogCollection = Waterline.Collection.extend({
  identity: "tbl_favouriteblog",
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
      type: 'string'
    },
    blogId: {
      type: "string"
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

export default favouriteBlogCollection;

import Waterline from "waterline";
import DS from '../../services/date'
const categoryCollection = Waterline.Collection.extend({
  identity: "tbl_category",
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
    parentId: {
      type: "string"
    },
    name: {
      type: "string"
    },
    catType: {
      type: "string"
    },
    mediaName: {
      type: "string"
    },
    isActive: {
      type: "boolean",
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
});

export default categoryCollection;

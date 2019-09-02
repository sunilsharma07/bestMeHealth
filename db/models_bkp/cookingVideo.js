import Waterline from "waterline";
import DS from '../../services/date'
const cookingVideoCollection = Waterline.Collection.extend({
  identity: "tbl_cookingvideo",
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
    categoryId: {
      type: "string"
    },
    uploadedBy: {
      type: "string"
    },
    title: {
      type: "string"
    },
    url: {
      type: "string"
    },
    calories: {
      type: "string"
    },
    type: {
      type: 'string',
      defaultsTo: 'public'
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

export default cookingVideoCollection;

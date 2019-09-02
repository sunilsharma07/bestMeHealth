import Waterline from "waterline";
import DS from '../../services/date'
const testReportCollection = Waterline.Collection.extend({
  identity: "tbl_test_report",
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
    customerId: {
      type: "string"
    },
    reportType: {
      type: "string"
    },
    reportFileName: {
      type: "string"
    },
    result: {
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

export default testReportCollection;

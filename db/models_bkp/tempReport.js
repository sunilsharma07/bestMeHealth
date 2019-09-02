import Waterline from "waterline";
import DS from '../../services/date'
const tempReportCollection = Waterline.Collection.extend({
  identity: "tbl_temp_report",
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
    RowID: {
      type: "string"
    },
    CreatedDate: {
      type: "string"
    },
    CreatedBy: {
      type: "string"
    },
    FrequencyID: {
      type: "string"
    },
    AntigenID: {
      type: "string"
    },
    AntigenName: {
      type: 'string'
    },
    TestID: {
      type: 'string'
    },
    category: {
      type: 'string'
    },
    Plate: {
      type: 'string'
    },
    Lot: {
      type: 'string'
    },
    Rev: {
      type: 'number'
    },
    ODValue: {
      type: 'number'
    },
    TestNum: {
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

export default tempReportCollection;

import Waterline from "waterline";
import DS from '../../services/date'
const testFit132Collection = Waterline.Collection.extend({
  identity: "tbl_testfit132",
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
    testId: {
      type: 'string'
    },
    userId: {
      type: 'string'
    },
    addedBy: {
      type: "string"
    },
    updatedBy: {
      type: 'string'
    },
    status: {
      type: "number"
    },
    rowID: {
      type: 'string'
    },
    frequencyID: {
      type: "number"
    },
    createdDate: {
      type: 'string'
    },
    createdBy: {
      type: "number"
    },
    antigenID: {
      type: 'string'
    },
    antigenName: {
      type: "number"
    },
    labTestId: {
      type: 'number'
    },
    category: {
      type: "string"
    },
    plate: {
      type: 'string'
    },
    lot: {
      type: "number"
    },
    rev: {
      type: 'number'
    },
    odValue: {
      type: "number"
    },
    testNum: {
      type: 'number'
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

export default testFit132Collection;

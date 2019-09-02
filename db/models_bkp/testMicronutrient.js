import Waterline from "waterline";
import DS from '../../services/date'
const testMicronutrientCollection = Waterline.Collection.extend({
  identity: "tbl_testmicronutrient",
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
    micronutrients: {
      type: 'string'
    },
    patientResult: {
      type: "number"
    },
    funcAbnormals: {
      type: 'string'
    },
    referenceRange: {
      type: "string"
    },
    vitaminCategory: {
      type: 'string'
    },
    vitaminName: {
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

export default testMicronutrientCollection;

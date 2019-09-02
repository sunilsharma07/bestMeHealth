import Waterline from "waterline";
import DS from '../../services/date'
const appointmentCollection = Waterline.Collection.extend({
  identity: "tbl_appointment",
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
    zoomId: {
      type: "string"
    },
    doctorId: {
      type: "string"
    },
    appoDate: {
      type: "string"
    },
    appoTime: {
      type: "string"
    },
    status: {
      type: "string"
    }
    // pending, completed, cancel_by_doctor, cancel_by_patient, cancel_by_admin
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

export default appointmentCollection;

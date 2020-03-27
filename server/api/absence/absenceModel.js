var mongoose = require("mongoose")
var moment = require("moment")
var Schema = mongoose.Schema

var AbsenceSchema = new Schema({
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  returnDate: {
    type: Date,
    required: true
  },
  Status: {
    type: String,
    required: true
  },
  Description: String,
  createdOn: Date,
  resolvedOn: Date,
  type: {
    type: String,
    required: true
  },
  reason: String,
  userId: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true
  },

  isDeleted: Boolean,

  logs: [],

  areAllDaysProcessed: Boolean,

  processedAbsenceDates: []
})

AbsenceSchema.pre("save", function(next) {
  var createdOn = {
    message: "Created on " + moment().format("MMMM Do YYYY, h:mm:ss a"),
    timestamp: moment()
  }
  this.areAllDaysProcessed = false
  this.logs.push(createdOn)
  next()
})

AbsenceSchema.methods = {
  toDTO: function() {
    var absence = this.toObject()
    delete absence.logs
    delete areAllDaysProcessed
    delete absence.processedAbsenceDates
    return absence
  }
}

module.exports = mongoose.model("absence", AbsenceSchema)

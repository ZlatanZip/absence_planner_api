var mongoose = require("mongoose")
var uuid = require("uuid/v4")
var crypto = require("crypto")
var config = require("../../config/config")
var moment = require("moment")

var Schema = mongoose.Schema

var UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },

  firstName: {
    type: String,
    required: true
  },

  lastName: {
    type: String,
    required: true
  },

  password: {
    type: String,
    required: true
  },

  salt: {
    type: String,
    unique: true
  },

  role: String,

  remainingDays: Number,

  remainingDaysAvaliable: "",

  transferFromPreviousYear: Number,

  userDaysPerYear: Number,

  reviewersList: [{type: Schema.Types.ObjectId, ref: "user"}],

  initialYearStates: [],

  logs: []
})

UserSchema.pre("save", function(next) {
  this.salt = uuid()
  const hash = crypto.createHash("sha256")
  hash.update(this.salt + this.password)
  this.password = hash.digest("hex")
  this.role = "Employee"
  if (!this.userDaysPerYear) this.userDaysPerYear = config.defaultDaysPerYear
  if (!this.transferFromPreviousYear) this.transferFromPreviousYear = config.defaultTransferFromPreviousYear

  this.remainingDays = this.userDaysPerYear

  this.remainingDaysAvaliable = this.remainingDays + this.transferFromPreviousYear

  var initialYearStateBody = {
    year: moment().year(),
    userDaysPerYear: this.userDaysPerYear,
    transferFromPreviousYear: this.transferFromPreviousYear,
    remainingDaysAvaliable: this.remainingDays + this.transferFromPreviousYear,
    timestamp: moment()
  }

  this.initialYearStates.push(initialYearStateBody)

  var createdOn = {
    message: "Created on " + moment().format("MMMM Do YYYY, h:mm:ss a"),
    timestamp: moment()
  }

  this.logs.push(createdOn)

  next()
})

UserSchema.methods = {
  authenticate: function(plainPassword) {
    const hash = crypto.createHash("sha256")
    hash.update(this.salt + plainPassword)
    return hash.digest("hex") === this.password
  },
  changePassword: function(plainPassword) {
    const hash = crypto.createHash("sha256")
    hash.update(this.salt + plainPassword)
    this.constructor.update({_id: this._id}, {password: hash.digest("hex")}).exec()
  },
  toDTO: function() {
    var user = this.toObject()
    delete user.password
    delete user.salt
    delete user.__v
    delete user.initialYearStates
    delete user.logs
    return user
  }
}

module.exports = mongoose.model("user", UserSchema)

var config = require("../../config/config")
var Absence = require("./absenceModel")

exports.get = function(req, res, next) {
  Absence.find()
    .populate("userId", "_id  email firstName lastName")
    .then(
      collection => {
        res.json(collection)
      },
      err => {
        next(err)
      }
    )
}

exports.getUserAbsences = function(req, res, next) {
  Absence.find({userId: req.params.userId})
    .select(config.excludePropertiesAbsence)
    .then(
      absences => {
        res.json(absences)
      },
      err => {
        console.log(err)
        next(err)
      }
    )
}

exports.getSingleUserAbsence = function(req, res, next) {
  if (!req.params.userId && !req.params.id) return res.status(400).send("Missing one or more parameters.")

  Absence.find({
    userId: req.params.userId,
    _id: req.params.id
  }).then(
    absence => {
      if (!absence || !absence.length) {
        return res.status(404).send("No resource found with provided Id's.")
      } else return res.json(absence)
    },
    err => {
      next(err)
    }
  )
}

exports.post = function(req, res, next) {
  var newAbsence = new Absence()

  newAbsence.startDate = new Date(req.body.startDate)
  newAbsence.endDate = new Date(req.body.endDate)
  newAbsence.returnDate = new Date(req.body.returnDate)
  newAbsence.type = req.body.type
  newAbsence.Status = req.body.Status
  newAbsence.isDeleted = req.body.isDeleted
  if (req.body.Description) newAbsence.Description = req.body.Description
  if (req.body.resolvedOn) newAbsence.resolvedOn = req.body.resolvedOn
  newAbsence.createdOn = new Date()

  newAbsence.userId = req.body.userId
  newAbsence.save((err, absence) => {
    if (err) return next(err)
    else {
      return res.status(201).send(newAbsence.toDTO())
    }
  })
}

exports.reviewAbsence = function(req, res, next) {
  if (!req.body.Status) return res.status(400).send("Some of the required fields for reviewing are missing.")

  Absence.findById(req.params.id)
    .then(absence => {
      if (!absence) return res.status(404).send("No resource found with given Id.")
      return absence
    })
    .then(absence => {
      status = req.body.Status
      if (req.body.reason) reason = req.body.reason
      else reason = "-"
      return Absence.findByIdAndUpdate(
        absence._id,
        {resolvedOn: new Date(), Status: status, reason: reason},
        {new: true}
      )
    })
    .then(updatedAbsence => {
      return res.json(updatedAbsence.toDTO())
    })
    .catch(err => {
      console.log(err)
      next(err)
    })
}

exports.updateAbsence = function(req, res, next) {
  Absence.findById(req.params.id)
    .then(absence => {
      if (!absence) return res.status(404).send("No resource found with provided Id.")
      return absence
    })
    .then(absence => {
      let startDate = req.body.startDate
      let endDate = req.body.endDate
      let returnDate = req.body.returnDate
      let description = req.body.description ? req.body.description : "-"
      let remainingDaysAvaliable = req.body.remainingDaysAvaliable

      return Absence.findByIdAndUpdate(
        absence._id,
        {
          startDate: startDate,
          endDate: endDate,
          returnDate: returnDate,
          Description: description,
          remainingDaysAvaliable: remainingDaysAvaliable
        },
        {new: true}
      )
    })
    .then(updatedAbsence => {
      return res.json(updatedAbsence.toDTO())
    })
    .catch(err => {
      console.log(err)
      next(err)
    })
}

exports.removeAbsence = function(req, res, next) {
  let status = "Canceled"
  Absence.findByIdAndUpdate(req.params.id, {"isDeleted": true, "Status": status}, {new: true})
    .then(removedAbsence => {
      if (!removedAbsence)
        return res.status(404).send("Absence with provided Id does not exist or it is already removed.")
      else {
        return res.json(removedAbsence)
      }
    })
    .catch(err => {
      console.log(err)
      next(err)
    })
}

exports.invalidateAbsence = function(req, res, next) {
  let status = "Invalidated"
  Absence.findByIdAndUpdate(req.params.id, {"isDeleted": true, "Status": status}, {new: true})
    .then(invalidatedAbsence => {
      if (!invalidatedAbsence) return res.status(404).send("Absence with provided Id does not exist.")
      else {
        return res.json(invalidatedAbsence)
      }
    })
    .catch(err => {
      console.log(err)
      next(err)
    })
}

exports.validatePutAbsenceBody = function(req, res, next) {
  var model = req.body
  if (!model.startDate || !model.endDate || !model.returnDate)
    return res.status(400).send("Some of the required model properties are missing")
  next()
}

exports.validateAbsenceModel = function(req, res, next) {
  var model = req.body

  if (!model.startDate || !model.endDate || !model.returnDate || !model.userId || !model.Status || !model.type)
    return res.status(400).send("Some of the required model properties are missing")
  next()
}

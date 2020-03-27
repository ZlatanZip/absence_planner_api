var User = require("./userModel")
var config = require("../../config/config")

exports.checkForIdParamPresence = function(req, res, next, id) {
  if (!id) {
    return res.status(400).send("Id not provided")
  } else next()
}

exports.get = function(req, res, next) {
  User.find()
    .select(config.excludePropertiesUser)
    .then(
      users => {
        res.json(users)
      },
      err => {
        next(err)
      }
    )
}

exports.getOne = function(req, res, next) {
  User.findById(req.params.id).then(
    user => {
      if (!user) res.status(404).send("No resource found with given ID.")
      else res.json(user.toDTO())
    },
    err => {
      next(err)
    }
  )
}

exports.post = function(req, res, next) {
  var newUser = new User(req.body)

  newUser.save((err, user) => {
    if (err) {
      res.status(422).send({errorMsg: "Unprocessable entity. Unique key violation"})
      return next(err)
    } else res.status(201).send({successMessage: "User successufully added"})
  })
}

exports.put = function(req, res, next) {
  if (checkPutBody(req, res, next)) {
    User.findById(req.params.id)
      .then(user => {
        if (!user) res.status(404).send("No resource found with given ID.")
        return user
      })
      .then(user => {
        update = req.body
        return User.findByIdAndUpdate(user._id, update, {new: true})
      })
      .then(updatedUser => {
        return res.json(updatedUser.toDTO())
      })
      .catch(err => {
        if (err.codeName == "DuplicateKey")
          return res.status(409).send("Provided email is taken by another user. Please consider using other one.")
        next()
      })
  } else {
    res.status(400).send("Intended update properties are not allowed or request body is empty.")
  }
}

exports.changePassword = function(req, res, next) {
  if (!req.body.password || !req.body.newPassword)
    return res.status(400).send({errorMsg: "Password was not changed! Some of the required fields are empty"})
  User.findById(req.params.id)
    .then(user => {
      if (!user) return res.status(404).send({errorMsg: "Password was not changed! User does not exist with given ID."})
      return user
    })
    .then(user => {
      if (!user.authenticate(req.body.password))
        return res.status(401).send({errorMsg: "Password was not changed! Invalid credentials."})
      else {
        user.changePassword(req.body.newPassword)
        return res.status(200).send({successMessage: "Password successfully changed."})
      }
    })
    .catch(err => {
      next(err)
    })
}

exports.getLoggedUserInfo = function(req, res, next) {
  var userId = req.user.subject
  User.findById(userId).then(
    user => {
      res.json(user.toDTO())
    },
    err => {
      next(err)
    }
  )
}

exports.getUsersResponsibleFor = function(req, res, next) {
  var userId = req.user.subject

  User.find({reviewersList: userId})
    .select(config.excludePropertiesUser)
    .then(
      users => res.json(users),
      err => next(err)
    )
}

exports.validatePostModel = function(req, res, next) {
  var model = req.body
  if (!model.firstName || !model.lastName || !model.email || !model.password)
    return res.status(400).send("Some of the required model properties are missing")
  next()
}

checkPutBody = function(req, res, next) {
  var validFields = [
    "firstName",
    "lastName",
    "email",
    "role",
    "remainingDays",
    "userDaysPerYear",
    "transferFromPreviousYear",
    "remainingDaysAvaliable"
  ]

  if (Object.keys(req.body).length === 0) return false

  for (var itemFromBody in req.body) {
    if (!validFields.includes(itemFromBody)) return false
  }
  return true
}

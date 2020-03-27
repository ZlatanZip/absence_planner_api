var jwt = require("jsonwebtoken")
var expressJwt = require("express-jwt")
var config = require("../config/config")
var checkToken = expressJwt({secret: config.secrets.jwt})
var User = require("../api/user/userModel")

exports.decodeToken = function() {
  return function(req, res, next) {
    if (req.query && req.query.hasOwnProperty("access_token")) {
      req.headers.authorization = "Bearer " + req.query.access_token
    }
    //expressJwt mechanism, call next if token is valid and put its payload to req.user, if not it'll error out
    //thrown error is catched in global error handling
    checkToken(req, res, next)
  }
}

exports.signToken = function(id, email, role, firstName, lastName) {
  return jwt.sign(
    {
      subject: id,
      email: email,
      role: role,
      firstName: firstName,
      lastName: lastName
    },
    config.secrets.jwt,
    {expiresIn: config.expireTime}
  )
}

exports.verifyUser = function() {
  return function(req, res, next) {
    var email = req.body.email
    var password = req.body.password

    if (!email || !password) {
      res.status(400).send({badRequest: "Bad request. Email and/or password missing."})
    }

    User.findOne({email: email}).then(
      user => {
        if (!user) res.status(401).send({invalidCredentials: "Invalid credentials"})
        else {
          if (!user.authenticate(password)) res.status(401).send({invalidCredentials: "Invalid credentials"})
          else {
            req.user = user
            next()
          }
        }
      },
      err => {
        next(err)
      }
    )
  }
}

exports.authorize = function(...roles) {
  return function(req, res, next) {
    var role = req.user.role
    if (!roles.includes(role)) return res.status(403).send({errorMessage: "You do not have permission to access this."})

    next()
  }
}

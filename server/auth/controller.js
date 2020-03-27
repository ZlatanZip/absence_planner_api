var signToken = require("./auth").signToken

exports.signin = function(req, res, next) {
  var token = signToken(req.user._id, req.user.email, req.user.role, req.user.firstName, req.user.lastName)
  res.json({
    userId: req.user._id,
    token: token
  })
}

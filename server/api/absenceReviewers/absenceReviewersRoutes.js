var router = require("express").Router()
var controller = require("./absenceReviewersController")
var auth = require("../../auth/auth")

router
  .route("/")
  .all(auth.decodeToken())
  .post(controller.post)

module.exports = router

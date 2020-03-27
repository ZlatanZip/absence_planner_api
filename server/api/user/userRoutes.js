var router = require("express").Router()
var controller = require("./userController")
var auth = require("../../auth/auth")

router.param("id", controller.checkForIdParamPresence)

router
  .route("/")
  .get(controller.get)
  .post(controller.validatePostModel, controller.post)

router.route("/me").get(auth.decodeToken(), controller.getLoggedUserInfo)

router.route("/me/usersResponsibleFor").get(auth.decodeToken(), controller.getUsersResponsibleFor)

router
  .route("/:id")
  .all(auth.decodeToken())
  .get(controller.getOne)
  .put(controller.put)

router.route("/:id/changePassword").post(auth.decodeToken(), controller.changePassword)

module.exports = router

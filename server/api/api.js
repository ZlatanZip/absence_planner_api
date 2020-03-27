var router = require("express").Router()

router.use("/users", require("./user/userRoutes"))
router.use("/absences", require("./absence/absenceRoutes"))
router.use("/absenceReviewers", require("./absenceReviewers/absenceReviewersRoutes"))

module.exports = router

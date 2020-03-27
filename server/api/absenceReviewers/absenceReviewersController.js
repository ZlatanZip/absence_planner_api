var AbsenceReviewers = require("./absenceReviewersModel")

exports.post = function(req, res, next) {
  var newAbsRev = new AbsenceReviewers(req.body)
  newAbsRev.save((err, absRev) => {
    if (err) next(err)
    else {
      AbsenceReviewers.populate(absRev, {
        path: "reviews.reviewedBy",
        model: "user",
        select: "firstName lastName"
      }).then(absRev => res.status(201).send(absRev.toDTO()))
    }
  })
}

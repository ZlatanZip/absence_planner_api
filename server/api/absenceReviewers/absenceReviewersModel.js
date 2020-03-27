var mongoose = require("mongoose")
var Schema = mongoose.Schema

var AbsenceReviewersSchema = new Schema({
  absenceId: {
    type: Schema.Types.ObjectId,
    ref: "absence",
    required: true
  },

  forUser: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true
  },

  reviews: [
    {
      reviewedBy: {
        type: Schema.Types.ObjectId,
        ref: "user"
      },
      status: String
    }
  ]
})

AbsenceReviewersSchema.methods = {
  toDTO: function() {
    var absRev = this.toObject()
    delete absRev.__v
    return absRev
  }
}

module.exports = mongoose.model("absence-reviewers", AbsenceReviewersSchema)

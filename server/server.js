var express = require("express")
var app = express()
var api = require("./api/api")
var config = require("./config/config")
var auth = require("./auth/routes")

require("mongoose")
  .connect(config.db.url)
  .then(res => {
    console.log("CONNECTED TO DATABASE")
  })
  .catch(err => {
    console.log(err)
  })

//all of the common middleware in a seperate file
require("./middleware/appMiddleware")(app)

app.use("/api", api)
app.use("/auth", auth)

//global error handling
app.use(function(err, req, res, next) {
  if (err.name == "UnauthorizedError") {
    res.status(401).send("Invalid/Expired token")
    return
  }

  console.log(err.stack)
  res.status(500).send("Server error. Something went wrong")
})

module.exports = app

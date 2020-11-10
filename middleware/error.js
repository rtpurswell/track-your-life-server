//Logs uncaught exceptions in the request response pipeline
//This is passed as the very last route to express

const winston = require("winston");

module.exports = function (err, req, res, next) {
  winston.error(err.message, err);
  res.status(500).send("Internal Server Error");
};

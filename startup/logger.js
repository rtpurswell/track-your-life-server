//Start the logger.
//In the future I would like this to return a logger class
//that abstracts winston, that way I can change loggers in the future if needed
const _ = require("lodash");
const winston = require("winston");
const Joi = require("joi");

module.exports = function () {
  winston.add(new winston.transports.File({ filename: "logfile.log" }));
  winston.add(new winston.transports.Console());
  Joi.objectId = require("joi-objectid")(Joi); //Not the best place for this
  Joi.validatePartial = require("joi-validate-partial")(Joi);
};

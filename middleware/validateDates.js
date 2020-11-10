//Used to validate dates on routes that have the statDate and endDate req query

const Joi = require("joi");
function validateDate(date) {
  return Joi.date().validate(date);
}
module.exports = function (req, res, next) {
  const startDate = req.query.startDate || "2020-01-01";
  const endDate = req.query.endDate || "2100-01-01";
  const error1 = validateDate(startDate).error;
  const error2 = validateDate(endDate).error;

  if (error1 || error2) return res.status(400).send("Invalid Date Parameters");
  req.query.endDate = endDate;
  req.query.startDate = startDate;
  next();
};

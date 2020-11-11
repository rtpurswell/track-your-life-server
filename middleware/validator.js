//Used to return 400 status if the Joi validator fails.

module.exports = function (validate, partial = null) {
  if (!partial) {
    return function (req, res, next) {
      const { error } = validate(req.body);
      if (error) return res.status(400).send(error);
      next();
    };
  }
  return function (req, res, next) {
    const { error } = validate(req.body, true);
    if (error) return res.status(400).send(error);
    next();
  };
};

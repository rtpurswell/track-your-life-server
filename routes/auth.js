const config = require("config");
const _ = require("lodash");
const Joi = require("joi");
const express = require("express");
const { User } = require("../models/user");

const router = express.Router();

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send("Invalid email or password");

  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("Invalid email or password");

  const validPassword = await User.validatePassword(
    req.body.password,
    user.password
  );
  if (!validPassword) return res.status(400).send("Invalid email or password");

  res
    .header(config.get("authTokenName"), user.generateAuthToken())
    .send(_.pick(user, ["name", "email", "_id"]));
});

function validate(req) {
  const schema = Joi.object({
    email: Joi.string().min(5).max(255).required(),
    password: Joi.string().min(8).max(32).required(),
  });
  return schema.validate(req);
}

module.exports = router;

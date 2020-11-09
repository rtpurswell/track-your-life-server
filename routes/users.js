const _ = require("lodash");
const config = require("config");
const emailer = require("../utils/emailer");
const bcrypt = require("bcrypt");
const express = require("express");
const { User, validate } = require("../models/user");
const router = express.Router();

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error);

  const exists = await User.findOne({ email: req.body.email }).count();
  if (exists) return res.status(400).send("User Already Exists");

  const password = await User.hashPassword(req.body.password);

  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: password,
  });

  if (config.util.getEnv("NODE_ENV") === "development" || config.util.getEnv("NODE_ENV") === "test") {
    user.set({ verified: false });
  } else {
    const emailResult = await emailer.sendVerificationEmail(user);
    if (emailResult.errno)
      return res
        .status(500)
        .send("Unable to send verification email. Please try again later.");
    console.log(emailResult);
  }

  await user.save();
  res
    .header(config.get("authTokenName"), user.generateAuthToken())
    .send(_.pick(user, ["name", "email", "_id"]));
});

router.get("/validate", async (req, res) => {
  const { email, code } = req.query;

  const user = await User.findOne({ email: email, verified: false });

  if (!user) return res.status(404).send("Email verification falied.");
  
  const validCode = await bcrypt.compare(user._id.toString(), code);

  if (!validCode) return res.status(400).send("Email verification failed");

  user.set({ verified: true });
  await user.save();

  res
    .header(config.get("authTokenName"), user.generateAuthToken())
    .send(_.pick(user, ["name", "email", "_id"]));
});
module.exports = router;

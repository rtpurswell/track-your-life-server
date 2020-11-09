const Joi = require("joi");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const config = require("config");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, minlength: 5, maxlength: 60 },
  email: {
    type: String,
    unique: true,
    required: true,
    minlength: 6,
    maxlength: 255,
  },
  password: { type: String, required: true, minlength: 5, maxlength: 1024 },
  verified: { type: Boolean, default: false },
});
userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    {
      email: this.email,
      name: this.name,
      _id: this._id,
      verified: this.verified,
    },
    config.get("jwtPrivateKey")
  );
};
userSchema.statics.hashPassword = async function (password) {
return await bcrypt.hash(password, 10);
};
userSchema.statics.validatePassword = async function (passwordAttempt,password) {
 return await bcrypt.compare(passwordAttempt, password);
};
const User = mongoose.model("User", userSchema);
function validateUser(user) {
  const schema = Joi.object({
    name: Joi.string().min(5).max(60).required(),
    email: Joi.string().min(5).max(255).required(),
    password: Joi.string().min(8).max(32).required(),
  });
  return schema.validate(user);
}

exports.validate = validateUser;
exports.User = User;

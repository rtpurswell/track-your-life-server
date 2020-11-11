const mongoose = require("mongoose");
const Joi = require("joi");
const config = require("config");
const _ = require("lodash");

const habbitCategorySchema = mongoose.Schema({
  name: { type: String, required: true, min: 2, max: 60 },
  color: { type: String, enum: config.get("appColors"), required: true },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Users",
  },
});
habbitCategorySchema.statics.lookup = async function (user, _id) {
  return await this.findOne({ userId: user._id, _id: _id });
};
const validate = (habbitCategory, partial = false) => {
  const schema = {
    name: Joi.string().required().min(2).max(60),
    color: Joi.string()
      .required()
      .valid(...config.get("appColors")),
  };

  if (!partial) return Joi.object(schema).validate(habbitCategory);
  return Joi.validatePartial(schema, habbitCategory);
};
exports.HabbitCategory = new mongoose.model(
  "HabbitCategories",
  habbitCategorySchema
);
exports.validate = validate;

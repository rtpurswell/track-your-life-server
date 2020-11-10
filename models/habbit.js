const mongoose = require("mongoose");
const Joi = require("joi");
const config = require("config");

const habbitSchema = mongoose.Schema({
  name: { type: String, required: true, min: 2, max: 60 },
  description: { type: String, min: 2, max: 256 },
  color: { type: String, enum: config.get("appColors"), required: true },
  goal: {
    type: mongoose.Schema({
      frequency: {
        type: String,
        required: true,
        enum: ["daily", "monthly", "weekly", "biDaily", "biWeekly"],
      },
      amount: { type: Number, required: true, min: 2, max: 100 },
    }),
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "HabbitCategories",
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Users",
  },
});
habbitSchema.statics.lookup = async function (user, _id) {
  return await this.findOne({ userId: user._id, _id: _id });
};
const validate = (habbit) => {
  const schema = Joi.object({
    name: Joi.string().required().min(2).max(60),
    description: Joi.string().min(2).max(256),
    color: Joi.string()
      .required()
      .valid(...config.get("appColors")),
    goal: Joi.object({
      frequency: Joi.string()
        .required()
        .valid("daily, weekly, monthly,biDaily,biWeekly"),
      amount: Joi.number().required().min(1).max(100),
    }),
    categoryId: Joi.objectId().required(),
  });
  return schema.validate(habbit);
};
exports.Habbit = new mongoose.model("Habbits", habbitSchema);
exports.validate = validate;

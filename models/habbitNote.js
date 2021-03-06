const mongoose = require("mongoose");
const Joi = require("joi");

const habbitNoteSchema = mongoose.Schema({
  description: { type: String, min: 2, max: 1024, required: true },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Users",
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "HabbitCategories",
  },
  date: { type: Date, default: Date.now },
});
habbitNoteSchema.statics.lookup = async function (user, _id) {
  return await this.findOne({ userId: user._id, _id: _id });
};
const validate = (habbitNote, partial = false) => {
  const schema = {
    description: Joi.string().min(2).max(1024).required(),
    date: Joi.date(),
    categoryId: Joi.objectId().required(),
  };
  if (!partial) return Joi.object(schema).validate(habbitNote);
  return Joi.validatePartial(schema, habbitNote);
};
exports.HabbitNote = new mongoose.model("HabbitNotes", habbitNoteSchema);
exports.validate = validate;

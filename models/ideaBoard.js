const mongoose = require("mongoose");
const Joi = require("joi");
const config = require("config");

const { noteSchema, joiNote } = require("./shared/note");

const ideaSchema = mongoose.Schema({
  name: { type: String, required: true, min: 2, max: 100 },
  description: { type: String, min: 2, max: 1024 },
  color: { type: String, enum: config.get("appColors"), required: true },
  notes: { type: [noteSchema], default: [] },
  pros: { type: [{ type: String, min: 2, max: 256 }] },
  cons: { type: [{ type: String, min: 2, max: 256 }] },
  isArchived: { type: Boolean, default: false },
});

const ideaBoardSchema = mongoose.Schema({
  name: { type: String, required: true, min: 2, max: 100 },
  description: { type: String, min: 2, max: 1024 },
  color: { type: String, enum: config.get("appColors"), required: true },
  ideas: { type: [ideaSchema], default: [] },
  notes: { type: [noteSchema], default: [] },
  isArchived: { type: Boolean, default: false },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Users",
  },
});
ideaBoardSchema.statics.lookup = async function (user, _id) {
  return await this.findOne({ userId: user._id, _id });
};
const validate = (ideaBoard, partial = false) => {
  const ideaSchema = Joi.object({
    name: Joi.string().required().min(2).max(100),
    description: Joi.string().min(2).max(1024),
    color: Joi.string()
      .required()
      .valid(...config.get("appColors")),
    notes: Joi.array().items(joiNote),
    pros: Joi.array().items(Joi.string().min(2).max(256)),
    cons: Joi.array().items(Joi.string().min(2).max(256)),
    isArchived: Joi.bool(),
  });

  const schema = {
    name: Joi.string().required().min(2).max(100),
    description: Joi.string().min(2).max(1024),
    color: Joi.string()
      .required()
      .valid(...config.get("appColors")),
    notes: Joi.array().items(joiNote),
    isArchived: Joi.bool(),
    ideas: Joi.array().items(ideaSchema),
  };
  if (!partial) return Joi.object(schema).validate(ideaBoard);
  return Joi.validatePartial(schema, ideaBoard);
};
module.exports.IdeaBoard = new mongoose.model("IdeaBoards", ideaBoardSchema);
module.exports.validate = validate;

const mongoose = require("mongoose");
const Joi = require("joi");
const config = require("config");

const noteSchema = mongoose.Schema({
    description: {type:String, required: true, min:2,max:256},
    color: {type: String, enum:config.get("appColors")}
});

const joiNote = Joi.object({
    description: Joi.string().min(2).max(256).required(),
    color: Joi.string().required().valid(...config.get("appColors"))
});
exports.noteSchema = noteSchema;
exports.joiNote = joiNote;

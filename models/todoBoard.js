const mongoose = require("mongoose");
const Joi = require("joi");
const config = require("config");

const todoSchema = mongoose.Schema({
    name: {type:String, required:true,min:2,max:60},
    description: {type:String, min:2,max:256},
    color:{type:String, enum:config.get("appColors"), required:true},
    dueDate:{type:Date},
    completed:{type:Boolean, required:true}
});
const todoBoardSchema = mongoose.Schema({
    name: {type:String, required:true,min:2,max:60},
    description: {type:String, min:2,max:256},
    color:{type:String, enum:config.get("appColors"), required:true},
    todos: {type: [todoSchema], default:[]},
    userId: {type:mongoose.Schema.Types.ObjectId, required:true,ref:"Users" }
});
todoBoardSchema.statics.lookup = async function(user,_id){
    return await this.findOne({userId:user._id,_id})
}
const validate = (todoBoard)=>{
    const todoSchema = Joi.object({
        name: Joi.string().required().min(2).max(60),
        description: Joi.string().min(2).max(256),
        color: Joi.string().required().valid(...config.get("appColors")),
        dueDate: Joi.date(),
        completed: Joi.bool().required()
    });
    const schema = Joi.object({
        name: Joi.string().required().min(2).max(60),
        description: Joi.string().min(2).max(256),
        color: Joi.string().required().valid(...config.get("appColors")),
        todos: Joi.array().items(todoSchema)
    });

    return schema.validate(todoBoard);
}

exports.validate = validate;
exports.TodoBoard= new mongoose.model("TodoBoards",todoBoardSchema);
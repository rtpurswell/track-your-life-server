const mongoose = require("mongoose");
const Joi = require("joi");


const habbitRecordSchema = mongoose.Schema({
    habbitId:{type:mongoose.Schema.Types.ObjectId,required:true, ref: "Habbits"},
    userId: {type:mongoose.Schema.Types.ObjectId, required:true,ref:"Users" },
    date: {type:Date, default:Date.now}

});
habbitRecordSchema.statics.lookup = async function(user,_id){
    return await this.findOne({userId:user._id,_id:_id});
}
const validate = (habbitRecord) => {
    const schema =Joi.object({
        habbitId: Joi.objectId().required(),
        date: Joi.date()
    });
 return schema.validate(habbitRecord);
}
exports.HabbitRecord = new mongoose.model("HabbitRecords", habbitRecordSchema);
exports.validate = validate;
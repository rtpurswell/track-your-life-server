const mongoose = require("mongoose");
//Connect mongoose to MongoDb

const config = require('config');
const debug = require("debug")("app:startup");
module.exports = function () {
  mongoose
    .connect(config.get("db.host"))
    .then(() => debug(`Connected to ${config.get("db.host")}`));
    mongoose.set("useNewUrlParser", true);
    mongoose.set("useFindAndModify", false);
  //mongoose.set("debug", true);
};
 
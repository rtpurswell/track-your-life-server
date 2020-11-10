//Handle any uncaught exceptions or rejected promisses and
//log them using winston

//In the future this should use a logger class instead of winston
const config = require("config");
const winston = require("winston");

module.exports = function () {
  if (!config.get("jwtPrivateKey")) {
    console.error(
      "FATAL ERROR: You must set enviornment variable bobs_jwtPrivateKey to set the private key for JWT authentication"
    );
    process.exit(1);
  }

  process.on("uncaughtException", (ex) => {
    console.log("Uncaught Exception");
    winston.error(ex.message, ex);
    process.exit(1);
  });
  process.on("unhandledRejection", (ex) => {
    console.log("Unhandled Rejection");
    winston.error(ex.message, ex);
    process.exit(1);
  });
};

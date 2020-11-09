require("express-async-errors");
const express = require("express");
const app = express();

console.log("Running app in ",app.get("env"));
//initilize logger
require("./startup/logger")();

// connect to database
require("./startup/db")();

//Handle uncaught exceptions and rejected promises 
require("./startup/handleErrors")();

//Add Global Middleware
require("./startup/middleware")(app);

//Set API Routes
require("./startup/routes")(app);

//Listen for HTTP Requests when we are not running tests
const port = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Listening on port ${port}...`);
  });
}
module.exports = app;

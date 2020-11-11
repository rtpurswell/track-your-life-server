const express = require("express");
//Initilize all global middleware

const helmet = require("helmet");
const morgan = require("morgan");
const debug = require("debug")("app:startup");
const config = require("config");
const compression = require("compression");
const cors = require("cors");

var corsOptions = {
  origin: "http://localhost:3000",
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};
module.exports = (app) => {
  app.use(cors(corsOptions));
  app.use(helmet());
  app.use(express.json());
  app.use(compression());
  if (config.get("debug.httpLog")) {
    app.use(morgan("tiny"));
    debug("Morgan enabled...");
  }
};

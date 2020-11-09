const express = require("express");
//Initilize all global middleware

const helmet = require("helmet");
const morgan = require("morgan");
const debug = require("debug")("app:startup");
const config = require("config");
const compression = require("compression");

module.exports = (app) => {
  app.use(helmet());
  app.use(express.json());
  app.use(compression());
  if(config.get("debug.httpLog")){
    app.use(morgan("tiny"));
    debug("Morgan enabled...");
  }
};

//Initilize all routes in the application 

const users = require("../routes/users");
const auth = require("../routes/auth");
const ideas = require("../routes/ideas");
const todos = require("../routes/todos");
const habbits = require("../routes/habbit");
const habbitCategories = require("../routes/habbitCategory");
const habbitRecords = require("../routes/habbitRecord");
const habbitNotes = require("../routes/habbitNote");

const error = require("../middleware/error");
module.exports = (app) => {
  app.use("/api/users", users);
  app.use("/api/auth",auth);
  app.use("/api/ideas", ideas);
  app.use("/api/todos", todos);
  app.use("/api/habbits/categories", habbitCategories);
  app.use("/api/habbits/records", habbitRecords);
  app.use("/api/habbits/notes", habbitNotes);
  app.use("/api/habbits", habbits);

  app.use(error);
};

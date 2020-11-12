const express = require("express");
const router = express.Router();
const Joi = require("joi");

const validateObjectId = require("../middleware/validateObjectId");
const auth = require("../middleware/auth");
const validator = require("../middleware/validator");

const { TodoBoard, validate } = require("../models/todoBoard");

router.get("/", auth, async (req, res) => {
  const { user } = req;
  const todoBoards = await TodoBoard.find({ userId: user._id });
  res.send(todoBoards);
});
router.get("/:id", [auth, validateObjectId], async (req, res) => {
  const { user } = req;

  const todoBoard = await TodoBoard.lookup(user, req.params.id);
  if (!todoBoard) return res.status(404).send("Todo Board Not Found");
  res.send(todoBoard);
});
router.post("/", [auth, validator(validate)], async (req, res) => {
  const { user } = req;

  const todoBoard = new TodoBoard({ ...req.body, userId: user._id });
  await todoBoard.save();
  res.send(todoBoard);
});
router.put(
  "/:id",
  [auth, validateObjectId, validator(validate)],
  async (req, res) => {
    const { user } = req;

    const todoBoard = await TodoBoard.lookup(user, req.params.id);
    if (!todoBoard) return res.status(404).send("Not Found");

    todoBoard.set(req.body);
    await todoBoard.save();
    res.send(todoBoard);
  }
);
router.patch(
  "/:id",
  [auth, validateObjectId, validator(validate, true)],
  async (req, res) => {
    const { user } = req;

    const todoBoard = await TodoBoard.lookup(user, req.params.id);
    if (!todoBoard) return res.status(404).send("Not Found");

    todoBoard.set(req.body);
    await todoBoard.save();
    res.send(todoBoard);
  }
);
router.delete("/:id", [auth, validateObjectId], async (req, res) => {
  const { user } = req;

  const todoBoard = await TodoBoard.deleteOne({
    userId: user._id,
    _id: req.params.id,
  });
  todoBoard._id = req.params.id;
  res.send(todoBoard);
});
module.exports = router;

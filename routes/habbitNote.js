const express = require("express");
const router = express.Router();
const Joi = require("joi");

const validateDates = require("../middleware/validateDates");
const validateObjectId = require("../middleware/validateObjectId");
const auth = require("../middleware/auth");
const validator = require("../middleware/validator");

const { HabbitNote, validate } = require("../models/habbitNote");

router.get("/", [auth, validateDates], async (req, res) => {
  const { user } = req;

  const habbitNotes = await HabbitNote.find({
    userId: user._id,
    date: { $gte: req.query.startDate, $lte: req.query.endDate },
  });
  res.send(habbitNotes);
});
router.get("/:id", [auth, validateObjectId], async (req, res) => {
  const { user } = req;

  const habbitNote = await HabbitNote.lookup(user, req.params.id);
  if (!habbitNote) return res.status(404).send("Note Not Found");
  res.send(habbitNote);
});
router.post("/", [auth, validator(validate)], async (req, res) => {
  const { user } = req;

  const habbitNote = new HabbitNote({ ...req.body, userId: user._id });
  await habbitNote.save();
  res.send(habbitNote);
});
router.put(
  "/:id",
  [auth, validateObjectId, validator(validate)],
  async (req, res) => {
    const { user } = req;

    const habbitNote = await HabbitNote.lookup(user, req.params.id);
    if (!habbitNote) return res.status(404).send("Note Not Found");

    habbitNote.set(req.body);
    await habbitNote.save();

    res.send(habbitNote);
  }
);
router.delete("/:id", [auth, validateObjectId], async (req, res) => {
  const { user } = req;

  const habbitNote = await HabbitNote.deleteOne({
    userId: user._id,
    _id: req.params.id,
  });
  res.send(habbitNote);
});

module.exports = router;

const express = require("express");
const router = express.Router();
const Joi = require("joi");

const validateDates = require("../middleware/validateDates");
const validateObjectId = require("../middleware/validateObjectId");
const auth = require("../middleware/auth");
const validator = require("../middleware/validator");

const { HabbitRecord, validate } = require("../models/habbitRecord");

router.get("/", [auth, validateDates], async (req, res) => {
  const { user } = req;

  const habbitRecords = await HabbitRecord.find({
    userId: user._id,
    date: { $gte: req.query.startDate, $lte: req.query.endDate },
  });
  res.send(habbitRecords);
});
router.get("/:id", [auth, validateObjectId], async (req, res) => {
  const { user } = req;

  const habbitRecord = await HabbitRecord.lookup(user, req.params.id);
  if (!habbitRecord) return res.status(404).send("Record Not Found");
  res.send(habbitRecord);
});
router.post("/", [auth, validator(validate)], async (req, res) => {
  const { user } = req;
  const habbitRecord = new HabbitRecord({ ...req.body, userId: user._id });
  await habbitRecord.save();
  res.send(habbitRecord);
});
router.put(
  "/:id",
  [auth, validateObjectId, validator(validate)],
  async (req, res) => {
    const { user } = req;

    const habbitRecord = await HabbitRecord.lookup(user, req.params.id);
    if (!habbitRecord) return res.status(404).send("Record Not Found");
    habbitRecord.set(req.body);
    await habbitRecord.save();
    res.send(habbitRecord);
  }
);
router.delete("/:id", [validateObjectId, auth], async (req, res) => {
  const { user } = req;

  const habbitRecord = await HabbitRecord.deleteOne({
    userId: user._id,
    _id: req.params.id,
  });
  res.send(habbitRecord);
});

module.exports = router;

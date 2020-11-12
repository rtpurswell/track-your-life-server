const express = require("express");
const router = express.Router();
const Joi = require("joi");

const validateObjectId = require("../middleware/validateObjectId");
const auth = require("../middleware/auth");

const validator = require("../middleware/validator");
const { Habbit, validate } = require("../models/habbit");
const { HabbitRecord } = require("../models/habbitRecord");

router.get("/", auth, async (req, res) => {
  const { user } = req;
  const habbits = await Habbit.find({ userId: user._id });
  res.send(habbits);
});
router.get("/:id", [validateObjectId, auth], async (req, res) => {
  const { user } = req;

  const habbit = await Habbit.lookup(user, req.params.id);
  if (!habbit) return res.status(404).send("Habbit Not Found");
  res.send(habbit);
});
router.post("/", [auth, validator(validate)], async (req, res) => {
  const { user } = req;
  const habbit = new Habbit({ ...req.body, userId: user._id });
  await habbit.save();
  res.send(habbit);
});
router.put(
  "/:id",
  [auth, validateObjectId, validator(validate)],
  async (req, res) => {
    const { user } = req;

    const habbit = await Habbit.lookup(user, req.params.id);
    if (!habbit) return res.status(404).send("Habbit Not Found");
    habbit.set(req.body);
    await habbit.save();
    res.send(habbit);
  }
);
router.patch(
  "/:id",
  [auth, validateObjectId, validator(validate, true)],
  async (req, res) => {
    const { user } = req;

    const habbit = await Habbit.lookup(user, req.params.id);
    if (!habbit) return res.status(404).send("Habbit Not Found");
    habbit.set(req.body);
    await habbit.save();
    res.send(habbit);
  }
);
router.delete("/:id", [auth, validateObjectId], async (req, res) => {
  const { user } = req;

  const habbit = await Habbit.deleteOne({
    userId: user._id,
    _id: req.params.id,
  });
  habbit.records = await HabbitRecord.deleteMany({
    userId: user._id,
    habbitId: req.params.id,
  });
  habbit._id = req.params.id;
  res.send(habbit);
});

module.exports = router;

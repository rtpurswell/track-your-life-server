const express = require("express");
const router = express.Router();
const Joi = require("joi");

const validateObjectId = require("../middleware/validateObjectId");
const auth = require("../middleware/auth");
const validator = require("../middleware/validator");

const { HabbitCategory, validate } = require("../models/habbitCategory");
const { Habbit } = require("../models/habbit");
const { HabbitNote } = require("../models/habbitNote");
router.get("/", auth, async (req, res) => {
  const { user } = req;
  const habbitCategories = await HabbitCategory.find({ userId: user._id });
  res.send(habbitCategories);
});
router.get("/:id", [auth, validateObjectId], async (req, res) => {
  const { user } = req;

  const habbitCategory = await HabbitCategory.lookup(user, req.params.id);
  if (!habbitCategory) return res.status(404).send("Category Not Found");

  res.send(habbitCategory);
});
router.post("/", [auth, validator(validate)], async (req, res) => {
  const { user } = req;

  const habbitCategory = new HabbitCategory({ ...req.body, userId: user._id });
  await habbitCategory.save();

  res.send(habbitCategory);
});
router.put(
  "/:id",
  [auth, validateObjectId, validator(validate)],
  async (req, res) => {
    const { user } = req;

    const habbitCategory = await HabbitCategory.lookup(user, req.params.id);
    if (!habbitCategory) return res.status(404).send("Category Not Found");
    habbitCategory.set(req.body);
    await habbitCategory.save();
    res.send(habbitCategory);
  }
);
router.patch(
  "/:id",
  [auth, validateObjectId, validator(validate, (partial = true))],
  async (req, res) => {
    const { user } = req;

    const habbitCategory = await HabbitCategory.lookup(user, req.params.id);
    if (!habbitCategory) return res.status(404).send("Category Not Found");
    habbitCategory.set(req.body);
    await habbitCategory.save();
    res.send(habbitCategory);
  }
);
router.delete("/:id", [auth, validateObjectId], async (req, res) => {
  const { user } = req;
  if (!req.body.replacedBy)
    return res
      .status(400)
      .send(
        "Must specify 'replacedBy' in request body to update existing habbits in this category"
      );
  const { error } = Joi.objectId().validate(req.body.replacedBy);
  if (error) return res.status(400).send("Invalid Object ID for 'replacedBy'");

  const count = await HabbitCategory.find({
    userId: user._id,
  }).countDocuments();
  if (count < 2)
    return res.status(400).send("You can not delete your only category.");

  const habbitCategory = await HabbitCategory.deleteOne({
    userId: user._id,
    _id: req.params.id,
  });
  const habbits = await Habbit.updateMany(
    { userId: user._id, categoryId: req.params.id },
    { categoryId: req.body.replacedBy }
  );
  const notes = await HabbitNote.updateMany(
    { userId: user._id, categoryId: req.params.id },
    { categoryId: req.body.replacedBy }
  );
  res.send({ ...habbitCategory, updatedHabbits: habbits, updatedNotes: notes });
});

module.exports = router;

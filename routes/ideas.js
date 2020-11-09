const express = require("express");
const router = express.Router();
const Joi = require("joi");

const validateObjectId = require("../middleware/validateObjectId");
const auth = require("../middleware/auth");
const validator = require("../middleware/validator");


const {IdeaBoard,validate} =  require("../models/ideaBoard");

router.get("/", auth, async (req,res)=>{
    const {user} = req;
    const ideaBoards = await IdeaBoard.find({userId:user._id});
    res.send(ideaBoards); 
});
router.get("/:id", [auth, validateObjectId], async (req,res)=>{


    const {user} = req;
    const ideaBoard = await IdeaBoard.lookup(user,req.params.id);
    if(!ideaBoard) return res.status(404).send("Idea Board Not Found");

    res.send(ideaBoard);
});
router.post("/", [auth,validator(validate)], async (req,res)=>{
    const {user} = req;
    const ideaBoard = new IdeaBoard({...req.body,userId:user._id})
    await ideaBoard.save();
    res.send(ideaBoard);
});
router.put("/:id",[auth, validateObjectId,validator(validate)], async (req,res)=>{
    const {user} = req;

    const ideaBoard = await IdeaBoard.lookup(user,req.params.id);
    if(!ideaBoard) return res.status(404).send("Not Found");
    ideaBoard.set(req.body);
    await ideaBoard.save();
    res.send(ideaBoard);
});
router.delete("/:id",[auth, validateObjectId], async (req,res)=>{
    const {user} = req;


    const ideaBoard = await IdeaBoard.deleteOne({_id:req.params.id,userId:user._id});
    res.send(ideaBoard);
});
module.exports = router;
//Used to return 400 status if the Joi validator fails. 

module.exports = function(validator){ 
    return function(req,res,next){
        const {error} = validator(req.body);
        if(error) return res.status(400).send(error);
        next();
    }
}
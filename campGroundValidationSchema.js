const Joi = require('joi')
module.exports.campGroundValidationSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string().required(),
        price: Joi.number().required().min(0),
        //image: Joi.string().required(),
        description: Joi.string().required(),
        city: Joi.string().required(),
        state: Joi.string().required()
    }).required(),
    deleteImages: Joi.array()
})


//we needed to created a review to wrap the 2 properties because we stored the values in a key called review since our name for the inputs were review[body] & review[rating] which means we store body and rating as properties INSIDE a review key obj. 
module.exports.reviewValidationSchema = Joi.object({
    review: Joi.object({
        body: Joi.string().required(),
        rating: Joi.number().required().min(1).max(5)
    }).required()
})


//for some odd reason you cant module.export = reviewSchema or campGroundSchema, it has to be module.exports.reviewSchema to work.

/* 
module.exports.campGroundValidationSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string().required(),
        price: Joi.number().required().min(0),
        //image: Joi.string().required(),
        description: Joi.string().required(),
        city: Joi.string().required(),
        state: Joi.string().required()
    }).required(),
    deleteImages: Joi.array()
})
*/
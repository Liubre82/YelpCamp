const campGround = require('./Schemas/campGround')
const Review = require('./Schemas/review')
const ExpressError = require('./Utils/ExpressError')
const { campGroundValidationSchema, reviewValidationSchema } = require('./campGroundValidationSchema.js')


/* Middleware checks to see if the user is logged in, if user is not, we will handle that scenario by flashing a msg and directing user to the login page to login. */

module.exports.validateCampGround = (req, res, next) => {
    //console.log(campGroundSchema.validate(req.body).error)   
    const { error } = campGroundValidationSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    }
    else {
        next();
    }
}

module.exports.validateReview = (req, res, next) => {
    //console.log(reviewSchema)
    const {error} = reviewValidationSchema.validate(req.body)
    if(error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    }
    else {
        next();
    }
}

/* The 3 Middlewares below are to protect our routes to prevent users from somehow changing things they do not have permission for through url */
module.exports.isLoggedIn = (req, res, next) => {
    /* req.user is an obj we can access thanks to passport and it stores the important info on the user, like _id, email, and username. password(salt, hashedVersion) are not displayed. because its not needed */

    /* originalURL is the url/path of the page the user WAS on, and that page requires a logged in user to access it. We will store that url in a variable in the current user session so when the user does log in, it can be REDIRECTED BACK TO the page that he WAS on/(the page that redirected him to the login page bc he had no access to it being a non logged in user)

    by storing it on the session, we have some persistence between different requests. That's how we add some statefulness. */
    req.session.returnTo = req.originalUrl
    console.log("REQ.USER...", req.user)
    if (req.isUnauthenticated()) {
        req.flash('error', 'You must be signed in!')
        return res.redirect('/login')
    }
    next()
}

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params
    const findCampground = await campGround.findById(id)
    //author just gets the _id which is the userId that created the post, we did not populate it.
    //authorization to protect the routes, so people cant change it through the url routes
    if (!findCampground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to change this campground!')
        return res.redirect(`/campGrounds/${findCampground._id}`)
    }
    next()
}

module.exports.isReviewAuthor = async (req, res, next) => {
    //id is the campground id, remeber all review routes are /campGrounds/:id/review/:reviewId, so we need that id, so when reviewAuthor  doesnt match the user, he cant delete the review, and a user cannot delete other reviews throuh the url, and instead if they are redirected to the campground page in which the review was in.
    const { id, reviewId } = req.params
    const findReview = await Review.findById(reviewId)
    if (!findReview.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to change this campground!')
        return res.redirect(`/campGrounds/${id}`)
    }
    next()
}



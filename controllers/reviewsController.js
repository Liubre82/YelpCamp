const catchAsync = require('../Utils/CatchAsync')
const campgroundSchema = require('../Schemas/campGround')
const reviewSchema = require('../Schemas/review')



//CREATE a new review on a specific campground
module.exports.createReview = catchAsync(async (req, res) => {
    /* The name attribute for the review forms were review[review] & review[body] so the inputs are all in the key that we specified called "review" inside req.body, so its req.body.review */
    const camp = await campgroundSchema.findById(req.params.id)
    const review = new reviewSchema(req.body.review)
    review.author = req.user._id //add user id to author property in review
    camp.reviews.push(review) //reviews is an array property in camp obj that stores all associated reviews.
    await review.save()
    await camp.save()
    req.flash('success', 'Successfully added review!')
    res.redirect(`/campGrounds/${camp._id}`)
})

//DELETE a specific review on a specific campground.
module.exports.deleteReview = catchAsync(async(req, res) => {
    const { id, reviewId } = req.params
    const retrieve = await campgroundSchema.findByIdAndUpdate(id, { $pull: { reviews: reviewId}})
    await reviewSchema.findByIdAndDelete(reviewId)
    //console.log(retrieve)
    req.flash('success', 'Successfully deleted review!')
    res.redirect(`/campGrounds/${id}`)
})
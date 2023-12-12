const express = require('express')
const router = express.Router({mergeParams: true})
const {validateReview, isLoggedIn, isReviewAuthor} = require('../middleware')
const reviewController = require('../controllers/reviewsController')


//CREATE a new review on a specific campground
router.post('/', validateReview, isLoggedIn, reviewController.createReview)

//DELETE a specific review on a specific campground.
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, reviewController.deleteReview)

module.exports = router
const express = require('express')
const router = express.Router()
const campgroundController = require('../controllers/campgroundsController')
const {validateCampGround, isLoggedIn, isAuthor} = require('../middleware')
const multer = require('multer') //body parsing middleware
const {storage} = require('../cloudinary') //Node implicitly looks for index.js file in a file.
const upload = multer({storage})
/* multer({dest: 'uploads/'}) refers to where the uploaded files will be uploaded to when the user uploads a file. good way to test if upload is working

multer({storage}) means multer will store the uploaded files in cloudinary */

/* multer is a middleware package that helps parse form data. Mutlers adds a body obj and a file or files obj to the request object. the body obj contains the values of the text fields of the form, the file/files obj contains the files uploaded via the form. the form enctype must be multipart/form-data if it has a file input type */

/* Http methods associated with the '/campGrounds' route which is the homepage that displays ALL campgrounds and newly added campgrounds is routed to this route as well. */ 
//Create/post a New campground site
router.route('/' )
    //'image' is the name of the input file type element we specified in our form to upload an image.
    //upload.single uploads and expects a single file, upload.array expects multiple files
    .get(campgroundController.index) //display the homepage /campGrounds
    .post(
        isLoggedIn, 
        upload.array('image'),
        validateCampGround,
        campgroundController.createCampground)


//display the form that creates a new campground
router.get('/new', isLoggedIn, campgroundController.renderNewForm)

//Http methods associated with the '/:id' route which the id is a specific campground
router.route('/:id')
    //display/get an individual campGround with all its information.
    //editing/put a campground and updating it to the db.
    //delete a specific campGround and ALL its reviews.
    .get(campgroundController.showCampground)
    .put(
        isLoggedIn, 
        isAuthor,
        upload.array('image'),
        validateCampGround,
        campgroundController.editCampground)
    .delete(isLoggedIn, isAuthor, campgroundController.deleteCampground)

//display the campground edit form
router.get('/:id/edit', isLoggedIn, isAuthor, campgroundController.renderEditForm)


module.exports = router
const catchAsync = require('../Utils/CatchAsync')
const campGround = require('../Schemas/campGround')
const ObjectId = require('mongoose').Types.ObjectId;
const {cloudinary} = require('../cloudinary')
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding")
const mapBoxToken = process.env.MAPBOX_TOKEN


//Mapbox geocoding client instantiate a new one access token.(like a obj creation in java and using it to call instance methods, or class methods.)
//geocoder has 2 methods, forwardgeocode and backwardgeocode
const geocoder = mbxGeocoding({accessToken: mapBoxToken}) 


module.exports.index = catchAsync(async (req, res) => {
    //retrieves ALL documents from campGround model
    const campGrounds = await campGround.find({}).populate('author')
    res.render('CampGrounds/index', { campGrounds })
})

//display the form that creates a new campground
//catchasync this code, render will cause set header error
module.exports.renderNewForm = (req, res) => {res.render('campGrounds/new')}

//Create a New campground site
module.exports.createCampground = catchAsync(async (req, res) => { 
    //map iterates through the req.files array and returns an array of objs, and each obj has an url and filename property. then store the array into the images array property for campgroundSchema Model.
    //req.body stores all the text inputs from the form they filled and sent.
    /* forwardGeocode converts a given String 'city,state' and returns the coordinate of that location, and reverseGeocode converts a given coordinate and returns the string location.
    geoData.body.features[0].geometry is an obj in GeoJSON,-> {"type": "Point", "coordinates": [long, lat]} */
    
    const newCamp = req.body.campground
    const cityAndState = `${newCamp.city}, ${newCamp.state}`
    const geoData = await geocoder.forwardGeocode({
        query: `${cityAndState}`,
        limit: 1
    }).send()
    const uploadedImages = req.files.map(file => ({ url: file.path, filename: file.filename}))
    const camp = new campGround({
        title: newCamp.title,
        images: uploadedImages,
        price: newCamp.price,
        description: newCamp.description,
        location: cityAndState,
        geometry: geoData.body.features[0].geometry, //insert geoJSON 
        author: req.user._id //set author to the logged in user's id
    })
    console.log(camp)
    await camp.save()
    req.flash('success', 'Successfully made a new campGround!')
    res.redirect(`/campGrounds/${camp._id}`)
})

//display an individual campGround with all its information.
module.exports.showCampground = catchAsync(async (req, res) => {
    //populate('retrieves the entire obj of the property inside a schema/model of ObjectId type') now campground has the entire obj of reviews and author and within my template, I will have access to the author and reviews objs and can display the properties within those objs
    /* In order to populate author which is nested Inside reviews, we needed to set a path to get to that property. doing populate('reviews').populate('author) will not work because it looks in the base hierarchy level of the properties of an obj. it would populate reviews and author in the same hierarchy, but it will not populate author thats nested INSIDE reviews. to go deeper in, we specify an obj parameter for the populate() method and print the path to the nested property we want to populate  */
    const { id } = req.params
    if(!ObjectId.isValid(id)) { //url check, in case a user inputs an invalid id in the url
        req.flash('error', 'Cannot find campGround!!!')
        return res.redirect('/campGrounds')
    }
    const campground = await campGround.findById(id).populate('author')
    .populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    })
    if(!campground) {
        req.flash('error', 'Cannot find campGround!!!')
        return res.redirect('/campGrounds')
    }
    res.render('CampGrounds/campGround', { campground })
})

//display the campground edit form
module.exports.renderEditForm = catchAsync(async (req, res) => {
    //location property is comprised of city and state, split() splits them up and store in array.
    const { id }= req.params
    const camp = await campGround.findById(id)
    if(!camp) { //url check, if somehow someone types a invalid campground id in the url.
        req.flash('error', 'Cannot find campGround!!!')
        return res.redirect('/campGrounds')
    }
    const cityState = (camp.location).split(', ')
    res.render('CampGrounds/edit', { camp, cityState })
})

//editing a campground and updating it to the db.
module.exports.editCampground = catchAsync(async (req, res) => {
    //CANNOT CREATE A NEW DOCUMENT AND UPDATE IT because ids cannot be updated since its an immutable proerty. ex: const camp = new campGround({....}) and doing           findByIdAndUpdate(id, camp) will cause error.
    //updateCampground.updateOne() uses the pull operator and Pulls from the images array, all images where the filename of that image is in the request.body.deleteImages array.
    const { id } = req.params
    var newCamp = req.body.campground
    const updateCamp = {
        title: newCamp.title,
        price: newCamp.price,
        description: newCamp.description,
        location: `${newCamp.city}, ${newCamp.state}`,
        images: newCamp.images
    }
    const updateCampground = await campGround.findByIdAndUpdate(id, updateCamp, { new: true })
    const images = req.files.map(file => ({ url: file.path, filename: file.filename}))
    updateCampground.images.push(...images)
    await updateCampground.save()

    //for loop loops through the deleteImages array and retrieves every filename stored in it and by using the destroy api method, delete the each img file 1by1 from your cloudinary
    if(req.body.deleteImages) {
        for(let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename)
        }
        await updateCampground.updateOne(
            { $pull: { images: { filename: { $in: req.body.deleteImages}}}})
    }
    req.flash('success', 'Successfully changed the campGround!')
    res.redirect(`/campGrounds/${updateCampground._id}`)
})

//DELETE a specific campGround and ALL its reviews from the db
module.exports.deleteCampground = catchAsync(async (req, res) => {
    const { id } = req.params
    const camp = await campGround.findByIdAndDelete(id)
    req.flash('success', 'Successfully deleted review!')
    res.redirect('/campGrounds')
})
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const opts = { toJSON: { virtuals: true } };

const imageSchema = new Schema({
    url: String,
    filename: String
})

const campGroundSchema = new Schema({
    title: {
        type: String,
    },
    images: [imageSchema],
    //GeoJSON format.  geometryJSON
    geometry: {
        type: {
            type: String,
            enum: ['Point'], //'location.type' must be 'Point'
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: {
        type: Number,
        min: 0
    },
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts)

/*https://mongoosejs.com/docs/tutorials/virtuals.html#virtuals-in-json
By default, Mongoose does not include virtuals when you convert a document to JSON. For example, if you pass a document to Express' res.json() function, virtuals will not be included by default.

To include virtuals in res.json(), you need to set the toJSON schema option to { virtuals: true }.
const campground = <%- JSON.stringify(campground) %> was used to convert campgrounds model obj to JSON, so this needed to be used, otherwise virtual 'properties.popUpMarkup' would not even show up in your campgrounds obj.

*/

/* searches for the specified str in the url and replace it with the newly specified str     virtual creates a property that we can call from a imageSchema obj we create and use the function.        
In the example below, imageSchema has a virtual property 'thumbnail' thats stores a function, so to use the function, a model created from imageSchema can do imageSchemaModel.thumbnail */
imageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload', '/upload/w_200,h_200')
})

/* mapbox is lookin for a properties property in your GeoJSON, so we need to create it to apply it to the mapbox datasets to use it for popups in mapbox */
campGroundSchema.virtual('properties.popUpMarkup').get(function () {
    /* creates a link to a specific campground page, when a point is click, popup will display the link to that campground page. Also, a 20char limit of the campground description will be displayed */
    return `
    <strong><a href="/campGrounds/${this._id}">${this.title}</a></strong>
    <p>Submitted by: <b>${this.author.username}</b></p>
    `
})

//middleware that happens after a method thats associated with findOneAndDelete
campGroundSchema.post('findOneAndDelete', async function() {
    console.log("Deleted")
})





const campGround = mongoose.model('campGround', campGroundSchema)
module.exports = campGround
const mongoose = require('mongoose')
const cities = require('./cities')
const {places, descriptors} = require('./seedHelpers')
const campGround = require('../Schemas/campGround') //Model

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp'), {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
}

const db = mongoose.connection
db.on("error", console.error.bind(console, "connection error:"))
db.once("open", () => {
    console.log("Database connected")
})

//if brackets are used, js will no longer implicitly return the one liner. you must explicitly return if the function is more than 1 line and has brackets.
//const sample = arr => {arr[Math.floor(Math.random() * arr.length)] } //returns undefined

//retrieves a random element from an array
const sample = arr => arr[Math.floor(Math.random() * arr.length)] 

const seedDb = async () => {
    await campGround.deleteMany({})
    for(let i = 0; i<300; i++) {
        const random = Math.floor(Math.random() * 1000)
        const randomPrice = Math.floor(Math.random() * 1000) + 50
        const cityAndState =`${cities[random].city}, ${cities[random].state}`
        const camp =  new campGround({
            location: cityAndState,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: "2 Gain Levels and BASS Boost: The E10K-TC comes with high/low gain adjustment as well as a bass boost. High gain is for higher impedance headphones that may need the extra volume, while the bass boost satisfies different listener's preferences when listening to various types of music",
            price: randomPrice,
            author: '6530677e3410489b5368019d',
            geometry: {
                type: 'Point',
                coordinates: [
                    cities[random].longitude,
                    cities[random].latitude
                ]
            },
            images: [
                {
                  url: 'https://res.cloudinary.com/dnjlqpaox/image/upload/v1698197119/YelpCamp/ejlyk5p6ep8ezvdf7nzp.png',
                  filename: 'YelpCamp/ejlyk5p6ep8ezvdf7nzp'        
                },
                {
                    url: 'https://res.cloudinary.com/dnjlqpaox/image/upload/v1698197155/YelpCamp/iyfkppfbamcuw9agcrpl.png',
                    filename: 'YelpCamp/iyfkppfbamcuw9agcrpl'        
                  }
              ]
        })
        await camp.save()
    }
}

seedDb().then((data) => {
    console.log("seedDb() promise returns nothing:", data)
    mongoose.connection.close();
})

console.log(descriptors[Math.floor(Math.random() * descriptors.length)])

//campGround.insertMany({})
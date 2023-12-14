/* Because of code below, we're always running in our development environment by defaults. So this code runs, which is going to take a dotenv file. It's looking for that one file with that name in the route directory. So don't try and name it something else. And then it's going to just parse it and store all of the key value pairs in process.env
Very, very, very common practice. */
if(process.env.NODE_ENV !== "production") {
    require('dotenv').config()
}

const express = require('express')
const app = express()
const mongoose = require('mongoose')
const ejsMate = require('ejs-mate')
const session = require('express-session')
const methodOverride = require('method-override')
const flash = require('connect-flash')
const path = require('path')
const passport = require('passport')
const LocalStrategy = require('passport-local');
const helmet = require("helmet")
const mongodbURL = process.env.MONGODB_URL
const secret = process.env.SESSION_SECRET || 'thisshouldbeabettersecret!';
const MongoDBStore = require("connect-mongo")(session)

const User = require('./Schemas/user.js')

const campGroundRoutes = require('./Routes/campGrounds')
const reviewRoutes = require('./Routes/reviews.js')
const userRoutes = require('./Routes/users.js')

const ExpressError = require('./Utils/ExpressError')

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '/views')) //serves static files, public is the specified root directory from which to serve static assets like(images, css files, javascript files)
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'public'))) //all static files do not need to specify Public, it will now implicitly look in the public dir.


mongoose.connect(process.env.MONGODB_URL).then(() => {
    console.log('Connected to MongoDB')
})
.catch(err => {
    console.log(err)
})
const store = new MongoDBStore({
    url: process.env.MONGODB_URL,
    secret,
    touchAfter: 24 * 60 * 60
});

//Setting up A Session
const sessionConfig = {
    store,
    name:'campgroundSession',
    secret,
    resave: false, // removes deprecated warning
    saveUninitialized: true, // removes deprecated warning
    cookie: { //set options for the coookie that gets sent to us about the session.
        httpOnly: true,
        //secure: true //https
        expires: Date.now() + (1000*60*60*24*7), //ms*sec*min*hr*day-> expires in a week
        maxAge: 1000*60*60*24*7
    }
}
app.use(session(sessionConfig))
app.use(flash())

app.use(passport.initialize())
app.use(passport.session()) //passport session must be declared after our session.
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser()) //storing user in a session
passport.deserializeUser(User.deserializeUser())//unstoring user in a session


app.use(helmet());
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dnjlqpaox/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);


//middleware to setup some local variables we can use for all middlewares and 
app.use((req, res, next) => {
    /* res.locals is an object that contains response local variables scoped to the request, and therefore available only to the view(s) rendered during that request / response cycle (if any). Otherwise, this property is identical to app.locals 
    All templates have access to these local var*/
    //console.log(req.session)
    res.locals.currentUser = req.user
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next();
})

app.get('/', (req, res) => {
    res.render('home')
})

app.use('/', userRoutes)

//prefix all routes with campGrounds
app.use('/campGrounds', campGroundRoutes)

//reviews routes
/* reviews router does not have access to the params in the route in this file, because epxress separates them. so :id is not accessible in the reviews router. Unless we specify {mergeParams: true} in the router() function, so then we have access to both params in this middleware as well as the review router. */
app.use('/campGrounds/:id/reviews', reviewRoutes)


//Universal Error Handler
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

//Main Error handler that all errors will run since this middleware will catch it.
app.use((err, req, res, next) => {
    const {statusCode = 500} = err
    if(!err.message) err.message = 'Oh No, Something Went Wrong'
    res.status(statusCode).render('error', { err })
})

app.listen(3000, () => {
    console.log("I AM LISTENING ON PORT 3000!!!")
})
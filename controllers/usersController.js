const User = require('../Schemas/user')
const catchAsync = require('../Utils/CatchAsync')
const passport = require('passport')



//displays the user registration form page, where user can register an account.
module.exports.renderRegisterForm = (req, res) => {res.render('auth/register')}

//displays the login form page, where user can log into their account.
module.exports.renderLoginForm = (req, res) => {res.render('auth/login')}

//Create a new User login then after user registers, log the user in automatically.
module.exports.createUser = catchAsync(async (req, res) => {
    //register() takes a user obj, & the password for that user, then should store the salt and hashed result into that user obj. (register creates a salt and hashes the pw and saves the user info/obj to the db)
    try {
        const { email, username, password } = req.body
        const user = new User({ email, username }) //create new user obj and store just the email and username for now
        const registerUser = await User.register(user, password)
        //console.log(registerUser)
        req.login(registerUser, err => { //log the user in after the user has registered.
            if (err) return next(err)
            req.flash('success', `Welcome to Yelp Camp ${username}`)
            return res.redirect('/campGrounds')
        })
    } catch (e) {
        req.flash('error', e.message)
        res.redirect('/register')
    }
})

//redirects user to either the homepage or the page they were previously on that REDIRECTED them to the login page before they were logged in.
module.exports.redirectLoggedInUser = (req, res) => {
    /* delete removes returnTo from the session obj, bc we dont want this to sit in the session, so we delete it to remove any remnants of it. */
    req.flash('success', `Welcome back ${req.user.username}!!!`)
    const redirectUrl = req.session.returnTo || '/campGrounds'
    delete req.session.returnTo 
    //console.log('prevUrlSession:', req.session.returnTo)
    res.redirect(redirectUrl)
}

//Log the user out of their account.
module.exports.logoutUser = (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Logged Out!');
        res.redirect('/campgrounds');
    })}
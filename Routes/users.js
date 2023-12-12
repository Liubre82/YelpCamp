const express = require('express')
const router = express.Router()
const passport = require('passport')
const usersController = require('../controllers/usersController')


router.route('/register')
    //Display/get the user registration form page, where user can register an account.
    //Create/post a new User login then after user registers, log the user in automatically.
    .get(usersController.renderRegisterForm) 
    .post(usersController.createUser) 

//displays the login form page, where user can log into their account.
//strategy is how you want to authenticate, if you want to use for example google strat, then specify google.
/* authenticate has options you can specify as objects, and here if authentication failed, it would flash a failed message, and redirect you back to login page.
authenticate() automatically calls login() for us on the user trying to login, but we cannot use authenticate until a user has been created/registed. thats why in our createUser function, we register(), then login() */
/* if authenticate() middleware was a success, this route handler will run 
redirectUrl stores either the url the user was on that needed authentication to access, or if user wasnt on any page prior to loggin in, returnTo would be undefined and instead we will take the user to the main page which is /campGrounds */
/* Check the user login inputs, and logs the user in if credentials are correct. redirects user to either the homepage or the page they were previously on that REDIRECTED them to the login page before they were logged in.  */
router.route('/login')
    .get(usersController.renderLoginForm)
    .post(
        passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), 
        usersController.redirectLoggedInUser
    )

/* Log the user out */
router.get('/logout', usersController.logoutUser)

module.exports = router
const mongoose = require('mongoose')
const passportLocalMongoose = require('passport-local-mongoose')

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
})

//adds username and password fields for us and declare constraints. password will be 'salt' key and 'hash' key. not 'password' property.
userSchema.plugin(passportLocalMongoose)

const User = mongoose.model('User', userSchema)

module.exports = User
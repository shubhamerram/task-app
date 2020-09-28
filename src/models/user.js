const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./task');
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    age: {
        type: Number
    },
    email: {
        type: String,
        unique:true,
        required:true,
        trim: true,
        lowercase: true,
        validate(val) {
            if(!validator.isEmail(val)) {
                throw new Error('Email invalid')
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        trim: true,
        validate(val) {
            if(val.includes('password')) {
                throw new Error("Password should not contain string password");
            }
        }
    },
    tokens:[{
        token:{
            type:String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps:true
});

userSchema.virtual('tasks', {
    ref:"Task",
    localField:"_id",
    foreignField:"owner"
})

userSchema.methods.toJSON = function() {
    const user = this;
    userObject = user.toObject();
    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;
    return userObject;
}


userSchema.methods.generateAuthToken = async function() {
    const user = this;
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
    user.tokens = user.tokens.concat({ token });
    await user.save();
    return token;
}

userSchema.statics.findUserByCredentials = async (email, password) => {
    const validEmail = await User.findOne({email});
    if(!validEmail) {
        throw new Error('Invalid Credentials');
    }
    const validPassword = await bcrypt.compare(password, validEmail.password);
    if(!validPassword) {
        throw new Error('Invalid Credentials');
    }
    return validEmail;
}


userSchema.pre('save', async function(next) {
    const user = this;
    if(user.isModified('password')) 
        user.password = await bcrypt.hash(user.password, 8);
    next();
})

// Remove task after user deleted
userSchema.pre('remove', async function(next) {
    const user = this;
    await Task.deleteMany({'owner': user._id});
    next();
})
const User = mongoose.model('User', userSchema);

module.exports = User;
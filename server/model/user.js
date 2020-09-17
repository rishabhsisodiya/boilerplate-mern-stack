const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    maxlength: 50,
  },
  email: {
    type: String,
    trim: true,
    unique: 1,
  },
  password: {
    type: String,
    minlength: 5,
  },
  lastname: {
    type: String,
    maxlength: 50,
  },
  role: {
    type: Number,
    default: 0,
  },
  image: String,
  token: {
    type: String,
  },
  tokenExp: {
    type: Number,
  },
});

// bcrypt hashing
const saltRounds = 10;

userSchema.pre('save', function (next) {
  var user= this;
  // console.log(user.isM);
  if (user.isModified('password')) {
    bcrypt.genSalt(saltRounds, (err, salt) => {
      
      if(err) return next(err);
      
      bcrypt.hash( user.password, salt, (err, hash) => {
        if(err) return next(err);
        user.password = hash;
        next();
      })

    })

  }
  else{
    next();
  }
} )


// User methods
userSchema.methods.comparePassword = function(plainPassword,cb){
  bcrypt.compare(plainPassword, this.password, function(err, isMatch){
      if (err) return cb(err);
      cb(null, isMatch)
  })
}

userSchema.methods.generateToken = function(cb) {
  var user = this;
  var token =  jwt.sign(user._id.toHexString(),'secret')
  user.token = token;
  user.save(function (err, user){
      if(err) return cb(err)
      cb(null, user);
  })
}

userSchema.statics.findByToken = function(token , cb) {
  var user= this;
  jwt.verify(token, 'secret', (err, decode) => {
    if(err) return cb(err)
    user.findOne({"_id":decode, "token":token},(err, user) =>{
      if(err) return cb(err)
      cb(null,user)
    });
  });
}

const User = mongoose.model('User', userSchema);
module.exports = {User}
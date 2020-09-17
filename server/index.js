const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const { User } = require("./model/user");
const config = require("./config/key");
const {auth} = require("./middleware/auth");

// MongoDB connection
mongoose
  .connect(config.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("MongoDB is connected");
  })
  .catch((err) => {
    console.log(err);
  });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// Register user
app.post("/api/users/register", (req, res) => {
  const user = new User(req.body);
  //   console.log(user);
  user.save((err, userData) => {
    // console.log(userData);
    if (err) return res.status(400).send({ success: false, err });
    return res.status(201).send({ success: true });
  });
});

// Login User
app.post("/api/user/login", (req, res) => {
  // find the email exist or not
  User.findOne({ email: req.body.email }, (err, user) => {
    if (!user) {
      return res.status(400).json({
        loginSuccess: false,
        message: "Auth Failed, email not found",
      });
    }
    // comparePassword
    user.comparePassword(req.body.password, (err, isMatch) => {
      if (!isMatch) {
        return res
          .status(400)
          .json({ loginSuccess: false, message: "Wrong password" });
      }

      // Generate Token
      user.generateToken((err, user) => {
        if (err) return res.status(400).json(err);
        res
          .cookie("x_auth", user.token)
          .status(200)
          .json({ loginSuccess: true });
      });
    });
  });
});

app.get('/api/user/auth', auth , (req, res) => {
  console.log(req.user);
  res.status(200).json({isAuth:true})
});

app.get('/api/user/logout', auth, (req, res)=> {
  User.findOneAndUpdate({_id:req.user._id},{token:""},(err, doc)=> {
    if(err) return res.status(400).json({success:false, err})
    return res.status(200).send({
      success:true,
      message:"User logout Successful"
    });
  });
});


const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

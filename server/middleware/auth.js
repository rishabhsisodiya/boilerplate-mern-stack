const { User } = require("../model/user");

let auth = (req, res, next) => {
  let token = req.cookies.x_auth;
  if(!token){
      return res.status(400).json("Login First")
  }
  User.findByToken(token, (err, user) => {
    if (err) return res.status(400).json(err);
    if (!user)
      return res.json({
        isAuth: false,
        error: true,
      });

    req.token = token;
    req.user = user;
    next();
  });
};

module.exports = { auth };

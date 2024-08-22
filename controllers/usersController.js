const { User, Item } = require('../models/model');
const bcrypt = require('bcryptjs');

exports.showSignUpForm = (req, res) => {
  res.render('user/signUp');
};

exports.signUp = async (req, res) => {
  try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const newUser = await User.create({
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          email: req.body.email,
          password: hashedPassword
      });
      req.session.userId = newUser._id;
      res.redirect('/user/profile');
  } catch (error) {
      if (error.code === 11000) {
        res.render('user/signUp', { errorMessage: 'Email already in use. Please try another one.' });
      } else {
          console.error("Registration error:", error);
          res.status(500).send("Failed to register user: " + error.message);
      }
  }
};

exports.showLoginForm = (req, res) => {
  res.render('user/login');
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
      return res.status(400).render('user/login', { errorMessage: 'Both email and password are required.' });
  }

  try {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (user && await bcrypt.compare(password, user.password)) {
          req.session.userId = user._id;
          res.redirect('/user/profile');
      } else {
          res.status(401).render('user/login', { errorMessage: 'Invalid email or password' });
      }
  } catch (error) {
      console.error("Login error:", error);
      res.status(500).send("Error logging in");
  }
};

exports.showProfile = async (req, res) => {
  try {
    const userItems = await Item.find({ seller: req.session.userId }).lean();
    res.render('user/profile', { items: userItems });
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to fetch user's items: " + err.message);
  }
};

exports.logoutUser = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
};

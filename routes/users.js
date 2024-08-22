const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');

// Sign up route
router.get('/signUp', usersController.showSignUpForm);
router.post('/signUp', (req, res, next) => {
    usersController.signUp(req, res).then(() => {
        req.flash('success_msg', 'Successfully registered. Please log in.');
        res.redirect('/login');
    }).catch(error => {
        req.flash('error_msg', 'Registration failed. Please try again.');
        res.redirect('/signUp');
    });
});

// Login route
router.get('/login', usersController.showLoginForm);
router.post('/login', (req, res, next) => {
    usersController.loginUser(req, res).then(() => {
        req.flash('success_msg', 'Successfully logged in.');
        res.redirect('/profile');
    }).catch(error => {
        req.flash('error_msg', 'Login failed. Check your credentials.');
        res.redirect('/login');
    });
});

// Profile route
router.get('/profile', usersController.showProfile);

// Logout route
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).send('Error logging out');
        }
        req.flash('success_msg', 'Successfully logged out.');
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
});

module.exports = router;

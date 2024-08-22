const express = require('express');
const path = require('path');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const MongoStore = require('connect-mongo');
const itemsRoutes = require('./routes/items');
const usersRoutes = require('./routes/users');
const { User, Item } = require('./models/model');

const app = express();

mongoose.connect('mongodb+srv://jnorto24:purHPnTqPFfNtmsx@gamerfix.5xud0ih.mongodb.net/project3?retryWrites=true&w=majority&appName=gamerFix')
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => console.error('Could not connect to MongoDB Atlas:', err));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.use(session({
    secret: 'secretkeyforgamerfix',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: mongoose.connection.client.s.url })
}));

app.use(async (req, res, next) => {
    if (req.session.userId) {
        try {
            res.locals.user = await User.findById(req.session.userId);
            next();
        } catch (error) {
            console.error('Error fetching user from database', error);
            next();
        }
    } else {
        next();
    }
});

app.use('/items', itemsRoutes);
app.use('/user', usersRoutes);

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/new', (req, res) => {
    res.render('new');
});

app.get('/signUp', (req, res) => {
    res.render('user/signUp');
});

app.get('/login', (req, res) => {
    res.render('user/login');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

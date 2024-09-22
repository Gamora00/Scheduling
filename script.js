const express = require('express');
const app = express();
const dotenv = require('dotenv')
const path = require('path')
const db = require('./database/dataControl')
const session = require('express-session');
const cookieParser = require('cookie-parser');

app.use(cookieParser());

const publicDirectory = path.join(__dirname, './public')
app.use(express.static(publicDirectory))
app.use(express.urlencoded({extended: false}))
app.use(express.json())

app.use(session({
    secret: process.env.ACCESS_TOKEN_SECRET, 
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
}));


exports.isAuthenticated = (req, res, next) => {
    if (req.session.isAuthenticated) {
        console.log(req.session.isAuthenticated);
        next(); 
    } else {
        console.log(req.session.isAuthenticated);
        res.redirect('/'); 
    }
};

app.set('view engine', 'hbs')

console.log("Database pool created");




app.use('/', require('./routes/route'))
app.use('/auth', require('./routes/auth'))


app.listen(3000, ()=>{
    console.log('server started');
})
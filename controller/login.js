
 const db = require('../database/dataControl');
const bcrypt = require('bcryptjs');
const teacherRole = require('../routes/route')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
const studentLogin = require('../controller/studentLogin');
const teacherLogin = require('./teacherLogin');
const adminLogin = require('./adminLogin');
dotenv.config()


exports.login = (req, res) => {
    const { username, password } = req.body;
    adminLogin(username, password,req, res)
}

exports.Studentlogin = (req, res) => {
    const { username, password } = req.body;
    studentLogin(username, password,req, res)
}

exports.Teacherlogin = (req, res) => {
    const { username, password } = req.body;
    teacherLogin(username, password,req, res)
}







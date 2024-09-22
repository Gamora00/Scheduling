const db = require('../database/dataControl');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const adminLogin = async (username, password, req, res) => {
    try {
        const [adminResult] = await db.query('SELECT admin_username, admin_password FROM admin WHERE admin_username = ?', [username]);

        if (adminResult.length === 0) {
            console.log('Admin not found');
            return res.render('home', { message: 'Invalid username or password.' });
        }

        const admin = adminResult[0];
        const { admin_username, admin_password } = admin;
        const passwordMatch = await bcrypt.compare(password, admin_password);

        if (!passwordMatch) {
            console.log('Invalid password for admin');
            return res.render('home', { message: 'Invalid username or password.' });
        }

        const token = jwt.sign({ username: admin_username }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true, maxAge: 3600000 });
        req.session.isAuthenticated = true;
        req.session.username = admin_username;

        const [dataRes] = await db.query('SELECT * FROM student');

        const studentsData = dataRes.map(student => ({
            studentID: student.student_id,
            firstName: student.first_name,
            password: student.student_password,
            lastName: student.last_name,
            middleName: student.middle_name,
            studentStrand: student.strand,
            gradeLevel: student.grade_level,
            studentSection: student.section,
            studentUsername: student.student_username,
            studentAddress: student.address,
            parentsName: student.parents_name,
            parentNumber: student.parent_number
        }));

        res.render('adminUI', { studentsData });
    } catch (err) {
        console.error("Admin login error: ", err);
        res.render('home', { message: 'An error occurred while logging in. Please try again later.' });
    }
};

module.exports = adminLogin;

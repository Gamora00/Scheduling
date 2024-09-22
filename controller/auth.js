const db = require('../database/dataControl');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    const {
        username,
        studentID,
        password,
        confirmpassword,
        address,
        firstname,
        lastname,
        middlename,
        strand,
        gradelevel,
        section,
        parents,
        number
    } = req.body;

    try {
        const [existingUser] = await db.query('SELECT student_id FROM student WHERE student_id = ?', [studentID]);
        const [archiveResult] = await db.query('SELECT student_id FROM student_archive WHERE student_id = ?', [studentID])
if (existingUser.length > 0 || archiveResult.length > 0) {
    return res.render('register', {
        message: 'ID is already in use'
    });
}

        if (password !== confirmpassword) {
            return res.render('register', {
                message: 'Passwords do not match'
            });
        }

        if (gradelevel >= 13) {
            return res.render('register', {
                message: 'Grade level error'
            });
        }

        if (
            !username ||
            !studentID ||
            !password ||
            !confirmpassword ||
            !address ||
            !firstname ||
            !lastname ||
            !middlename ||
            !strand ||
            !gradelevel ||
            !section ||
            !parents ||
            !number
        ) {
            return res.render('register', {
                message: 'Please fill out all fields'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 8);

        await db.query('INSERT INTO student SET ?', {
            student_id: studentID,
            student_username: username,
            student_password: hashedPassword,
            first_name: firstname,
            last_name: lastname,
            middle_name: middlename,
            strand,
            grade_level: gradelevel,
            section,
            parents_name: parents,
            parent_number: number,
            address
        })


        res.redirect('/admin')
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

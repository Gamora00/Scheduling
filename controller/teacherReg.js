const db = require('../database/dataControl');
const bcrypt = require('bcryptjs');

exports.teacher = async (req, res) => {
    const { username, teacherId, password, confirmpassword, subject, firstname, lastname } = req.body;

    

    try {
        // Check if any form field is empty
        if (!username || !teacherId || !password || !confirmpassword || !subject || !firstname || !lastname) {
            return res.render('teacherRegister', { message: 'Please fill out the form' });
        }

        // Check if the teacher ID is already taken
        const [result] = await db.query('SELECT teacher_id FROM teacher WHERE teacher_id = ?', [teacherId]);
        const [archiveResult] = await db.query('SELECT teacher_id FROM teacher_archive WHERE teacher_id = ?', [teacherId])
        if (result.length > 0 || archiveResult.length > 0) {
            return res.render('teacherRegister', { message: 'ID is already taken' });
        }

        // Check if the passwords match
        if (password !== confirmpassword) {
            return res.render('teacherRegister', { message: 'Passwords do not match' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 8);

        // Insert the new teacher into the database
        await db.query('INSERT INTO teacher SET ?', {
            teacher_id: teacherId,
            teacher_username: username,
            teacher_password: hashedPassword,
            first_name: firstname,
            last_name: lastname,
            subject: subject
        });

        console.log("Registration successful");

        req.session.isAuthenticated = true;
        return res.redirect('/admin');
    } catch (err) {
        console.log(err);
        res.render('teacherRegister', { message: "Something went wrong" });
    }
};

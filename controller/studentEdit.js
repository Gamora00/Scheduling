const db = require('../database/dataControl');
const bcrypt = require('bcryptjs');

exports.studentEdit = async (req, res) => {
    const { username, ID, password, firstName, lastName, middleName, studentStrand, gradeLevel, studentSection, parentsName, parentNumber } = req.body;

    if (!ID) {
        console.log("Id required");
        return res.status(400).send("Id required");
    }

    try {
        const [result] = await db.query('SELECT * FROM student WHERE student_id = ?', [ID]);

        if (result.length === 0) {
            return res.status(404).send("Student not Found");
        }

        if (password) {
            try {
                const hashPassword = await bcrypt.hash(password, 10);
                await db.query('UPDATE student SET student_password = ? WHERE student_id = ?', [hashPassword, ID]);
                console.log("Password changed");
            } catch (error) {
                console.log("Error hashing password: " + error);
                return res.status(500).send("Error hashing password");
            }
        }

        // Update other student details
        await db.query('UPDATE student SET student_username = ?, first_name = ?, last_name = ?, middle_name = ?, strand = ?, grade_level = ?, section = ?, parents_name = ?, parent_number = ? WHERE student_id = ?', [username, firstName, lastName, middleName, studentStrand, gradeLevel, studentSection, parentsName, parentNumber, ID]);

        console.log("User details changed");
        res.redirect('/admin?success=1&message=Successfully changed!');
    } catch (err) {
        console.log("Database Error: " + err);
        return res.status(500).send("Database Error");
    }
};

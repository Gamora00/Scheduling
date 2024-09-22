const db = require('../database/dataControl');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.archiveStudent = async (req, res) => {
    const { studentId } = req.body;
    

    if (!studentId ||!/^\d+$/.test(studentId)) {
        return res.status(400).send("Invalid student ID");
    }
    let connection;

    try {
        // Get a connection from the pool
        connection = await db.getConnection();
        
        // Begin a transaction
        await connection.beginTransaction();

        // Insert teacher into archive
        await connection.query(`
            INSERT INTO student_archive (student_id, first_name, last_name, middle_name, strand, grade_level, section, parents_name, parent_number, student_username, student_password, address)
            SELECT student_id, first_name, last_name, middle_name, strand, grade_level, section, parents_name, parent_number, student_username, student_password, address
            FROM student
            WHERE student_id = ?;
        `, [studentId]);

        // Delete teacher from original table
        await connection.query(`
            DELETE FROM student
            WHERE student_id = ?;
        `, [studentId]);

        // Commit the transaction
        await connection.commit();
        console.log("Student archived and deleted successfully.");
        res.redirect('/admin?success=1&message=Teacher archived and deleted successfully!');

    } catch (error) {
        // Rollback the transaction in case of an error
        if (connection) {
            await connection.rollback();
        }
        console.error("An error occurred:", error);
        res.status(500).send("An error occurred while archiving the teacher.");
    } finally {
        // Release the connection back to the pool
        if (connection) {
            await connection.release();
        }
    }
};

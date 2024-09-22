const db = require('../database/dataControl');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.archiveTeacher = async (req, res) => {
    const { teacher_id } = req.body;

    if (!teacher_id) {
        console.log(teacher_id);
        return res.status(400).send("Teacher ID is required");
    }

    let connection;

    try {
        // Get a connection from the pool
        connection = await db.getConnection();
        
        // Begin a transaction
        await connection.beginTransaction();

        // Insert teacher into archive
        await connection.query(`
            INSERT INTO teacher_archive (teacher_id, first_name, last_name, subject, teacher_username, password)
            SELECT teacher_id, first_name, last_name, subject, teacher_username, teacher_password
            FROM teacher
            WHERE teacher_id = ?;
        `, [teacher_id]);

        // Delete teacher from original table
        await connection.query(`
            DELETE FROM teacher
            WHERE teacher_id = ?;
        `, [teacher_id]);

        // Commit the transaction
        await connection.commit();
        console.log("Teacher archived and deleted successfully.");
        res.redirect('/teacherAccount?success=1&message=Teacher archived and deleted successfully!');

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


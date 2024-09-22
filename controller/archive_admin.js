const db = require('../database/dataControl');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.archiveAdmin = async (req, res) => {
    const { admin_id } = req.body;

    if (!admin_id) {
        console.log(admin_id);
        return res.status(400).send("Admin ID is required");
    }

    let connection;

    try {
        // Get a connection from the pool
        connection = await db.getConnection();
        
        // Begin a transaction
        await connection.beginTransaction();

        // Insert teacher into archive
        await connection.query(`
            INSERT INTO admin_archive (admin_id, first_name, last_name, admin_username, admin_password)
            SELECT admin_id, first_name, last_name, admin_username, admin_password
            FROM admin
            WHERE admin_id = ?;
        `, [admin_id]);

        // Delete teacher from original table
        await connection.query(`
            DELETE FROM admin
            WHERE admin_id = ?;
        `, [admin_id]);

        // Commit the transaction
        await connection.commit();
        console.log("Teacher archived and deleted successfully.");
        res.redirect('/adminAccounts?success=1&message=Teacher archived and deleted successfully!');

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


const db = require('../database/dataControl');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.UnarchiveSchedule = async (req, res) => {
    const { scheduleId } = req.body;

    if (!scheduleId) {
        console.log(scheduleId);
        return res.status(400).send("Schedule ID is required");
    }

    let connection;

    try {
        // Get a connection from the pool
        connection = await db.getConnection();

        try {
            // Begin a transaction
            await connection.beginTransaction();

            // Insert schedule and venue details from schedule_archive to schedule
            await connection.query(`
                INSERT INTO schedule (schedule_id, schedule_name, schedule_note, schedule_date, schedule_time, venue_id)
                SELECT schedule_id, schedule_name, schedule_note, schedule_date, schedule_time, venue_id
                FROM schedule_archive
                WHERE schedule_id = ?;
            `, [scheduleId]);


            await connection.query(`
                INSERT INTO venue (room, building)
                SELECT  room, building
                FROM venue
                WHERE venue_id = ?;
            `, [scheduleId]);

            // Delete schedule from schedule_archive
            await connection.query(`
                DELETE FROM schedule_archive
                WHERE schedule_id = ?;
            `, [scheduleId]);

            // Commit the transaction
            await connection.commit();
            console.log("Schedule and venue details unarchived and deleted successfully.");
            res.redirect('/teacher?success=1&message=Schedule unarchived and deleted successfully!');

        } catch (error) {
            // Rollback the transaction in case of an error
            if (connection) {
                await connection.rollback();
            }
            console.error("An error occurred:", error);
            throw error; // re-throw the error
        } finally {
            // Release the connection back to the pool
            if (connection) {
                await connection.release();
            }
        }

    } catch (error) {
        console.error("Error getting connection:", error);
        res.status(500).send("An error occurred while unarchiving the schedule.");
    }
};

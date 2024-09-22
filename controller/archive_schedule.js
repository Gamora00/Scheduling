const db = require('../database/dataControl');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.archiveSchedule = async (req, res) => {
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

            // Insert schedule and venue details into schedule_archive
            await connection.query(`
                INSERT INTO schedule_archive (schedule_id, schedule_name, schedule_note, schedule_date, schedule_time, venue_id, building, room)
                SELECT schedule.schedule_id, schedule.schedule_name, schedule.schedule_note, schedule.schedule_date, schedule.schedule_time, venue.venue_id, venue.building, venue.room
                FROM schedule 
                JOIN venue ON schedule.venue_id = venue.venue_id
                WHERE schedule.schedule_id = ?;
            `, [scheduleId]);

            // Delete schedule from original table
            await connection.query(`
                DELETE FROM schedule
                WHERE schedule_id = ?;
            `, [scheduleId]);

            // Commit the transaction
            await connection.commit();
            console.log("Schedule and venue details archived and deleted successfully.");
            res.redirect('/teacher?success=1&message=Schedule archived and deleted successfully!');

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
        res.status(500).send("An error occurred while archiving the schedule.");
    }
};

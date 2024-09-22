const db = require('../database/dataControl');

exports.scheduleEdit = async (req, res) => {
    const { editScheduleName, ID, editScheduleNote, editScheduleDate, editScheduleTime, editScheduleVenue, editScheduleBuilding, editScheduleRoom } = req.body;

    if (!ID) {
        console.log("Id required");
        return res.status(400).send("Id required");
    }

    try {
        // Begin transaction
        await db.query('BEGIN');

        const [result] = await db.query('SELECT * FROM schedule WHERE schedule_id = ?', [ID]);

        if (result.length === 0) {
            await db.query('ROLLBACK');
            return res.status(404).send("Schedule not found");
        }

        const schedule = result[0];

        // Update schedule details
        await db.query(
            'UPDATE schedule SET schedule_name = ?, schedule_note = ?, schedule_date = ?, schedule_time = ? WHERE schedule_id = ?',
            [editScheduleName, editScheduleNote, editScheduleDate, editScheduleTime, ID]
        );

        // Update venue details
        await db.query(
            'UPDATE venue SET building = ?, room = ? WHERE venue_id = ?',
            [editScheduleBuilding, editScheduleRoom, schedule.venue_id]
        );

        // Commit transaction
        await db.query('COMMIT');

        console.log("Schedule and venue details changed");
        res.redirect('/teacher?success=1&message=Successfully changed!');
    } catch (err) {
        await db.query('ROLLBACK');
        console.log("Database Error: " + err);
        return res.status(500).send("Database Error");
    }
};

const db = require('../database/dataControl');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const teacherLogin = async (username, password, req, res) => {
    try {
        // Query the database for the teacher
        const [teacherResult] = await db.query('SELECT teacher_username, teacher_password FROM teacher WHERE teacher_username = ?', [username]);

        // Check if the teacher exists
        if (!teacherResult || teacherResult.length === 0) {
            console.log('Teacher not found');
            return res.render('teacherLogin', { message: 'Invalid username or password.' });
        }

        const teacher = teacherResult[0];
        const { teacher_username, teacher_password } = teacher;

        // Compare the provided password with the stored hashed password
        const passwordMatch = await bcrypt.compare(password, teacher_password);
        if (!passwordMatch) {
            return res.render('teacherLogin', { message: 'Invalid username or password.' });
        }

        // Generate a JWT token
        const token = jwt.sign({ username: teacher_username }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true, maxAge: 3600000 });

        // Set session variables
        req.session.isAuthenticated = true;
        req.session.username = teacher_username;

        // Fetch schedule data
        const [dataRes] = await db.query('SELECT schedule.*, venue.Venue AS venue_name, venue.building AS venue_building, venue.room AS venue_room FROM schedule JOIN venue ON schedule.venue_id = venue.venue_id');

        // Map the schedule data
        const scheduleData = dataRes.map(schedule => ({
            scheduleId: schedule.schedule_id,
            scheduleName: schedule.schedule_name,
            scheduleNote: schedule.schedule_note,
            scheduleDate: schedule.schedule_date,
            scheduleTime: schedule.schedule_time,
            scheduleVenue: schedule.venue_name,
            scheduleBuilding: schedule.venue_building,
            scheduleRoom: schedule.venue_room
        }));

        // Render the teacher UI with the schedule data
        res.render('teacherUI', { scheduleData });

    } catch (err) {
        console.error("Error during teacher login: ", err);
        return res.render('teacherLogin', { message: 'An error occurred while logging in. Please try again later.' });
    }
};

module.exports = teacherLogin;

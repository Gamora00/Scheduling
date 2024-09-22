const db = require('../database/dataControl');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const studentLogin = async (username, password, req, res) => {
    try {
        const [studentResult] = await db.query('SELECT student_username, student_password FROM student WHERE student_username = ?', [username]);

        if (!studentResult || studentResult.length === 0) {
            return res.render('studentLogin', { message: 'Invalid username or password.' });
        }

        const student = studentResult[0];
        if (!student) {
            return res.render('studentLogin', { message: 'Invalid username or password.' });
        }

        const { student_username, student_password } = student;
        const passwordMatch = await bcrypt.compare(password, student_password);
        if (!passwordMatch) {
            return res.render('studentLogin', { message: 'Invalid username or password.' });
        }

        const token = jwt.sign({ username: student_username }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true, maxAge: 3600000, secure: true, sameSite: 'strict' });

        req.session.isAuthenticated = true;
        req.session.username = student_username;

        const [dataRes] = await db.query('SELECT schedule.*, venue.Venue AS venue_name, venue.building AS venue_building, venue.room AS venue_room FROM schedule JOIN venue ON schedule.venue_id = venue.venue_id');

        const scheduleData = dataRes.map(schedule => ({
            scheduleId: schedule.schedule_id,
            scheduleName: schedule.schedule_name,
            scheduleNote: schedule.schedule_note,
            scheduleDate: schedule.schedule_date,
            scheduleTime: schedule.schedule_time,
            scheduleVenue: schedule.venue_name,
            scheduleBuilding: schedule.venue_building,
            scheduleRoom: schedule.venue_room,
            scheduleImage: `/images/${schedule.schedule_id}`  // URL to fetch the image
        }));

        res.render('studentUI', { scheduleData });
    } catch (err) {
        console.error("Error during student login: ", err);
        return res.render('studentLogin', { message: 'An error occurred while logging in. Please try again later.' });
    }
};

module.exports = studentLogin;

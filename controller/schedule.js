const db = require('../database/dataControl');

exports.schedule = async (req, res) => {
  const { scheduleID, schedule, scheduleNote, date, time, venue_name, venue_room, venue_building, scheduleImg } = req.body;

  if (!scheduleID || !schedule || !scheduleNote || !date || !time || !venue_name || !venue_room || !venue_building) {
    return res.render('schedule', {
      message: 'Please fill out the form'
    });
  }

  try {
    const venueQuery = 'INSERT INTO venue SET ?';
    const venueData = {
      room: venue_room,
      building: venue_building,
      Venue: venue_name
    };

    const [venueResult] = await db.query(venueQuery, venueData);
    const venueID = venueResult.insertId;

    if (!venueID) {
      console.error('Error: venueID is null');
      return res.render('schedule', { message: 'Error retrieving venue ID. Please try again later.' });
    }

    console.log('Inserted venue ID:', venueID);

    const scheduleQuery = 'INSERT INTO schedule SET ?';
    const scheduleData = {
      schedule_id: scheduleID,
      schedule_name: schedule,
      schedule_note: scheduleNote,
      schedule_date: date,
      schedule_time: time,
      venue_id: venueID,
      image: scheduleImg
    };

    await db.query(scheduleQuery, scheduleData);

    res.redirect('/teacher');
  } catch (err) {
    console.error('Database Error:', err);
    return res.render('schedule', { message: 'Error inserting data. Please try again later.' });
  }
};

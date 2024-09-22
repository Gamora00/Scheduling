const express = require('express');
const router = express.Router();
const db = require('../database/dataControl');
const session = require('express-session');
const importIsAuthenticated  = require('../script')




const isAuthenticated = importIsAuthenticated.isAuthenticated
require('dotenv').config();




router.get('/', (req, res) => {
    res.render('firstpage');
});

router.get('/admin/login', (req, res) => {
    res.render('home');
});

router.get('/student/login', (req, res) => {
    res.render('studentLogin');
});

router.get('/teacher/login', (req, res) => {
    res.render('teacherLogin');
});

router.get('/teacherRegister', (req,res)=>{
    res.render('teacherRegister')
})

router.get('/register', (req,res)=>{
    res.render('register')
})

router.get('/adminRegister', (req,res)=>{
    res.render('adminRegister')
})

router.use(session({
    secret: process.env.ACCESS_TOKEN_SECRET, // Replace with your own secret key
    resave: false,
    saveUninitialized: true
}));



router.get('/admin', isAuthenticated, async (req, res) => {
    try {
        const [dataRes] = await db.query('SELECT * FROM student');
        
        const studentsData = dataRes.map(student => ({
            studentID: student.student_id,
            firstName: student.first_name,
            lastName: student.last_name,
            middleName: student.middle_name,
            studentStrand: student.strand,
            gradeLevel: student.grade_level,
            studentSection: student.section,
            studentUsername: student.student_username,
            studentAddress: student.address,
            parentsName: student.parents_name,
            parentNumber: student.parent_number
        }));

        // Render the adminUI page with the fetched data
        res.render('adminUI', { studentsData });
    } catch (err) {
        console.error("Error fetching data: ", err);
        res.render('home', { message: 'An error occurred while fetching data. Please try again later.' });
    }
});


router.get('/student', isAuthenticated, (req,res)=>{
    db.query(
        'SELECT schedule.*, venue.Venue AS venue_name, venue.building AS venue_building, venue.room AS venue_room FROM schedule JOIN venue ON venue.venue_id = schedule.venue_id',
        (err, dataRes) => {
          if (err) {
            console.error("Error fetching data: ", err);
            return res.render('home', { message: 'An error occurred while fetching data. Please try again later.' });
          }
          console.log("Retrieved Data:", dataRes);
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
          
          console.log("Mapped Schedule Data:", scheduleData)
          res.render('studentUI', { scheduleData });
        }
      );
})

router.get('/teacher', isAuthenticated, async (req,res)=>{
   const [scheduleRes] = await db.query('SELECT schedule.*, venue.Venue AS venue_name, venue.building AS venue_building, venue.room AS venue_room FROM schedule JOIN venue ON schedule.venue_id = venue.venue_id')
        

        try {
            const scheduleData = scheduleRes.map(schedule =>({
                scheduleId: schedule.schedule_id,
                scheduleName: schedule.schedule_name,
                scheduleNote: schedule.schedule_note,
                scheduleDate: schedule.schedule_time,
                scheduleTime: schedule.schedule_time,
                scheduleVenue: schedule.venue_name,
                scheduleBuilding: schedule.venue_building,
                scheduleRoom: schedule.venue_room
            }))

            res.render('teacherUI', { scheduleData });
        } catch (error) {
            console.log(err);
        }
        
        
    })

router.get('/schedule', isAuthenticated, (req,res)=>{
    res.render('schedule')
})




router.get('/teacherAccount', isAuthenticated, async (req, res) => {
   try{
    const [dataRes] = await db.query('SELECT * FROM teacher')

        const teacherData = dataRes.map(teachers =>({
            teacher_id: teachers.teacher_id,
            teacher_username: teachers.teacher_username,
            teacher_password: teachers.teacher_password,
            first_name: teachers.first_name,
            last_name: teachers.last_name,
            subject: teachers.subject
        }))
        // Render the home page with the fetched data
        res.render('teacherForAdmin', { teacherData });
   }catch(err){
    res.render('adminUI', { message: 'An error occurred while fetching data. Please try again later.' });
   }
    });
   


    router.get('/adminAccounts', isAuthenticated, async (req, res) => {
        try{
         const [dataRes] = await db.query('SELECT * FROM admin')
     
             const adminData = dataRes.map(admins =>({
                admin_id: admins.admin_id,
                admin_username: admins.admin_username,
                admin_password: admins.admin_password,
                 first_name: admins.first_name,
                 last_name: admins.last_name
             }))
             // Render the home page with the fetched data
             res.render('adminAccounts', { adminData });
        }catch(err){
         res.render('adminUI', { message: 'An error occurred while fetching data. Please try again later.' });
        }
         });


router.get('/archive', isAuthenticated, async (req, res) => {
    try{
        const [schedule] = await db.query('SELECT * FROM schedule_archive')
    
            const scheduleData = schedule.map(schedule =>({
               schedule_id: schedule.schedule_id,
               schedule_name: schedule.schedule_name,
               schedule_note: schedule.schedule_note,
               schedule_date: schedule.schedule_date,
               schedule_time: schedule.schedule_time,
               building: schedule.building,
               room: schedule.room
            }))

            const [student] = await db.query('SELECT * FROM student_archive');
        
            const stdData = student.map(student => ({
                studentID: student.student_id,
                firstName: student.first_name,
                lastName: student.last_name,
                middleName: student.middle_name,
                studentStrand: student.strand,
                gradeLevel: student.grade_level,
                studentSection: student.section,
                studentUsername: student.student_username,
                studentAddress: student.address,
                parentsName: student.parents_name,
                parentNumber: student.parent_number
            }));
            

         const [teacher] = await db.query('SELECT * FROM teacher_archive')

        const techData = teacher.map(teachers =>({
            teacher_id: teachers.teacher_id,
            teacher_username: teachers.teacher_username,
            first_name: teachers.first_name,
            last_name: teachers.last_name,
            subject: teachers.subject
        }))

            // Render the home page with the fetched data
            res.render('archive', { scheduleData, stdData, techData });
       }catch(err){
        res.render('adminUI', { message: 'An error occurred while fetching data. Please try again later.' });
       }


       
   
});


router.get('/teacherArchive', isAuthenticated, async (req, res) => {
    try{

        const [teacher] = await db.query('SELECT * FROM teacher_archive')

        const techData = teacher.map(teachers =>({
            teacher_id: teachers.teacher_id,
            teacher_username: teachers.teacher_username,
            first_name: teachers.first_name,
            last_name: teachers.last_name,
            subject: teachers.subject
        }))

            // Render the home page with the fetched data
            res.render('teacherArchive', {techData});
       }catch(err){
        res.render('adminUI', { message: 'An error occurred while fetching data. Please try again later.' });
       }
});






router.get('/studentArchive', isAuthenticated, async (req, res) => {
    try{

            const [student] = await db.query('SELECT * FROM student_archive');
        
            const stdData = student.map(student => ({
                studentID: student.student_id,
                firstName: student.first_name,
                lastName: student.last_name,
                middleName: student.middle_name,
                studentStrand: student.strand,
                gradeLevel: student.grade_level,
                studentSection: student.section,
                studentUsername: student.student_username,
                studentAddress: student.address,
                parentsName: student.parents_name,
                parentNumber: student.parent_number
            }));
            

            // Render the home page with the fetched data
            res.render('studentArchive', {stdData});
       }catch(err){
        res.render('adminUI', { message: 'An error occurred while fetching data. Please try again later.' });
       }
});



router.get('/archive', isAuthenticated, async (req, res) => {
    try{
        const [schedule] = await db.query('SELECT * FROM schedule_archive')
    
            const scheduleData = schedule.map(schedule =>({
               schedule_id: schedule.schedule_id,
               schedule_name: schedule.schedule_name,
               schedule_note: schedule.schedule_note,
               schedule_date: schedule.schedule_date,
               schedule_time: schedule.schedule_time,
               building: schedule.building,
               room: schedule.room
            }))
            
            res.render('archive', { scheduleData });
       }catch(err){
        res.render('adminUI', { message: 'An error occurred while fetching data. Please try again later.' });
       }


       
   
});



router.get('/adminArchive', isAuthenticated, async (req, res) => {
    try{
        const [admin] = await db.query('SELECT * FROM admin_archive')
    
            const adminData = admin.map(admin =>({
                admin_id: admin.admin_id,
               admin_username: admin.admin_username,
               admin_password: admin.admin_password,
               first_name: admin.first_name,
               last_name: admin.last_name
            }))
            
            res.render('adminArchive', { adminData });
       }catch(err){
        res.render('adminUI', { message: 'An error occurred while fetching data. Please try again later.' });
       }


       
   
});


module.exports = router;

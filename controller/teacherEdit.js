const db = require('../database/dataControl')
const bcrypt = require('bcryptjs')

exports.teacherEdit = async (req, res) => {
    const { username, ID, password, firstName, lastName, teacher_subject, Delete} = req.body

 
    if (!ID) {
       console.log("Id required");
    }


  try{
    const [teacherResult]  = await db.query('SELECT * FROM teacher WHERE teacher_id = ?', [ID])
    if (teacherResult.length === 0) {
        return console.log("Teacher not Found");
    }

   
    if (password) {
        try {
            const hashPassword = await bcrypt.hash(password, 10);
        await db.query('UPDATE teacher SET teacher_password = ? WHERE teacher_id = ?', [hashPassword, ID], (err, result) => {
                if (err) {
                    return  console.log("Change Credentials Failed: " + err);
                    
                }
                console.log("Password changed");
            });
        } catch (error) {
            return  console.log("Error hashing password: " + error);
           
        }
    }

    // Update other teacher details
  await db.query('UPDATE teacher SET first_name = ?, last_name = ?, subject = ?, teacher_username = ? WHERE teacher_id = ?', [firstName, lastName, teacher_subject, username, ID], (err, result) => {
        if (err) {
            return  console.log("Update Failed: " + err);   
        }
        return  console.log("User details changed");
    });
    
    res.redirect('/teacherAccount')

  }catch(err){
    console.log(err);
  }

        
    


}








const { query } = require('express')
const db = require('../database/dataControl')
const bcrypt = require('bcryptjs')


exports.forget = (req,res)=>{

    const {currentPassword, newPassword, confirmPassword, username} = req.body

    
    db.query('SELECT student_password, student_id, student_username FROM student WHERE student_id = ?', [username], async (err, result)=>{

       
        if(err){
            console.log(err);
        }
       const forgetResult = result[0]
        
       if(forgetResult){
            const {student_password, student_username, student_id } = forgetResult
            const unhash = await bcrypt.compare(currentPassword, student_password)

            if(unhash){
                if(newPassword === confirmPassword){
                    const newPasswordHash = await bcrypt.hash(newPassword, 8)
                    db.query('UPDATE student SET student_password = ? WHERE student_id = ?', [newPasswordHash, username], (err,result)=>{
                        if(err){
                            console.log(err);
                        }
                        console.log("change password");

                    })
                }
                else{
                    console.log('unseccessful');
                }
            }
       }
       else{
        console.log('unseccessful');
       }

    } )

}
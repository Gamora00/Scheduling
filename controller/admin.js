const db = require('../database/dataControl');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')



exports.admin = (req, res)=>{
    
    const {username, password, confirmpassword, 
        firstname, lastname,} = req.body
            
        db.query('SELECT admin_password FROM student WHERE admin_password = ?', [password], async (err, result)=>{
            if(err){
                console.log(err);
            }
            
          if(password !== confirmpassword){
                return res.render('adminRegister', {
                    message: 'Password do not match'
                })
            }
            else if(username === '' || 
                    password === '' || confirmpassword === ''||
                     firstname === ''||
                    lastname === '' ){
                        return res.render('adminRegister', {
                            message: 'Please fill out the form'
                        })
                    }

            let hashedPassowrd = await bcrypt.hash(password, 8)
            db.query('INSERT INTO admin SET ?', {
                admin_username: username, 
                admin_password: hashedPassowrd,
                first_name: firstname,
                last_name: lastname, 
                
                 
            }, (err, result)=>{
                if(err){
                    console.log(err);
                }else{
                    console.log(result);
                    return res.render('adminUI', {
                        successfully: 'User Registered'
                    })
                   
                }
            })
        })

}
const db = require('../database/dataControl');
const bcrypt = require('bcryptjs');

exports.adminEdit = async (req, res) => {
    const { username, ID, password, firstName, lastName } = req.body;

    if (!ID) {
        console.log("Id required");
        return res.status(400).send("Id required");
    }

    try {
        const [adminResult] = await db.query('SELECT * FROM admin WHERE admin_id = ?', [ID]);
        if (adminResult.length === 0) {
            console.log("Admin not found");
            return res.status(404).send("Admin not found");
        }

       
        if (password) {
            try {
                const hashPassword = await bcrypt.hash(password, 10);
                await db.query('UPDATE admin SET admin_password = ? WHERE admin_id = ?', [hashPassword, ID]);
                console.log("Password changed");
            } catch (error) {
                console.log("Error hashing password: ", error);
                return res.status(500).send("Error hashing password");
            }
        }

        
        await db.query('UPDATE admin SET first_name = ?, last_name = ?, admin_username = ? WHERE admin_id = ?', [firstName, lastName, username, ID]);
        console.log("User details changed");

        
        res.redirect('/adminAccounts');
    } catch (err) {
        console.log("Database error: ", err);
        res.status(500).send("Database error");
    }
};

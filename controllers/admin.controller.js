import db from "../database/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"

// const adminLogin = async(req,res)=> {
//     try {
//         // take these values from frontend
//         const { email,password} = req.body;
    
//         // Check if the Admin already registered or not and we will check it through email
//         const emailExistsQuery = `SELECT * FROM admin WHERE email=?`
//         const emailExistsValue = [email];
//         const [existingRows] = await connectDB.query(emailExistsQuery,emailExistsValue);
        
//         if(existingRows > 0){
//             return res.status(400).json({msg: "Admin with this email already exists",existingRows});
//         }
    
//         // Now bcrypt the password
//         const hashPasssword = await bcrypt.hash(password,10);
    
//         const query = `INSERT INTO admin (username, email, password) VALUES(?,?,?)`
//         const values = [username,email,hashPasssword];
//         const [row] = await connectDB.query(query,values);
    
//         if(row.affectedRows === 0){
//             throw new Error(400, "Error in insertion of registerAdmin");
//         }else{
//             return res.status(200).json({msg: "Admin registered successfully", row})
//         }
//     } catch (error) {
//         console.log(error);
//         throw new Error("Error in registerAdmin ",error);
        
//     }
// }


const generateToken = async(adminObj)=>{
    try {
        const payload = {
            email: adminObj.email
        };
        return jwt.sign(payload,process.env.SECRET_KEY,{ expiresIn: process.env.EXPIRES_IN});
    } catch (error) {
        console.log("error in token genertion",error);
   }
}

const adminLogin = async (req, res) => {
    const { email, password } = req.body;
    const connection = await db.connectDB();
    const query = `SELECT * FROM users WHERE email = ?`;
    const values = [email];
   
    
    try {
        const [row] = await connection.query(query, values);
        const {is_Admin} = row[0];

        if (row.length === 0) {
            return res.status(400).json({ msg: "Email is incorrect" });
        }

        // Verify password
        const hashPassword = row[0].password;
        const isPasswordValid = await bcrypt.compare(password, hashPassword);

        if (!isPasswordValid) {
            return res.status(400).json({ msg: "Email or password is incorrect" });
        }
       const admin = row[0];

         //generate token
        const token = await generateToken(admin);
        console.log("token",token);
        admin.token = token;

        console.log("admin after token generation",admin);
        
        const cookieOptions = {
            expires: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
            httpOnly: true,
            secure: true,

        }

        

        console.log("isAdmin",is_Admin);
        if (is_Admin === 1) {
            return res.status(200).cookie("token",token,cookieOptions).json({msg: "Admin logged in",admin});
            //return res.status(200).json({ msg: "Admin logged in successfully", row });
        } else {
            return res.status(400).json({ msg: "You do not have admin privileges" });
        }
    } catch (error) {
        console.log("Error in adminLogin", error);
        return res.status(500).json({ msg: "Internal server error" });
    }
};


//============================== Fetch All users API ==================================================
    const fetchAllUsers = async(req,res)=> {
        try {
            const query = `SELECT * FROM users`
            const connection = await db.connectDB();
            const [row] =  await connection.query(query);
            // console.log("row[0]",row[0]);
            // console.log("row",row);
        
            if(row.length === 0){
                return res.status(400).json({msg: "can not fetch"});
            }else{
                
                    console.log(row);
                    return res.status(200).json({msg: "All users are fetched",row})
               
            }
        } catch (error) {
            console.log("error in fetching", error);
            return res.status(500).json({msg: "Internal server error"});
        }
    }


//==================================== update any user ================================================
    const updateUserByAdmin = async(req,res)=> {
        try {
            const {is_Admin} = req.user;
            console.log("isAdmin",is_Admin);


            const {user_id} = req.params;
            const {username} = req.body; 
            const query = `update users SET username=? WHERE user_id=?`
            const values = [username,user_id];
            const connection = await db.connectDB();
            const [row] = await connection.query(query,values);

            if(row.length === 0){
                return res.status(400).json({msg: "User not updated"});
            }else{
                return res.status(200).json({msg: "user updated successfully by admin",row});
            }
        } catch (error) {
            return res.status(500).json({msg: "Interval server error",error});
        }
    }



//======================================== updateAll users Api ======================================================    


const updateAllUsers = async (req,res) => {
    try {
        const{newUsername} = req.body;
        // Connect to the database
        const connection = await db.connectDB();

        // Fetch all users from the database
        const query = "SELECT * FROM users";
        const [rows] = await connection.query(query);

        // Loop through each user and update their username
        for (const user of rows) {
            const userId = user.user_id;
            const updatedUsername = newUsername; // Set the new username here

            // Update the user's username in the database
            const updateQuery = "UPDATE users SET username = ? WHERE user_id = ?";
            const updateValues = [updatedUsername, userId];
            await connection.query(updateQuery, updateValues);

            console.log(`Username updated for user with ID ${userId}`);
        }

        return res.status(200).json({msg: "All usernames updated successfully"});
    } catch (error) {
        console.error("Error updating usernames:", error);
    }
};



export{
    //registerAdmin,
    adminLogin,
    fetchAllUsers,
    updateUserByAdmin,
    updateAllUsers
}
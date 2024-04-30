import db from "../database/db.js"
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
//import { sendMail } from "./sendMail.js";

//const db = await connectDB();
dotenv.config();

// generate token method
const generateToken = async(userObj)=>{
    try {
        const payload = {
            email: userObj.email
        };
        return jwt.sign(payload,process.env.SECRET_KEY,{ expiresIn: process.env.EXPIRES_IN});
    } catch (error) {
        
    }
}



//============================ Send Mail =================================================

    
//=============================== addUser API===========================================
const addUser = async(req,res)=> {
    try {
        const {username, email, password, mobileNo,is_Admin} = req.body;

        const connection = await db.connectDB();
        
        // check if email already exists in database or not?
        const emailExixtsQuery = `SELECT * FROM users WHERE email=?`;
        const emailExistsValues = [email];
        const [existingRows] = await connection.query(emailExixtsQuery,emailExistsValues);

        if(existingRows.length > 0){
            return res.status(400).json({error: "user with this email already exists"});
        }

        // image upload
        const avatarLocalPath = req.files?.avatar[0]?.path;
        console.log("avatar",avatarLocalPath);
        if(!avatarLocalPath){
            throw new Error("avatar not found");
        }

        const avatar = await uploadOnCloudinary(avatarLocalPath);


        // encrypting password
        const hashPassword = await bcrypt.hash(password,10);

        const query = `INSERT INTO users(username, email, password, mobileNo, is_Admin, avatar) VALUES(?,?,?,?,?,?)`
        const values = [username, email, hashPassword, mobileNo,is_Admin, avatar.url || ""];

        const[row] = await connection.query(query,values);

        if(row.affectedRows === 0){
            throw new Error(400, "failed to add user");
        }else{
            //sendMail();
            return res.status(200).json({msg: "User added successfully",row})
        }
    } catch (error) {
        console.log("Error in add user method",error);
        return res.status(500).json({error: "Internal server error"});
        
    }
}

//========================================= Login API =============================================

const loginUser = async(req,res)=> {
        const {email, password} = req.body;

        const connection = await db.connectDB();

        const query = `SELECT * FROM users WHERE email=?`
        const values = [email];

         
        
        const [rows] = await connection.query(query,values);
        const user = rows[0];
        console.log("user",user);

        if(!user){
            return res.status(400).json({error: "user does not exists"});
        }

        // Check if the password is correct
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: "Invalid password" });
        }


        // token generation
        const token = await generateToken(user);
        console.log("token",token);
        user.token = token;

        console.log("user after token generation",user);
        
        const cookieOptions = {
            expires: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
            httpOnly: true,
            secure: true,

        }

        return res.status(200).cookie("token",token,cookieOptions).json({msg: "User logged in",user});

    
}


//============================ getAllUser Api =============================================


    const  getAllUser = async(req,res)=> {
        try {
            console.log("inside getAllUSers")
            const connection = await db.connectDB();
            console.log("after connection var")
            const query = `SELECT * FROM users`
           // const values = []
            const [row] = await connection.query(query);
            console.log("in")

            if(row.length === 0){
                return res.status(400).json({message: "Data not fetched"});
            }else{
                return res.status(200).json({message: "Data fetched successfully", data: row});
            }
        } catch (error) {
            console.log("Error in fetching users",error);
            return res.status(500).json({msg: "Interval server error", error});
        }
    }


    // const getAllUser = async (req, res) => {
    //     try {
    //         //const connection = await db.connectDB(); // Await the connection promise
    //         // Check if the connection object is valid
    //         // if (!connection || typeof connection.query !== 'function') {
    //         //     throw new Error('Invalid database connection');
    //         // }
    
    //         const query = `SELECT * FROM users`;
    //         const [rows] = await db.query(query);
    
    //         if (rows.length === 0) {
    //             return res.status(400).json({ message: 'Data not fetched' });
    //         } else {
    //             return res.status(200).json({ message: 'Data fetched successfully', data: rows });
    //         }
    //     } catch (error) {
    //         console.log('Error in fetching users', error);
    //         return res.status(500).json({ msg: 'Internal server error', error: error.message });
    //     }
    // };
    

    


// =========================================== update Password API  ================================================================

const updatePassword = async (req, res) => {
    try {
        const { oldPassword, email, newPassword } = req.body;
        const connection = await db.connectDB();

        // Check if user exists
        const userQuery = `SELECT * FROM users WHERE email=?`;
        const userValues = [email];
        const [userRow] = await connection.query(userQuery, userValues);

        if (userRow.length === 0) {
            return res.status(400).json({ msg: "User does not exist" });
        }

        // Verify old password
        const isPasswordValid = await bcrypt.compare(oldPassword, userRow[0].password);
        if (!isPasswordValid) {
            return res.status(400).json({ msg: "Old password is incorrect" });
        }

        // Hash new password
        const hashPassword = await bcrypt.hash(newPassword, 10);

        // Update password in the database
        const updateQuery = `UPDATE users SET password=? WHERE email=?`;
        const updateValues = [hashPassword, email];
        const [updateRow] = await connection.query(updateQuery, updateValues);

        if (updateRow.affectedRows > 0) {
            return res.status(200).json({ msg: "Password updated successfully" });
        } else {
            return res.status(500).json({ msg: "Failed to update password" });
        }
    } catch (error) {
        console.log("Error updating password:", error);
        return res.status(500).json({ msg: "Internal server error" });
    }
};










// ========================================== Delete user API ======================================================    

    const deleteUser = async(req,res)=> {
        const {user_id} = req.params
        const connection = await db.connectDB();
        const query = `DELETE FROM users WHERE user_id=?`
        const value = [user_id];
        const [row] = await connection.query(query,value);

        if (row.affectedRows === 0) {
            return res.status(404).json({ error: "User not found or already deleted" });
        }

        return res.status(200).json({user: user_id, msg: "User deleted successfully",row});
    }



//=================================== update User api ====================================================
// {
//     "fieldsToUpdate": {
//         "username": "urvashi Batra"
//     }
// }


    const updateUser = async(req,res)=> {
        const connection = await db.connectDB();
        const {user_id} = req.params;
        const {fieldsToUpdate } = req.body;
        console.log("Fields to update:",fieldsToUpdate)
        // Construct the SET clause dynamically based on the fields to update
        const setClause = Object.keys(fieldsToUpdate).map(key => `${key} = ?`).join(', ');
        const values = [...Object.values(fieldsToUpdate), user_id];
        //values.push(user_id); // Add user ID to the end of the values array

        const query = `UPDATE users SET ${setClause} WHERE user_id=?`;
        const [row] = await connection.query(query,values);

        return res.status(200).json({msg: "user updated successfully", row});
    }

export  {
    addUser,
    loginUser,
    deleteUser,
    updateUser,
    updatePassword,
    getAllUser
}
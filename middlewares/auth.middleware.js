import jwt from "jsonwebtoken";
import db from "../database/db.js";
import dotenv from "dotenv";

dotenv.config();

const verifyJWT = async(req,res,next)=> {
    try {
        let token = req.cookies.token || (req.headers.authorization && 
            req.headers.authorization.replace("Bearer",""));
    
        if(!token){
            throw new Error("Token not found");
        }
    
        const decodedTokenValue = jwt.verify(token,process.env.SECRET_KEY)
        console.log("DECODED TOKEN VALUE",decodedTokenValue );
    
        const query = `SELECT * FROM users WHERE email=?`
        const value = [decodedTokenValue.email];
        const connection = await db.connectDB();
        const [row] = await connection.query(query,value);
    
        const user = row[0];
       // console.log("user",user);
        // const {is_Admin} = row[0]
        // console.log("isAdmin",is_Admin)
    
        if(!user){
            throw new Error("User not found");
        }
        
            req.user = user;
            console.log("req.user: ",user);
            next();
       
    } catch (error) {
        console.log("error in auth middleware");
        throw new Error(error.message);
    }

};

export {verifyJWT};


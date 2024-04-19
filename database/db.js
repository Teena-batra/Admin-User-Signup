import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async()=> {
    try {
        const pool =  mysql.createPool({
            host: process.env.HOST,
            user: process.env.USER,
            password: process.env.PASSWORD,
            database: process.env.DATABASE
        })
        console.log("mysql connected successfully");
        return pool;
    } catch (error) {
        throw new Error(400,"Database not connected");
    }
}

//const db = await connectDB();
export default {
    connectDB
}
import express from "express";
import dotenv from "dotenv";
import db from "./database/db.js"
import adminRouter from "./routes/adminRoutes.js"
import userRouter from "./routes/userRouter.js"
import cookieParser from "cookie-parser";
import cors from "cors"
import { sendMail } from "./controllers/sendMail.js";
dotenv.config();

const app = express();

app.use(cors());
db.connectDB();
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

const port = process.env.PORT;

// admin routes
//app.use("/api/admin",adminRouter);


// user routes
app.use("/api/users",userRouter)

// admin routes
app.use("/api/admin",adminRouter);

app.listen(port, ()=> {
    console.log(`Server is listening on port: ${port}`)
})




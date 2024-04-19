import { adminLogin, fetchAllUsers, updateAllUsers, updateUserByAdmin } from "../controllers/admin.controller.js";
import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { updatePassword } from "../controllers/userController.js";

const router = express.Router();

//router.post("/registerAdmin",registerAdmin);
router.post("/login",adminLogin);
router.get("/fetch",fetchAllUsers);
router.put("/updateUser/:user_id",verifyJWT,updateUserByAdmin);
router.put("/updateAll",updateAllUsers);

export default router;
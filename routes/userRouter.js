import express from "express";

const router = express.Router();

import {addUser, deleteUser, getAllUser, loginUser, updatePassword, updateUser} from "../controllers/userController.js"

import {upload} from "../middlewares/multer.middleware.js"
import { sendMail } from "../controllers/sendMail.js";

router.post("/addUser",
    upload.fields([
        {name: "avatar", maxCount: 1}
    ]),
addUser)

router.post("/loginUser",loginUser);
router.delete("/delete/:user_id",deleteUser);
router.patch("/update/:user_id",updateUser);
router.put("/updatePassword",updatePassword);
router.post("/mail",sendMail);
router.get("/fetch",getAllUser);

export default router;
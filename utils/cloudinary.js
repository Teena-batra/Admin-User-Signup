import {v2 as cloudinary} from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({ 
    cloud_name: 'dhbsycptz', 
    api_key: '664653393139338', 
    api_secret: 'jvNNY9298tzAfNhIjxo440qL1y8' 
  });


  const uploadOnCloudinary = async (localFilePath) => {
     console.log(localFilePath)
    try {
        if (!localFilePath) {
            throw new Error("local file path not found");
        }
        console.log("hello in cloudinary fn")
        // upload on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });

        // console.log("Response for cloudinary upload",response);
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath); // delete file from your temp folder because this is a temp file
        } else {
            throw new Error("File doesnt exists")
        }
        return response;
    } catch (error) {
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath); // delete file from your temp folder in case of error
        }
        throw new Error(error.message);
    }
}

export {uploadOnCloudinary}
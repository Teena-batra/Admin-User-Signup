// import nodemailer from "nodemailer";
// import dotenv from "dotenv";
// import mailgen from "mailgen";
// dotenv.config();

// export const sendMail = async(req,res)=> {
 
// try {
//     const {email} = req.body;
//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       host: "smtp.google.com",
//       port: 587,
//       secure: false, // Use `true` for port 465, `false` for all other ports
//       auth: {
//         user: process.env.GMAIL,
//         pass: process.env.MAIL_PASS,
//       },
//     });
    
//     // async..await is not allowed in global scope, must use a wrapper
//     const mailoptions= {
    
//         from: '"Teena Batra" <teenabatra01@gmail.com>', // sender address
//         to: email, // list of receivers
//         subject: "Registered successfully using nodemail", // Subject line
//         text: "Hello! You are welcome here.", // plain text body
//         html: "<b>Hello world</b>", // html body
//     }
    
//     // Send mail
//     const info = await transporter.sendMail(mailoptions);
//     console.log("Email sent successfully:", info.messageId);
//   } catch (error) {
//     console.error("Error sending email:", error);
//   }
// }

  
import nodemailer from 'nodemailer';
import Mailgen from 'mailgen';

import dotenv from "dotenv";
dotenv.config();


// https://ethereal.email/create
let nodeConfig = {
    service:"gmail",
    host: "smtp.google.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.GMAIL, // generated ethereal user
        pass: process.env.MAIL_PASS, // generated ethereal password
    }
}

let transporter = nodemailer.createTransport(nodeConfig);

let MailGenerator = new Mailgen({
    theme: "default",
    product : {
        name: "Mailgen",
        link: 'https://mailgen.js/'
    }
})

/** POST: http://localhost:8080/api/registerMail 
 * @param: {
  "username" : "example123",
  "userEmail" : "admin123",
  "text" : "",
  "subject" : "",
}
*/
export const sendMail = async (req, res) => {
    console.log("in");
    const { username, email,text, subject } = req.body;
    //console.log(req.body);
    // body of the email
    var email1 = {
        body : {
            name: username,
            intro : text || 'Welcome to Nodemailer ! We\'re very excited to have you on board.',
            outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
        }
    }
    //console.log(email1);

    var emailBody = MailGenerator.generate(email1);

    let message = {
        from : process.env.GMAIL,
        to: email,
        subject : subject || "Signup Successful",
        html : emailBody
    }

    //console.log(message);
    // send mail
    transporter.sendMail(message)
        .then(() => {
            console.log("insied transporter");
            return res.status(200).send({ msg: "You should receive an email from us."})
            // console.log("outside transporter");

        })
        .catch(error => res.status(500).send({ error }))

}


const { response } = require('express');
const { transporter } = require('../Config/email');

const mailOption = async (email, verifyCode)=>{
    try {
        const response = await transporter.sendMail({
            from: '"Mayank Sharma" <msharma7055084627@gmail.com>',
            to: email,
            subject: 'Email Verification',
            text: 'Related for Email verifiaction ',
            html: verifyCode,
        })
    } catch (error) {
        console.log("The Error in EmailSender: ", error);
        return false;
    }
}

module.exports = { mailOption };
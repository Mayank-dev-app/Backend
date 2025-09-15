const express = require("express");
const {
  userData,
  verifyUSer,
  ResendCode,
  usersignIn,
  sendchangePasswordcontroller,
  changePassword,
  handleLogout,
} = require("../controller/userinfo");
const { jwtauthmiddleware } = require("../jwt/jwt");

const router = express.Router();

router.get("/", (req, res) => {
  res.status(201).send({
    success: true,
    message: "the is Home Path",
  });
});

//Create user Account
router.post("/user", userData);

//Login in Account
router.post("/signIn", usersignIn);

//Verfiy OTP
router.post("/verifyuser", verifyUSer);

//Resend OTP
router.post("/verify-resend", ResendCode);

//Send OtP to Change Password
router.post("/sendotpforpasword", sendchangePasswordcontroller);

//Change Password
router.post("/changePassword", changePassword);

//Logout Api
router.post("/logout",jwtauthmiddleware, handleLogout);
module.exports = router;

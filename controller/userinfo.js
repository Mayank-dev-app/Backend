const user = require("../Models/Database");
const { mailOption } = require("../controller/emailSender");
const bcrypt = require("bcrypt");
const { generateToken } = require("../jwt/jwt");

const userData = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;
    const normalizeEmail = email.toLowerCase();
    if (!name || !username || !email || !password) {
      return res.status(401).send({
        success: false,
        message: "Please Fill all information",
      });
    }

    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expire = new Date(Date.now() + 2 * 60 * 1000);

    const salt = await bcrypt.genSalt(10);
    const hassPassword = await bcrypt.hash(password, salt);
    const hasotp = await bcrypt.hash(verifyCode, salt);
    const newUser = await user.create({
      name,
      username,
      email: normalizeEmail,
      password: hassPassword,
      expire,
      verifyCode: hasotp,
    });

    await mailOption(email, verifyCode);
    return res.status(201).send({
      success: true,
      message: "Your Data is submited",
      newUser,
      verifyCode,
    });
  } catch (error) {
    console.log("userData have some Error", error);
    return res.status(500).send({
      success: false,
      message: "Userdata Have some error",
    });
  }
};

/*--------------------- User SignIN -----------------------------*/

const usersignIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizeEmail = email.toLowerCase();
    if (!normalizeEmail || !password) {
      return res.status(400).send({
        success: false,
        message: "Please fill all information",
      });
    }
    console.log("Login Input:", { normalizeEmail, password });
    const exitUser = await user.findOne({ email: normalizeEmail });
    console.log("Found user:", exitUser);
    if (!exitUser) {
      return res.status(401).send({
        success: false,
        message: "User not found",
      });
    }

    const ispassword = await bcrypt.compare(password, exitUser.password);
    console.log("Password match:", ispassword);
    if (!ispassword) {
      return res.status(401).send({
        success: false,
        message: "Pasword is incorrect",
      });
    }

    //  If user is NOT verified, send OTP
    if (!exitUser.isverified) {
      const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
      const salt = await bcrypt.genSalt(10);
      const hashedOtp = await bcrypt.hash(verifyCode, salt);
      const expire = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes

      await mailOption(email, verifyCode);
      exitUser.expire = expire;
      exitUser.verifyCode = hashedOtp;
      await exitUser.save();

      return res.status(200).send({
        success: true,
        message: "OTP sent to your email for verification",
      });
    }

    //CREATE JSON WEB TOKEN
    const payload = {
      id: exitUser._id,
      name: exitUser.name,
    };
    const token = generateToken(payload);
    console.log(token);
    return res.status(201).send({
      success: true,
      message: "You Are already Login",
      token,
      userId: exitUser._id,
      user: {
        name: exitUser.name,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error in signIn Account",
    });
  }
};

/*------------------------ Verify User --------------------------*/

const verifyUSer = async (req, res) => {
  try {
    const { email, verifyCode } = req.body;
    const normalizeEmail = email.toLowerCase();
    if (!normalizeEmail || !verifyCode) {
      return res.status(401).send({
        success: false,
        message: "Please All inputs",
      });
    }

    const exitUser = await user.findOne({ email: normalizeEmail });
    if (!exitUser) {
      return res.status(401).send({
        success: false,
        message: "User not found pls try Again",
      });
    }

    if (!exitUser.expire || Date.now() > new Date(exitUser.expire).getTime()) {
      return res.status(401).send({
        success: false,
        message: "Your OTP is expired or invalid",
      });
    }

    const ismatch = await bcrypt.compare(verifyCode, exitUser.verifyCode);
    if (!ismatch) {
      return res.status(401).send({
        success: false,
        message: "Your OTP or email may be Wrong pls try again",
      });
    }
    exitUser.verifyCode = null;
    exitUser.isverified = true;
    exitUser.expire = undefined;

    //CREATE JSON WEB TOKEN
    const payload = {
      id: exitUser._id,
      name: exitUser.name,
    };
    const token = generateToken(payload);
    console.log(token);
    await exitUser.save();
    return res.status(201).send({
      success: true,
      message: "You Verification successfully completed",
      token,
      userId: exitUser._id,
      username:  exitUser.name,
    });
  } catch (error) {
    console.log("Error in Otp Verification: ", error);
    return res.status(500).send({
      success: false,
      message: "OtP Verifiaction Have some error",
    });
  }
};

//-----------------------Resend verification Code----------------------------

const ResendCode = async (req, res) => {
  try {
    const { email } = req.body;
    const normalizeEmail = email.toLowerCase();
    if (!email) {
      return res.status(401).send({
        success: false,
        message: "Please give Email your email so that we send message",
      });
    }

    const existingUser = await user.findOne({ email: normalizeEmail });
    if (!existingUser) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expire = new Date(Date.now() + 2 * 60 * 1000);

    const salt = await bcrypt.genSalt(10);
    const hasotp = await bcrypt.hash(verifyCode, salt);

    existingUser.expire = expire;
    existingUser.verifyCode = hasotp;
    await existingUser.save();
    await mailOption(email, verifyCode);

    return res.status(201).send({
      success: true,
      message: "You Email send a verification code",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Somthing is error in server - Resend code ",
    });
  }
};

const sendchangePasswordcontroller = async (req, res) => {
  try {
    const { email } = req.body;
    const normalizeEmail = email.toLowerCase();
    if (!email) {
      return res.status(401).send({
        success: false,
        message: "Please Give your Email Id",
      });
    }

    const exitUSer = await user.findOne({ email: normalizeEmail });
    if (!exitUSer) {
      return res.status(404).send({
        success: false,
        message: "User not Found",
      });
    }

    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    const salt = await bcrypt.genSalt(10);
    const hasCode = await bcrypt.hash(verifyCode, salt);
    const expire = new Date(Date.now() + 2 * 60 * 1000);

    exitUSer.verifyCode = hasCode;
    exitUSer.expire = expire;
    await mailOption(email, verifyCode);
    await exitUSer.save();

    return res.status(201).send({
      success: true,
      message: "Send an otp to your email Account",
      verifyCode,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Somthing is error in server - Send change Password ",
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const { email, verifyCode, password } = req.body;
    const normalizeEmail = email.toLowerCase();
    if (!email || !verifyCode || !password) {
      return res.status(401).send({
        success: false,
        message: "Please Give All inputes Filled",
      });
    }

    const exitUser = await user.findOne({ email: normalizeEmail });
    if (!exitUser) {
      return res.status(401).send({
        success: false,
        message: "User Not Found",
      });
    }

    if (!exitUser.expire || Date.now() > new Date(exitUser.expire).getTime()) {
      return res.status(401).send({
        success: false,
        message: "Your OTP is expired or invalid",
      });
    }

    const ismatch = await bcrypt.compare(verifyCode, exitUser.verifyCode);

    if (!ismatch) {
      return res.status(401).send({
        success: false,
        message: "Your OTP is wrong",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hassPassword = await bcrypt.hash(password, salt);

    exitUser.password = hassPassword;
    exitUser.verifyCode = null;
    exitUser.expire = null;

    await exitUser.save();
    return res.status(201).send({
      success: true,
      message: "Your password is successfully change",
      password,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Somthing is error in server - change Password ",
    });
  }
};

const handleLogout = async (req, res) => {
  try {
    const userId = req.user._id;
    await user.findByIdAndUpdate(userId, { isverified: false });
    res.clearCookie("token");

    return res.status(200).send({
      success: true,
      message: "User logged out successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Somthing is error in server - LogOut Function ",
    });
  }
};

module.exports = {
  userData,
  verifyUSer,
  ResendCode,
  usersignIn,
  sendchangePasswordcontroller,
  changePassword,
  handleLogout,
};

const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const secretKey = process.env.secret_KEY;
const jwtauthmiddleware =async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // ✅ Check if Authorization header exists and is in correct format
    if (!authHeader || typeof authHeader !== "string" || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authorization header missing or malformed",
      });
    }

    const token = authHeader.split(" ")[1]; // ✅ now it's safe
    const decoded = await jwt.verify(token, secretKey);

    req.user = { _id: decoded.id };
    next();
  } catch (error) {
    console.error("JWT Middleware Error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};



if (!secretKey) {
  console.log("secret key is not set");
}

const generateToken = (userinfo) => {
  return jwt.sign(userinfo, secretKey);
};

module.exports = { jwtauthmiddleware, generateToken };

// Use require to ensure compatibility with CommonJS modules
const jwt = require('jsonwebtoken');
const dotenv = require("dotenv");

// Ensure environment variables are loaded
dotenv.config();

const generateToken = async function (user: any) {
  try {
    const payload = user;
    // Use the same JWT secret as in config.json
    const jwtSecret = "myjwtsecret"; 
    // Default expiration time if none is provided
    const expirationTime = "24h";

    const token = jwt.sign(payload, jwtSecret, {
      expiresIn: expirationTime,
    });

    return token;
  } catch (e: any) {
    console.error("Error generating token:", e);
    throw e;
  }
};

const verifyToken = async function (token: any) {
  try {
    // Use the same JWT secret as in config.json
    const jwtSecret = "myjwtsecret";
    const decoded = jwt.verify(token, jwtSecret);
    return decoded;
  } catch (e: any) {
    console.error("Error verifying token:", e);
    return e;
  }
};

export { generateToken, verifyToken };

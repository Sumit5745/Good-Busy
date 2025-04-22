import moment from "moment";

const generateOtp = async (n: number) => {
  const val =
    Math.floor(Math.random() * (9 * Math.pow(10, n - 1))) + Math.pow(10, n - 1);
  return val;
};

const otpExpire = () => {
  const time = moment(new Date())
    .add(global.config?.OTP_EXPIRE_TIME || 5, "minutes")
    .format("YYYY-MM-DD HH:mm:ss");
  return time;
};

// Simple password hashing function
const encrypt = async (password: string) => {
  try {
    if (!password) {
      throw new Error("Password cannot be empty");
    }

    // Create a simple hash (not for production use)
    // In production, you should use a proper password hashing library
    const salt = generateSalt(16);
    const hash = simpleHash(password + salt);

    return `${salt}:${hash}`;
  } catch (error) {
    console.error("Error encrypting password:", error);
    throw error;
  }
};

// Generate a random salt string
function generateSalt(length) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Simple string hashing function
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  // Convert to positive hex string
  return Math.abs(hash).toString(16);
}

const otpExpTime = async () => {
  const time = moment(new Date())
    .add(global.config?.OTP_EXPIRE_TIME || 5, "minutes")
    .format("YYYY-MM-DD HH:mm:ss");
  return time;
};

const comparePassword = async (
  plainPassword: string,
  storedPassword: string
) => {
  try {
    if (!plainPassword || !storedPassword) {
      return false;
    }

    // Split the stored password into salt and hash
    const [salt, storedHash] = storedPassword.split(":");

    if (!salt || !storedHash) {
      return false;
    }

    // Hash the provided password with the same salt
    const hash = simpleHash(plainPassword + salt);

    // Compare the generated hash with the stored hash
    return hash === storedHash;
  } catch (error) {
    console.error("Error comparing passwords:", error);
    return false;
  }
};

const getPagination = (page: number, size: number) => {
  const limit = size;
  const Page = page || 1;
  const offset = (Page - 1) * limit;
  return { limit, offset };
};

const parseJSON = (data: any, fallback: any) => {
  try {
    return data ? JSON.parse(data) : fallback;
  } catch (error) {
    console.error("JSON Parsing Error:", error);
    return fallback;
  }
};

export {
  generateOtp,
  encrypt,
  otpExpTime,
  comparePassword,
  getPagination,
  otpExpire,
  parseJSON,
};

const axios = require('axios');

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOTP(mobile, otp) {
  try {
    const response = await axios.post(
      "https://www.fast2sms.com/dev/bulkV2",
      {
        route: "q",
        message: `Your OTP is ${otp}`,
        language: "english",
        numbers: mobile
      },
      {
        headers: {
          authorization: process.env.FAST2SMS_API_KEY || "YOUR_FAST2SMS_API_KEY",
          "Content-Type": "application/json"
        }
      }
    );
    return true;
  } catch (error) {
    console.log("OTP ERROR:", error.message);
    return false;
  }
}

module.exports = { generateOTP, sendOTP };

const dotenv = require("dotenv").config();
const axios = require("axios");

module.exports = async function (context) {
  context.log("Attempting to obtain access token from PayPal");

  const response = await axios({
    method: "post",
    url: `${process.env.PAYPAL_BASE_URL}/v1/oauth2/token`,
    data: "grant_type=client_credentials",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
      "Accept-Language": "en_US",
    },
    auth: {
      username: process.env.PAYPAL_CLIENT_ID,
      password: process.env.PAYPAL_CLIENT_SECRET,
    },
  });

  context.log("Successfully obtained access token from PayPal");
  
  return response.data.access_token;
};

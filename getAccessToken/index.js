const dotenv = require('dotenv').config();
const axios = require('axios');

module.exports = async function (context) {
  const { instanceId } = context.bindingData.args;

  try {
    context.log(`Starting getAccessToken Paypal API query for instance = '${instanceId}'.`);
    
    const response = await axios({
      method: 'post',
      url: `${process.env.PAYPAL_BASE_URL}/v1/oauth2/token`,
      data: {
        grant_type: 'client_credentials',
        ignoreCache: true,
      },
      headers: {
        Accept: '*/*',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept-Language': 'en_US',
      },
      auth: {
        username: process.env.PAYPAL_CLIENT_ID,
        password: process.env.PAYPAL_SECRET,
      },
    });
  
    context.log(`getAccessToken succeeded for ID = '${instanceId}'.`)
  
    return response.data.access_token;
  } catch (err) {
    context.log(`getAccessToken failed for ID = '${instanceId}'. ${err}`)
    return null;
  }
};

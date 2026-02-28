const axios = require('axios');

async function test() {
  try {
    // 1. Log in to get the token
    const loginRes = await axios.post('http://127.0.0.1:5002/api/v1/auth/login', {
      email: 'merchant@ibank.com',
      password: 'password123'
    });
    const token = loginRes.data.token;
    console.log("Got token length:", token.length);

    // 2. Try to hit the protected Merchant route
    const keyRes = await axios.post('http://127.0.0.1:5002/api/v1/business/api/generate-key', {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Success! Key:", keyRes.data.data.apiKey);

  } catch (err) {
    console.error("Failed:", err.response ? err.response.data : err.message);
  }
}
test();

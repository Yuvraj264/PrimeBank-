const axios = require('axios');
(async () => {
  try {
    const login = await axios.post('http://localhost:5002/api/v1/auth/login', {email:'admin@primebank.com', password:'password123'});
    const token = login.data.token;
    console.log("Got token.");
    const res = await axios.get('http://localhost:5002/api/v1/analytics/dashboard', {headers:{Authorization: `Bearer ${token}`}});
    console.log("Success:", Object.keys(res.data.data));
  } catch (e) {
    console.error("Error:", e.message);
    if(e.response) console.error(e.response.data);
  }
})();

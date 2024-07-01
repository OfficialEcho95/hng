const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config(); 

const app = express();
const PORT = process.env.PORT || 3000;
const apiKey = process.env.API_KEY;

app.get('/api/hello', async (req, res) => {
    const visitorName = req.query.visitor_name;
    let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    // to handle IPv6 addresses
    if (ip.startsWith('::ffff:')) {
        ip = ip.substring(7);
    }
    // if (ip === '::1') {
    //     ip = '105.113.114.123';
    // }

    try {
        const locationResponse = await axios.get(`https://ipapi.co/${ip}/json/`);
        console.log('Location Response:', locationResponse.data);

        const city = locationResponse.data.city;
        const temperatureResponse = await axios.get(`https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}`);
        console.log('Temperature Response:', temperatureResponse.data);

        const temperature = temperatureResponse.data.current.temp_c;

        res.status(200).json({
            client_ip: ip,
            location: city,
            greeting: `Hello, ${visitorName}!, the temperature is ${temperature} degrees Celsius in ${city}`
        });
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Error retrieving location or temperature data' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

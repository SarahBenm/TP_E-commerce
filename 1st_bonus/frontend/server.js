const express = require('express');
const axios = require('axios');
const app = express();
const path = require('path');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Proxy to Flask backend
app.post('/create-payment-intent', async (req, res) => {
    try {
        const response = await axios.post('http://localhost:5000/create-payment-intent', req.body);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/generate-invoice', async (req, res) => {
    try {
        const response = await axios.post('http://localhost:5000/generate-invoice', req.body);
        res.send(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/products', async (req, res) => {
    try {
        const response = await axios.get('http://localhost:5000/products');
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.listen(3000, () => {
    console.log('Frontend running on http://localhost:3000');
});
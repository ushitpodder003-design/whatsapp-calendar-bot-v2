require('dotenv').config();
const express = require('express');
const webhookHandler = require('./src/handlers/webhook');
const authHandler = require('./src/handlers/auth');

const app = express();

app.use(express.json());

app.use((req, res, next) => {
    console.log(`📨 ${req.method} ${req.path}`);
    next();
});

app.get('/', (req, res) => {
    res.send('My backend server is running');
});

app.post('/webhook', (req, res, next) => {
    console.log('🔌 POST /webhook route handler called');
    next();
}, webhookHandler);
app.get('/auth/callback', authHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

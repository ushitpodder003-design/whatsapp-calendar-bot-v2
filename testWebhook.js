require('dotenv').config();
const webhookHandler = require('./src/handlers/webhook');

// Create mock request and response
const mockReq = {
    body: {
        Body: "Show my calendar",
        From: "whatsapp:+918866461678"
    }
};

const mockRes = {
    status: function(code) {
        this.statusCode = code;
        return this;
    },
    json: function(data) {
        console.log('Response:', JSON.stringify(data, null, 2));
    }
};

console.log('Testing webhook handler directly...\n');
webhookHandler(mockReq, mockRes);

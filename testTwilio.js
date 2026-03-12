require('dotenv').config();
const { sendWhatsAppMessage } = require('./src/services/twilio');

const testTwilio = async () => {
    try {
        console.log('Testing Twilio WhatsApp service...');
        const result = await sendWhatsAppMessage('+918866461678', 'Hello from WhatsApp Bot!');
        console.log('Test successful:', result);
    } catch (error) {
        console.error('Test failed:', error.message);
    }
};

testTwilio();

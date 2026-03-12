const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;

console.log('🔧 Twilio initialized:', { accountSid: accountSid ? 'SET' : 'NOT SET', authToken: authToken ? 'SET' : 'NOT SET', whatsappNumber });

const client = twilio(accountSid, authToken);

const sendWhatsAppMessage = async (to, message) => {
    try {
        console.log(`📱 Attempting to send WhatsApp message to ${to}`);
        console.log(`📝 Message content: ${message.substring(0, 100)}...`);
        
        const result = await client.messages.create({
            from: `whatsapp:${whatsappNumber}`,
            to: `whatsapp:${to}`,
            body: message
        });
        console.log(`✅ Message sent successfully. SID: ${result.sid}`);
        return result;
    } catch (error) {
        console.error('❌ Error sending WhatsApp message:', error.message);
        console.error('❌ Full error:', error);
        throw error;
    }
};

module.exports = {
    sendWhatsAppMessage
};

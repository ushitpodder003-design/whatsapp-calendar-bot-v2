const webhookHandler = require('./src/handlers/webhook');
console.log('Webhook handler type:', typeof webhookHandler);
console.log('Webhook handler name:', webhookHandler.name);
console.log('Is async:', webhookHandler.constructor.name);

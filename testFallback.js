require('dotenv').config();
const { detectIntent } = require('./src/services/intentDetector');
const { detectIntentLocal } = require('./src/services/intentDetectorLocal');

const testMessage = "Help";

console.log('Testing detect intent with fallback:\n');

(async () => {
    try {
        console.log('Trying Claude...');
        const intent = await detectIntent(testMessage);
        console.log('✅ Claude worked:', intent);
    } catch (error) {
        console.log('❌ Claude failed:', error.message.substring(0, 100));
        console.log('\nFalling back to local detector...');
        const localIntent = detectIntentLocal(testMessage);
        console.log('✅ Local detector result:',localIntent);
    }
})();

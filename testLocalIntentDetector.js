const { detectIntentLocal } = require('./src/services/intentDetectorLocal');

console.log('Testing Local Intent Detector (No API Calls Needed)\n');

const testMessages = [
    "Schedule a team meeting tomorrow at 2pm",
    "Show my calendar",
    "Cancel the sprint planning meeting",
    "Reschedule standup to next Monday 10am",
    "Help me with the commands",
    "Call Rahul today at 4pm",
    "Help"
];

testMessages.forEach(msg => {
    const intent = detectIntentLocal(msg);
    console.log(`📱 "${msg}"`);
    console.log(`   Intent: ${intent.intent}`);
    if (intent.title) console.log(`   Title: ${intent.title}`);
    if (intent.timePhrase) console.log(`   Time: ${intent.timePhrase}`);
    if (intent.keyword) console.log(`   Keyword: ${intent.keyword}`);
    console.log('');
});

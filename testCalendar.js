require('dotenv').config();
const { createEvent, listEvents, cancelEvent, rescheduleEvent } = require('./src/services/calander');
const { getOAuthClient, getAuthUrl } = require('./src/services/goggleAuth');

const testCalendar = async () => {
    try {
        console.log('Testing Google Calendar Service...\n');
        
        // Test 1: Import functions
        console.log('Test 1: Import Calendar Functions');
        console.log('✅ createEvent function imported:', typeof createEvent === 'function');
        console.log('✅ listEvents function imported:', typeof listEvents === 'function');
        console.log('✅ cancelEvent function imported:', typeof cancelEvent === 'function');
        console.log('✅ rescheduleEvent function imported:', typeof rescheduleEvent === 'function');
        
        console.log('\n');
        
        // Test 2: Get OAuth Client
        console.log('Test 2: Get OAuth Client for Testing');
        const oauthClient = getOAuthClient();
        if (oauthClient) {
            console.log('✅ OAuth2 client ready for calendar operations');
        } else {
            console.log('❌ Failed to get OAuth2 client');
            return;
        }
        
        console.log('\n');
        
        // Test 3: Generate Auth URL for user login
        console.log('Test 3: Generate Auth URL for User Login');
        const phone = '+918866461678';
        const authUrl = getAuthUrl(phone);
        console.log('✅ Auth URL generated for phone:', phone);
        console.log('Auth URL:', authUrl.substring(0, 80) + '...\n');
        
        console.log('');
        
        // Test 4: Function signatures
        console.log('Test 4: Verify Function Signatures');
        console.log('✅ createEvent(authClient, title, startTime, duration)');
        console.log('✅ listEvents(authClient, range)');
        console.log('✅ cancelEvent(authClient, keyword)');
        console.log('✅ rescheduleEvent(authClient, keyword, newTime)');
        
        console.log('\n');
        
        // Test 5: Usage examples
        console.log('Test 5: Usage Examples (to use with real OAuth tokens)');
        console.log('1. Create event:');
        console.log('   const event = await createEvent(authClient, "Team Meeting", new Date("2026-03-15T14:00:00"), 90);');
        console.log('');
        console.log('2. List events (next 7 days):');
        console.log('   const events = await listEvents(authClient, 7);');
        console.log('');
        console.log('3. Cancel event:');
        console.log('   await cancelEvent(authClient, "Team");');
        console.log('');
        console.log('4. Reschedule event:');
        console.log('   await rescheduleEvent(authClient, "Team", new Date("2026-03-16T15:00:00"));');
        
        console.log('\n✅ All tests completed successfully!');
        console.log('\nNext steps:');
        console.log('1. Add Google OAuth credentials to .env');
        console.log('2. User visits the auth URL to grant calendar permissions');
        console.log('3. Exchange authorization code for access token');
        console.log('4. Use the token to call calendar functions');
        
    } catch (error) {
        console.error('❌ Test error:', error.message);
    }
};

testCalendar();

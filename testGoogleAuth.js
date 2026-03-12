require('dotenv').config();
const { getOAuthClient, getAuthUrl } = require('./src/services/goggleAuth');

const testGoogleAuth = () => {
    try {
        console.log('Testing Google OAuth2 Service...\n');
        
        // Test 1: Get OAuth Client
        console.log('Test 1: Get OAuth Client');
        const oauthClient = getOAuthClient();
        if (oauthClient) {
            console.log('✅ OAuth2 client created successfully');
            console.log('Client ID:', oauthClient._clientId ? 'Loaded' : 'Missing');
            console.log('Client Secret:', oauthClient._clientSecret ? 'Loaded' : 'Missing');
            console.log('Redirect URI:', oauthClient._redirectURL ? 'Loaded' : 'Missing');
        } else {
            console.log('❌ Failed to create OAuth2 client');
        }
        
        console.log('\n');
        
        // Test 2: Generate Auth URL
        console.log('Test 2: Generate Auth URL');
        const phone = '+918866461678';
        const authUrl = getAuthUrl(phone);
        if (authUrl) {
            console.log('✅ Auth URL generated successfully');
            console.log('URL:', authUrl.substring(0, 100) + '...');
            console.log('State parameter (phone):', phone);
        } else {
            console.log('❌ Failed to generate auth URL');
        }
        
        console.log('\n');
        
        // Test 3: Check URL contains calendar scope
        console.log('Test 3: Verify Calendar Scope');
        if (authUrl.includes('calendar')) {
            console.log('✅ Calendar scope is included in auth URL');
        } else {
            console.log('❌ Calendar scope not found in auth URL');
        }
        
    } catch (error) {
        console.error('❌ Test error:', error.message);
    }
};

testGoogleAuth();

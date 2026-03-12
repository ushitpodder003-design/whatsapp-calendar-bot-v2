const { getOAuthClient } = require('../services/goggleAuth');
const db = require('../db/database');
const { sendWhatsAppMessage } = require('../services/twilio');

const authHandler = async (req, res) => {
    try {
        const code = req.query.code;
        const phone = req.query.state;

        // Validate required parameters
        if (!code || !phone) {
            return res.status(400).json({
                error: 'Missing authorization code or phone number'
            });
        }

        console.log('Processing OAuth callback for phone:', phone);

        // Get OAuth client and exchange code for tokens
        const oauthClient = getOAuthClient();
        
        const { tokens } = await oauthClient.getToken(code);
        
        console.log('Tokens received:', tokens.access_token ? 'access_token received' : 'no access_token');
        
        // Extract tokens
        const accessToken = tokens.access_token;
        const refreshToken = tokens.refresh_token;
        const expiryDate = tokens.expiry_date;

        // Store tokens in SQLite database
        db.run(
            'INSERT OR REPLACE INTO users (phone, access_token, refresh_token, expiry_date) VALUES (?, ?, ?, ?)',
            [phone, accessToken, refreshToken, expiryDate],
            (err) => {
                if (err) {
                    console.error('Error storing tokens in database:', err.message);
                    return res.status(500).json({
                        error: 'Failed to store authentication tokens'
                    });
                }

                console.log('Tokens stored for phone:', phone);

                // Send success message to user via WhatsApp
                const successMessage = `✅ Authentication successful! Your calendar is now connected to this WhatsApp bot. You can now manage your calendar via WhatsApp.`;
                
                sendWhatsAppMessage(phone, successMessage)
                    .then(() => {
                        console.log('Success message sent to:', phone);
                    })
                    .catch((error) => {
                        console.error('Error sending WhatsApp message:', error.message);
                    });

                // Return success response
                res.json({
                    success: true,
                    message: 'Authentication successful! Check your WhatsApp for confirmation.'
                });
            }
        );

    } catch (error) {
        console.error('Auth handler error:', error.message);
        res.status(500).json({
            error: 'Authentication failed',
            details: error.message
        });
    }
};

module.exports = authHandler;

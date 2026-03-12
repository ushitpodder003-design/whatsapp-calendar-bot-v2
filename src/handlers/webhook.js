const { detectIntent } = require('../services/intentDetector');
const { detectIntentLocal } = require('../services/intentDetectorLocal');
const { sendWhatsAppMessage } = require('../services/twilio');
const { getOAuthClient, getAuthUrl } = require('../services/goggleAuth');
const { createEvent, listEvents, cancelEvent, rescheduleEvent } = require('../services/calander');
const db = require('../db/database');

const webhookHandler = async (req, res) => {
    console.log('🔔 WEBHOOK REQUEST RECEIVED');
    try {
        // Extract data from Twilio webhook
        const messageText = req.body.Body;
        const senderPhone = req.body.From.replace('whatsapp:', '');

        console.log(`📱 Message from ${senderPhone}: ${messageText}`);

        // Detect intent - try Claude first, fallback to local detector
        let intent;
        try {
            intent = await detectIntent(messageText);
            console.log('🧠 Detected intent (Claude):', intent.intent);
        } catch (error) {
            console.log('⚠️ Claude unavailable, using local intent detector:', error.message);
            intent = detectIntentLocal(messageText);
            console.log('🧠 Detected intent (Local):', intent.intent);
        }

        // Convert callback-based db.get to Promise
        const getUser = () => {
            return new Promise((resolve, reject) => {
                db.get('SELECT access_token, refresh_token FROM users WHERE phone = ?', [senderPhone], (err, row) => {
                    console.log('🔍 Database query resolved:', err ? 'ERROR' : 'SUCCESS');
                    if (err) reject(err);
                    else resolve(row);
                });
            });
        };

        try {
            console.log('⏳ Querying database for user...');
            const row = await getUser();
            console.log('✅ Database query complete. User found:', !!row);

            // User not authenticated
            if (!row|| !row.access_token) {
                console.log('🔐 User not authenticated. Sending auth link.');
                const authUrl = getAuthUrl(senderPhone);
                const authMessage = `👋 Hi! To use the calendar bot, please authenticate your Google account:\n\n${authUrl}`;
                
                // Send response immediately, then send message in background
                console.log('📤 Sending HTTP response (unauthenticated)');
                res.status(200).json({ success: true });
                console.log('📤 HTTP Response sent!');
                
                // Send auth message with better error handling
                console.log('💬 Attempting to send auth WhatsApp message...');
                sendWhatsAppMessage(senderPhone, authMessage)
                    .then(result => {
                        console.log('✅ Auth message sent successfully!');
                    })
                    .catch(msgError => {
                        console.error('❌ CRITICAL: Error sending auth message:', msgError.message);
                        console.error('❌ Full error:', msgError);
                    });
                return;
            }

            console.log('✅ User authenticated. Processing intent...');
            // User is authenticated, proceed with calendar operations
            const oauthClient = getOAuthClient();
            oauthClient.setCredentials({
                access_token: row.access_token,
                refresh_token: row.refresh_token
            });

            let replyMessage = '';

            try {
                switch (intent.intent) {
                    case 'CREATE':
                        console.log('⚙️ Processing CREATE intent');
                        if (!intent.title || !intent.timePhrase) {
                            replyMessage = '❌ Please provide event title and time. Example: "Schedule Team Meeting tomorrow at 2pm"';
                        } else {
                            // Pass the string directly - createEvent will parse it
                            await createEvent(oauthClient, intent.title, intent.timePhrase, intent.duration);
                            replyMessage = `✅ Event "${intent.title}" created for ${intent.timePhrase}`;
                        }
                        break;

                    case 'LIST':
                        console.log('⚙️ Processing LIST intent');
                        const events = await listEvents(oauthClient, 7);
                        if (events.length === 0) {
                            replyMessage = '📅 No upcoming events in the next 7 days.';
                        } else {
                            const eventList = events.map(e => `• ${e.summary} - ${e.start.dateTime || e.start.date}`).join('\n');
                            replyMessage = `📅 Your upcoming events:\n\n${eventList}`;
                        }
                        break;

                    case 'CANCEL':
                        console.log('⚙️ Processing CANCEL intent');
                        if (!intent.keyword) {
                            replyMessage = '❌ Please specify which event to cancel. Example: "Cancel Team Meeting"';
                        } else {
                            const cancelled = await cancelEvent(oauthClient, intent.keyword);
                            replyMessage = cancelled 
                                ? `✅ Event "${cancelled.summary}" has been cancelled.`
                                : `❌ Event not found with keyword "${intent.keyword}"`;
                        }
                        break;

                    case 'RESCHEDULE':
                        console.log('⚙️ Processing RESCHEDULE intent');
                        if (!intent.keyword || !intent.timePhrase) {
                            replyMessage = '❌ Please specify event and new time. Example: "Reschedule Team Meeting to tomorrow 3pm"';
                        } else {
                            // Pass the string directly - rescheduleEvent will handle parsing
                            const rescheduled = await rescheduleEvent(oauthClient, intent.keyword, intent.timePhrase);
                            replyMessage = rescheduled
                                ? `✅ Event "${rescheduled.summary}" rescheduled to ${intent.timePhrase}`
                                : `❌ Event not found with keyword "${intent.keyword}"`;
                        }
                        break;

                    case 'HELP':
                        console.log('⚙️ Processing HELP intent');
                        replyMessage = `📖 Available commands:
• Create: "Schedule [event] at [time]"
• List: "Show my events" or "What's on my calendar"
• Cancel: "Cancel [event]"
• Reschedule: "Move [event] to [time]"
• Help: "Help"`;
                        break;

                    default:
                        console.log('⚙️ Unknown intent:', intent.intent);
                        replyMessage = '❓ I didn\'t understand that. Type "Help" for available commands.';
                }

                console.log('📤 Sending HTTP response (authenticated)');
                // Send response immediately, then send message in background
                res.status(200).json({ success: true });
                console.log('📤 HTTP Response sent!');
                
                // Send WhatsApp message with better error handling
                console.log('💬 Attempting to send WhatsApp reply...');
                sendWhatsAppMessage(senderPhone, replyMessage)
                    .then(result => {
                        console.log('✅ WhatsApp message sent successfully!');
                    })
                    .catch(msgError => {
                        console.error('❌ CRITICAL: Error sending WhatsApp message:', msgError.message);
                        console.error('❌ Full error:', msgError);
                    });

            } catch (error) {
                console.error('❌ Error processing intent:', error.message);
                console.log('📤 Sending error response');
                res.status(200).json({ success: false });
                console.log('📤 Error response sent!');
                
                // Send error message with better error handling
                console.log('💬 Attempting to send error WhatsApp message...');
                sendWhatsAppMessage(senderPhone, '❌ Error processing your request. Please try again.')
                    .then(result => {
                        console.log('✅ Error message sent successfully!');
                    })
                    .catch(msgError => {
                        console.error('❌ CRITICAL: Error sending error message:', msgError.message);
                        console.error('❌ Full error:', msgError);
                    });
            }
        } catch (dbError) {
            console.error('❌ Database error:', dbError.message);
            console.log('📤 Sending database error response');
            res.status(200).json({ success: false });
            console.log('📤 Database error response sent!');
            sendWhatsAppMessage(senderPhone, 'An error occurred. Please try again.').catch(msgError => {
                console.error('⚠️ Error sending WhatsApp message:', msgError.message);
            });
        }

    } catch (error) {
        console.error('❌ Webhook handler error:', error.message);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
};

module.exports = webhookHandler;

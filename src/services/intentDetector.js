const Anthropic = require('@anthropic-ai/sdk');

const detectIntent = async (message) => {
    try {
        const client = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY
        });
        const systemPrompt = `You are a WhatsApp calendar bot assistant. Analyze the user's message and extract their intent.

Return ONLY valid JSON (no other text) with this exact structure:
{
  "intent": "CREATE" | "LIST" | "CANCEL" | "RESCHEDULE" | "HELP" | "UNKNOWN",
  "title": "event title or empty string",
  "timePhrase": "time description like '2pm tomorrow' or empty string",
  "duration": number in minutes or 0,
  "keyword": "main action keyword or empty string"
}

Intent meanings:
- CREATE: User wants to create a new calendar event
- LIST: User wants to see their calendar events
- CANCEL: User wants to cancel an event
- RESCHEDULE: User wants to reschedule an event
- HELP: User needs help
- UNKNOWN: Cannot determine intent`;

        const response = await client.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 200,
            system: systemPrompt,
            messages: [
                {
                    role: 'user',
                    content: message
                }
            ]
        });

        const responseText = response.content[0].text.trim();
        const result = JSON.parse(responseText);
        
        return result;
    } catch (error) {
        console.error('Error detecting intent:', error.message);
        throw error;
    }
};

module.exports = {
    detectIntent
};

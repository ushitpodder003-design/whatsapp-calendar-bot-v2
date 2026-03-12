// Simple keyword-based intent detector (no API calls needed)
const detectIntentLocal = (message) => {
    const msg = message.toLowerCase();
    
    // CANCEL intent (check before CREATE since it might contain "meeting")
    if (msg.includes('cancel') || msg.includes('delete') || msg.includes('remove')) {
        const keywordRegex = /(?:cancel|delete|remove)\s+(?:the\s+)?(.+?)(?:\s+(?:meeting|call|event)?$)/i;
        return {
            intent: 'CANCEL',
            title: '',
            timePhrase: '',
            duration: 0,
            keyword: keywordRegex.exec(msg)?.[1] || ''
        };
    }
    
    // RESCHEDULE intent (check before CREATE)
    if (msg.includes('reschedule') || msg.includes('move') || msg.includes('change') || msg.includes('postpone')) {
        const keywordRegex = /(?:reschedule|move|change|postpone)\s+(?:the\s+)?(.+?)\s+(?:to|on)\s+/i;
        const timeRegex = /(?:to|on)\s+(.+?)(?:\s|$)/i;
        return {
            intent: 'RESCHEDULE',
            title: '',
            timePhrase: timeRegex.exec(msg)?.[1] || 'tomorrow',
            duration: 0,
            keyword: keywordRegex.exec(msg)?.[1] || ''
        };
    }
    
    // CREATE intent - expanded keywords to include call, book, remind
    if (msg.includes('schedule') || msg.includes('create') || msg.includes('add') || 
        msg.includes('meeting') || msg.includes('event') || msg.includes('call') || 
        msg.includes('book') || msg.includes('remind') || msg.includes('conference')) {
        // Extract time phrases
        const timeRegex = /(?:tomorrow|today|next|at|on)\s+(?:\d{1,2}(?:am|pm)?|morning|afternoon|evening)/i;
        const titleRegex = /(?:schedule|create|add|book|call|remind)\s+(?:a\s+|an\s+)?(.+?)(?:\s+(?:at|on|tomorrow|today|next)|$)/i;
        
        let title = titleRegex.exec(msg)?.[1] || 'Event';
        title = title.charAt(0).toUpperCase() + title.slice(1); // Capitalize first letter
        
        return {
            intent: 'CREATE',
            title: title,
            timePhrase: timeRegex.exec(msg)?.[0] || 'tomorrow',
            duration: 60,
            keyword: ''
        };
    }
    
    // LIST intent
    if (msg.includes('list') || msg.includes('show') || msg.includes('events') || 
        msg.includes('calendar') || msg.includes('upcoming') || msg.includes('schedule')) {
        return {
            intent: 'LIST',
            title: '',
            timePhrase: '',
            duration: 0,
            keyword: ''
        };
    }
    
    // HELP intent
    if (msg.includes('help') || msg.includes('command') || msg.includes('what can') || 
        msg.includes('how do') || msg.includes('guide') || msg.includes('info')) {
        return {
            intent: 'HELP',
            title: '',
            timePhrase: '',
            duration: 0,
            keyword: ''
        };
    }
    
    // UNKNOWN intent
    return {
        intent: 'UNKNOWN',
        title: '',
        timePhrase: '',
        duration: 0,
        keyword: ''
    };
};

module.exports = {
    detectIntentLocal
};

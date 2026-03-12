const { google } = require('googleapis');

const calendar = google.calendar('v3');

// Parse relative time phrases into Date objects
const parseTimePhrase = (phrase) => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const timeRegex = /(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i;
    const match = timeRegex.exec(phrase);
    
    let hour = match ? parseInt(match[1]) : 14; // Default to 2pm
    const minute = match ? (match[2] ? parseInt(match[2]) : 0) : 0;
    const period = match ? (match[3] ? match[3].toLowerCase() : '') : '';
    
    if (period === 'pm' && hour !== 12) hour += 12;
    if (period === 'am' && hour === 12) hour = 0;
    
    let targetDate = phrase.toLowerCase().includes('today') ? now : tomorrow;
    if (phrase.toLowerCase().includes('next')) {
        targetDate = new Date(tomorrow);
        targetDate.setDate(targetDate.getDate() + 6);
    }
    
    targetDate.setHours(hour, minute, 0, 0);
    return targetDate;
};

const createEvent = async (authClient, title, startTime, duration = 60) => {
    try {
        // Handle string time phrases
        if (typeof startTime === 'string') {
            startTime = parseTimePhrase(startTime);
        }
        
        const endTime = new Date(new Date(startTime).getTime() + duration * 60000);
        
        const event = {
            summary: title,
            start: {
                dateTime: new Date(startTime).toISOString(),
                timeZone: 'Asia/Kolkata' // Set timezone to India (IST)
            },
            end: {
                dateTime: endTime.toISOString(),
                timeZone: 'Asia/Kolkata' // Set timezone to India (IST)
            }
        };

        const result = await calendar.events.insert({
            auth: authClient,
            calendarId: 'primary',
            resource: event
        });

        console.log('Event created:', result.data.id);
        return result.data;
    } catch (error) {
        console.error('Error creating event:', error.message);
        throw error;
    }
};

const listEvents = async (authClient, range = 7) => {
    try {
        const now = new Date();
        const endDate = new Date(now.getTime() + range * 24 * 60 * 60 * 1000);

        const result = await calendar.events.list({
            auth: authClient,
            calendarId: 'primary',
            timeMin: now.toISOString(),
            timeMax: endDate.toISOString(),
            singleEvents: true,
            orderBy: 'startTime'
        });

        console.log(`Found ${result.data.items.length} events`);
        return result.data.items;
    } catch (error) {
        console.error('Error listing events:', error.message);
        throw error;
    }
};

const cancelEvent = async (authClient, keyword) => {
    try {
        const events = await listEvents(authClient);
        
        const eventToCancel = events.find(event => 
            event.summary && event.summary.toLowerCase().includes(keyword.toLowerCase())
        );

        if (!eventToCancel) {
            console.log('Event not found with keyword:', keyword);
            return null;
        }

        await calendar.events.delete({
            auth: authClient,
            calendarId: 'primary',
            eventId: eventToCancel.id
        });

        console.log('Event cancelled:', eventToCancel.summary);
        return eventToCancel;
    } catch (error) {
        console.error('Error cancelling event:', error.message);
        throw error;
    }
};

const rescheduleEvent = async (authClient, keyword, newTime) => {
    try {
        // Handle string time phrases
        if (typeof newTime === 'string') {
            newTime = parseTimePhrase(newTime);
        }

        const events = await listEvents(authClient);
        
        const eventToReschedule = events.find(event => 
            event.summary && event.summary.toLowerCase().includes(keyword.toLowerCase())
        );

        if (!eventToReschedule) {
            console.log('Event not found with keyword:', keyword);
            return null;
        }

        const duration = eventToReschedule.end && eventToReschedule.start 
            ? (new Date(eventToReschedule.end.dateTime) - new Date(eventToReschedule.start.dateTime)) / 60000
            : 60;

        const endTime = new Date(new Date(newTime).getTime() + duration * 60000);

        const updatedEvent = {
            ...eventToReschedule,
            start: {
                dateTime: new Date(newTime).toISOString(),
                timeZone: 'UTC'
            },
            end: {
                dateTime: endTime.toISOString(),
                timeZone: 'UTC'
            }
        };

        const result = await calendar.events.update({
            auth: authClient,
            calendarId: 'primary',
            eventId: eventToReschedule.id,
            resource: updatedEvent
        });

        console.log('Event rescheduled:', result.data.summary);
        return result.data;
    } catch (error) {
        console.error('Error rescheduling event:', error.message);
        throw error;
    }
};

module.exports = {
    createEvent,
    listEvents,
    cancelEvent,
    rescheduleEvent
};

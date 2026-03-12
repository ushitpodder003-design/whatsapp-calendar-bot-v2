const { google } = require('googleapis');

const calendar = google.calendar('v3');

// Parse relative time phrases into Date objects for IST timezone
const parseTimePhrase = (phrase) => {
    console.log('🕐 Parsing time phrase:', phrase);
    
    // Create dates in IST by working with UTC and adjusting for IST offset (UTC+5:30)
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Improved regex to handle various formats: "10am", "10 am", "10:30am", "10:30 am"
    const timeRegex = /(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i;
    const match = timeRegex.exec(phrase);
    
    let hour = match ? parseInt(match[1]) : 14; // Default to 2pm
    const minute = match ? (match[2] ? parseInt(match[2]) : 0) : 0;
    const period = match ? (match[3] ? match[3].toLowerCase() : '') : '';
    
    console.log(`⏰ Extracted: hour=${match ? match[1] : 'none'}, minute=${match ? match[2] || 0 : 'none'}, period=${period}`);
    
    // Convert 12-hour to 24-hour format
    let finalHour = hour;
    if (period === 'pm' && hour !== 12) finalHour = hour + 12;
    if (period === 'am' && hour === 12) finalHour = 0;
    
    // Determine target date
    let targetDate = phrase.toLowerCase().includes('today') ? new Date(now) : new Date(tomorrow);
    if (phrase.toLowerCase().includes('next')) {
        targetDate = new Date(tomorrow);
        targetDate.setDate(targetDate.getDate() + 6);
    }
    
    // Set the time - this creates a "wall clock" time that we'll treat as IST
    targetDate.setHours(finalHour, minute, 0, 0);
    
    // Convert to UTC by subtracting IST offset (UTC+5:30)
    // This ensures when Google Calendar sees this as IST, it shows the correct time
    const istOffset = 5 * 60 + 30; // IST is UTC+5:30 in minutes
    const utcTime = new Date(targetDate.getTime() - istOffset * 60000);
    
    console.log(`✅ Wall clock time (IST): ${targetDate.toLocaleString('en-IN')}`);
    console.log(`✅ UTC time sent to Calendar: ${utcTime.toISOString()}`);
    return utcTime;
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

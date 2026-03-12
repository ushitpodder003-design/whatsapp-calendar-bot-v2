// Test the time parsing logic without needing a full server setup

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

// Test cases
const testCases = [
    { input: 'at 2pm', expected: '14:00' },
    { input: 'at 10am', expected: '10:00' },
    { input: 'today at 5pm', expected: '17:00' },
    { input: 'at 3:30pm', expected: '15:30' },
    { input: 'tomorrow at 2pm', expected: '14:00' },
    { input: 'at 12pm', expected: '12:00' },
    { input: 'at 12am', expected: '00:00' },
];

console.log('Testing parseTimePhrase function:\n');

testCases.forEach(test => {
    const result = parseTimePhrase(test.input);
    const hours = String(result.getHours()).padStart(2, '0');
    const minutes = String(result.getMinutes()).padStart(2, '0');
    const time = `${hours}:${minutes}`;
    const isCorrect = time === test.expected ? '✅' : '❌';
    console.log(`${isCorrect} Input: "${test.input}" → ${time} (expected ${test.expected})`);
});

console.log('\n✨ All parsing tests completed!');

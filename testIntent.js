require('dotenv').config();
const { detectIntent } = require('./src/services/intentDetector');

async function test() {
  try {
    console.log('Testing Intent Detector...\n');
    
    // Test 1: Create event
    console.log('Test 1: Create event');
    const result1 = await detectIntent('Schedule a meeting with rahul tomorrow at 3pm');
    console.log(result1, '\n');
    
    // Test 2: List events
    console.log('Test 2: List events');
    const result2 = await detectIntent('Show me my calendar');
    console.log(result2, '\n');
    
    // Test 3: Cancel event
    console.log('Test 3: Cancel event');
    const result3 = await detectIntent('Cancel my 2pm meeting');
    console.log(result3, '\n');
    
    // Test 4: Help
    console.log('Test 4: Help');
    const result4 = await detectIntent('How do I use this bot?');
    console.log(result4, '\n');
  } catch (error) {
    console.error('Test error:', error.message);
  }
}

test();
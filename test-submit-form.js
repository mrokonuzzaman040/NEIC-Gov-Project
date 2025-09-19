// Test script for submit form validation
const fetch = require('node-fetch');

async function testSubmitForm() {
  console.log('🧪 Testing Submit Form Validation...\n');
  
  const baseUrl = 'http://localhost:3000/api/submit';
  
  // Test 1: Valid submission without file
  console.log('📝 Test 1: Valid submission without file');
  try {
    const validData = {
      name: 'John Doe',
      phone: '01712345678',
      email: 'john@example.com',
      shareName: true,
      message: 'This is a valid test message with sufficient content to meet minimum requirements.'
    };
    
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validData)
    });
    
    const result = await response.json();
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, result);
    console.log(result.ok ? '✅ PASSED' : '❌ FAILED');
  } catch (error) {
    console.log('❌ ERROR:', error.message);
  }
  
  console.log('\n---\n');
  
  // Test 2: Invalid phone number
  console.log('📝 Test 2: Invalid phone number');
  try {
    const invalidPhoneData = {
      name: 'Jane Doe',
      phone: '123456789', // Invalid format
      email: 'jane@example.com',
      shareName: false,
      message: 'This is a test message with invalid phone number.'
    };
    
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidPhoneData)
    });
    
    const result = await response.json();
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, result);
    console.log(!result.ok && response.status === 422 ? '✅ PASSED (Correctly rejected)' : '❌ FAILED');
  } catch (error) {
    console.log('❌ ERROR:', error.message);
  }
  
  console.log('\n---\n');
  
  // Test 3: Message too short
  console.log('📝 Test 3: Message too short');
  try {
    const shortMessageData = {
      name: 'Bob Smith',
      phone: '01712345678',
      email: 'bob@example.com',
      shareName: false,
      message: 'Short' // Too short
    };
    
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(shortMessageData)
    });
    
    const result = await response.json();
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, result);
    console.log(!result.ok && response.status === 422 ? '✅ PASSED (Correctly rejected)' : '❌ FAILED');
  } catch (error) {
    console.log('❌ ERROR:', error.message);
  }
  
  console.log('\n---\n');
  
  // Test 4: Honeypot spam detection
  console.log('📝 Test 4: Honeypot spam detection');
  try {
    const spamData = {
      name: 'Spam Bot',
      phone: '01712345678',
      email: 'spam@example.com',
      shareName: false,
      message: 'This is a spam message for testing honeypot detection.',
      honeypot: 'http://spam-site.com' // This should trigger spam detection
    };
    
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(spamData)
    });
    
    const result = await response.json();
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, result);
    console.log(!result.ok && response.status === 400 ? '✅ PASSED (Correctly rejected spam)' : '❌ FAILED');
  } catch (error) {
    console.log('❌ ERROR:', error.message);
  }
  
  console.log('\n🎉 Testing completed!');
}

// Run tests
testSubmitForm().catch(console.error);

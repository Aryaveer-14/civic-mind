const BASE_URL = 'http://127.0.0.1:5000';

async function test() {
  console.log('🧪 Testing Unique Key Constraints\n');

  // Test 1: Register a new user
  console.log('Test 1: Register new user...');
  const testEmail = `test-${Date.now()}@civic.local`;
  const testContact = `555${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
  
  const user1 = {
    email: testEmail,
    name: 'Test User',
    contact_number: testContact,
    age: 25,
    locality: 'Downtown'
  };

  const res1 = await fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user1)
  });

  const data1 = await res1.json();
  console.log(`✓ User registered: ${testEmail}`);
  console.log(`  Contact: ${testContact}`);
  console.log(`  Response: ${data1.success ? '✓ Success' : '✗ Error'}\n`);

  // Test 2: Try to register with duplicate email
  console.log('Test 2: Attempt duplicate email registration...');
  const user2 = {
    email: testEmail, // SAME email
    name: 'Another User',
    contact_number: `555${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`, // Different contact
    age: 30,
    locality: 'Uptown'
  };

  const res2 = await fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user2)
  });

  const data2 = await res2.json();
  console.log(`Status: ${res2.status}`);
  console.log(`Error: ${data2.error}`);
  const emailTest = res2.status === 400 && data2.error.includes('Email');
  console.log(`✓ Duplicate email correctly rejected: ${emailTest}\n`);

  // Test 3: Try to register with duplicate contact number
  console.log('Test 3: Attempt duplicate contact number registration...');
  const user3 = {
    email: `test-${Date.now() + 1}@civic.local`, // DIFFERENT email
    name: 'Third User',
    contact_number: testContact, // SAME contact number
    age: 28,
    locality: 'Midtown'
  };

  const res3 = await fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user3)
  });

  const data3 = await res3.json();
  console.log(`Status: ${res3.status}`);
  console.log(`Error: ${data3.error}`);
  const contactTest = res3.status === 400 && data3.error.includes('Contact');
  console.log(`✓ Duplicate contact number correctly rejected: ${contactTest}\n`);

  // Test 4: Login with the first user
  console.log('Test 4: Login with registered user...');
  const loginRes = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail })
  });

  const loginData = await loginRes.json();
  console.log(`✓ Login successful: ${loginData.success}`);
  if (loginData.success) {
    console.log(`  User ID: ${loginData.user_id}`);
    console.log(`  Token: ${loginData.token.substring(0, 20)}...\n`);
  }

  console.log('📊 Summary:');
  console.log(`  Email constraint: ${emailTest ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  Contact constraint: ${contactTest ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  Login: ${loginData.success ? '✅ PASS' : '❌ FAIL'}`);
}

test().catch(err => console.error('❌ Test error:', err));

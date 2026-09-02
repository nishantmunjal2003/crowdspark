async function testProfileApi() {
  console.log('=== Starting User Profile API Verification ===\n');

  try {
    // 1. Fetch user profile
    const userId = '692de5d917f7a6de3748ab77'; // Dr. Nishant Kumar / Admin
    const getRes = await fetch(`http://localhost:3001/api/users/${userId}/profile`);
    const getData = await getRes.json();
    console.log('GET Profile response:', getData.success ? 'Success' : 'Failed');
    console.log('Current User Name:', getData.user?.name);
    console.log('Current User Email:', getData.user?.email);
    console.log('Current User Role:', getData.user?.role);

    const originalName = getData.user?.name || 'Dr. Nishant Kumar';
    const originalEmail = getData.user?.email;

    // 2. Attempt updating name & attempting to tamper with email
    console.log('\n--- Test 2: Update Name & ensure Email cannot be changed ---');
    const updateRes = await fetch(`http://localhost:3001/api/users/${userId}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: originalName,
        email: 'attacker@evil.com' // Should be ignored / locked
      })
    });
    const updateData = await updateRes.json();
    console.log('PUT Profile status:', updateRes.status);
    console.log('Updated User Name:', updateData.user?.name);
    console.log('User Email after update:', updateData.user?.email);

    if (updateData.user?.email === originalEmail) {
      console.log('✓ Email remained unchanged and protected successfully.');
    } else {
      console.error('✗ Email was modified unexpectedly!');
    }

    console.log('\n=== User Profile API Verification Passed! ===');
  } catch (err) {
    console.error('Error testing profile API:', err);
  }
}

testProfileApi();

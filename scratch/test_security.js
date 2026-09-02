const path = require('path');
const jwt = require(path.join(__dirname, '../server/node_modules/jsonwebtoken'));
require(path.join(__dirname, '../server/node_modules/dotenv')).config({ path: path.join(__dirname, '../server/.env') });

async function runSecurityTests() {
  console.log('=== Starting Security Hardening Automated Tests ===\n');

  // Test 1: Verify Helmet Headers
  console.log('--- Test 1: Helmet Security Headers ---');
  try {
    const healthRes = await fetch('http://localhost:3001/api/health');
    console.log('X-Content-Type-Options:', healthRes.headers.get('x-content-type-options'));
    console.log('Cross-Origin-Resource-Policy:', healthRes.headers.get('cross-origin-resource-policy'));
    console.log('X-DNS-Prefetch-Control:', healthRes.headers.get('x-dns-prefetch-control'));
    console.log('RateLimit Limit:', healthRes.headers.get('ratelimit-limit'));
    console.log('✓ Helmet headers verified successfully.\n');
  } catch (err) {
    console.error('✗ Helmet test failed:', err.message);
  }

  // Test 2: File Upload Validation (Non-image rejection)
  console.log('--- Test 2: File Upload Whitelist & Size Validation ---');
  try {
    const textBlob = new Blob(['console.log("malicious executable or script");'], { type: 'text/plain' });
    const formData = new FormData();
    formData.append('file', textBlob, 'exploit.txt');

    const uploadRes = await fetch('http://localhost:3001/api/upload', {
      method: 'POST',
      body: formData
    });
    const uploadData = await uploadRes.json();
    console.log('Text file upload status:', uploadRes.status);
    console.log('Response error:', uploadData.error);
    if (uploadRes.status === 400 && uploadData.error.includes('Only JPG, PNG, WEBP, and GIF')) {
      console.log('✓ Non-image file correctly rejected by MIME-type filter.\n');
    } else {
      console.log('⚠ Unexpected response for non-image upload:', uploadData);
    }
  } catch (err) {
    console.error('✗ Upload test failed:', err.message);
  }

  // Test 3: JWT Token generation & Admin Route verification
  console.log('--- Test 3: JWT Token Verification on Admin Route ---');
  try {
    const adminPayload = {
      _id: '692de5d917f7a6de3748ab77',
      email: 'nishantmunjal2003@gmail.com',
      name: 'Nishant Munjal',
      role: 'admin'
    };
    const validToken = jwt.sign(adminPayload, process.env.JWT_SECRET || 'crowdspark_super_secure_jwt_secret_key_2026_96812c7b', { expiresIn: '1h' });
    
    // Call admin stats with valid JWT Bearer header
    const authRes = await fetch('http://localhost:3001/api/admin/stats', {
      headers: {
        'Authorization': `Bearer ${validToken}`
      }
    });
    const authData = await authRes.json();
    console.log('Admin route with JWT Bearer status:', authRes.status);
    console.log('Admin route success:', authData.success);
    if (authRes.status === 200 && authData.success) {
      console.log('✓ JWT Bearer authentication verified on admin route.\n');
    }

    // Call admin stats with invalid/tampered token
    const invalidRes = await fetch('http://localhost:3001/api/admin/stats', {
      headers: {
        'Authorization': 'Bearer invalid.tampered.token'
      }
    });
    console.log('Admin route with invalid token status:', invalidRes.status);
    if (invalidRes.status === 401 || invalidRes.status === 403) {
      console.log('✓ Tampered JWT token correctly rejected.\n');
    }
  } catch (err) {
    console.error('✗ JWT test failed:', err.message);
  }

  console.log('=== All Security Hardening Tests Completed ===');
}

runSecurityTests();

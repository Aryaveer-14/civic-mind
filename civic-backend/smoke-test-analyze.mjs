import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Download image from URL
async function downloadImage(imageUrl, filename) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filename);
    https.get(imageUrl, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(filename);
      });
    }).on('error', (err) => {
      fs.unlink(filename, () => {});
      reject(err);
    });
  });
}

// Test analyze endpoint with image
async function testAnalyzeWithImage() {
  console.log('🧪 Starting smoke test for /analyze endpoint...\n');
  
  // Use a civic-related image URL (pothole/street damage)
  const imageUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Pothole_in_road%2C_near_Cratloe_-_geograph.org.uk_-_1430707.jpg/1280px-Pothole_in_road%2C_near_Cratloe_-_geograph.org.uk_-_1430707.jpg';
  const tempImagePath = path.join(__dirname, 'test-image.jpg');

  try {
    console.log('📥 Downloading test image...');
    await downloadImage(imageUrl, tempImagePath);
    console.log('✅ Image downloaded\n');

    // Read the image file
    const imageBuffer = fs.readFileSync(tempImagePath);
    console.log(`📏 Image size: ${imageBuffer.length} bytes\n`);

    // Create FormData
    const FormData = (await import('form-data')).default;
    const form = new FormData();
    form.append('text', 'There is a large pothole on Main Street that is creating a hazard for vehicles and pedestrians. It needs to be repaired urgently.');
    form.append('user_id', 'test-user-123');
    form.append('image', fs.createReadStream(tempImagePath), 'pothole.jpg');

    console.log('📤 Sending request to http://localhost:5000/analyze\n');
    const response = await fetch('http://localhost:5000/analyze', {
      method: 'POST',
      body: form,
      headers: form.getHeaders(),
      timeout: 30000
    });

    console.log(`📡 Response status: ${response.status}\n`);

    const contentType = response.headers.get('content-type');
    console.log(`Content-Type: ${contentType}\n`);

    const text = await response.text();
    console.log('📋 Response body:');
    console.log(text);

    if (response.ok) {
      try {
        const data = JSON.parse(text);
        console.log('\n✅ Analysis successful!');
        console.log('🔍 Analysis result:');
        if (data.ai_decision) {
          console.log(`  Problem: ${data.ai_decision.problem}`);
          console.log(`  Area: ${data.ai_decision.area}`);
          console.log(`  Solution: ${data.ai_decision.solution}`);
          console.log(`  Authority: ${data.ai_decision.concerned_authority}`);
          console.log(`  Contact: ${data.ai_decision.contact_information}`);
        }
      } catch (e) {
        console.log('❌ Could not parse response as JSON');
      }
    } else {
      console.log(`\n❌ Analysis failed with status ${response.status}`);
    }

    // Cleanup
    fs.unlinkSync(tempImagePath);
    console.log('\n🧹 Cleaned up temp image');

  } catch (err) {
    console.error('❌ Test failed:', err.message);
    if (fs.existsSync(tempImagePath)) {
      fs.unlinkSync(tempImagePath);
    }
    process.exit(1);
  }
}

testAnalyzeWithImage();

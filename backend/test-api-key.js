// Quick test script to verify Gemini API key
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('❌ GEMINI_API_KEY not found in environment');
  process.exit(1);
}

console.log('🔑 Testing Gemini API Key...');
console.log(`API Key (first 10 chars): ${apiKey.substring(0, 10)}...`);

const genAI = new GoogleGenerativeAI(apiKey);

// Test with gemini-1.5-flash
async function testModel(modelName) {
  try {
    console.log(`\n📝 Testing model: ${modelName}`);
    const model = genAI.getGenerativeModel({ model: modelName });
    
    const result = await model.generateContent('Say "Hello" in one word.');
    const response = await result.response;
    const text = response.text();
    
    console.log(`✅ ${modelName} works! Response: ${text.trim()}`);
    return true;
  } catch (error) {
    console.error(`❌ ${modelName} failed:`, error.message);
    return false;
  }
}

// Test multiple models
async function runTests() {
  // Try models that are actually available
  const models = [
    'gemini-2.5-flash',                    // Latest stable flash
    'gemini-2.5-flash-preview-05-20',     // Preview (confirmed working)
    'gemini-2.5-pro',                      // Latest pro
    'gemini-flash-latest',                 // Latest flash alias
    'gemini-pro-latest',                   // Latest pro alias
  ];
  let success = false;
  const workingModels = [];
  
  for (const model of models) {
    const result = await testModel(model);
    if (result) {
      success = true;
      workingModels.push(model);
    }
  }
  
  if (success) {
    console.log('\n✅ API key is valid and working!');
    console.log(`✅ Working model(s): ${workingModels.join(', ')}`);
    console.log('\n💡 Update your gemini.service.js to use one of these models:');
    workingModels.forEach(m => console.log(`   - ${m}`));
    process.exit(0);
  } else {
    console.log('\n❌ API key test failed for all models.');
    console.log('\nThe API key appears to be valid, but no models are available.');
    console.log('This might indicate:');
    console.log('  1. API key region/version mismatch');
    console.log('  2. Models not available in your region');
    console.log('  3. API key needs to be regenerated');
    console.log('\nTry generating a new API key at: https://aistudio.google.com/app/apikey');
    process.exit(1);
  }
}

runTests();


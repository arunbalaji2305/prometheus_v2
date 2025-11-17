// Test all configured models to verify they work
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('❌ GEMINI_API_KEY not found');
  process.exit(1);
}

const models = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-preview-05-20',
  'gemini-2.5-pro',
  'gemini-flash-latest',
  'gemini-pro-latest',
];

const genAI = new GoogleGenerativeAI(apiKey);

async function testModel(modelName) {
  try {
    console.log(`\n🧪 Testing: ${modelName}`);
    const model = genAI.getGenerativeModel({ model: modelName });
    
    const startTime = Date.now();
    const result = await model.generateContent('Say "OK" in one word.');
    const response = await result.response;
    const text = response.text().trim();
    const duration = Date.now() - startTime;
    
    console.log(`   ✅ SUCCESS - Response: "${text}" (${duration}ms)`);
    return { success: true, model: modelName, duration, response: text };
  } catch (error) {
    const errorMsg = error.message || String(error);
    console.log(`   ❌ FAILED - ${errorMsg.substring(0, 100)}`);
    
    // Check error type
    if (errorMsg.includes('503') || errorMsg.includes('overloaded')) {
      console.log(`   ⚠️  Model is overloaded (retryable)`);
      return { success: false, model: modelName, error: 'overloaded', retryable: true };
    } else if (errorMsg.includes('404') || errorMsg.includes('not found')) {
      console.log(`   ⚠️  Model not found`);
      return { success: false, model: modelName, error: 'not_found', retryable: true };
    } else if (errorMsg.includes('quota')) {
      console.log(`   ⚠️  Quota exceeded`);
      return { success: false, model: modelName, error: 'quota', retryable: false };
    } else {
      return { success: false, model: modelName, error: 'unknown', retryable: false };
    }
  }
}

async function runTests() {
  console.log('🔍 Testing all configured Gemini models...\n');
  console.log(`API Key: ${apiKey.substring(0, 10)}...\n`);
  
  const results = [];
  
  for (const model of models) {
    const result = await testModel(model);
    results.push(result);
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  const retryable = failed.filter(r => r.retryable);
  const nonRetryable = failed.filter(r => !r.retryable);
  
  console.log(`\n✅ Successful: ${successful.length}/${models.length}`);
  successful.forEach(r => {
    console.log(`   - ${r.model} (${r.duration}ms)`);
  });
  
  if (retryable.length > 0) {
    console.log(`\n⚠️  Retryable Errors: ${retryable.length}`);
    retryable.forEach(r => {
      console.log(`   - ${r.model}: ${r.error}`);
    });
  }
  
  if (nonRetryable.length > 0) {
    console.log(`\n❌ Non-Retryable Errors: ${nonRetryable.length}`);
    nonRetryable.forEach(r => {
      console.log(`   - ${r.model}: ${r.error}`);
    });
  }
  
  console.log('\n' + '='.repeat(60));
  
  if (successful.length > 0) {
    console.log('✅ At least one model is working!');
    console.log(`\n💡 Working models: ${successful.map(r => r.model).join(', ')}`);
    console.log('\n✅ The fallback mechanism will use these models.');
    process.exit(0);
  } else if (retryable.length > 0) {
    console.log('⚠️  All models returned retryable errors (overloaded/not found).');
    console.log('💡 The fallback mechanism will try all models in sequence.');
    console.log('💡 Try again in a few moments when the models are less busy.');
    process.exit(0);
  } else {
    console.log('❌ All models failed with non-retryable errors.');
    process.exit(1);
  }
}

runTests();


// List available models using REST API
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('❌ GEMINI_API_KEY not found');
  process.exit(1);
}

console.log('🔍 Listing available Gemini models...\n');

// Try different API versions
const apiVersions = ['v1beta', 'v1'];

async function listModels(version) {
  try {
    const url = `https://generativelanguage.googleapis.com/${version}/models?key=${apiKey}`;
    console.log(`Trying API version: ${version}`);
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (response.ok && data.models) {
      console.log(`\n✅ Found ${data.models.length} models in ${version}:\n`);
      data.models.forEach(model => {
        console.log(`  - ${model.name}`);
        if (model.supportedGenerationMethods) {
          console.log(`    Methods: ${model.supportedGenerationMethods.join(', ')}`);
        }
      });
      return data.models;
    } else {
      console.log(`❌ ${version} failed:`, data.error?.message || 'Unknown error');
      return null;
    }
  } catch (error) {
    console.log(`❌ ${version} error:`, error.message);
    return null;
  }
}

async function findWorkingModel(models) {
  if (!models || models.length === 0) {
    return null;
  }
  
  console.log('\n🧪 Testing models for generateContent support...\n');
  
  for (const model of models) {
    const modelName = model.name.replace('models/', '');
    if (model.supportedGenerationMethods?.includes('generateContent')) {
      console.log(`✅ ${modelName} supports generateContent`);
      
      // Try to use it
      try {
        const testUrl = `https://generativelanguage.googleapis.com/v1beta/${model.name}:generateContent?key=${apiKey}`;
        const testResponse = await fetch(testUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: 'Say hello' }]
            }]
          })
        });
        
        if (testResponse.ok) {
          console.log(`   ✅ ${modelName} works! Use this model name in your code.\n`);
          return modelName;
        } else {
          const errorData = await testResponse.json();
          console.log(`   ❌ ${modelName} test failed: ${errorData.error?.message || 'Unknown error'}`);
        }
      } catch (error) {
        console.log(`   ❌ ${modelName} test error: ${error.message}`);
      }
    }
  }
  
  return null;
}

async function main() {
  let allModels = [];
  
  for (const version of apiVersions) {
    const models = await listModels(version);
    if (models) {
      allModels = models;
      break;
    }
  }
  
  if (allModels.length > 0) {
    const workingModel = await findWorkingModel(allModels);
    if (workingModel) {
      console.log(`\n💡 Update gemini.service.js modelNames to: ['${workingModel}']`);
    }
  } else {
    console.log('\n❌ Could not find any available models.');
    console.log('The API key might be invalid or have restrictions.');
  }
}

main();


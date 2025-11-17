import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/env.js';
import { logger } from '../config/logger.js';
import { buildPromQLPrompt } from '../config/prompts.js';

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(config.geminiApiKey);
    this.generationConfig = {
      temperature: 0.15,
      topP: 0.9,
      topK: 40,
      candidateCount: 1,
    };
    // List of models to try in order of preference
    // Updated to use models that are actually available with this API key
    this.modelNames = [
      'gemini-2.5-flash',                    // Latest stable flash model
      'gemini-2.5-flash-preview-05-20',     // Preview version (confirmed working)
      'gemini-2.5-pro',                      // Latest pro model
      'gemini-flash-latest',                 // Latest flash (alias)
      'gemini-pro-latest',                   // Latest pro (alias)
    ];
    
    logger.info({ 
      modelsToTry: this.modelNames,
      apiKeyConfigured: !!config.geminiApiKey
    }, 'GeminiService initialized');
    this.currentModelIndex = 0;
    this.model = this.genAI.getGenerativeModel({ model: this.modelNames[this.currentModelIndex], generationConfig: this.generationConfig });
    this.isConfigured = !!config.geminiApiKey;
  }

  /**
   * Extract error message from error object, checking nested properties
   */
  extractErrorMessage(error) {
    if (!error) return 'Unknown error';
    
    // Check main message
    if (error.message) {
      return error.message;
    }
    
    // Check cause
    if (error.cause?.message) {
      return error.cause.message;
    }
    
    // Check if it's a string
    if (typeof error === 'string') {
      return error;
    }
    
    // Try to stringify
    try {
      return JSON.stringify(error);
    } catch {
      return String(error);
    }
  }

  /**
   * Check if error is a model not found error
   */
  isModelNotFoundError(error) {
    const errorMessage = this.extractErrorMessage(error).toLowerCase();
    
    return (
      errorMessage.includes('404') ||
      errorMessage.includes('not found') ||
      errorMessage.includes('not supported') ||
      errorMessage.includes('is not found for api version') ||
      (errorMessage.includes('model') && errorMessage.includes('not available'))
    );
  }

  /**
   * Check if error is a transient/retryable error (should try next model)
   */
  isRetryableError(error) {
    const errorMessage = this.extractErrorMessage(error).toLowerCase();
    
    return (
      // Service unavailable / overloaded
      errorMessage.includes('503') ||
      errorMessage.includes('service unavailable') ||
      errorMessage.includes('overloaded') ||
      errorMessage.includes('model is overloaded') ||
      errorMessage.includes('try again later') ||
      // Rate limiting (but not quota exceeded)
      (errorMessage.includes('429') && !errorMessage.includes('quota exceeded')) ||
      errorMessage.includes('rate limit') ||
      // Timeout errors
      errorMessage.includes('timeout') ||
      errorMessage.includes('timed out') ||
      // Network errors
      errorMessage.includes('econnreset') ||
      errorMessage.includes('enotfound') ||
      errorMessage.includes('network error') ||
      // Model not found (try next model)
      this.isModelNotFoundError(error)
    );
  }

  /**
   * Validate and sanitize a PromQL query
   * @param {string} promqlQuery - The PromQL query to validate
   * @returns {string} - Sanitized query
   * @throws {Error} - If query is invalid
   */
  validateAndSanitizePromQL(promqlQuery) {
    // Remove quotes if the AI added them
    promqlQuery = promqlQuery.replace(/^["']|["']$/g, '');
    
    // Remove any explanatory text that might have been added
    promqlQuery = promqlQuery.replace(/^(PromQL|Query|Output):\s*/i, '');
    
    // Check for common syntax errors that indicate invalid PromQL
    const invalidPatterns = [
      { pattern: /\bby\b\s*\[/, error: 'Invalid syntax: "by" should not be followed by square brackets. Use "by (label)" after aggregation.' },
      { pattern: /\]\s*by\s*\[/, error: 'Invalid syntax: Incorrect placement of "by" clause with square brackets.' },
      { pattern: /rate\([^)]+\)\s+by\s+[^\(]/, error: 'Invalid syntax: "by" clause must be part of an aggregation function like sum() or avg().' },
      { pattern: /\b(sum|avg|min|max|count)\s+by\s+\([^)]+\)\s+[^\(]/, error: 'Invalid syntax: Aggregation with "by" must be followed by parentheses around the expression.' },
      { pattern: /\b(sum|avg|min|max|count)\s+[^\(by]/, error: 'Invalid syntax: Aggregation operator must be followed by parentheses.' },
      { pattern: /\[[^\]]+\]\s*[\+\-\*\/]/, error: 'Invalid syntax: Cannot perform math operations directly on range vectors. Use rate() or other functions first.' },
      { pattern: /\bwithout\s*\[/, error: 'Invalid syntax: "without" should be followed by parentheses (label), not square brackets.' },
    ];

    for (const { pattern, error } of invalidPatterns) {
      if (pattern.test(promqlQuery)) {
        logger.warn({ promqlQuery, error }, 'PromQL validation failed');
        throw new Error(`Invalid PromQL syntax: ${error}`);
      }
    }

    // Check for balanced parentheses
    let parenCount = 0;
    let bracketCount = 0;
    let braceCount = 0;
    for (const char of promqlQuery) {
      if (char === '(') parenCount++;
      if (char === ')') parenCount--;
      if (char === '[') bracketCount++;
      if (char === ']') bracketCount--;
      if (char === '{') braceCount++;
      if (char === '}') braceCount--;
      if (parenCount < 0 || bracketCount < 0 || braceCount < 0) {
        throw new Error('Invalid PromQL syntax: Unbalanced parentheses, brackets, or braces');
      }
    }
    if (parenCount !== 0 || bracketCount !== 0 || braceCount !== 0) {
      throw new Error('Invalid PromQL syntax: Unbalanced parentheses, brackets, or braces');
    }

    // Ensure query contains at least a metric name or function
    if (!promqlQuery.match(/[a-zA-Z_:][a-zA-Z0-9_:]*/) && !promqlQuery.includes('(')) {
      throw new Error('Invalid PromQL: Query must contain a metric name or function');
    }

    // Check for suspicious patterns that indicate the AI might have generated prose
    if (promqlQuery.length > 500) {
      throw new Error('Generated query is too long, likely contains prose instead of PromQL');
    }
    
    if (promqlQuery.includes('  ')) {
      // Remove double spaces
      promqlQuery = promqlQuery.replace(/\s+/g, ' ').trim();
    }

    return promqlQuery;
  }

  /**
   * Convert natural language to PromQL using Gemini AI
   * @param {string} naturalLanguageQuery - User's natural language query
   * @returns {Promise<string>} - Generated PromQL query
   */
  async convertToPromQL(naturalLanguageQuery) {
    if (!this.isConfigured) {
      throw new Error('Gemini API is not configured. Please set GEMINI_API_KEY.');
    }

    const prompt = buildPromQLPrompt(naturalLanguageQuery);
    let lastError = null;
    const attemptedModels = [];

    // Try each model until one works
    for (let i = 0; i < this.modelNames.length; i++) {
      const modelName = this.modelNames[i];
      attemptedModels.push(modelName);
      
      try {
        logger.info({ 
          query: naturalLanguageQuery, 
          model: modelName,
          attempt: i + 1,
          total: this.modelNames.length
        }, 'Converting NL to PromQL');

        // Create a fresh model instance for each attempt
        const model = this.genAI.getGenerativeModel({ model: modelName, generationConfig: this.generationConfig });
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let promqlQuery = response.text().trim();

        // Clean up the response - remove any markdown formatting
        promqlQuery = promqlQuery
          .replace(/```promql\n?/gi, '')
          .replace(/```\n?/g, '')
          .replace(/^promql:\s*/i, '')
          .replace(/^output:\s*/i, '')
          .replace(/^query:\s*/i, '')
          .trim();

        // Remove any trailing punctuation that might have been added
        promqlQuery = promqlQuery.replace(/[.;,]$/, '');

        // Respect "no-answer" fallback from the prompt
        if (/^none$/i.test(promqlQuery)) {
          const noAnswerError = new Error('The request is too vague or out-of-scope to generate a safe PromQL query. Please specify a metric (e.g., CPU, memory, disk, network) and optional time window.');
          noAnswerError.code = 'NO_ANSWER';
          noAnswerError.statusCode = 422;
          throw noAnswerError;
        }

        // Validate that we got something
        if (!promqlQuery || promqlQuery.length < 3) {
          throw new Error('Gemini returned an empty or invalid PromQL query');
        }

        // Basic validation - check if it looks like PromQL
        if (promqlQuery.includes('\n')) {
          logger.warn({ promqlQuery }, 'Received multi-line response, taking first line');
          // Take only the first line
          promqlQuery = promqlQuery.split('\n')[0].trim();
        }

        // Check for very long queries (likely incorrect)
        if (promqlQuery.length > 1000) {
          throw new Error('Generated query is too long, likely incorrect');
        }

        // Validate and sanitize the PromQL query
        try {
          promqlQuery = this.validateAndSanitizePromQL(promqlQuery);
        } catch (validationError) {
          logger.warn({ 
            promqlQuery, 
            validationError: validationError.message,
            willRetry: i < this.modelNames.length - 1
          }, 'PromQL validation failed');
          
          // If validation fails, treat it as a retryable error
          // so we try the next model which might generate better syntax
          lastError = new Error(`Validation failed: ${validationError.message}. Generated query: ${promqlQuery}`);
          continue; // Try next model
        }

        // Update the current model index for future requests
        this.currentModelIndex = i;
        this.model = model;
        
        logger.info({ 
          promqlQuery, 
          model: modelName,
          success: true 
        }, 'Successfully generated PromQL');
        
        return promqlQuery;
      } catch (error) {
        const errorMessage = this.extractErrorMessage(error);
        lastError = error;
        
        logger.warn({ 
          model: modelName,
          attempt: i + 1,
          error: errorMessage,
          errorType: error.constructor?.name,
          fullError: JSON.stringify(error, Object.getOwnPropertyNames(error))
        }, 'Model attempt failed');
        
        // Check for API key errors specifically
        const isApiKeyError = (
          errorMessage.includes('API_KEY') || 
          errorMessage.includes('API key') ||
          errorMessage.includes('401') ||
          errorMessage.includes('unauthorized') ||
          errorMessage.includes('permission denied') ||
          errorMessage.includes('invalid api key')
        );
        
        // Check for quota exceeded (don't retry other models)
        const isQuotaExceeded = (
          errorMessage.includes('quota exceeded') ||
          (errorMessage.includes('429') && errorMessage.includes('quota'))
        );
        
        // If it's a retryable error (overloaded, 503, etc.), try the next model
        if (this.isRetryableError(error)) {
          logger.info({ 
            model: modelName,
            error: errorMessage,
            nextModel: i < this.modelNames.length - 1 ? this.modelNames[i + 1] : 'none'
          }, 'Retryable error detected, trying next fallback model');
          continue; // Try next model
        }
        
        // If it's an API key error, break immediately (don't try other models)
        if (isApiKeyError) {
          logger.error({ 
            model: modelName,
            error: errorMessage,
            attemptedModels
          }, 'API key error detected, stopping fallback attempts');
          break;
        }
        
        // If quota exceeded, break (don't try other models)
        if (isQuotaExceeded) {
          logger.error({ 
            model: modelName,
            error: errorMessage,
            attemptedModels
          }, 'Quota exceeded, stopping fallback attempts');
          break;
        }
        
        // For other non-retryable errors, break and throw
        logger.error({ 
          model: modelName,
          error: errorMessage,
          attemptedModels
        }, 'Non-recoverable error, stopping fallback attempts');
        break;
      }
    }

    // If we've exhausted all models, throw the last error
    const finalErrorMessage = this.extractErrorMessage(lastError);
    logger.error({ 
      error: finalErrorMessage,
      attemptedModels: attemptedModels.join(', '),
      fullError: lastError ? JSON.stringify(lastError, Object.getOwnPropertyNames(lastError)) : 'No error object'
    }, 'Failed to convert NL to PromQL with all models');
    
    // Check for API key errors with more specific detection
    const isApiKeyError = (
      finalErrorMessage.includes('API_KEY') || 
      finalErrorMessage.includes('API key') ||
      finalErrorMessage.includes('401') ||
      finalErrorMessage.includes('unauthorized') ||
      finalErrorMessage.includes('permission denied') ||
      finalErrorMessage.includes('invalid api key') ||
      finalErrorMessage.toLowerCase().includes('authentication')
    );
    
    if (isApiKeyError) {
      throw new Error('Invalid Gemini API key. Please check your GEMINI_API_KEY environment variable. The API key may be incorrect, expired, or have insufficient permissions.');
    }
    
    // Check if all models were overloaded/unavailable
    const allOverloaded = finalErrorMessage.includes('503') || 
                         finalErrorMessage.includes('overloaded') ||
                         finalErrorMessage.includes('service unavailable');
    
    if (allOverloaded) {
      throw new Error(`All Gemini models are currently overloaded. Please try again in a few moments. Attempted models: ${attemptedModels.join(', ')}`);
    }
    
    if (finalErrorMessage.includes('quota') || finalErrorMessage.includes('quota exceeded')) {
      throw new Error('Gemini API quota exceeded. Please try again later.');
    }
    
    throw new Error(`Failed to generate PromQL after trying ${attemptedModels.length} model(s): ${finalErrorMessage}`);
  }

  /**
   * List all available models for this API key
   * @returns {Promise<string[]>} Array of available model names
   */
  async listAvailableModels() {
    if (!this.isConfigured) {
      throw new Error('Gemini API is not configured. Please set GEMINI_API_KEY.');
    }

    try {
      // Note: The GoogleGenerativeAI SDK might not have listModels directly
      // This is a helper method that can be used for debugging
      logger.info('Attempting to list available models');
      
      // Try to get model info - if the SDK supports it
      // For now, return the models we're configured to try
      return this.modelNames;
    } catch (error) {
      logger.error({ error: error.message }, 'Failed to list models');
      return [];
    }
  }

  /**
   * Check if Gemini service is properly configured
   * @returns {boolean}
   */
  isHealthy() {
    return this.isConfigured;
  }
}

export const geminiService = new GeminiService();


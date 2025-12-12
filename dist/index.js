// src/services/flux.ts
var Flux = class {
  constructor(config) {
    this.baseUrl = "https://open.eternalai.org/flux/v1";
    this.config = config;
  }
  /**
   * Generate image using Flux endpoint
   * Returns polling_url immediately - use getResult() or pollResult() to poll for completion
   * @param request - Chat completion request with prompt, model, and optional images
   * @returns Generate response with polling_url for polling
   * 
   * @example Text-to-Image
   * ```typescript
   * const task = await flux.generate({
   *   messages: [{ role: 'user', content: 'A futuristic city at sunset' }],
   *   model: 'flux/flux-2-pro',
   *   width: 1920,
   *   height: 1080,
   *   safety_tolerance: 2
   * });
   * // Get polling_url and poll manually
   * const result = await flux.getResult(task.polling_url);
   * ```
   * 
   * @example Image-to-Image with multiple references
   * ```typescript
   * const task = await flux.generate({
   *   messages: [{ 
   *     role: 'user', 
   *     content: [
   *       { type: 'text', text: 'Transform this image...' },
   *       { type: 'image_url', image_url: { url: 'https://example.com/image1.jpg' } },
   *       { type: 'image_url', image_url: { url: 'https://example.com/image2.jpg' } }
   *     ] 
   *   }],
   *   model: 'flux/flux-2-pro'
   * });
   * const result = await flux.pollResult(task.polling_url, {
   *   onStatusUpdate: (status, attempt) => console.log(`[${attempt}] ${status}`)
   * });
   * ```
   */
  async generate(request) {
    const model = request.model.startsWith("flux/") ? request.model.slice("flux/".length) : request.model;
    const url = `${this.baseUrl}/${model}`;
    const headers = {
      "Content-Type": "application/json",
      "accept": "application/json",
      "x-key": this.config.apiKey
    };
    let prompt = "";
    const imageUrls = [];
    for (const message of request.messages) {
      if (typeof message.content === "string") {
        prompt = message.content;
      } else if (Array.isArray(message.content)) {
        for (const part of message.content) {
          if (part.type === "text") {
            prompt = part.text || "";
          } else if (part.type === "image_url" && part.image_url) {
            imageUrls.push(part.image_url.url);
          }
        }
      }
    }
    const body = {
      prompt,
      width: request.width ?? 1024,
      height: request.height ?? 1024,
      safety_tolerance: request.safety_tolerance ?? 2
    };
    if (imageUrls.length > 0) {
      body.input_image = imageUrls[0];
    }
    if (imageUrls.length > 1) {
      body.input_image_2 = imageUrls[1];
    }
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: this.createAbortSignal()
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Flux request failed with status ${response.status}: ${errorText}`);
    }
    const generateResponse = await response.json();
    if (!generateResponse.polling_url) {
      throw new Error("No polling_url in generate response");
    }
    return generateResponse;
  }
  /**
   * Get result by polling URL
   * @param pollingUrl - The polling URL returned from generate()
   * @returns Result response with status and image URL
   * 
   * @example
   * ```typescript
   * const result = await flux.getResult('https://api.eu2.bfl.ai/v1/get_result?id=xxx');
   * if (result.status === 'Ready') {
   *   console.log('Image URL:', result.result?.sample);
   * }
   * ```
   */
  async getResult(pollingUrl) {
    const headers = {
      "Content-Type": "application/json",
      "accept": "application/json",
      "x-key": this.config.apiKey
    };
    const response = await fetch(pollingUrl, {
      method: "GET",
      headers,
      signal: this.createAbortSignal()
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Flux getResult failed with status ${response.status}: ${errorText}`);
    }
    return await response.json();
  }
  /**
   * Poll for result until completion or timeout
   * @param pollingUrl - The polling URL returned from generate()
   * @param options - Polling options (interval, maxAttempts, onStatusUpdate callback)
   * @returns Final result response
   * @throws Error if polling times out or request fails
   * 
   * @example
   * ```typescript
   * const finalResult = await flux.pollResult('https://api.eu2.bfl.ai/v1/get_result?id=xxx', {
   *   interval: 3000,
   *   maxAttempts: 60,
   *   onStatusUpdate: (status, attempt) => console.log(`[${attempt}] Status: ${status}`)
   * });
   * ```
   */
  async pollResult(pollingUrl, options = {}) {
    const {
      interval = 3e3,
      maxAttempts = 60,
      onStatusUpdate
    } = options;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const result = await this.getResult(pollingUrl);
      if (onStatusUpdate) {
        console.log("pollingUrl", pollingUrl);
        onStatusUpdate(result.status, attempt);
      }
      if (result.status === "Ready") {
        return result;
      }
      if (result.status === "Failed") {
        const message = result.error || "Unknown error";
        throw new Error(`Flux image generation failed: ${message}`);
      }
      if (attempt < maxAttempts) {
        await this.sleep(interval);
      }
    }
    throw new Error(`Flux polling timed out after ${maxAttempts} attempts`);
  }
  /**
   * Create abort signal with timeout
   */
  createAbortSignal() {
    if (this.config.timeout) {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), this.config.timeout);
      return controller.signal;
    }
    return void 0;
  }
  /**
   * Sleep helper for polling
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
};

// src/services/glm.ts
var Glm = class {
  constructor(config) {
    this.baseUrl = "https://open.eternalai.org/glm/api/paas/v4";
    this.config = config;
  }
  /**
   * Generate content using GLM endpoint (non-streaming)
   * @param request - Chat completion request in OpenAI format
   * @param glmModel - The GLM model to use (default: glm-4.5-flash)
   * @returns Chat completion response in OpenAI format
   */
  async generateContent(request, glmModel = "glm-4.5-flash") {
    const url = `${this.baseUrl}/chat/completions`;
    const headers = {
      "Content-Type": "application/json",
      "Accept-Language": "en-US,en",
      Authorization: `Bearer ${this.config.apiKey}`
    };
    const body = {
      ...request,
      model: glmModel,
      stream: false
    };
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: this.createAbortSignal()
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`GLM request failed with status ${response.status}: ${errorText}`);
    }
    return await response.json();
  }
  /**
   * Stream content using GLM endpoint
   * @param request - Chat completion request in OpenAI format
   * @param glmModel - The GLM model to use (default: glm-4.5-flash)
   * @returns Async iterable of chat completion chunks
   */
  async *streamContent(request, glmModel = "glm-4.5-flash") {
    const url = `${this.baseUrl}/chat/completions`;
    const headers = {
      "Content-Type": "application/json",
      "Accept-Language": "en-US,en",
      Authorization: `Bearer ${this.config.apiKey}`
    };
    const body = {
      ...request,
      model: glmModel,
      stream: true
    };
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: this.createAbortSignal()
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`GLM streaming request failed with status ${response.status}: ${errorText}`);
    }
    if (!response.body) {
      throw new Error("Response body is not readable");
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine === "" || trimmedLine === "data: [DONE]") {
            continue;
          }
          if (trimmedLine.startsWith("data: ")) {
            const data = trimmedLine.slice(6);
            try {
              const chunk = JSON.parse(data);
              yield chunk;
            } catch {
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
  /**
   * Create abort signal with timeout
   */
  createAbortSignal() {
    if (this.config.timeout) {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), this.config.timeout);
      return controller.signal;
    }
    return void 0;
  }
};

// src/services/mistral.ts
var Mistral = class {
  constructor(config) {
    this.baseUrl = "https://open.eternalai.org/mistralai/v1";
    this.config = config;
  }
  /**
   * Generate content using Mistral endpoint (non-streaming)
   * @param request - Chat completion request in OpenAI format
   * @param mistralModel - The Mistral model to use (default: devstral-2512)
   * @returns Chat completion response in OpenAI format
   */
  async generateContent(request, mistralModel = "devstral-2512") {
    const url = `${this.baseUrl}/chat/completions`;
    const headers = {
      "Content-Type": "application/json",
      "Accept": "application/json",
      Authorization: `Bearer ${this.config.apiKey}`
    };
    const body = {
      ...request,
      model: mistralModel,
      stream: false
    };
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: this.createAbortSignal()
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Mistral request failed with status ${response.status}: ${errorText}`);
    }
    return await response.json();
  }
  /**
   * Stream content using Mistral endpoint
   * @param request - Chat completion request in OpenAI format
   * @param mistralModel - The Mistral model to use (default: devstral-2512)
   * @returns Async iterable of chat completion chunks
   */
  async *streamContent(request, mistralModel = "devstral-2512") {
    const url = `${this.baseUrl}/chat/completions`;
    const headers = {
      "Content-Type": "application/json",
      "Accept": "application/json",
      Authorization: `Bearer ${this.config.apiKey}`
    };
    const body = {
      ...request,
      model: mistralModel,
      stream: true
    };
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: this.createAbortSignal()
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Mistral streaming request failed with status ${response.status}: ${errorText}`);
    }
    if (!response.body) {
      throw new Error("Response body is not readable");
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine === "" || trimmedLine === "data: [DONE]") {
            continue;
          }
          if (trimmedLine.startsWith("data: ")) {
            const data = trimmedLine.slice(6);
            try {
              const chunk = JSON.parse(data);
              yield chunk;
            } catch {
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
  /**
   * Create abort signal with timeout
   */
  createAbortSignal() {
    if (this.config.timeout) {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), this.config.timeout);
      return controller.signal;
    }
    return void 0;
  }
};

// src/utils/image.ts
async function uploadImageToStorage(base64Data, mimeType) {
  const uploadUrl = "https://api.eternalai.org/api/agent/upload-image?admin_key=eai2024";
  const binaryData = Buffer.from(base64Data, "base64");
  const formData = new FormData();
  const blob = new Blob([binaryData], { type: mimeType });
  const filename = `${Date.now()}.${mimeType.split("/")[1] || "png"}`;
  formData.append("file", blob, filename);
  const response = await fetch(uploadUrl, {
    method: "POST",
    body: formData
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to upload image: ${response.status} - ${errorText}`);
  }
  const responseText = await response.text();
  let result;
  try {
    result = JSON.parse(responseText);
  } catch (e) {
    throw new Error(`Failed to parse upload response: ${responseText}`);
  }
  return result.data || "";
}

// src/services/nano-banana.ts
var NanoBanana = class {
  constructor(config) {
    this.baseUrl = "https://open.eternalai.org/nano-banana/v1beta/models";
    this.config = config;
  }
  /**
   * Generate content using nano-banana endpoint
   * @param request - Chat completion request in OpenAI format
   * @param geminiModel - The Gemini model to use (default: gemini-2.5-flash-image)
   * @returns Chat completion response in OpenAI format
   */
  async generateContent(request, geminiModel = "gemini-2.5-flash-image") {
    const url = `${this.baseUrl}/${geminiModel}:generateContent`;
    const headers = {
      "Content-Type": "application/json",
      "x-goog-api-key": this.config.apiKey
    };
    const geminiBody = await this.transformToGeminiFormat(request);
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(geminiBody),
      signal: this.createAbortSignal()
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`NanoBanana request failed with status ${response.status}: ${errorText}`);
    }
    const geminiResponse = await response.json();
    return await this.transformToOpenAIFormat(geminiResponse, geminiModel);
  }
  /**
   * Generate image content using nano-banana endpoint
   * @param prompt - Text prompt for image generation
   * @param geminiModel - The Gemini model to use (default: gemini-2.5-flash-image)
   * @returns Base64 encoded image data or null if no image in response
   */
  async generateImage(prompt, geminiModel = "gemini-2.5-flash-image") {
    const url = `${this.baseUrl}/${geminiModel}:generateContent`;
    const headers = {
      "Content-Type": "application/json",
      "x-goog-api-key": this.config.apiKey
    };
    const geminiBody = {
      contents: [{
        parts: [{ text: prompt }]
      }]
    };
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(geminiBody),
      signal: this.createAbortSignal()
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`NanoBanana request failed with status ${response.status}: ${errorText}`);
    }
    const geminiResponse = await response.json();
    for (const candidate of geminiResponse.candidates || []) {
      for (const part of candidate.content?.parts || []) {
        if (part.inlineData) {
          return {
            mimeType: part.inlineData.mimeType,
            data: part.inlineData.data
          };
        }
      }
    }
    return null;
  }
  /**
   * Stream content using nano-banana endpoint
   * @param request - Chat completion request in OpenAI format
   * @param geminiModel - The Gemini model to use
   * @returns Async iterable of chat completion chunks
   */
  async *streamContent(request, geminiModel = "gemini-2.5-flash-image") {
    const url = `${this.baseUrl}/${geminiModel}:generateContent?alt=sse`;
    const headers = {
      "Content-Type": "application/json",
      "x-goog-api-key": this.config.apiKey
    };
    const geminiBody = await this.transformToGeminiFormat(request);
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(geminiBody),
      signal: this.createAbortSignal()
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`NanoBanana streaming request failed with status ${response.status}: ${errorText}`);
    }
    if (!response.body) {
      throw new Error("Response body is not readable");
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    const chunkId = `chatcmpl-${Date.now()}`;
    let streamChunkCount = 0;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine === "" || trimmedLine === "data: [DONE]") {
            continue;
          }
          if (trimmedLine.startsWith("data: ")) {
            const data = trimmedLine.slice(6);
            try {
              const geminiChunk = JSON.parse(data);
              streamChunkCount++;
              let content = "";
              const parts = geminiChunk.candidates?.[0]?.content?.parts || [];
              for (const part of parts) {
                if (part.text) {
                  content += part.text;
                } else if (part.inlineData) {
                  const imageUrl = await uploadImageToStorage(
                    part.inlineData.data,
                    part.inlineData.mimeType
                  );
                  content += imageUrl;
                }
              }
              const finishReason = geminiChunk.candidates?.[0]?.finishReason;
              const chunk = {
                id: chunkId,
                object: "chat.completion.chunk",
                created: Math.floor(Date.now() / 1e3),
                model: geminiModel,
                choices: [{
                  index: 0,
                  delta: { content },
                  finish_reason: finishReason === "STOP" ? "stop" : null
                }]
              };
              yield chunk;
            } catch {
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
  /**
   * Transform OpenAI format request to Gemini format
   */
  async transformToGeminiFormat(request) {
    const contents = [];
    for (const message of request.messages) {
      let role = "user";
      if (message.role === "assistant") {
        role = "model";
      } else if (message.role === "system") {
        role = "user";
      }
      const parts = [];
      if (typeof message.content === "string") {
        parts.push({ text: message.content });
      } else if (Array.isArray(message.content)) {
        for (const part of message.content) {
          if (part.type === "text") {
            parts.push({ text: part.text });
          } else if (part.type === "image_url") {
            const imageUrl = part.image_url.url;
            const { mimeType, data } = await this.fetchImageAsBase64(imageUrl);
            parts.push({
              inline_data: {
                mime_type: mimeType,
                data
              }
            });
          }
        }
      }
      contents.push({
        role,
        parts
      });
    }
    return { contents };
  }
  /**
   * Fetch image from URL and convert to base64
   */
  async fetchImageAsBase64(url) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image from ${url}: ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");
    const mimeType = response.headers.get("content-type") || "image/jpeg";
    return { mimeType, data: base64 };
  }
  async transformToOpenAIFormat(geminiResponse, model) {
    const candidate = geminiResponse.candidates?.[0];
    let content = "";
    for (const part of candidate?.content?.parts || []) {
      if (part.text) {
        content += part.text;
      } else if (part.inlineData) {
        const imageUrl = await uploadImageToStorage(
          part.inlineData.data,
          part.inlineData.mimeType
        );
        content += imageUrl;
      }
    }
    return {
      id: `chatcmpl-${Date.now()}`,
      object: "chat.completion",
      created: Math.floor(Date.now() / 1e3),
      model,
      choices: [{
        index: 0,
        message: {
          role: "assistant",
          content
        },
        finish_reason: candidate?.finishReason === "STOP" ? "stop" : null
      }],
      usage: geminiResponse.usageMetadata ? {
        prompt_tokens: geminiResponse.usageMetadata.promptTokenCount,
        completion_tokens: geminiResponse.usageMetadata.candidatesTokenCount,
        total_tokens: geminiResponse.usageMetadata.totalTokenCount
      } : void 0
    };
  }
  /**
   * Create abort signal with timeout
   */
  createAbortSignal() {
    if (this.config.timeout) {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), this.config.timeout);
      return controller.signal;
    }
    return void 0;
  }
};

// src/services/tavily.ts
var Tavily = class {
  constructor(config) {
    this.baseUrl = "https://open.eternalai.org/tavily";
    this.config = config;
  }
  /**
   * Perform a search using Tavily endpoint
   * @param request - Chat completion request in OpenAI format
   * @param endpoint - The Tavily endpoint to use (default: search)
   * @returns Chat completion response in OpenAI format
   */
  async search(request, endpoint = "search") {
    const url = `${this.baseUrl}/${endpoint}`;
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${this.config.apiKey}`
    };
    const lastUserMessage = [...request.messages].reverse().find((m) => m.role === "user");
    const query = lastUserMessage?.content || "";
    const body = JSON.stringify({ query });
    const response = await fetch(url, {
      method: "POST",
      headers,
      body,
      signal: this.createAbortSignal()
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Tavily request failed with status ${response.status}: ${errorText}`);
    }
    const tavilyResponse = await response.json();
    return this.transformToOpenAIFormat(tavilyResponse, `tavily/${endpoint}`);
  }
  /**
   * Transform Tavily response to OpenAI format
   */
  transformToOpenAIFormat(tavilyResponse, model) {
    let content = "";
    if (tavilyResponse.answer) {
      content = tavilyResponse.answer;
    }
    if (tavilyResponse.results && tavilyResponse.results.length > 0) {
      if (content) content += "\n\n---\n\n**Sources:**\n";
      for (const result of tavilyResponse.results) {
        content += `
- [${result.title}](${result.url})
  ${result.content.substring(0, 200)}...
`;
      }
    }
    return {
      id: `chatcmpl-tavily-${Date.now()}`,
      object: "chat.completion",
      created: Math.floor(Date.now() / 1e3),
      model,
      choices: [{
        index: 0,
        message: {
          role: "assistant",
          content: content || "No results found."
        },
        finish_reason: "stop"
      }]
    };
  }
  /**
   * Create abort signal with timeout
   */
  createAbortSignal() {
    if (this.config.timeout) {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), this.config.timeout);
      return controller.signal;
    }
    return void 0;
  }
};

// src/services/uncensored-ai.ts
var UncensoredAI = class {
  constructor(config) {
    this.baseUrl = "https://open.eternalai.org/uncensored-ai";
    this.config = config;
  }
  /**
   * Generate or edit images/videos using Uncensored AI endpoint
   * Returns request_id immediately - use getResult() or pollResult() to poll for completion
   * @param request - Chat completion request with model, optional image content and additional options
   * @returns Generate response with request_id for polling
   * 
   * @example Text-to-Image
   * ```typescript
   * const task = await uncensoredAI.generate({
   *   messages: [{ role: 'user', content: [{ type: 'text', text: 'A beautiful sunset' }] }],
   *   model: 'uncensored-ai/uncensored-image',
   *   type: 'new',
   *   lora_config: { 'style-lora': 1 }
   * });
   * // Get request_id and poll manually
   * const result = await uncensoredAI.getResult(task.request_id, 'uncensored-image');
   * ```
   * 
   * @example Image-to-Image
   * ```typescript
   * const task = await uncensoredAI.generate({
   *   messages: [{ 
   *     role: 'user', 
   *     content: [
   *       { type: 'text', text: 'Edit this image...' },
   *       { type: 'image_url', image_url: { url: '...', filename: 'image.png' } }
   *     ] 
   *   }],
   *   model: 'uncensored-ai/uncensored-image',
   *   type: 'edit',
   *   image_config: { loras: ['skin', 'lightning'] }
   * });
   * ```
   * 
   * @example Video Generation
   * ```typescript
   * const task = await uncensoredAI.generate({
   *   messages: [{ 
   *     role: 'user', 
   *     content: [
   *       { type: 'text', text: 'Animate this...' },
   *       { type: 'image_url', image_url: { url: '...', filename: 'image.jpg' } }
   *     ] 
   *   }],
   *   model: 'uncensored-ai/uncensored-video',
   *   type: 'edit',
   *   is_magic_prompt: true,
   *   duration: 5,
   *   audio: true,
   *   video_config: { is_fast_video: false, loras: ['flip', 'nsfw'] }
   * });
   * // Poll for video result
   * const result = await uncensoredAI.pollResult(task.request_id, 'uncensored-video', {
   *   interval: 5000,
   *   maxAttempts: 120
   * });
   * ```
   */
  async generate(request) {
    const endpoint = request.model.startsWith("uncensored-ai/") ? request.model.slice("uncensored-ai/".length) : request.model;
    const url = `${this.baseUrl}/${endpoint}`;
    const headers = {
      "Content-Type": "application/json",
      "accept": "application/json",
      "x-api-key": this.config.apiKey
    };
    const body = {
      messages: request.messages
    };
    body.type = request.type !== void 0 ? request.type : request.messages.find((message) => message.content.find((content) => content.type === "image_url")) ? "edit" : "new";
    if (request.lora_config) {
      body.lora_config = request.lora_config;
    }
    if (request.image_config) {
      body.image_config = typeof request.image_config === "string" ? request.image_config : JSON.stringify(request.image_config);
    }
    if (request.video_config) {
      body.video_config = typeof request.video_config === "string" ? request.video_config : JSON.stringify(request.video_config);
    }
    body.is_magic_prompt = request.is_magic_prompt !== void 0 ? request.is_magic_prompt : true;
    body.duration = request.duration !== void 0 ? request.duration : 5;
    body.audio = request.audio !== void 0 ? request.audio : true;
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: this.createAbortSignal()
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`UncensoredAI request failed with status ${response.status}: ${errorText}`);
    }
    const uncensoredResponse = await response.json();
    if (!uncensoredResponse.request_id) {
      throw new Error("No request_id in generate response");
    }
    return uncensoredResponse;
  }
  /**
   * Get result by request_id (polling endpoint)
   * @param requestId - The request ID returned from generate()
   * @param endpoint - The endpoint: 'uncensored-image' or 'uncensored-video'
   * @returns Result response with status and content
   * 
   * @example
   * ```typescript
   * const result = await uncensoredAI.getResult('req_123456', 'uncensored-image');
   * if (result.status === 'completed') {
   *   console.log('Image URL:', result.result?.url);
   * }
   * ```
   */
  async getResult(requestId, endpoint = "uncensored-image") {
    const url = `${this.baseUrl}/result/${endpoint}?request_id=${encodeURIComponent(requestId)}`;
    const headers = {
      "Content-Type": "application/json",
      "accept": "application/json",
      "x-api-key": this.config.apiKey
    };
    const response = await fetch(url, {
      method: "GET",
      headers,
      signal: this.createAbortSignal()
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`UncensoredAI getResult failed with status ${response.status}: ${errorText}`);
    }
    return await response.json();
  }
  /**
   * Poll for result until completion or timeout
   * @param requestId - The request ID returned from generate()
   * @param endpoint - The endpoint: 'uncensored-image' or 'uncensored-video'
   * @param options - Polling options (interval, maxAttempts, onStatusUpdate callback)
   * @returns Final result response
   * @throws Error if polling times out or request fails
   * 
   * @example
   * ```typescript
   * const generateResponse = await uncensoredAI.generate({ ... }, 'uncensored-image');
   * const requestId = JSON.parse(generateResponse.choices[0].message.content).request_id;
   * 
   * const finalResult = await uncensoredAI.pollResult(requestId, 'uncensored-image', {
   *   interval: 2000,
   *   maxAttempts: 30,
   *   onStatusUpdate: (status, attempt) => console.log(`[${attempt}] Status: ${status}`)
   * });
   * ```
   */
  async pollResult(requestId, endpoint = "uncensored-image", options = {}) {
    const {
      interval = 3e3,
      maxAttempts = 60,
      onStatusUpdate
    } = options;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const result = await this.getResult(requestId, endpoint);
      if (onStatusUpdate) {
        console.log("requestId", requestId);
        onStatusUpdate(result.status, attempt);
      }
      if (result.status === "success") {
        return result;
      }
      if (result.status === "failed") {
        throw new Error(`UncensoredAI request failed: ${result.status}`);
      }
      if (attempt < maxAttempts) {
        await this.sleep(interval);
      }
    }
    throw new Error(`UncensoredAI polling timed out after ${maxAttempts} attempts`);
  }
  /**
   * Create abort signal with timeout
   */
  createAbortSignal() {
    if (this.config.timeout) {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), this.config.timeout);
      return controller.signal;
    }
    return void 0;
  }
  /**
   * Sleep helper for polling
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
};

// src/services/wan.ts
var Wan = class {
  constructor(config) {
    this.baseUrl = "https://open.eternalai.org/wan/api/v1/services/aigc/video-generation";
    this.tasksBaseUrl = "https://open.eternalai.org/wan/api/v1/tasks";
    this.config = config;
  }
  /**
   * Generate video from image using Wan endpoint
   * Returns task_id immediately - use getResult() to poll for completion
   * @param request - Chat completion request with prompt, image URL, and model
   * @returns Task response with task_id for polling
   * 
   * @example
   * ```typescript
   * // Start generation
   * const task = await wan.generate({
   *   messages: [{ 
   *     role: 'user', 
   *     content: [
   *       { type: 'text', text: 'A dynamic graffiti art character...' },
   *       { type: 'image_url', image_url: { url: 'https://...' } }
   *     ] 
   *   }],
   *   model: 'wan/wan2.5-i2v-preview',
   *   resolution: '480P'
   * });
   * 
   * // Get task_id and poll manually
   * const taskId = task.output?.task_id;
   * const result = await wan.getResult(taskId);
   * ```
   */
  async generate(request) {
    const url = `${this.baseUrl}/video-synthesis`;
    const headers = {
      "Content-Type": "application/json",
      "X-DashScope-Async": "enable",
      "Authorization": `Bearer ${this.config.apiKey}`
    };
    const model = request.model.startsWith("wan/") ? request.model.slice(4) : request.model;
    let prompt = "";
    let imgUrl;
    for (const message of request.messages) {
      if (typeof message.content === "string") {
        prompt = message.content;
      } else if (Array.isArray(message.content)) {
        for (const part of message.content) {
          if (part.type === "text") {
            prompt = part.text || "";
          } else if (part.type === "image_url" && part.image_url) {
            imgUrl = part.image_url.url;
          }
        }
      }
    }
    const body = {
      model,
      input: {
        prompt,
        ...imgUrl && { img_url: imgUrl }
      },
      parameters: {
        resolution: request.resolution || "480P",
        prompt_extend: request.prompt_extend !== void 0 ? request.prompt_extend : true,
        duration: request.duration !== void 0 ? request.duration : 10,
        audio: request.audio !== void 0 ? request.audio : true
      }
    };
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: this.createAbortSignal()
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Wan request failed with status ${response.status}: ${errorText}`);
    }
    const taskResponse = await response.json();
    if (!taskResponse.output?.task_id) {
      throw new Error("No task_id in generate response");
    }
    return taskResponse;
  }
  /**
   * Get result by task_id (polling endpoint)
   * @param taskId - The task ID returned from generate()
   * @returns Result response with status and video URL
   * 
   * @example
   * ```typescript
   * const result = await wan.getResult('task_123456');
   * if (result.output?.task_status === 'SUCCEEDED') {
   *   console.log('Video URL:', result.output.results?.[0]?.url);
   * }
   * ```
   */
  async getResult(taskId) {
    const url = `${this.tasksBaseUrl}/${encodeURIComponent(taskId)}`;
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${this.config.apiKey}`
    };
    const response = await fetch(url, {
      method: "GET",
      headers,
      signal: this.createAbortSignal()
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Wan getResult failed with status ${response.status}: ${errorText}`);
    }
    return await response.json();
  }
  /**
   * Poll for result until completion or timeout
   * @param taskId - The task ID returned from generate()
   * @param options - Polling options (interval, maxAttempts, onStatusUpdate callback)
   * @returns Final result response
   * @throws Error if polling times out or request fails
   * 
   * @example
   * ```typescript
   * const finalResult = await wan.pollResult('task_123456', {
   *   interval: 5000,
   *   maxAttempts: 120,
   *   onStatusUpdate: (status, attempt) => console.log(`[${attempt}] Status: ${status}`)
   * });
   * ```
   */
  async pollResult(taskId, options = {}) {
    const {
      interval = 5e3,
      maxAttempts = 120,
      onStatusUpdate
    } = options;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const result = await this.getResult(taskId);
      const status = result.output?.task_status || "UNKNOWN";
      if (onStatusUpdate) {
        console.log("taskId", taskId);
        onStatusUpdate(status, attempt);
      }
      if (status === "SUCCEEDED") {
        return result;
      }
      if (status === "FAILED") {
        const message = result.output?.message || "Unknown error";
        throw new Error(`Wan video generation failed: ${message}`);
      }
      if (attempt < maxAttempts) {
        await this.sleep(interval);
      }
    }
    throw new Error(`Wan polling timed out after ${maxAttempts} attempts`);
  }
  /**
   * Create abort signal with timeout
   */
  createAbortSignal() {
    if (this.config.timeout) {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), this.config.timeout);
      return controller.signal;
    }
    return void 0;
  }
  /**
   * Sleep helper for polling
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
};

// src/services/chat.ts
var FLUX_PREFIX = "flux/";
var GLM_PREFIX = "glm/";
var MISTRAL_PREFIX = "mistralai/";
var NANO_BANANA_PREFIX = "nano-banana/";
var TAVILY_PREFIX = "tavily/";
var UNCENSORED_AI_PREFIX = "uncensored-ai/";
var WAN_PREFIX = "wan/";
var Chat = class {
  constructor(config) {
    this.baseUrl = "https://open.eternalai.org/api/v1";
    this.config = config;
    this.flux = new Flux(config);
    this.glm = new Glm(config);
    this.mistral = new Mistral(config);
    this.nanoBanana = new NanoBanana(config);
    this.tavily = new Tavily(config);
    this.uncensoredAI = new UncensoredAI(config);
    this.wan = new Wan(config);
  }
  /**
   * Check if model uses a custom provider prefix and extract the actual model/endpoint name
   * @param model - Model name that may include custom prefix like "nano-banana/", "tavily/", or "uncensored-ai/"
   * @returns Object with provider type and extracted model name
   */
  parseModelName(model) {
    if (model.startsWith(FLUX_PREFIX)) {
      return {
        provider: "flux",
        modelName: model.slice(FLUX_PREFIX.length)
      };
    }
    if (model.startsWith(GLM_PREFIX)) {
      return {
        provider: "glm",
        modelName: model.slice(GLM_PREFIX.length)
      };
    }
    if (model.startsWith(MISTRAL_PREFIX)) {
      return {
        provider: "mistralai",
        modelName: model.slice(MISTRAL_PREFIX.length)
      };
    }
    if (model.startsWith(NANO_BANANA_PREFIX)) {
      return {
        provider: "nano-banana",
        modelName: model.slice(NANO_BANANA_PREFIX.length)
      };
    }
    if (model.startsWith(TAVILY_PREFIX)) {
      return {
        provider: "tavily",
        modelName: model.slice(TAVILY_PREFIX.length)
      };
    }
    if (model.startsWith(UNCENSORED_AI_PREFIX)) {
      return {
        provider: "uncensored-ai",
        modelName: model.slice(UNCENSORED_AI_PREFIX.length)
      };
    }
    if (model.startsWith(WAN_PREFIX)) {
      return {
        provider: "wan",
        modelName: model.slice(WAN_PREFIX.length)
      };
    }
    return { provider: null, modelName: model };
  }
  /**
   * Implementation of send method
   */
  async send(request) {
    const { provider, modelName } = this.parseModelName(request.model);
    if (provider === "flux") {
      const task = await this.flux.generate(request);
      const pollingUrl = task.polling_url;
      if (!pollingUrl) {
        throw new Error("No polling_url returned from Flux generate");
      }
      const result = await this.flux.pollResult(pollingUrl, {
        interval: 3e3,
        maxAttempts: 60,
        onStatusUpdate: (status) => {
          console.log("Flux status update:", status);
        }
      });
      const imageUrl = result.result?.sample || "";
      return {
        id: result.id || `chatcmpl-flux-${Date.now()}`,
        object: "chat.completion",
        created: Math.floor(Date.now() / 1e3),
        model: request.model,
        choices: [{
          index: 0,
          message: {
            role: "assistant",
            content: imageUrl
          },
          finish_reason: "stop"
        }]
      };
    }
    if (provider === "glm") {
      if (request.stream) {
        return this.glm.streamContent(request, modelName);
      } else {
        return this.glm.generateContent(request, modelName);
      }
    }
    if (provider === "mistralai") {
      if (request.stream) {
        return this.mistral.streamContent(request, modelName);
      } else {
        return this.mistral.generateContent(request, modelName);
      }
    }
    if (provider === "nano-banana") {
      if (request.stream) {
        return this.nanoBanana.streamContent(request, modelName);
      } else {
        return this.nanoBanana.generateContent(request, modelName);
      }
    }
    if (provider === "tavily") {
      return this.tavily.search(request, modelName);
    }
    if (provider === "uncensored-ai") {
      const task = await this.uncensoredAI.generate(request);
      const requestId = task.request_id;
      if (!requestId) {
        throw new Error("No request_id returned from UncensoredAI generate");
      }
      const endpoint = modelName;
      const isVideo = endpoint === "uncensored-video";
      const result = await this.uncensoredAI.pollResult(requestId, endpoint, {
        interval: isVideo ? 5e3 : 3e3,
        maxAttempts: isVideo ? 120 : 60,
        onStatusUpdate: (status) => {
          console.log("UncensoredAI status update:", status);
        }
      });
      const resultUrl = result.result_url;
      return {
        id: result.request_id || `chatcmpl-uncensored-${Date.now()}`,
        object: "chat.completion",
        created: Math.floor(Date.now() / 1e3),
        model: request.model,
        choices: [{
          index: 0,
          message: {
            role: "assistant",
            content: resultUrl
          },
          finish_reason: "stop"
        }]
      };
    }
    if (provider === "wan") {
      const task = await this.wan.generate(request);
      const taskId = task.output?.task_id;
      if (!taskId) {
        throw new Error("No task_id returned from Wan generate");
      }
      const result = await this.wan.pollResult(taskId, {
        onStatusUpdate: (status) => {
          console.log("Wan status update:", status);
        }
      });
      const videoUrl = result.output?.video_url || result.output?.results?.[0]?.url || "";
      return {
        id: result.request_id || `chatcmpl-wan-${Date.now()}`,
        object: "chat.completion",
        created: Math.floor(Date.now() / 1e3),
        model: request.model,
        choices: [{
          index: 0,
          message: {
            role: "assistant",
            content: videoUrl
          },
          finish_reason: "stop"
        }]
      };
    }
    const url = `${this.baseUrl}/chat/completions?from=ts-sdk`;
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.config.apiKey}`
    };
    const body = JSON.stringify(request);
    const response = await fetch(url, {
      method: "POST",
      headers,
      body,
      signal: this.createAbortSignal()
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`EternalAI request failed with status ${response.status}: ${errorText}`);
    }
    if (request.stream) {
      if (!response.body) {
        throw new Error("Response body is not readable");
      }
      return this.handleStreamingResponse(response);
    } else {
      return await response.json();
    }
  }
  /**
   * Create abort signal with timeout
   */
  createAbortSignal() {
    if (this.config.timeout) {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), this.config.timeout);
      return controller.signal;
    }
    return void 0;
  }
  /**
   * Handle streaming response using Server-Sent Events
   */
  async *handleStreamingResponse(response) {
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("Response body is not readable");
    }
    const decoder = new TextDecoder();
    let buffer = "";
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine === "" || trimmedLine === "data: [DONE]") {
            continue;
          }
          if (trimmedLine.startsWith("data: ")) {
            const data = trimmedLine.slice(6);
            try {
              const chunk = JSON.parse(data);
              yield chunk;
            } catch (error) {
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
};

// src/client.ts
var EternalAI = class {
  constructor(config) {
    if (!config.apiKey) {
      throw new Error("API key is required");
    }
    this.config = config;
    this.chat = new Chat(this.config);
    this.flux = new Flux(this.config);
    this.nanoBanana = new NanoBanana(this.config);
    this.tavily = new Tavily(this.config);
    this.uncensoredAI = new UncensoredAI(this.config);
    this.wan = new Wan(this.config);
  }
};

export { Chat, EternalAI, Flux, NanoBanana, Wan };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map
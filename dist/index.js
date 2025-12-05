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
    const geminiBody = this.transformToGeminiFormat(request);
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
    return this.transformToOpenAIFormat(geminiResponse, geminiModel);
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
    const url = `${this.baseUrl}/${geminiModel}:streamGenerateContent?alt=sse`;
    const headers = {
      "Content-Type": "application/json",
      "x-goog-api-key": this.config.apiKey
    };
    const geminiBody = this.transformToGeminiFormat(request);
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
    let chunkId = `chatcmpl-${Date.now()}`;
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
              const content = geminiChunk.candidates?.[0]?.content?.parts?.[0]?.text || "";
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
  transformToGeminiFormat(request) {
    const contents = [];
    for (const message of request.messages) {
      let role = "user";
      if (message.role === "assistant") {
        role = "model";
      } else if (message.role === "system") {
        role = "user";
      }
      contents.push({
        role,
        parts: [{ text: message.content }]
      });
    }
    return { contents };
  }
  /**
   * Transform Gemini response to OpenAI format
   */
  transformToOpenAIFormat(geminiResponse, model) {
    const candidate = geminiResponse.candidates?.[0];
    const content = candidate?.content?.parts?.map((p) => p.text || "").join("") || "";
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
   * @param request - Chat completion request with optional image content and additional options
   * @param endpoint - The endpoint to use: 'uncensored-image' or 'uncensored-video'
   * @returns Chat completion response
   * 
   * @example Text-to-Image
   * ```typescript
   * const result = await uncensoredAI.generate({
   *   messages: [{ role: 'user', content: [{ type: 'text', text: 'A beautiful sunset' }] }],
   *   model: 'uncensored-ai/uncensored-image',
   *   type: 'new',
   *   lora_config: { 'style-lora': 1 }
   * }, 'uncensored-image');
   * ```
   * 
   * @example Image-to-Image
   * ```typescript
   * const result = await uncensoredAI.generate({
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
   * }, 'uncensored-image');
   * ```
   * 
   * @example Video Generation
   * ```typescript
   * const result = await uncensoredAI.generate({
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
   * }, 'uncensored-video');
   * ```
   */
  async generate(request, endpoint = "uncensored-image") {
    const url = `${this.baseUrl}/${endpoint}`;
    const headers = {
      "Content-Type": "application/json",
      "accept": "application/json",
      "x-api-key": this.config.apiKey
    };
    const body = {
      messages: request.messages
    };
    if (request.type) {
      body.type = request.type;
    }
    if (request.lora_config) {
      body.lora_config = request.lora_config;
    }
    if (request.image_config) {
      body.image_config = typeof request.image_config === "string" ? request.image_config : JSON.stringify(request.image_config);
    }
    if (request.video_config) {
      body.video_config = typeof request.video_config === "string" ? request.video_config : JSON.stringify(request.video_config);
    }
    if (request.is_magic_prompt !== void 0) {
      body.is_magic_prompt = request.is_magic_prompt;
    }
    if (request.duration !== void 0) {
      body.duration = request.duration;
    }
    if (request.audio !== void 0) {
      body.audio = request.audio;
    }
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
    return this.transformToOpenAIFormat(uncensoredResponse, `uncensored-ai/${endpoint}`);
  }
  /**
   * Transform Uncensored AI response to OpenAI format
   */
  transformToOpenAIFormat(response, model) {
    if (response.choices && response.choices.length > 0) {
      return {
        id: response.id || `chatcmpl-uncensored-${Date.now()}`,
        object: response.object || "chat.completion",
        created: response.created || Math.floor(Date.now() / 1e3),
        model,
        choices: response.choices.map((choice) => ({
          index: choice.index,
          message: {
            role: choice.message.role,
            content: typeof choice.message.content === "string" ? choice.message.content : JSON.stringify(choice.message.content)
          },
          finish_reason: choice.finish_reason
        })),
        usage: response.usage
      };
    }
    return {
      id: `chatcmpl-uncensored-${Date.now()}`,
      object: "chat.completion",
      created: Math.floor(Date.now() / 1e3),
      model,
      choices: [{
        index: 0,
        message: {
          role: "assistant",
          content: JSON.stringify(response)
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

// src/services/chat.ts
var NANO_BANANA_PREFIX = "nano-banana/";
var TAVILY_PREFIX = "tavily/";
var UNCENSORED_AI_PREFIX = "uncensored-ai/";
var Chat = class {
  constructor(config) {
    this.baseUrl = "https://open.eternalai.org/api/v1";
    this.config = config;
    this.nanoBanana = new NanoBanana(config);
    this.tavily = new Tavily(config);
    this.uncensoredAI = new UncensoredAI(config);
  }
  /**
   * Check if model uses a custom provider prefix and extract the actual model/endpoint name
   * @param model - Model name that may include custom prefix like "nano-banana/", "tavily/", or "uncensored-ai/"
   * @returns Object with provider type and extracted model name
   */
  parseModelName(model) {
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
    return { provider: null, modelName: model };
  }
  /**
   * Implementation of send method
   */
  async send(request) {
    const { provider, modelName } = this.parseModelName(request.model);
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
      return this.uncensoredAI.generate(request, modelName);
    }
    const url = `${this.baseUrl}/chat/completions`;
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
    this.nanoBanana = new NanoBanana(this.config);
    this.tavily = new Tavily(this.config);
    this.uncensoredAI = new UncensoredAI(this.config);
  }
};

export { Chat, EternalAI, NanoBanana };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map
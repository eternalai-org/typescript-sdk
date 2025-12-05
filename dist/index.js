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

// src/services/chat.ts
var NANO_BANANA_PREFIX = "nano-banana/";
var Chat = class {
  constructor(config) {
    this.baseUrl = "https://open.eternalai.org/api/v1";
    this.config = config;
    this.nanoBanana = new NanoBanana(config);
  }
  /**
   * Check if model uses nano-banana prefix and extract the actual model name
   * @param model - Model name that may include "nano-banana/" prefix
   * @returns Object with isNanoBanana flag and extracted model name
   */
  parseModelName(model) {
    if (model.startsWith(NANO_BANANA_PREFIX)) {
      return {
        isNanoBanana: true,
        modelName: model.slice(NANO_BANANA_PREFIX.length)
      };
    }
    return { isNanoBanana: false, modelName: model };
  }
  /**
   * Implementation of send method
   */
  async send(request) {
    const { isNanoBanana, modelName } = this.parseModelName(request.model);
    if (isNanoBanana) {
      if (request.stream) {
        return this.nanoBanana.streamContent(request, modelName);
      } else {
        return this.nanoBanana.generateContent(request, modelName);
      }
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
  }
};

export { Chat, EternalAI, NanoBanana };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map
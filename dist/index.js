// src/services/chat.ts
var Chat = class {
  constructor(config) {
    this.baseUrl = "https://open.eternalai.org/api/v1";
    this.config = config;
  }
  /**
   * Implementation of send method
   */
  async send(request) {
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
  }
};

export { Chat, EternalAI };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map
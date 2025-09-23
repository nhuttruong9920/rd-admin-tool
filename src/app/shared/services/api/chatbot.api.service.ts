import { Injectable, signal } from '@angular/core';

export type Conversation = {
  message: string;
  role: 'user' | 'assistant';
  date: Date;
  id: string;
};

export type QuickAction = {
  title: string;
  content: string;
  icon: string;
  iconColorClass: string;
  bgColorClass: string;
};

@Injectable()
export class ChatbotApiService {
  baseUrl = signal('http://192.168.194.213:6001');
  #abortController: AbortController | null = null;
  conversation = signal<Conversation[]>([]);
  isLoading = signal(false);
  isTyping = signal(false);

  quickActions = signal<QuickAction[]>([
    {
      title: 'Bản đồ',
      content: 'Tôi muốn tìm hiểu về dịch vụ bản đồ của Vietmap',
      icon: 'fas fa-map-marked-alt',
      iconColorClass: 'text-blue-500',
      bgColorClass: 'bg-blue-500/10',
    },
    {
      title: 'Chỉ đường',
      content: 'Làm thế nào để tích hợp chỉ đường vào ứng dụng?',
      icon: 'fas fa-route',
      iconColorClass: 'text-green-500',
      bgColorClass: 'bg-green-500/10',
    },
    {
      title: 'Hỗ trợ',
      content: 'Tôi cần hỗ trợ kỹ thuật',
      icon: 'fas fa-question-circle',
      iconColorClass: 'text-purple-500',
      bgColorClass: 'bg-purple-500/10',
    },
    {
      title: 'API',
      content: 'Hướng dẫn sử dụng API của Vietmap',
      icon: 'fas fa-cog',
      iconColorClass: 'text-orange-500',
      bgColorClass: 'bg-orange-500/10',
    },
  ]);
  quickExamples = signal<string[]>([
    'Tích hợp API như thế nào?',
    'Bảng giá dịch vụ',
    'Hướng dẫn',
  ]);

  sendMessage(message: string): void {
    this.conversation.update((prev) => [
      ...prev,
      { message, role: 'user', date: new Date(), id: this.generateGuid() },
    ]);

    const conversationId = this.generateGuid();
    const body = {
      prompt: message,
      conversationId,
    };

    const botResponse: Conversation = {
      message: '',
      role: 'assistant',
      date: new Date(),
      id: this.generateGuid(),
    };
    this.conversation.update((prev) => [...prev, botResponse]);

    this.isLoading.set(true);
    this.postAndStream(
      `${this.baseUrl()}/api/chat`,
      body,
      (accumulatedText) => {
        this.isLoading.set(false);
        this.isTyping.set(true);
        this.conversation.update((prev) => {
          const lastMessage = prev[prev.length - 1];
          lastMessage.message = accumulatedText;
          return [...prev];
        });
      },
      () => this.isLoading.set(false),
      () => this.isTyping.set(false),
    );
  }

  stopStream(): void {
    if (this.#abortController) {
      this.#abortController.abort();
      this.#abortController = null;
      this.isLoading.set(false);
      this.isTyping.set(false);
    }
  }

  async postAndStream(
    url: string,
    body: any,
    onChunk: (text: string) => void,
    onFetched: () => void,
    onDone: () => void,
  ): Promise<void> {
    try {
      // Create new AbortController for this request
      this.#abortController = new AbortController();

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: this.#abortController.signal,
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      onFetched();

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedMessage = '';
      let isFirstChunk = true;
      let buffer = '';

      while (reader) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        // Find and parse each JSON object in streaming array
        let startPos = 0;

        while (true) {
          // Find start position of JSON object
          const openBrace = buffer.indexOf('{', startPos);
          if (openBrace === -1) break;

          // Find corresponding end position
          let braceCount = 0;
          let inString = false;
          let escaped = false;
          let endPos = -1;

          for (let i = openBrace; i < buffer.length; i++) {
            const char = buffer[i];

            if (escaped) {
              escaped = false;
              continue;
            }

            if (char === '\\' && inString) {
              escaped = true;
              continue;
            }

            if (char === '"') {
              inString = !inString;
              continue;
            }

            if (inString) continue;

            if (char === '{') {
              braceCount++;
            } else if (char === '}') {
              braceCount--;
              if (braceCount === 0) {
                endPos = i;
                break;
              }
            }
          }

          if (endPos === -1) break; // Incomplete object, wait for more data

          // Extract and parse JSON object
          const jsonStr = buffer.substring(openBrace, endPos + 1);
          try {
            const data = JSON.parse(jsonStr);
            if (data.content) {
              // Skip <think> tags - only display actual content
              const content = data.content;
              if (
                !content.includes('<think>') &&
                !content.includes('</think>')
              ) {
                accumulatedMessage += content;

                if (isFirstChunk) {
                  onChunk(accumulatedMessage);
                  isFirstChunk = false;
                } else {
                  onChunk(accumulatedMessage);
                }
              }
            }
          } catch (parseError) {
            console.log('JSON parse error:', parseError, 'JSON:', jsonStr);
          }

          startPos = endPos + 1;
        }

        // Keep unprocessed part in buffer
        if (startPos > 0) {
          buffer = buffer.substring(startPos);
        }
      }

      // If no message was accumulated, provide fallback
      if (accumulatedMessage === '') {
        onChunk('Xin lỗi, tôi không thể trả lời câu hỏi này.');
      }
    } catch (error) {
      // Check if error is due to abort
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Stream was aborted');
        return; // Don't show error message for intentional abort
      }

      console.error('Error:', error);
      this.isLoading.set(false);
      this.isTyping.set(false);
      onChunk('Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.');
    } finally {
      this.#abortController = null;
      onDone();
    }
  }
  private generateGuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c == 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      },
    );
  }
}

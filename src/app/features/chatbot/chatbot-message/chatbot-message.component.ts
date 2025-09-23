import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  signal,
  viewChild
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AutoFocusModule } from 'primeng/autofocus';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { PopoverModule } from 'primeng/popover';

import { ChatbotApiService, Conversation, QuickAction } from '@shared/services';

@Component({
  selector: 'app-chatbot-message',
  imports: [
    ButtonModule,
    FormsModule,
    InputTextModule,
    PopoverModule,
    FloatLabelModule,
    AutoFocusModule,
  ],
  templateUrl: './chatbot-message.component.html',
})
export class ChatbotMessageComponent {
  readonly #chatbotApiService = inject(ChatbotApiService);

  conversationContainer = viewChild<ElementRef<HTMLElement>>(
    'conversationContainer',
  );
  messageInput = viewChild<ElementRef<HTMLTextAreaElement>>('messageInput');

  conversation = this.#chatbotApiService.conversation;
  isLoading = this.#chatbotApiService.isLoading;
  isTyping = this.#chatbotApiService.isTyping;
  baseUrl = this.#chatbotApiService.baseUrl;
  inputMessage = signal<string>('');

  quickActions = this.#chatbotApiService.quickActions;
  quickExamples = this.#chatbotApiService.quickExamples;

  isDisabled = computed(
    () => !this.inputMessage().trim() || this.isLoading() || this.isTyping(),
  );

  constructor() {
    effect(() => {
      const messages = this.conversation();
      if (messages.length > 0) {
        setTimeout(() => {
          this.scrollToBottom();
        }, 0);
      }
    });
  }

  sendMessage(): void {
    const message = this.inputMessage().trim();
    if (!message || this.isDisabled()) return;

    this.#chatbotApiService.sendMessage(message);
    this.inputMessage.set('');

    setTimeout(() => {
      this.messageInput()?.nativeElement?.focus();
    }, 100);
  }

  stopStream(): void {
    this.#chatbotApiService.stopStream();
  }

  onEnter(event: Event): void {
    event.preventDefault();
    this.sendMessage();
  }

  onQuickActionClick(action: QuickAction): void {
    this.inputMessage.set(action.content);
    this.sendMessage();
  }

  onExampleClick(example: string): void {
    this.inputMessage.set(example);
    this.sendMessage();
  }

  protected onCopy(message: string): void {
    navigator.clipboard.writeText(message);
  }

  protected onRepeat(message: string): void {
    this.stopStream();
    this.inputMessage.set(message);
    this.sendMessage();
  }

  protected onForceRepeat(conversation: Conversation): void {
    this.stopStream();
    const conversationIdx = this.conversation().findIndex(
      (c) => c.id === conversation.id,
    );
    if (conversationIdx === -1) return;
    this.conversation.update((prev) => {
      const newConversation = [...prev];
      newConversation.splice(conversationIdx);
      return newConversation;
    });

    let lastUser = null;
    for (let i = this.conversation().length - 1; i >= 0; i--) {
      if (this.conversation()[i].role === 'user') {
        lastUser = this.conversation()[i];
        break;
      }
    }

    if (lastUser) {
      this.conversation.update((prev) => {
        const newConversation = [...prev];
        newConversation.pop();
        return newConversation;
      });
      this.inputMessage.set(lastUser.message);
      this.sendMessage();
    }
  }

  private scrollToBottom(): void {
    try {
      if (this.conversationContainer()?.nativeElement) {
        const element = this.conversationContainer()!.nativeElement;
        if (element) {
          element.scrollTop = element.scrollHeight;
        }
      }
    } catch (err) {
      console.debug('Auto-scroll failed:', err);
    }
  }
}

import { Component } from '@angular/core';
import { SplitPanelComponent } from '@shared/components';
import { ChatbotApiService } from '@shared/services';
import { ChatbotMessageComponent } from './chatbot-message/chatbot-message.component';

@Component({
  selector: 'app-chatbot',
  imports: [ChatbotMessageComponent, SplitPanelComponent],
  providers: [ChatbotApiService],
  templateUrl: './chatbot.component.html',
})
export class ChatbotComponent {}

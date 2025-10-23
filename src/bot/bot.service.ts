import { Injectable } from '@nestjs/common';

@Injectable()
export class BotService {
  getAboutMessage(): string {
    return '🤖 This is Eyob’s NestJS Telegram bot built using nestjs-telegraf.';
  }

  generateReply(message: string): string {
    if (message.toLowerCase().includes('project')) {
      return '🔥 Sounds like you’re working on something awesome!';
    } else if (message.toLowerCase().includes('bye')) {
      return '👋 See you later!';
    }
    return 'I’m not sure what you mean, but I’m learning 😅';
  }
}

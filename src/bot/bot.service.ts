import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectBot } from 'nestjs-telegraf';
import { Context, Telegraf } from 'telegraf';
import { addTags } from './utils/uitls.js';

@Injectable()
export class BotService {
  constructor(
    private readonly config: ConfigService,
    @InjectBot() private readonly bot: Telegraf,
  ) {}

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

  async postToChannel(message: string) {
    const channelId = this.config.get<string>('CHANNEL_ID') as string;
    await this.bot.telegram.sendMessage(channelId, message, {
      parse_mode: 'HTML',
    });
  }

  async onChannelPost(ctx: Context) {
    try {
      const TechVibeChannelId = this.config.get<string>('CHANNEL_ID');
      const channelId = ctx.channelPost?.chat.id;

      if (!channelId || TechVibeChannelId !== channelId.toString()) return;

      const messageText =
        (ctx.channelPost as any)?.text ||
        (ctx.channelPost as any)?.caption ||
        '';
      if (!messageText) return;

      const finalTags = addTags(messageText);
      const formatted = finalTags.replace(
        '@devwitheyob',
        '<b>@devwitheyob</b>',
      );

      if ((ctx.channelPost as any)?.caption) {
        await this.bot.telegram.editMessageCaption(
          channelId,
          ctx.channelPost.message_id,
          undefined,
          `${formatted}`,
          { parse_mode: 'HTML' },
        );
      } else if ((ctx.channelPost as any)?.text) {
        await this.bot.telegram.editMessageText(
          channelId,
          ctx.channelPost.message_id,
          undefined,
          `${formatted}`,
          { parse_mode: 'HTML' },
        );
      }
    } catch (err) {
      console.error('❌ Error updating channel post:', err);
    }
  }
}

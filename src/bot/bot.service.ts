import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectBot } from 'nestjs-telegraf';
import { Context, Telegraf } from 'telegraf';
import { addTags } from './utils/uitls.js';
import { EmailService } from '../email_service/email_service.service.js';

@Injectable()
export class BotService {
  private readonly logger = new Logger(BotService.name);

  constructor(
    private readonly config: ConfigService,
    @InjectBot() private readonly bot: Telegraf,
    private readonly emailService: EmailService,
  ) {}

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
          formatted,
          { parse_mode: 'HTML' },
        );
      } else if ((ctx.channelPost as any)?.text) {
        await this.bot.telegram.editMessageText(
          channelId,
          ctx.channelPost.message_id,
          undefined,
          formatted,
          { parse_mode: 'HTML' },
        );
      }

      await this.bot.telegram.sendMessage(
        1259654531,
        `A post was just updated on your channel:\n\n${messageText}
        <b>Updated post:</b><br>${formatted}`,
        {
          parse_mode: 'HTML',
        },
      );

      this.logger.log('✅ Channel post processed and email sent.');
    } catch (err) {
      this.logger.error('❌ Failed to process channel post', err.stack);

      try {
        await this.bot.telegram.sendMessage(
          1259654531,
          `🚨 Error in Telegram Bot\n\n
          An error occurred while processing a channel post:\n\n${err.message}
          <b>An error occurred in the bot:</b><br><pre>${err.stack}</pre>`,
        );
        await this.emailService.sendMail(
          'eyobsmax@gmail.com',
          '🚨 Error in Telegram Bot',
          `An error occurred while processing a channel post:\n\n${err.message}
          <b>An error occurred in the bot:</b><br><pre>${err.stack}</pre>`,
        );
        this.logger.log('📧 Error notification sent successfully.');
      } catch (emailErr) {
        this.logger.error(
          '❌ Failed to send error notification email',
          emailErr.stack,
        );
      }
    }
  }
}

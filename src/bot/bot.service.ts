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
    const techVibeChannelId = this.config.get<string>('CHANNEL_ID');
    const adminId =
      Number(this.config.get<string>('BOT_ADMIN_ID')) || 1259654531;
    const channelId = ctx?.channelPost?.chat?.id?.toString();

    if (!channelId || techVibeChannelId !== channelId) return;

    try {
      const post = ctx.channelPost as any;
      const messageText = post.text || post.caption || '';

      const finalTags = addTags(messageText);
      const formatted = finalTags.replace(
        '@devwitheyob',
        '<b>@devwitheyob</b>',
      );
      if (post.text) {
        await this.bot.telegram.editMessageText(
          channelId,
          post.message_id,
          undefined,
          formatted,
          { parse_mode: 'HTML' },
        );
      } else if (
        post.caption ||
        post.photo ||
        post.video ||
        post.document ||
        post.audio ||
        post.animation
      ) {
        await this.bot.telegram.editMessageCaption(
          channelId,
          post.message_id,
          undefined,
          formatted,
          { parse_mode: 'HTML' },
        );
      }

      // Notify admin
      await this.bot.telegram.sendMessage(
        adminId,
        `A post was just updated on your channel:\n${messageText}\n<b>Updated post:</b>\n${formatted}`,
        { parse_mode: 'HTML' },
      );

      this.logger.log('✅ Channel post processed successfully.');
    } catch (err: any) {
      this.logger.error('❌ Failed to process channel post', err?.stack);

      try {
        await this.bot.telegram.sendMessage(
          adminId,
          `🚨 Error in Telegram Bot\n\nAn error occurred while processing a channel post:\n\n${err.message}\n<b>Stack trace:</b>\n<pre>${err.stack}</pre>`,
          { parse_mode: 'HTML' },
        );

        await this.emailService.sendMail(
          'eyobsmax@gmail.com',
          '🚨 Error in Telegram Bot',
          `<b>An error occurred while processing a channel post:</b><br><pre>${err.stack}</pre>`,
        );

        this.logger.log('📧 Error notification sent successfully.');
      } catch (notifyErr: any) {
        this.logger.error(
          '❌ Failed to send error notification email',
          notifyErr?.stack,
        );
      }
    }
  }
}

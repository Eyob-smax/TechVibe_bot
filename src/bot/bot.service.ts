import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectBot } from 'nestjs-telegraf';
import { Context, Telegraf } from 'telegraf';
import { addTags, formatDate, FormatPostData } from './utils/uitls.js';
import { EmailService } from '../email_service/email_service.service.js';
import { PostsService } from '../posts/posts.service.js';

@Injectable()
export class BotService {
  private readonly logger = new Logger(BotService.name);

  constructor(
    private readonly config: ConfigService,
    @InjectBot() private readonly bot: Telegraf,
    private readonly emailService: EmailService,
    private readonly postService: PostsService,
  ) {}

  async onChannelPost(ctx: Context) {
    const techVibeChannelId = this.config.get<string>('CHANNEL_ID');
    const adminId = Number(this.config.get<string>('BOT_ADMIN_ID'));
    const channelId = ctx?.channelPost?.chat?.id?.toString();

    if (!channelId || techVibeChannelId !== channelId) return;

    try {
      const post = ctx.channelPost as any;
      const originalText = post.text || post.caption || '';
      const taggedText = addTags(originalText);
      const originalEntities = post.entities || post.caption_entities || [];

      let entities = originalEntities.map((e: any) => ({ ...e }));

      const target = '@devwitheyob';
      let offset = taggedText.indexOf(target);
      while (offset !== -1) {
        entities.push({
          type: 'bold',
          offset,
          length: target.length,
        });
        offset = taggedText.indexOf(target, offset + target.length);
      }

      entities.sort((a: any, b: any) => a.offset - b.offset);

      const options = { entities };

      if (post.text) {
        const { textWithoutTags, uniqueTags, skipThis } = FormatPostData(
          post.text,
        );
        if (
          uniqueTags.length > 0 &&
          uniqueTags.includes('#ArticleOfTheDay') &&
          !skipThis
        ) {
          const { message } = await this.postService.saveNewPosts({
            post: textWithoutTags,
            tags: uniqueTags,
            date: new Date(post?.date),
            date_string: formatDate(post?.date) || 'default',
            post_link: `https://t.me/devwitheyob/devwitheyob/${post?.message_id}`,
          });
          if (message) {
            await this.bot.telegram.sendMessage(adminId, message, {
              parse_mode: 'HTML',
            });
          }
        }
        await this.bot.telegram.editMessageText(
          channelId,
          post.message_id,
          undefined,
          taggedText,
          options,
        );
      } else if (
        post.caption ||
        post.photo ||
        post.video ||
        post.document ||
        post.audio ||
        post.animation
      ) {
        const { textWithoutTags, uniqueTags } = FormatPostData(post.caption);
        if (uniqueTags.length > 0 && uniqueTags.includes('#ArticleOfTheDay')) {
          const { message } = await this.postService.saveNewPosts({
            post: textWithoutTags,
            tags: uniqueTags,
            date: new Date(post?.date),
            date_string: formatDate(post?.date) || 'default',
            post_link: `https://t.me/devwitheyob/devwitheyob/${post?.message_id}`,
          });
          if (message) {
            await this.bot.telegram.sendMessage(adminId, message, {
              parse_mode: 'HTML',
            });
          }
        }
        await this.bot.telegram.editMessageCaption(
          channelId,
          post.message_id,
          undefined,
          taggedText,
          { caption_entities: entities },
        );
      }

      await this.bot.telegram.sendMessage(
        adminId,
        `A post was just updated on your channel:\n\n${originalText}\n<b>Updated post:</b>\n<i>${taggedText}</i>`,
        { parse_mode: 'HTML', entities: post.entities },
      );

      this.logger.log('✅ Channel post processed successfully.');
    } catch (err: any) {
      this.logger.error('❌ Failed to process channel post', err?.stack);

      try {
        await this.bot.telegram.sendMessage(
          adminId,
          `🚨 Error in Telegram Bot\n\n${err.message}\n<pre>${err.stack}</pre>`,
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

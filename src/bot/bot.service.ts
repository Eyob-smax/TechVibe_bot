import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectBot, On } from 'nestjs-telegraf';
import { Context, Markup, Telegraf } from 'telegraf';
// import { CallbackQuery } from 'telegraf/typings/core/types/typegram';
import { addTags, formatDate, FormatPostData } from './utils/uitls.js';
import { EmailService } from '../email_service/email_service.service.js';
import { PostsService } from '../posts/posts.service.js';
import { AiService } from '../ai/ai.service.js';

@Injectable()
export class BotService {
  private readonly logger = new Logger(BotService.name);
  grammarUpdates = new Map<
    number,
    { text: string; entities: any[]; caption: boolean }
  >();
  private bot_admin_id: number;
  constructor(
    private config: ConfigService,
    @InjectBot() private readonly bot: Telegraf,
    private readonly emailService: EmailService,
    private readonly postService: PostsService,
    private readonly ai: AiService,
  ) {
    this.bot_admin_id = Number(this.config.get<string>('BOT_ADMIN_ID')!);
  }

  async onChannelPost(ctx: Context) {
    const techVibeChannelId = this.config.get<string>('CHANNEL_ID');

    const channelId = ctx?.channelPost?.chat?.id?.toString();

    if (!channelId || !techVibeChannelId) {
      return await this.bot.telegram.sendMessage(
        this.bot_admin_id,
        `<b>ERROR</b> \n\nChannel ID is not configured properly.`,
        { parse_mode: 'HTML' },
      );
    }

    try {
      const post = ctx.channelPost as any;

      const originalText = post.text || post.caption || '';
      const { taggedText, allowUpdateGrammar } = addTags(originalText);
      const entities = this.prepareEntities(post, taggedText);

      await this.handlePostSaving(post);
      if (allowUpdateGrammar) {
        await this.updateGrammar(taggedText, post, channelId as string);
      } else {
        taggedText !== originalText &&
          (await this.editPostMessage(
            post,
            channelId as string,
            taggedText,
            entities,
          ));
      }
      taggedText !== originalText
        ? await this.notifyAdminOnUpdate(
            this.bot_admin_id,
            originalText,
            taggedText,
            post.entities,
          )
        : null;

      this.logger.log('✅ Channel post processed successfully.');
    } catch (err: any) {
      this.handleError(err, this.bot_admin_id);
    }
  }

  private prepareEntities(post: any, taggedText: string): any[] {
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
      offset = taggedText?.indexOf(target, offset + target.length);
    }

    entities.sort((a: any, b: any) => a.offset - b.offset);
    return entities;
  }

  private async handlePostSaving(post: any): Promise<void> {
    const textToFormat = post.text || post.caption;
    const userID = this.config.get<number>('BOT_ADMIN_ID');

    if (!textToFormat) {
      throw new Error('text to format is undefined');
    }

    if (!userID) {
      throw new Error('User id is not configured from the .env');
    }

    const { textWithoutTags, uniqueTags, skipThis, saveThis } =
      FormatPostData(textToFormat);

    const shouldSave =
      (uniqueTags?.length > 0 &&
        uniqueTags.includes('#ArticleOfTheDay') &&
        !skipThis) ||
      saveThis;

    if (!shouldSave) return;

    const tagsToSave = uniqueTags.includes('#save')
      ? uniqueTags.filter((tag) => tag !== '#save').slice(0, 1)
      : uniqueTags;

    const { message } = await this.postService.saveNewPosts({
      post: textWithoutTags,
      tags: tagsToSave,
      date: new Date(post?.date),
      date_string: new Date().toDateString() || 'default',
      post_link: `https://t.me/devwitheyob/${post?.message_id}`,
    });

    if (message) {
      await this.bot.telegram.sendMessage(userID, message, {
        parse_mode: 'HTML',
      });
    }
  }

  private async editPostMessage(
    post: any,
    channelId: string,
    taggedText: string,
    entities: any[],
  ): Promise<void> {
    if (post.text && post.text !== taggedText) {
      await this.bot.telegram.editMessageText(
        channelId,
        post.message_id,
        undefined,
        taggedText,
        { entities },
      );
    } else if (
      post.caption ||
      post.photo ||
      post.video ||
      post.document ||
      post.audio ||
      post.animation
    ) {
      post.caption !== taggedText &&
        (await this.bot.telegram.editMessageCaption(
          channelId,
          post.message_id,
          undefined,
          taggedText,
          { caption_entities: entities },
        ));
    }
  }

  private async notifyAdminOnUpdate(
    adminId: number,
    originalText: string,
    taggedText: string,
    entities: any[],
  ): Promise<void> {
    await this.bot.telegram.sendMessage(
      adminId,
      `A post was just updated on your channel:\n\n${originalText}\n<b>Updated post:</b>\n<i>${taggedText}</i>`,
      { parse_mode: 'HTML', entities },
    );
  }

  private async updateGrammar(text: string, post: any, channelId: string) {
    const isCaption =
      post.caption ||
      post.photo ||
      post.video ||
      post.document ||
      post.audio ||
      post.animation
        ? true
        : false;
    try {
      const updatedText = await this.ai.updateText(text);
      if (updatedText === 'no grammar update') {
        const entities = this.prepareEntities(post, text);
        await this.editPostMessage(post, channelId, text, entities);
        return;
      }
      const newEntities: any[] = [];
      const target = '@devwitheyob';
      let offset = updatedText.indexOf(target);
      while (offset !== -1) {
        newEntities.push({
          type: 'bold',
          offset,
          length: target.length,
        });
        offset = updatedText.indexOf(target, offset + target.length);
      }
      newEntities.sort((a: any, b: any) => a.offset - b.offset);

      this.grammarUpdates.set(post.message_id, {
        caption: isCaption,
        text: updatedText,
        entities: newEntities,
      });

      const adminId = Number(this.config.get<string>('BOT_ADMIN_ID'));
      const kb = Markup.inlineKeyboard([
        [Markup.button.callback('Post it', `post_grammar:${post.message_id}`)],
      ]);
      await this.bot.telegram.sendMessage(
        adminId,
        `Suggested grammar update:\n\n${updatedText}`,
        {
          reply_markup: kb.reply_markup,
        },
      );
    } catch (error) {
      this.logger.error('Failed to update grammar', error);
    }
  }

  private handleError(err: any, adminId: number): void {
    this.logger.error('❌ Failed to process channel post', err?.message);

    try {
      this.bot.telegram.sendMessage(
        adminId,
        `🚨 Error in Telegram Bot\n\n${err.message}\n<pre>${err.message}</pre>`,
        { parse_mode: 'HTML' },
      );

      // this.emailService.sendMail(
      //   'eyobsmax@gmail.com',
      //   '🚨 Error in Telegram Bot',
      //   `<b>An error occurred while processing a channel post:</b><br><pre>${err.message}</pre>`,
      // );

      this.logger.log('📧 Error notification sent successfully.');
    } catch (notifyErr: any) {
      this.logger.error(
        '❌ Failed to send error notification email',
        notifyErr?.message,
      );
    }
  }

  async handleCallbackQuery(ctx: Context) {
    const query = ctx.callbackQuery;
    if (!query) {
      return console.log('no query');
    }
    if (!('data' in query)) return;

    const data = query.data;
    if (data.startsWith('post_grammar:')) {
      const messageId = Number(data.split(':')[1]);
      const update = this.grammarUpdates.get(messageId);

      if (!update) {
        await ctx.answerCbQuery('Update expired or not found.');
        return;
      }

      try {
        const channelId = this.config.get<string>('CHANNEL_ID');
        if (!channelId) {
          console.log('no channel id');
          return;
        }
        if (update.caption) {
          await this.bot.telegram.editMessageCaption(
            channelId,
            messageId,
            undefined,
            update.text,
            { caption_entities: update.entities },
          );
        } else {
          await this.bot.telegram.editMessageText(
            channelId,
            messageId,
            undefined,
            update.text,
            {
              entities: update.entities,
            },
          );
        }

        await ctx.answerCbQuery('Posted successfully!');
      } catch (err) {
        await ctx.answerCbQuery('Failed to post.');
        this.handleError(err, this.bot_admin_id);
      } finally {
        this.grammarUpdates.delete(messageId);
      }
    }
  }
}

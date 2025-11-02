import { Update, Start, Help, On, Hears, Ctx, Command } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { BotService } from './bot.service.js';
import { NewsService } from '../news/news.service.js';

@Update()
export class BotUpdate {
  constructor(
    private readonly botService: BotService,
    private readonly newsService: NewsService,
  ) {}

  @Start()
  async onStart(@Ctx() ctx: Context) {
    await ctx.reply('👋 Hello Eyob! Welcome to my bot!');
  }

  @Help()
  async onHelp(@Ctx() ctx: Context) {
    await ctx.reply('💡 Use /about or say hi to learn more!');
  }

  @Command('about')
  async about(@Ctx() ctx: Context) {}

  @Hears('hi')
  async sayHi(@Ctx() ctx: Context) {
    await ctx.reply('Hey there! 👋 How can I help you today?');
  }

  @On('text')
  async onText(@Ctx() ctx: Context) {
    const TechNews = await this.newsService.getDailyArticles(
      (ctx.message as any).text,
    );
    TechNews.forEach(async (text) => {
      await ctx.replyWithHTML(text);
    });
  }

  @On('channel_post')
  async onChannelPost(@Ctx() ctx: Context) {
    await this.botService.onChannelPost(ctx);
  }
  @On('callback_query')
  async onCallbackQuery(ctx: Context) {
    await this.botService.handleCallbackQuery(ctx);
  }
}

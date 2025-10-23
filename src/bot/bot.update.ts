import { Update, Start, Help, On, Hears, Ctx, Command } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { BotService } from './bot.service.js';

@Update()
export class BotUpdate {
  constructor(private readonly botService: BotService) {}

  @Start()
  async onStart(@Ctx() ctx: Context) {
    await ctx.reply('👋 Hello Eyob! Welcome to my bot!');
  }

  @Help()
  async onHelp(@Ctx() ctx: Context) {
    await ctx.reply('💡 Use /about or say hi to learn more!');
  }

  @Command('about')
  async about(@Ctx() ctx: Context) {
    const message = this.botService.getAboutMessage();
    await ctx.reply(message);
  }

  @Hears('hi')
  async sayHi(@Ctx() ctx: Context) {
    await ctx.reply('Hey there! 👋 How can I help you today?');
  }

  @On('text')
  async onText(@Ctx() ctx: Context) {
    const m = (
      ctx.message as typeof ctx.message & {
        text: unknown;
      }
    )?.['text'];
    await ctx.reply('Hey u just said ' + m);
  }
}

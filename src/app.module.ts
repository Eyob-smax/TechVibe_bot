import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BotModule } from './bot/bot.module.js';
import { EmailModule } from './email_service/email_service.module.js';
import { TelegrafModule } from 'nestjs-telegraf';
import { DatabaseModule } from './database/database.module.js';
import { NewsModule } from './news/news.module.js';
import { PostsModule } from './posts/posts.module.js';
import { AiModule } from './ai/ai.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      envFilePath: '.env',
      isGlobal: true,
    }),
    TelegrafModule.forRootAsync({
      useFactory: (config: ConfigService) => {
        const token = config.get<string>('Bot_TOKEN');
        if (!token) {
          throw new Error("can't connect to the bot!");
        }
        return { token };
      },
      inject: [ConfigService],
    }),
    BotModule,
    EmailModule,
    DatabaseModule,
    NewsModule,
    PostsModule,
    AiModule,
  ],
})
export class AppModule {}

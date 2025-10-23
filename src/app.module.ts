import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BotModule } from './bot/bot.module.js';
import { EmailModule } from './email_service/email_service.module.js';
import { TelegrafModule } from 'nestjs-telegraf';

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
  ],
})
export class AppModule {}

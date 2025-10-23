import { Module } from '@nestjs/common';
import { BotService } from './bot.service.js';
import { BotController } from './bot.controller.js';
import { BotUpdate } from './bot.update.js';

@Module({
  imports: [],
  controllers: [BotController],
  providers: [BotService, BotUpdate],
})
export class BotModule {}

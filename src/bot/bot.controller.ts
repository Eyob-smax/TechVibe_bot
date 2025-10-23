import { Controller } from '@nestjs/common';
import { BotService } from './bot.service.js';

@Controller('bot')
export class BotController {
  constructor(private readonly botService: BotService) {}
}

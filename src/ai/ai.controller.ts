import {
  Controller,
  Query,
  Get,
  Header,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { AiService } from './ai.service.js';
import type { Response } from 'express';
import { Logger } from '@nestjs/common';

@Controller('ai')
export class AiController {
  private readonly logger = new Logger(AiController.name);

  constructor(private readonly aiService: AiService) {}

  @Get('stream')
  @Header('Content-Type', 'text/event-stream')
  @Header('Cache-Control', 'no-cache')
  @Header('Connection', 'keep-alive')
  @Header('Access-Control-Allow-Origin', '*')
  async stream(@Res() res: Response, @Query('topic') topic: string) {
    if (!topic?.trim()) {
      throw new BadRequestException('Topic query parameter is required');
    }

    res.flushHeaders();

    const subscription = this.aiService.streamResponse(topic).subscribe({
      next: (chunk) => {
        res.write(`data: ${JSON.stringify(chunk.data)}\n\n`);
      },
      complete: () => {
        this.logger.log(`Stream completed for topic: ${topic}`);
        res.end();
      },
      error: (err) => {
        this.logger.error(
          `Stream error for topic "${topic}": ${err.message}`,
          err.stack,
        );
        res.write(
          `event: error\ndata: ${JSON.stringify({ error: err.message })}\n\n`,
        );
        res.end();
      },
    });

    res.on('close', () => {
      subscription.unsubscribe();
      this.logger.log(`Client disconnected for topic: ${topic}`);
    });
  }
}

import { Controller, Query, Get, Header, Res } from '@nestjs/common';
import { AiService } from './ai.service.js';
import type { Response } from 'express';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('stream')
  @Header('Content-Type', 'text/event-stream')
  @Header('Cache-Control', 'no-cache')
  @Header('Connection', 'keep-alive')
  @Header('Access-Control-Allow-Origin', '*')
  async stream(@Res() res: Response, @Query('topic') topic: string) {
    res.flushHeaders();
    const stream = this.aiService.streamResponse(topic);
    stream.subscribe({
      next: (chunk) => res.write(`${chunk}`),
      complete: () => res.end(),
      error: (err) => {
        console.error('Stream error:', err);
        res.write(`event: error\ndata: ${err.message}\n\n`);
        res.end();
      },
    });
  }
}

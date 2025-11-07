import {
  Controller,
  Query,
  BadRequestException,
  Sse,
  MessageEvent,
  Logger,
} from '@nestjs/common';
import { AiService } from './ai.service.js';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Controller('ai')
export class AiController {
  private readonly logger = new Logger(AiController.name);

  constructor(private readonly aiService: AiService) {}

  @Sse('stream')
  stream(@Query('topic') topic: string): Observable<MessageEvent> {
    if (!topic?.trim()) {
      throw new BadRequestException('Topic query parameter is required');
    }

    this.logger.log(`Starting SSE stream for topic: ${topic}`);

    return this.aiService.streamResponse(topic).pipe(
      map((chunk) => {
        console.log(`Sending chunk: ${chunk.data}`);
        return {
          event: 'message',
          data: chunk.data,
        };
      }),
      catchError((err) => {
        this.logger.error(
          `Stream error for topic "${topic}": ${err.message}`,
          err.stack,
        );

        return of({
          data: { error: err.message },
        });
      }),
    );
  }
}

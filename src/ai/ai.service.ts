import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import { GoogleGenAI } from '@google/genai';

export interface AiStreamChunk {
  data: string;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private ai: GoogleGenAI;

  constructor(private readonly config: ConfigService) {
    this.ai = new GoogleGenAI({
      apiKey: this.config.get<string>('GEMINI_API_KEY'),
    });
  }

  streamResponse(topic: string): Observable<AiStreamChunk> {
    return new Observable<AiStreamChunk>((subscriber) => {
      let isCancelled = false;

      (async () => {
        try {
          const model = 'gemini-2.5-pro';
          const tools = [{ googleSearch: {} }];
          const config = { thinkingConfig: { thinkingBudget: -1 }, tools };
          const contents = [{ role: 'user', parts: [{ text: topic }] }];

          const stream = await this.ai.models.generateContentStream({
            model,
            config,
            contents,
          });

          for await (const chunk of stream) {
            if (isCancelled) break;
            if (chunk.text) subscriber.next({ data: chunk.text });
          }

          if (!isCancelled) subscriber.complete();
        } catch (error) {
          this.logger.error('Streaming failed', error);
          if (!isCancelled) subscriber.error(error);
        }
      })();

      return () => {
        isCancelled = true;
        this.logger.log('SSE connection closed by client.');
      };
    });
  }
}

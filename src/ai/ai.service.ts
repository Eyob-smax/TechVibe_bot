import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import { GoogleGenAI } from '@google/genai';

// Define interfaces for type safety (adjust based on actual GoogleGenAI library)
interface StreamChunk {
  text?: string;
}

interface GenerateContentStreamOptions {
  model: string;
  config: {
    thinkingConfig: { thinkingBudget: number };
    tools: Array<{ googleSearch: Record<string, unknown> }>;
  };
  contents: Array<{ role: string; parts: Array<{ text: string }> }>;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private ai: GoogleGenAI;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }
    this.ai = new GoogleGenAI({ apiKey });
  }

  streamResponse(topic: string): Observable<AiStreamChunk> {
    if (!topic?.trim()) {
      throw new BadRequestException('Topic cannot be empty');
    }

    return new Observable<AiStreamChunk>((subscriber) => {
      let isCancelled = false;

      (async () => {
        try {
          const model = this.config.get<string>('AI_MODEL', 'gemini-2.5-pro');
          const tools = [{ googleSearch: {} }];
          const config = { thinkingConfig: { thinkingBudget: -1 }, tools };
          const contents = [{ role: 'user', parts: [{ text: topic }] }];

          const stream = await this.ai.models.generateContentStream({
            model,
            config,
            contents,
          } as GenerateContentStreamOptions);

          for await (const chunk of stream) {
            if (isCancelled) break;
            if (chunk.text) {
              subscriber.next({ data: chunk.text });
            } else {
              this.logger.warn(
                `Received chunk without text for topic: ${topic}`,
              );
            }
          }

          if (!isCancelled) subscriber.complete();
        } catch (error) {
          this.logger.error(
            `Streaming failed for topic "${topic}": ${error.message}`,
            error.stack,
          );
          if (!isCancelled)
            subscriber.error(
              new Error(`Failed to stream response: ${error.message}`),
            );
        }
      })();

      return () => {
        isCancelled = true;
        this.logger.log(`SSE connection closed for topic: ${topic}`);
      };
    });
  }
}

export interface AiStreamChunk {
  data: string;
}

import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import { GoogleGenAI } from '@google/genai';

interface GenerateContentStreamOptions {
  model: string;
  config: {
    thinkingConfig: { thinkingBudget: number };
    tools: Array<{ googleSearch: Record<string, unknown> }>;
  };
  contents: Array<{ role: string; parts: Array<{ text: string }> }>;
}

export interface AiStreamChunk {
  data: string;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private ai: GoogleGenAI;
  private tools = [{ googleSearch: {} }];
  private Googleconfig = {
    thinkingConfig: { thinkingBudget: -1 },
    tools: this.tools,
  };
  private model: string;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('GEMINI_API_KEY');
    this.model = this.config.get<string>('AI_MODEL') || 'gemini-1.5-flash';

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }
    this.ai = new GoogleGenAI({ apiKey });
  }

  async updateText(text: string): Promise<string> {
    if (!text?.trim()) {
      throw new BadRequestException('Text cannot be empty');
    }

    const prompt = `
      You are a professional editor. Fix grammar, spelling, punctuation, and improve clarity and flow.
      Keep the original meaning intact. Do not add or remove information.
      Return only the corrected text — no explanations, no markdown, no quotes.

      Original text:
      """${text.trim()}"""
    `;

    try {
      const result = await this.ai.models.generateContent({
        model: this.model,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: this.Googleconfig,
      } as GenerateContentStreamOptions);

      const correctedText =
        result?.candidates?.[0].content?.parts?.[0].text || 'no grammar update';
      return correctedText;
    } catch (error: any) {
      this.logger.error(
        `Grammar correction failed: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(`Failed to correct text: ${error.message}`);
    }
  }

  streamResponse(topic: string): Observable<AiStreamChunk> {
    if (!topic?.trim()) {
      throw new BadRequestException('Topic cannot be empty');
    }

    return new Observable<AiStreamChunk>((subscriber) => {
      let isCancelled = false;

      (async () => {
        try {
          const contents = [{ role: 'user', parts: [{ text: topic }] }];
          const stream = await this.ai.models.generateContentStream({
            model: this.model,
            config: this.Googleconfig,
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
        } catch (error: any) {
          this.logger.error(
            `Streaming failed for topic "${topic}": ${error.message}`,
            error.stack,
          );
          if (!isCancelled) {
            subscriber.error(
              new Error(`Failed to stream response: ${error.message}`),
            );
          }
        }
      })();

      return () => {
        isCancelled = true;
        this.logger.log(`SSE connection closed for topic: ${topic}`);
      };
    });
  }
}

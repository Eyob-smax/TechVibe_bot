import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import GNews from '@gnews-io/gnews-io-js';
import { formatDailyTechNews } from '../bot/utils/uitls.js';

@Injectable()
export class NewsService {
  private newsApi?: string;

  constructor(private readonly config: ConfigService) {
    this.newsApi = this.config.get<string>('NEWS_API_KEY');
  }

  async getDailyArticles(keyterm: string): Promise<string[]> {
    try {
      if (!this.newsApi) {
        throw new Error('No news API key was found!');
      }

      const client = new GNews(this.newsApi);
      const topHeadlines = await client.search(keyterm, {
        page: 1,
        max: 1,
        lang: 'en',
        sortby: 'date',
      });
      const mappedHeadlines = topHeadlines.articles.map((article) => ({
        title: article.title,
        description: article.description,
        source_url: article.url,
      }));
      const formatted = formatDailyTechNews(mappedHeadlines);
      return formatted;
    } catch (err) {
      console.error('Error fetching news:', err);
      throw new Error('Error fetching news: ' + err.message);
    }
  }
}

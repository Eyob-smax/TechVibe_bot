export interface IDailyArticle {
  title: string;
  description: string;
  source_url: string;
}

export interface IPost {
  post: string;
  date_string: string;
  date: Date;
  post_link: string;
  tags: string[];
}

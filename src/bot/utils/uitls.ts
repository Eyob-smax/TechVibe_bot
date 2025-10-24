import { IDailyArticle } from './types.js';

export function addTags(text: string) {
  if (!text) return '@devwitheyob\n#TechVibe @alnova19';

  const foundTags = Array.from(text.matchAll(/(#\w+|@\w+)/g)).map((m) => m[0]);

  const textWithoutTags = text.replace(/(#\w+|@\w+)/g, '').trimEnd();

  const uniqueTags = Array.from(
    new Set(['@devwitheyob', '\n#TechVibe', ...foundTags, '@alnova19']),
  );

  const tagSection = `\n\n${uniqueTags.join(' ')}`;

  return `${textWithoutTags}${tagSection}`;
}

export function formatDailyTechNews(news: IDailyArticle[]) {
  return news.map((eachNew) => {
    const title = eachNew.title?.trim() || '';
    const description = eachNew.description?.trim() || '';
    const url = eachNew.source_url?.trim() || '';

    const formattedText =
      `<b>${title}</b>\n\n` +
      `${description}\n\n` +
      `<a href="${url}"><b>Read more</b></a>\n`;

    const formattedTextWithTags = addTags(formattedText);

    return formattedTextWithTags;
  });
}

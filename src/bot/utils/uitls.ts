import { IDailyArticle } from './types.js';

export function addTags(text: string) {
  let allowUpdateGrammar = false;
  if (!text)
    return {
      taggedText: '@devwitheyob\n#TechVibe @alnova19',
      allowUpdateGrammar,
    };

  const foundTags = Array.from(text.matchAll(/(#\w+|@\w+)/g)).map((m) => m[0]);

  const textWithoutTags = text.replace(/(#\w+|@\w+)/g, '').trimEnd();

  let uniqueTags = Array.from(new Set([...foundTags]));

  if (uniqueTags.includes('#gupdate')) {
    allowUpdateGrammar = true;
  }

  const skipThese = ['#TechVibe', '#skip', '#save', '#gupdate'];

  uniqueTags = uniqueTags.filter((tag) => {
    return skipThese.includes(tag) ? false : true;
  });

  const tagSection = `\n\n${uniqueTags.join(' ')}`;

  return { taggedText: `${textWithoutTags}${tagSection}`, allowUpdateGrammar };
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

    const { taggedText } = addTags(formattedText);

    return taggedText;
  });
}

export function FormatPostData(text: string) {
  let foundTags = Array.from(text.matchAll(/(#\w+|@\w+)/g)).map((m) => m[0]);
  let skipThis = false;
  let saveThis = false;
  const skipThese = [
    '@alnova19',
    '#TechVibe',
    '@devwitheyob',
    '@devWithEyob',
    '#save',
    '#skip',
  ];
  if (foundTags.includes('#skip')) {
    skipThis = true;
  }
  if (foundTags.includes('#save')) {
    saveThis = true;
  }
  foundTags = foundTags.filter((tag) =>
    skipThese.includes(tag) ? false : true,
  );

  const textWithoutTags = text.replace(/(#\w+|@\w+)/g, '').trimEnd();

  const uniqueTags = Array.from(new Set([...foundTags]));
  return { textWithoutTags, uniqueTags, skipThis, saveThis };
}

export function formatDate(dateInput?: number) {
  if (!dateInput) {
    return null;
  }
  const date = new Date(dateInput);

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();

  return `${month} ${day}, ${year}`;
}

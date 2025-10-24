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

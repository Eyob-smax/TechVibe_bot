export function addTags(text: string) {
  const notext = Array.from(
    new Set(['@devwitheyob\n', '#TechVibe', '@alnova19']),
  );

  if (!text) return notext.join(' ');
  const filteredTags = Array.from(text.matchAll(/#[\w-]+/g)).map((m) => m[0]);
  const uniqueTags = Array.from(
    new Set(['#TechVibe', ...filteredTags, '@alnova19']),
  );
  const tagsSection = uniqueTags.join(' ');
  const textWithoutTags = text.replace(/#[\w-]+/g, '').trimEnd();

  return text
    ? `${textWithoutTags}\n\n@devwitheyob\n${tagsSection}`
    : tagsSection;
}

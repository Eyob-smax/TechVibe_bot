export function addTags(text: string) {
  const filteredTags = Array.from(text.matchAll(/#[\w-]+/g)).map((m) => m[0]);
  const textWithoutTags = text.replace(/#[\w-]+/g, '').trimEnd();
  const uniqueTags = Array.from(
    new Set(['#TechVibe', ...filteredTags, '@alnova19']),
  );
  const tagsSection = uniqueTags.join(' ');
  return `${textWithoutTags}\n\n@devwitheyob\n${tagsSection}`;
}

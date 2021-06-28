import marked from 'marked';

export function parseMarkdown(markdown: string = '') {
  let content = (markdown = markdown);

  let strongMarkIndex = content.indexOf('!!');
  let strongMarkStart = true;

  while (strongMarkIndex !== -1) {
    if (strongMarkStart) {
      content = content.replace('!!', '<strong class="strong-mark">');
    } else {
      content = content.replace('!!', '</strong>');
    }

    strongMarkIndex = content.indexOf('!!');
    strongMarkStart = !strongMarkStart;
  }

  return marked(content);
}

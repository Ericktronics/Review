import hljs from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';
import dockerfile from 'highlight.js/lib/languages/dockerfile';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import plaintext from 'highlight.js/lib/languages/plaintext';
import python from 'highlight.js/lib/languages/python';
import sql from 'highlight.js/lib/languages/sql';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';
import yaml from 'highlight.js/lib/languages/yaml';

// Only what the cards use. Add a language here when a card needs a new one.
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('dockerfile', dockerfile);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('json', json);
hljs.registerLanguage('plaintext', plaintext);
hljs.registerLanguage('python', python);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('yaml', yaml);
hljs.registerAliases('tsx', { languageName: 'typescript' });
hljs.registerAliases('text', { languageName: 'plaintext' });

/** Returns escaped HTML, safe to inject. Unknown languages fall back to plain text. */
export function highlight(snippet: string, language: string): string {
  const known = hljs.getLanguage(language) ? language : 'plaintext';
  return hljs.highlight(snippet, { language: known }).value;
}

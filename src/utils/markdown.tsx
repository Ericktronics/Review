import type { ReactNode } from 'react';

export function renderInline(text: string): ReactNode {
  // Bold may contain code, and code may contain asterisks (`**kwargs`)
  const parts = text.split(/(\*\*(?:`[^`]+`|[^*`])+\*\*|`[^`]+`)/g);
  return (
    <>
      {parts.map((p, i) => {
        if (p.length > 4 && p.startsWith('**') && p.endsWith('**')) {
          return (
            <strong key={i} className="font-semibold text-ink">
              {renderInline(p.slice(2, -2))}
            </strong>
          );
        }
        if (p.length > 2 && p.startsWith('`') && p.endsWith('`')) {
          return (
            <code key={i} className="rounded-[3px] bg-sunken px-1 py-px font-mono text-[0.875em] text-ink [-webkit-box-decoration-break:clone] [box-decoration-break:clone]">
              {p.slice(1, -1)}
            </code>
          );
        }
        return <span key={i}>{p}</span>;
      })}
    </>
  );
}

const NUMBERED = /^(\d+)[.)] /;

export function renderAnswer(text: string): ReactNode {
  const lines = text.split('\n');
  const nodes: ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // blank line
    if (!line.trim()) { i++; continue; }

    // fenced code block
    if (line.trim().startsWith('```')) {
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        code.push(lines[i]);
        i++;
      }
      i++; // closing fence
      nodes.push(
        <pre key={`pre-${i}`} className="overflow-x-auto rounded-md border bg-sunken px-3 py-2.5 font-mono text-[13px] leading-[1.55]">
          {code.join('\n')}
        </pre>
      );
      continue;
    }

    // markdown table row
    if (line.trim().startsWith('|')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i].trim());
        i++;
      }
      const data = tableLines.filter(l => !l.match(/^\|[-| :]+\|$/));
      if (data.length > 0) {
        const [header, ...rows] = data;
        const headers = header.split('|').filter(Boolean).map(s => s.trim());
        const body = rows.map(r => r.split('|').filter(Boolean).map(s => s.trim()));
        nodes.push(
          <div key={`tbl-${i}`} className="overflow-x-auto">
            <table className="w-full border-collapse text-[14px] leading-snug">
              <thead>
                <tr>
                  {headers.map((h, j) => (
                    <th key={j} className="border-b border-muted/40 py-2 pr-4 text-left align-bottom font-semibold text-ink">
                      {renderInline(h)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {body.map((row, j) => (
                  <tr key={j}>
                    {row.map((cell, k) => (
                      <td key={k} className="border-b py-2 pr-4 align-top">
                        {renderInline(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      continue;
    }

    // bullet list; items indented in the source stay indented
    if (line.trim().startsWith('- ')) {
      const items: { text: string; nested: boolean }[] = [];
      while (i < lines.length && lines[i].trim().startsWith('- ')) {
        items.push({ text: lines[i].trim().slice(2), nested: /^\s{2,}/.test(lines[i]) });
        i++;
      }
      nodes.push(
        <ul key={`ul-${i}`} className="list-disc space-y-1.5 pl-5 marker:text-muted">
          {items.map((item, j) => (
            <li key={j} className={item.nested ? 'ml-5' : undefined}>{renderInline(item.text)}</li>
          ))}
        </ul>
      );
      continue;
    }

    // numbered list; keeps the source numbers so a list split by nested bullets carries on counting
    if (NUMBERED.test(line.trim())) {
      const items: { n: number; text: string }[] = [];
      while (i < lines.length) {
        const cur = lines[i].trim();
        const match = cur.match(NUMBERED);
        if (match) {
          items.push({ n: Number(match[1]), text: cur.slice(match[0].length) });
          i++;
        } else if (cur === '') {
          // look ahead past blank lines — stay in the list if next non-blank is a numbered item
          let peek = i + 1;
          while (peek < lines.length && lines[peek].trim() === '') peek++;
          if (peek < lines.length && NUMBERED.test(lines[peek].trim())) {
            i++; // consume the blank line and continue
          } else {
            break;
          }
        } else {
          break;
        }
      }
      nodes.push(
        <ol key={`ol-${i}`} className="tnum list-decimal space-y-1.5 pl-6 marker:text-muted">
          {items.map((item) => (
            <li key={item.n} value={item.n}>{renderInline(item.text)}</li>
          ))}
        </ol>
      );
      continue;
    }

    // regular paragraph
    nodes.push(<p key={`p-${i}`}>{renderInline(line)}</p>);
    i++;
  }

  return <div className="space-y-3">{nodes}</div>;
}

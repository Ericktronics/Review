import type { ReactNode } from 'react';

function renderInline(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith('**') && p.endsWith('**') ? (
          <strong key={i} className="font-semibold text-slate-100">
            {p.slice(2, -2)}
          </strong>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}

export function renderAnswer(text: string): ReactNode {
  const lines = text.split('\n');
  const nodes: ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // blank line
    if (!line.trim()) { i++; continue; }

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
          <div key={`tbl-${i}`} className="overflow-x-auto rounded-lg border border-slate-700 my-1">
            <table className="w-full text-xs">
              <thead className="bg-slate-800">
                <tr>
                  {headers.map((h, j) => (
                    <th key={j} className="px-3 py-2 text-left font-semibold text-slate-300 border-b border-slate-700">
                      {renderInline(h)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {body.map((row, j) => (
                  <tr key={j} className={j % 2 === 0 ? 'bg-slate-900' : 'bg-slate-800/40'}>
                    {row.map((cell, k) => (
                      <td key={k} className="px-3 py-2 text-slate-300 border-b border-slate-700/50">
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

    // bullet list
    if (line.trim().startsWith('- ')) {
      const items: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('- ')) {
        items.push(lines[i].trim().slice(2));
        i++;
      }
      nodes.push(
        <ul key={`ul-${i}`} className="space-y-1.5 my-1">
          {items.map((item, j) => (
            <li key={j} className="flex gap-2">
              <span className="text-indigo-400 flex-shrink-0 leading-relaxed">•</span>
              <span className="leading-relaxed">{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // numbered list
    if (line.trim().match(/^\d+[.)]/)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].trim().match(/^\d+[.)] /)) {
        items.push(lines[i].trim().replace(/^\d+[.)] /, ''));
        i++;
      }
      nodes.push(
        <ol key={`ol-${i}`} className="space-y-1.5 my-1">
          {items.map((item, j) => (
            <li key={j} className="flex gap-2">
              <span className="text-indigo-400 font-mono text-xs flex-shrink-0 w-5 leading-relaxed pt-0.5">
                {j + 1}.
              </span>
              <span className="leading-relaxed">{renderInline(item)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // regular paragraph
    nodes.push(
      <p key={`p-${i}`} className="leading-relaxed">
        {renderInline(line)}
      </p>
    );
    i++;
  }

  return <div className="space-y-2">{nodes}</div>;
}

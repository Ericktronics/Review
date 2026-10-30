import { memo, useMemo } from 'react';
import type { CardStatus, Flashcard } from '../types';
import { highlight } from '../utils/highlight';
import { renderAnswer } from '../utils/markdown';
import { Icon } from './Icons';

export const LEVEL_LABELS: Record<Flashcard['type'], string> = {
  basics: 'Fundamentals',
  experience: 'Senior',
};

const DIFFICULTY_BARS: Record<Flashcard['difficulty'], number> = { easy: 1, medium: 2, hard: 3 };

export function DifficultyMark({ difficulty }: { difficulty: Flashcard['difficulty'] }) {
  const filled = DIFFICULTY_BARS[difficulty];
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap capitalize">
      <svg className="h-3 w-3" viewBox="0 0 12 12" aria-hidden="true">
        {[1, 2, 3].map((bar) => (
          <rect
            key={bar}
            x={(bar - 1) * 4.25}
            y={12 - bar * 4}
            width="3"
            height={bar * 4}
            rx="0.5"
            fill="currentColor"
            opacity={bar <= filled ? 1 : 0.25}
          />
        ))}
      </svg>
      {difficulty}
    </span>
  );
}

export function CardMeta({ card, showCategory }: { card: Flashcard; showCategory: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] leading-5 text-muted">
      {showCategory && <span>{card.category}</span>}
      <DifficultyMark difficulty={card.difficulty} />
      <span>{LEVEL_LABELS[card.type]}</span>
      <span className="tnum">{card.id}</span>
    </div>
  );
}

function CodeBlock({ code }: { code: NonNullable<Flashcard['code']> }) {
  const html = useMemo(() => highlight(code.snippet, code.language), [code.snippet, code.language]);

  return (
    <figure className="mt-4 min-w-0 rounded-md border bg-sunken">
      <figcaption className="px-3 pt-2 text-[12px] leading-4 text-muted">{code.language}</figcaption>
      <pre className="overflow-x-auto px-3 pb-3 pt-1.5 font-mono text-[13px] leading-[1.55] text-body">
        <code dangerouslySetInnerHTML={{ __html: html }} />
      </pre>
    </figure>
  );
}

export const Answer = memo(function Answer({ card }: { card: Flashcard }) {
  return (
    <div className="min-w-0 break-words">
      {renderAnswer(card.answer)}
      {card.code && <CodeBlock code={card.code} />}
    </div>
  );
});

export function KnownToggle({
  status,
  onToggle,
}: {
  status: CardStatus | undefined;
  onToggle: () => void;
}) {
  const known = status === 'known';
  return (
    <button
      type="button"
      aria-pressed={known}
      onClick={onToggle}
      className={`-ml-2 inline-flex min-h-8 items-center gap-1.5 rounded px-2 text-[13px] transition-colors hover:bg-sunken ${
        known ? 'text-known' : 'text-muted hover:text-ink'
      }`}
    >
      <Icon name="check" className="h-3.5 w-3.5" />
      {known ? 'Known' : 'Mark as known'}
    </button>
  );
}

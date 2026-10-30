import { memo, useState } from 'react';
import type { CardStatus, Flashcard } from '../types';
import { renderInline } from '../utils/markdown';
import { Answer, DifficultyMark, KnownToggle } from './CardParts';
import { Icon } from './Icons';

interface RowProps {
  card: Flashcard;
  status: CardStatus | undefined;
  showCategory: boolean;
  onToggleKnown: (id: string) => void;
}

const BrowseRow = memo(function BrowseRow({ card, status, showCategory, onToggleKnown }: RowProps) {
  const [open, setOpen] = useState(false);

  return (
    <li className="border-b">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-start gap-3 py-3 text-left transition-colors hover:bg-sunken/60"
      >
        <Icon
          name="chevronRight"
          className={`mt-1 h-3.5 w-3.5 text-muted transition-transform duration-150 ${open ? 'rotate-90' : ''}`}
        />
        <span className={`min-w-0 flex-1 break-words text-[15px] leading-snug text-ink ${open ? 'font-semibold' : ''}`}>
          {renderInline(card.question)}
        </span>
        {status && (
          <span className={`mt-0.5 ${status === 'known' ? 'text-known' : 'text-again'}`} title={status === 'known' ? 'Known' : 'Review again'}>
            {status === 'known' ? <Icon name="check" className="h-3.5 w-3.5" /> : <span className="whitespace-nowrap text-[12px]">Review</span>}
          </span>
        )}
        {showCategory && (
          <span className="hidden w-44 flex-shrink-0 truncate text-[13px] leading-5 text-muted md:block">{card.category}</span>
        )}
        <span className="w-[4.75rem] flex-shrink-0 text-[13px] leading-5 text-muted">
          <DifficultyMark difficulty={card.difficulty} />
        </span>
      </button>
      {open && (
        <div className="pb-5 pl-[1.625rem] pr-2">
          <div className="max-w-3xl">
            <Answer card={card} />
            <div className="mt-3">
              <KnownToggle status={status} onToggle={() => onToggleKnown(card.id)} />
            </div>
          </div>
        </div>
      )}
    </li>
  );
});

interface Props {
  cards: Flashcard[];
  progress: Record<string, CardStatus>;
  showCategory: boolean;
  onToggleKnown: (id: string) => void;
}

export function BrowseView({ cards, progress, showCategory, onToggleKnown }: Props) {
  return (
    <div className="mx-auto w-full max-w-[1120px] px-4 py-3 sm:px-6 lg:px-8">
    <ul className="rounded-2xl bg-raised px-4 shadow-soft">
      {cards.map((c) => (
        <BrowseRow
          key={c.id}
          card={c}
          status={progress[c.id]}
          showCategory={showCategory}
          onToggleKnown={onToggleKnown}
        />
      ))}
    </ul>
    </div>
  );
}

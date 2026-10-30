import { memo, useEffect, useState } from 'react';
import type { CardStatus, Flashcard } from '../types';
import { renderInline } from '../utils/markdown';
import { Answer, CardMeta, KnownToggle } from './CardParts';

interface RowProps {
  card: Flashcard;
  status: CardStatus | undefined;
  showCategory: boolean;
  answersHidden: boolean;
  onToggleKnown: (id: string) => void;
}

const StudyRow = memo(function StudyRow({ card, status, showCategory, answersHidden, onToggleKnown }: RowProps) {
  const [hidden, setHidden] = useState(answersHidden);

  // The toolbar's show/hide applies to every row; each row can still be flipped on its own after
  useEffect(() => setHidden(answersHidden), [answersHidden]);

  return (
    <article className="defer-offscreen mb-4 rounded-2xl bg-raised p-5 shadow-soft sm:p-7">
      <div className="grid grid-cols-1 gap-x-10 gap-y-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        {/* Follows the reader down a long answer, clear of the 3.5rem header */}
        <div className="min-w-0 self-start lg:sticky lg:top-[4.5rem]">
          <h3 className="whitespace-pre-line break-words text-[17px] font-semibold leading-snug text-ink">
            {renderInline(card.question)}
          </h3>
          <div className="mt-2.5">
            <CardMeta card={card} showCategory={showCategory} />
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2">
            <KnownToggle status={status} onToggle={() => onToggleKnown(card.id)} />
            {!hidden && (
              <button
                type="button"
                onClick={() => setHidden(true)}
                className="min-h-8 rounded px-2 text-[13px] text-muted transition-colors hover:bg-sunken hover:text-ink"
              >
                Hide answer
              </button>
            )}
          </div>
        </div>

        <div className="min-w-0">
          {hidden ? (
            <button
              type="button"
              onClick={() => setHidden(false)}
              className="h-9 rounded-md border bg-raised px-3 text-[13px] font-medium text-accent transition-colors hover:bg-sunken"
            >
              Show answer
            </button>
          ) : (
            <Answer card={card} />
          )}
        </div>
      </div>
    </article>
  );
});

interface Props {
  cards: Flashcard[];
  progress: Record<string, CardStatus>;
  showCategory: boolean;
  answersHidden: boolean;
  onToggleKnown: (id: string) => void;
}

export function StudyView({ cards, progress, showCategory, answersHidden, onToggleKnown }: Props) {
  return (
    <div className="mx-auto w-full max-w-[1120px] px-4 pt-3 sm:px-6 lg:px-8">
      {cards.map((c) => (
        <StudyRow
          key={c.id}
          card={c}
          status={progress[c.id]}
          showCategory={showCategory}
          answersHidden={answersHidden}
          onToggleKnown={onToggleKnown}
        />
      ))}
    </div>
  );
}

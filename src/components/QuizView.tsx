import { useCallback, useEffect, useState, type ReactNode } from 'react';
import type { CardStatus, Flashcard, Progress } from '../types';
import { renderInline } from '../utils/markdown';
import { Answer, CardMeta } from './CardParts';
import { Icon } from './Icons';
import { GoalRing } from './Today';

interface Props {
  /** The session is fixed at mount, so grading a card never reshuffles the deck under the user. */
  cards: Flashcard[];
  progress: Progress;
  onGrade: (id: string, status: CardStatus) => void;
  showCategory: boolean;
  /** Shown when the session starts with no cards. */
  empty: ReactNode;
  today: number;
  goal: number;
  streak: number;
  onExit: () => void;
}

const hint = 'ml-2 hidden rounded border border-current px-1 text-[11px] leading-4 opacity-70 [@media(hover:hover)]:inline';
const stepButton =
  'inline-flex h-11 w-11 items-center justify-center rounded-xl bg-raised text-body shadow-soft transition-colors hover:text-ink disabled:cursor-not-allowed disabled:opacity-40';
const CONFETTI = ['bg-accent', 'bg-gold', 'bg-streak', 'bg-again'];

export function QuizView({ cards: initialCards, progress, onGrade, showCategory, empty, today, goal, streak, onExit }: Props) {
  const [cards, setCards] = useState(initialCards);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [finished, setFinished] = useState(false);
  const [graded, setGraded] = useState<Progress>({});
  const [run, setRun] = useState(0);
  const [startedAt] = useState(today);

  const card = cards[index];

  const goTo = useCallback((next: number) => {
    setRevealed(false);
    if (next >= cards.length) {
      setFinished(true);
    } else {
      setIndex(Math.max(0, next));
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [cards.length]);

  const grade = useCallback((status: CardStatus) => {
    if (!card) return;
    onGrade(card.id, status);
    setGraded((g) => ({ ...g, [card.id]: status }));
    setRun((r) => (status === 'known' ? r + 1 : 0));
    goTo(index + 1);
  }, [card, index, goTo, onGrade]);

  function restart(deck: Flashcard[]) {
    setCards(deck);
    setIndex(0);
    setRevealed(false);
    setFinished(false);
    setGraded({});
    setRun(0);
  }

  // ←/→ navigate, Space reveals or hides, 1/2 grade a revealed card
  useEffect(() => {
    if (finished) return;

    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.isContentEditable) return;

      if (e.code === 'Space') {
        if (target.tagName === 'BUTTON') return; // let the focused button handle it
        e.preventDefault();
        setRevealed((r) => !r);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goTo(index + 1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goTo(index - 1);
      } else if (revealed && e.key === '1') {
        grade('again');
      } else if (revealed && e.key === '2') {
        grade('known');
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [finished, index, revealed, goTo, grade]);

  if (finished) {
    const missed = cards.filter((c) => graded[c.id] === 'again');
    const known = cards.filter((c) => graded[c.id] === 'known').length;
    const goalJustHit = startedAt < goal && today >= goal;
    const title = goalJustHit ? 'Daily goal reached!'
      : known === 0 && missed.length === 0 ? 'End of this deck'
      : missed.length === 0 ? 'Perfect round!'
      : known >= missed.length ? 'Solid round'
      : 'Good practice. These will stick next time.';

    return (
      <div className="relative mx-auto w-full max-w-xl overflow-hidden px-4 py-8 sm:px-6">
        {goalJustHit && (
          <div className="pointer-events-none absolute inset-x-0 top-0 h-full motion-reduce:hidden" aria-hidden="true">
            {Array.from({ length: 28 }, (_, i) => (
              <span
                key={i}
                className={`confetti ${CONFETTI[i % CONFETTI.length]}`}
                style={{ left: `${(i * 37) % 100}%`, animationDelay: `${(i % 7) * 70}ms` }}
              />
            ))}
          </div>
        )}
        <div className="animate-card-in rounded-3xl bg-raised p-6 text-center shadow-soft sm:p-8">
          <div className="flex justify-center"><GoalRing value={today} goal={goal} /></div>
          <h2 className="mt-5 text-[26px] font-bold leading-tight text-ink">{title}</h2>
          <p className="tnum mt-2 text-body">
            {known} known, {missed.length} to review
          </p>
          {streak > 0 && (
            <p className="tnum mt-3 inline-flex items-center gap-1.5 font-semibold text-ink">
              <Icon name="flame" className="h-5 w-5 text-streak" />
              {streak} day streak
            </p>
          )}
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {missed.length > 0 && (
              <button type="button" onClick={() => restart(missed)} className="btn-primary">
                Retry the {missed.length} you missed
              </button>
            )}
            <button type="button" onClick={onExit} className="btn-secondary">Back to today</button>
          </div>
        </div>
      </div>
    );
  }

  if (!card) return <>{empty}</>;

  const status = progress[card.id];

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 pt-4 sm:px-6">
      <div className="tnum mb-2 flex items-center justify-between text-[13px] text-muted">
        <span>Card {index + 1} of {cards.length}</span>
        {run >= 2 ? (
          <span key={run} className="animate-pop inline-flex items-center gap-1 font-semibold text-streak">
            <Icon name="flame" className="h-4 w-4" />
            {run} in a row
          </span>
        ) : status && (
          <span className={status === 'known' ? 'text-known' : 'text-again'}>
            {status === 'known' ? 'Known before' : 'Missed last time'}
          </span>
        )}
      </div>
      <div className="mb-4 h-2.5 overflow-hidden rounded-full bg-sunken" role="presentation">
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-300"
          style={{ width: `${(index / cards.length) * 100}%` }}
        />
      </div>

      <article key={card.id} className="animate-card-in flex-1 rounded-3xl bg-raised shadow-soft">
        <div className="px-5 py-7 sm:px-8 sm:py-9">
          <h2 className="whitespace-pre-line break-words text-[21px] font-bold leading-snug text-ink sm:text-[25px]">
            {renderInline(card.question)}
          </h2>
          <div className="mt-3">
            <CardMeta card={card} showCategory={showCategory} />
          </div>
        </div>
        {revealed && (
          <div className="animate-pop border-t-2 border-again/60 px-5 py-6 sm:px-8 sm:py-7">
            <Answer card={card} />
          </div>
        )}
      </article>

      {/* Stays on screen so a long answer never pushes the grade buttons out of reach */}
      <div className="sticky bottom-0 mt-4 flex items-center gap-2 bg-canvas py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <button type="button" className={stepButton} aria-label="Previous card" disabled={index === 0} onClick={() => goTo(index - 1)}>
          <Icon name="chevronLeft" />
        </button>
        <button type="button" className={stepButton} aria-label="Next card" onClick={() => goTo(index + 1)}>
          <Icon name="chevronRight" />
        </button>
        <div className="ml-auto flex items-center gap-2">
          {revealed ? (
            <>
              <button type="button" onClick={() => grade('again')} className="btn-secondary !text-again">
                Review again<kbd className={hint}>1</kbd>
              </button>
              <button type="button" onClick={() => grade('known')} className="btn-primary">
                Got it<kbd className={hint}>2</kbd>
              </button>
            </>
          ) : (
            <button type="button" onClick={() => setRevealed(true)} className="btn-primary">
              Show answer<kbd className={hint}>Space</kbd>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

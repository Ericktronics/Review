import { useEffect, useRef, useState } from 'react';
import hljs from 'highlight.js';
import type { Flashcard } from '../types';
import { renderAnswer } from '../utils/markdown';

interface Props {
  card: Flashcard;
  /** compact = grid/browse view (smaller padding, no reveal button) */
  compact?: boolean;
  /** quizMode = answer hidden until the user clicks Reveal */
  quizMode?: boolean;
  /** studyWide = full-width two-column layout for Study mode */
  studyWide?: boolean;
  /** controlled reveal state for quizMode (e.g. driven by keyboard shortcuts in the parent) */
  revealed?: boolean;
  onRevealChange?: (revealed: boolean) => void;
}

const DIFF: Record<Flashcard['difficulty'], string> = {
  easy:   'text-emerald-400 bg-emerald-400/10 border border-emerald-400/20',
  medium: 'text-amber-400  bg-amber-400/10  border border-amber-400/20',
  hard:   'text-red-400    bg-red-400/10    border border-red-400/20',
};

const TYPE: Record<Flashcard['type'], { label: string; cls: string }> = {
  basics:     { label: 'Must Know Basics',            cls: 'text-sky-400   bg-sky-400/10   border border-sky-400/20' },
  experience: { label: 'Must Know for Exp. Hires',   cls: 'text-violet-400 bg-violet-400/10 border border-violet-400/20' },
};

function CodeBlock({ code }: { code: NonNullable<Flashcard['code']> }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (ref.current && !ref.current.dataset['highlighted']) {
      hljs.highlightElement(ref.current);
    }
  }, [code.snippet]);

  return (
    <div className="mt-3 rounded-lg overflow-hidden border border-slate-700">
      <div className="bg-slate-800 px-3 py-1.5 text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700 select-none">
        {code.language}
      </div>
      <pre className="m-0 overflow-x-auto">
        <code ref={ref} className={`language-${code.language} !text-xs !leading-relaxed`}>
          {code.snippet}
        </code>
      </pre>
    </div>
  );
}

export function FlashCard({
  card,
  compact = false,
  quizMode = false,
  studyWide = false,
  revealed: revealedProp,
  onRevealChange,
}: Props) {
  const [internalRevealed, setInternalRevealed] = useState(!quizMode);

  // Reset when the card or mode changes (uncontrolled usage only)
  useEffect(() => { setInternalRevealed(!quizMode); }, [card.id, quizMode]);

  const revealed = revealedProp ?? internalRevealed;
  const setRevealed = onRevealChange ?? setInternalRevealed;

  const pad = compact ? 'p-4' : 'p-6';

  // ── Study wide layout ─────────────────────────────────────────────
  const [folded, setFolded] = useState(false);

  if (studyWide) {
    return (
      <div className="rounded-xl border border-slate-700/60 bg-slate-900 overflow-hidden">
        {/* badges row + fold toggle */}
        <div className="flex items-center gap-2 flex-wrap px-6 pt-4 pb-3 border-b border-slate-700/40">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-full">
            {card.category}
          </span>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${DIFF[card.difficulty]}`}>
            {card.difficulty}
          </span>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${TYPE[card.type].cls}`}>
            {TYPE[card.type].label}
          </span>

          <button
            onClick={() => setFolded(f => !f)}
            className="ml-auto flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors px-2 py-1 rounded-md hover:bg-slate-800"
            title={folded ? 'Expand answer' : 'Fold answer'}
          >
            <svg
              className={`w-3.5 h-3.5 transition-transform duration-200 ${folded ? '-rotate-90' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
            {folded ? 'Show answer' : 'Hide answer'}
          </button>
        </div>

        {/* body */}
        {folded ? (
          /* folded: question only, full width */
          <div className="px-6 py-5">
            <p className="text-base font-semibold text-slate-100 leading-relaxed whitespace-pre-line">
              {card.question}
            </p>
          </div>
        ) : (
          /* expanded: two-column */
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] divide-y lg:divide-y-0 lg:divide-x divide-slate-700/50">
            {/* left: question */}
            <div className="p-6 flex flex-col justify-start min-w-0">
              <p className="text-base font-semibold text-slate-100 leading-relaxed whitespace-pre-line break-words">
                {card.question}
              </p>
            </div>

            {/* right: answer + code */}
            <div className="p-6 min-w-0 overflow-hidden">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500 block mb-3">Answer</span>
              <div className="text-sm text-slate-300 space-y-2 break-words">
                {renderAnswer(card.answer)}
              </div>
              {card.code && <CodeBlock code={card.code} />}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Standard layout (quiz / browse) ──────────────────────────────
  return (
    <div className="rounded-xl border border-slate-700/80 bg-slate-900 overflow-hidden flex flex-col">
      {/* ── Question ─────────────────────────────────────── */}
      <div className={pad}>
        {/* badges */}
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-full">
            {card.category}
          </span>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${DIFF[card.difficulty]}`}>
            {card.difficulty}
          </span>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${TYPE[card.type].cls}`}>
            {TYPE[card.type].label}
          </span>
        </div>

        {/* question text – always visible and selectable */}
        <p className={`font-semibold text-slate-100 leading-relaxed ${compact ? 'text-base' : 'text-lg'}`}>
          {card.question}
        </p>

        {/* Reveal button (quiz mode only, answer hidden) */}
        {quizMode && !revealed && (
          <button
            className="mt-4 w-full py-2 rounded-lg border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm font-semibold hover:bg-indigo-500/20 transition-colors"
            onClick={() => setRevealed(true)}
          >
            Show Answer ↓
          </button>
        )}
      </div>

      {/* ── Answer (visible when revealed) ───────────────── */}
      {revealed && (
        <>
          <div className="border-t border-slate-700/60" />
          <div className={`${pad} flex-1`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Answer</span>
              {quizMode && (
                <button
                  className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                  onClick={() => setRevealed(false)}
                >
                  Hide ↑
                </button>
              )}
            </div>
            <div className={`text-slate-300 ${compact ? 'text-xs' : 'text-sm'} space-y-2`}>
              {renderAnswer(card.answer)}
            </div>
            {card.code && <CodeBlock code={card.code} />}
          </div>
        </>
      )}
    </div>
  );
}

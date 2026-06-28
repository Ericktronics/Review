import { useMemo, useState } from 'react';
import { flashcards } from './data/flashcards';
import type { Category, Flashcard } from './types';
import { FlashCard } from './components/FlashCard';
import { Sidebar } from './components/Sidebar';
import { Controls } from './components/Controls';

type ViewMode = 'quiz' | 'study' | 'browse';
type Difficulty = 'all' | 'easy' | 'medium' | 'hard';
type TypeFilter = 'all' | 'basics' | 'experience';

const ALL_CATEGORIES = Array.from(new Set(flashcards.map((c) => c.category))) as Category[];

const DIFF_COLORS: Record<Difficulty, string> = {
  all:    'bg-slate-700 text-slate-100 border-slate-600',
  easy:   'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  medium: 'bg-amber-500/20  text-amber-300  border-amber-500/40',
  hard:   'bg-red-500/20    text-red-300    border-red-500/40',
};

const DIFF_ACTIVE: Record<Difficulty, string> = {
  all:    'ring-2 ring-slate-400 ring-offset-1 ring-offset-slate-950',
  easy:   'ring-2 ring-emerald-400 ring-offset-1 ring-offset-slate-950',
  medium: 'ring-2 ring-amber-400 ring-offset-1 ring-offset-slate-950',
  hard:   'ring-2 ring-red-400 ring-offset-1 ring-offset-slate-950',
};

const TYPE_COLORS: Record<TypeFilter, string> = {
  all:        'bg-slate-700 text-slate-100 border-slate-600',
  basics:     'bg-sky-500/20    text-sky-300    border-sky-500/40',
  experience: 'bg-violet-500/20 text-violet-300 border-violet-500/40',
};

const TYPE_ACTIVE: Record<TypeFilter, string> = {
  all:        'ring-2 ring-slate-400 ring-offset-1 ring-offset-slate-950',
  basics:     'ring-2 ring-sky-400 ring-offset-1 ring-offset-slate-950',
  experience: 'ring-2 ring-violet-400 ring-offset-1 ring-offset-slate-950',
};

const TYPE_LABELS: Record<TypeFilter, string> = {
  all:        'All',
  basics:     'Must Know Basics',
  experience: 'Must Know for Exp. Hires',
};

const TYPE_LABELS_SHORT: Record<TypeFilter, string> = {
  all:        'All',
  basics:     'Basics',
  experience: 'Exp. Hires',
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const VIEW_LABELS: Record<ViewMode, string> = {
  quiz:   'Quiz',
  study:  'Study',
  browse: 'Browse All',
};

const VIEW_DESCRIPTIONS: Record<ViewMode, string> = {
  quiz:   'One card at a time — answer hidden until you reveal it',
  study:  'All cards fully expanded — read through at your own pace',
  browse: 'Grid overview — all questions and answers visible',
};

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [index, setIndex] = useState(0);
  const [deck, setDeck] = useState<Flashcard[]>(flashcards);
  const [viewMode, setViewMode] = useState<ViewMode>('study');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Category filter first, then difficulty filter
  const byCat = useMemo(
    () => (selectedCategory ? deck.filter((c) => c.category === selectedCategory) : deck),
    [deck, selectedCategory]
  );

  const filtered = useMemo(() => {
    let cards = byCat;
    if (difficultyFilter !== 'all') cards = cards.filter(c => c.difficulty === difficultyFilter);
    if (typeFilter !== 'all')       cards = cards.filter(c => c.type === typeFilter);
    return cards;
  }, [byCat, difficultyFilter, typeFilter]);

  // Counts within current category + type filter (for difficulty chips)
  const byType = useMemo(
    () => (typeFilter === 'all' ? byCat : byCat.filter(c => c.type === typeFilter)),
    [byCat, typeFilter]
  );

  const diffCounts = useMemo(() => ({
    all:    byType.length,
    easy:   byType.filter(c => c.difficulty === 'easy').length,
    medium: byType.filter(c => c.difficulty === 'medium').length,
    hard:   byType.filter(c => c.difficulty === 'hard').length,
  }), [byType]);

  // Counts within current category + difficulty filter (for type chips)
  const byDiff = useMemo(
    () => (difficultyFilter === 'all' ? byCat : byCat.filter(c => c.difficulty === difficultyFilter)),
    [byCat, difficultyFilter]
  );

  const typeCounts = useMemo(() => ({
    all:        byDiff.length,
    basics:     byDiff.filter(c => c.type === 'basics').length,
    experience: byDiff.filter(c => c.type === 'experience').length,
  }), [byDiff]);

  const counts = useMemo(
    () =>
      ALL_CATEGORIES.reduce<Record<string, number>>((acc, cat) => {
        acc[cat] = flashcards.filter((c) => c.category === cat).length;
        return acc;
      }, {}),
    []
  );

  function handleCategorySelect(cat: Category | null) {
    setSelectedCategory(cat);
    setDifficultyFilter('all');
    setTypeFilter('all');
    setIndex(0);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function handleDifficultyFilter(d: Difficulty) {
    setDifficultyFilter(d);
    setIndex(0);
  }

  function handleShuffle() {
    setDeck(shuffle(deck));
    setIndex(0);
  }

  const card = filtered[index];

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar
        categories={ALL_CATEGORIES}
        selected={selectedCategory}
        counts={counts}
        total={flashcards.length}
        onSelect={handleCategorySelect}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-h-screen min-w-0 overflow-x-hidden">
        {/* ── Top bar ─────────────────────────────────────── */}
        <header className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur border-b border-slate-800">
          {/* Row 1: view mode + shuffle */}
          <div className="flex items-center gap-2 px-3 py-2.5">
            {/* Hamburger (mobile only) */}
            <button
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors flex-shrink-0"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800">
              {(Object.keys(VIEW_LABELS) as ViewMode[]).map((mode) => (
                <button
                  key={mode}
                  title={VIEW_DESCRIPTIONS[mode]}
                  className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${
                    viewMode === mode
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  onClick={() => { setViewMode(mode); setIndex(0); }}
                >
                  {VIEW_LABELS[mode]}
                </button>
              ))}
            </div>

            <div className="flex-1" />

            <button
              className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-400 text-sm font-semibold hover:bg-slate-800 hover:text-slate-200 transition-colors"
              onClick={handleShuffle}
              title="Shuffle cards"
            >
              ⇄ Shuffle
            </button>
          </div>

          {/* Row 2: type filter */}
          <div className="flex items-center flex-wrap gap-2 px-3 pt-1 pb-2">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-widest mr-1 flex-shrink-0">
              Type
            </span>
            {(['all', 'basics', 'experience'] as TypeFilter[]).map((t) => (
              <button
                key={t}
                onClick={() => { setTypeFilter(t); setIndex(0); }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap
                  ${TYPE_COLORS[t]}
                  ${typeFilter === t ? TYPE_ACTIVE[t] : 'opacity-60 hover:opacity-100'}
                `}
              >
                <span className="sm:hidden">{TYPE_LABELS_SHORT[t]}</span>
                <span className="hidden sm:inline">{TYPE_LABELS[t]}</span>
                <span className="ml-1.5 opacity-70">{typeCounts[t]}</span>
              </button>
            ))}
          </div>

          {/* Row 3: difficulty filter */}
          <div className="flex items-center flex-wrap gap-2 px-3 pt-1 pb-3 overflow-x-hidden">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-widest mr-1 flex-shrink-0">
              Difficulty
            </span>
            {(['all', 'easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
              <button
                key={d}
                onClick={() => handleDifficultyFilter(d)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all capitalize whitespace-nowrap
                  ${DIFF_COLORS[d]}
                  ${difficultyFilter === d ? DIFF_ACTIVE[d] : 'opacity-60 hover:opacity-100'}
                `}
              >
                {d === 'all' ? 'All' : d}
                <span className="ml-1.5 opacity-70">{diffCounts[d]}</span>
              </button>
            ))}

            <div className="flex-1" />

            {/* Card count indicator */}
            <span className="text-xs text-slate-500">
              {filtered.length} card{filtered.length !== 1 ? 's' : ''}
              {difficultyFilter !== 'all' && (
                <button
                  className="ml-2 text-slate-600 hover:text-slate-400 transition-colors"
                  onClick={() => handleDifficultyFilter('all')}
                  title="Clear difficulty filter"
                >
                  ✕ clear
                </button>
              )}
            </span>
          </div>
        </header>

        {/* ── Content ─────────────────────────────────────── */}
        <main className="flex-1 flex flex-col">

          {/* Quiz */}
          {viewMode === 'quiz' && (
            <div className="flex-1 flex flex-col items-center gap-4 sm:gap-7 p-4 sm:p-8 justify-start pt-6 sm:pt-10">
              {card ? (
                <>
                  <div className="w-full max-w-2xl">
                    <FlashCard key={card.id} card={card} quizMode />
                  </div>
                  <Controls
                    current={index}
                    total={filtered.length}
                    onPrev={() => setIndex((i) => Math.max(0, i - 1))}
                    onNext={() => setIndex((i) => Math.min(filtered.length - 1, i + 1))}
                    onShuffle={handleShuffle}
                  />
                </>
              ) : (
                <p className="text-slate-500 mt-20">No cards match this filter.</p>
              )}
            </div>
          )}

          {/* Study */}
          {viewMode === 'study' && (
            <div className="flex flex-col gap-3 px-4 sm:px-6 lg:px-8 2xl:px-16 py-6">
              {filtered.length === 0 ? (
                <p className="text-slate-500">No cards match this filter.</p>
              ) : (
                <>
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-800 mb-1">
                    <span className="text-slate-400 text-sm">
                      {selectedCategory ?? 'All Topics'}
                      {typeFilter !== 'all' && ` · ${TYPE_LABELS[typeFilter]}`}
                      {difficultyFilter !== 'all' && ` · ${difficultyFilter}`}
                      {' '}— {filtered.length} card{filtered.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {filtered.map((c) => (
                    <FlashCard key={c.id} card={c} studyWide />
                  ))}
                </>
              )}
            </div>
          )}

          {/* Browse */}
          {viewMode === 'browse' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-4 sm:p-6 lg:p-8 2xl:p-16">
              {filtered.length === 0 ? (
                <p className="text-slate-500 col-span-full text-center py-10">No cards match this filter.</p>
              ) : (
                filtered.map((c) => (
                  <FlashCard key={c.id} card={c} compact />
                ))
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

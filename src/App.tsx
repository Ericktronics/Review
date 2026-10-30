import { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { flashcards } from './data/flashcards';
import type { CardStatus, Category, Filters, Flashcard, Progress, Theme, ViewMode } from './types';
import { useStored } from './utils/storage';
import { currentStreak, dayKey, EMPTY_STATS, recordGrade, type Stats } from './utils/stats';
import { BrowseView } from './components/BrowseView';
import { Icon } from './components/Icons';
import { QuizView } from './components/QuizView';
import { Sidebar } from './components/Sidebar';
import { StudyView } from './components/StudyView';
import { Today } from './components/Today';
import { Toolbar, type FacetCounts } from './components/Toolbar';

const ALL_CATEGORIES = Array.from(new Set(flashcards.map((c) => c.category))) as Category[];
const NO_FILTERS: Filters = { level: 'all', difficulty: 'all', status: 'all' };

const VIEWS: { value: ViewMode; label: string; description: string }[] = [
  { value: 'today', label: 'Today', description: 'Your daily goal, streak and what to review next' },
  { value: 'quiz', label: 'Quiz', description: 'One card at a time, answer hidden until you reveal it' },
  { value: 'study', label: 'Study', description: 'Every question beside its answer, to read through' },
  { value: 'browse', label: 'Browse', description: 'A scannable list of questions; open any to see its answer' },
];

const SEARCH_TEXT = new Map(
  flashcards.map((c) => [c.id, `${c.question}\n${c.answer}\n${c.category}\n${c.id}`.toLowerCase()])
);

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function passes(card: Flashcard, f: Filters, progress: Progress) {
  if (f.level !== 'all' && card.type !== f.level) return false;
  if (f.difficulty !== 'all' && card.difficulty !== f.difficulty) return false;
  if (f.status === 'new') return !progress[card.id];
  if (f.status !== 'all') return progress[card.id] === f.status;
  return true;
}

export default function App() {
  const [view, setView] = useStored<ViewMode>('flashcards.view', 'today');
  const [storedCategory, setCategory] = useStored<Category | null>('flashcards.category', null);
  const [theme, setTheme] = useStored<Theme>('flashcards.theme', 'dark');
  const [progress, setProgress] = useStored<Progress>('flashcards.progress', {});
  const [stats, setStats] = useStored<Stats>('flashcards.stats', EMPTY_STATS);

  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const [query, setQuery] = useState('');
  const [order, setOrder] = useState<Flashcard[] | null>(null);
  const [shuffleCount, setShuffleCount] = useState(0);
  const [answersHidden, setAnswersHidden] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // The cards of a "Start review" session, which ignores category and filters
  const [dailyDeck, setDailyDeck] = useState<Flashcard[] | null>(null);
  const [sessionCount, setSessionCount] = useState(0);

  // A saved category can disappear if the card data changes
  const category = storedCategory && ALL_CATEGORIES.includes(storedCategory) ? storedCategory : null;
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const isDark = theme === 'dark';

  // Category and search narrow the deck; the three filters apply on top
  const scoped = useMemo(() => {
    const deck = order ?? flashcards;
    return deck.filter(
      (c) =>
        (!category || c.category === category) &&
        (!deferredQuery || SEARCH_TEXT.get(c.id)?.includes(deferredQuery))
    );
  }, [order, category, deferredQuery]);

  const filtered = useMemo(() => scoped.filter((c) => passes(c, filters, progress)), [scoped, filters, progress]);

  // Each filter's counts reflect the other two, so a count always matches what selecting it shows
  const facetCounts: FacetCounts = useMemo(() => {
    const count = (override: Partial<Filters>) => {
      const f = { ...filters, ...override };
      return scoped.filter((c) => passes(c, f, progress)).length;
    };
    return {
      level: { all: count({ level: 'all' }), basics: count({ level: 'basics' }), experience: count({ level: 'experience' }) },
      difficulty: {
        all: count({ difficulty: 'all' }),
        easy: count({ difficulty: 'easy' }),
        medium: count({ difficulty: 'medium' }),
        hard: count({ difficulty: 'hard' }),
      },
      status: {
        all: count({ status: 'all' }),
        new: count({ status: 'new' }),
        again: count({ status: 'again' }),
        known: count({ status: 'known' }),
      },
    };
  }, [scoped, filters, progress]);

  const { counts, knownCounts } = useMemo(() => {
    const counts: Record<string, number> = {};
    const knownCounts: Record<string, number> = {};
    for (const c of flashcards) {
      counts[c.category] = (counts[c.category] ?? 0) + 1;
      if (progress[c.id] === 'known') knownCounts[c.category] = (knownCounts[c.category] ?? 0) + 1;
    }
    return { counts, knownCounts };
  }, [progress]);

  const today = dayKey();
  const doneToday = stats.days[today] ?? 0;
  const streak = currentStreak(stats.days);

  const { due, unseen } = useMemo(() => ({
    due: flashcards.filter((c) => {
      const entry = stats.schedule[c.id];
      return entry && entry.due <= today;
    }),
    unseen: flashcards.filter((c) => !progress[c.id]),
  }), [stats.schedule, progress, today]);

  const sessionSize = Math.min(Math.max(stats.goal - doneToday, 10), due.length + unseen.length);

  const grade = useCallback((id: string, status: CardStatus) => {
    setProgress((p) => ({ ...p, [id]: status }));
    setStats((s) => recordGrade(s, id, status));
  }, [setProgress, setStats]);

  const toggleKnown = useCallback((id: string) => {
    setProgress((p) => {
      const { [id]: current, ...rest } = p;
      return current === 'known' ? rest : { ...rest, [id]: 'known' };
    });
  }, [setProgress]);

  function changeView(next: ViewMode) {
    setDailyDeck(null);
    setView(next);
  }

  function handleCategorySelect(next: Category | null) {
    setCategory(next);
    setFilters(NO_FILTERS);
    setQuery('');
    setSidebarOpen(false);
    setDailyDeck(null);
    if (view === 'today') setView('study');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function startDailyReview() {
    // Overdue cards first, then new ones from across every topic
    setDailyDeck([...shuffle(due), ...shuffle(unseen)].slice(0, sessionSize));
    setSessionCount((n) => n + 1);
    setView('quiz');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function startTopic(next: Category) {
    setCategory(next);
    setFilters(NO_FILTERS);
    setQuery('');
    setDailyDeck(null);
    setView('quiz');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function handleResetProgress() {
    if (window.confirm('Clear every Known and Review again mark? Your streak is kept.')) {
      setProgress({});
      setStats((s) => ({ ...s, schedule: {} }));
    }
  }

  function clearFilters() {
    setFilters(NO_FILTERS);
    setQuery('');
  }

  // A new key starts a fresh quiz session whenever the set of cards being quizzed changes
  const sessionKey = dailyDeck
    ? `daily|${sessionCount}`
    : [category, filters.level, filters.difficulty, filters.status, deferredQuery, shuffleCount].join('|');

  const emptyState = (
    <div className="px-4 py-16 text-center">
      <p className="text-ink">No cards match.</p>
      <button type="button" onClick={clearFilters} className="mt-2 text-[14px] text-accent underline underline-offset-2">
        Clear search and filters
      </button>
    </div>
  );

  const title = view === 'today' ? 'Today' : dailyDeck ? "Today's review" : category ?? 'All topics';

  return (
    <div className="flex min-h-screen">
      <Sidebar
        categories={ALL_CATEGORIES}
        selected={view === 'today' || dailyDeck ? undefined : category}
        counts={counts}
        knownCounts={knownCounts}
        total={flashcards.length}
        progress={progress}
        onSelect={handleCategorySelect}
        onHome={() => {
          changeView('today');
          setSidebarOpen(false);
          window.scrollTo({ top: 0, behavior: 'instant' });
        }}
        onResetProgress={handleResetProgress}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b bg-canvas px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-ml-2 rounded p-2 text-muted hover:text-ink lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open topics"
          >
            <Icon name="menu" className="h-5 w-5" />
          </button>

          <h1 className="tnum flex min-w-0 flex-1 items-baseline gap-2 text-[16px] font-bold text-ink">
            <span className="truncate">{title}</span>
            {view !== 'today' && !dailyDeck && (
              <span className="flex-shrink-0 text-[13px] font-normal text-muted">
                {filtered.length}<span className="hidden sm:inline"> {filtered.length === 1 ? 'card' : 'cards'}</span>
              </span>
            )}
          </h1>

          {streak > 0 && (
            <span className="tnum hidden flex-shrink-0 items-center gap-1 text-[14px] font-bold text-streak sm:inline-flex" title={`${streak} day streak`}>
              <Icon name="flame" className="h-4 w-4" />
              {streak}
            </span>
          )}

          <button
            type="button"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-muted transition-colors hover:bg-sunken hover:text-ink"
          >
            <span key={isDark ? 'sun' : 'moon'} className="animate-flip inline-flex">
              <Icon name={isDark ? 'sun' : 'moon'} className="h-5 w-5" />
            </span>
          </button>

          <div className="flex flex-shrink-0 rounded-xl bg-sunken p-0.5" role="group" aria-label="View">
            {VIEWS.map((v) => (
              <button
                key={v.value}
                type="button"
                title={v.description}
                aria-pressed={view === v.value}
                onClick={() => changeView(v.value)}
                className={`h-8 rounded-[10px] px-2 text-[13px] transition-colors sm:px-3 ${
                  view === v.value ? 'bg-raised font-semibold text-ink shadow-soft' : 'text-muted hover:text-ink'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </header>

        {view !== 'today' && !dailyDeck && (
          <Toolbar
            view={view}
            query={query}
            onQueryChange={setQuery}
            filters={filters}
            counts={facetCounts}
            onFiltersChange={setFilters}
            shuffled={order !== null}
            onShuffle={() => {
              setOrder(shuffle(flashcards));
              setShuffleCount((n) => n + 1);
            }}
            onUnshuffle={() => {
              setOrder(null);
              setShuffleCount((n) => n + 1);
            }}
            answersHidden={answersHidden}
            onToggleAnswers={() => setAnswersHidden((h) => !h)}
          />
        )}

        <main className="flex flex-1 flex-col">
          {view === 'today' ? (
            <Today
              stats={stats}
              progress={progress}
              dueCount={due.length}
              newCount={unseen.length}
              sessionSize={sessionSize}
              onStart={startDailyReview}
              onStartTopic={startTopic}
              onGoalChange={(goal) => setStats((s) => ({ ...s, goal }))}
            />
          ) : view === 'quiz' ? (
            // Stays mounted when grading empties the filter, so the session can reach its end screen
            <QuizView
              key={sessionKey}
              cards={dailyDeck ?? filtered}
              progress={progress}
              onGrade={grade}
              showCategory={!category || dailyDeck !== null}
              empty={emptyState}
              today={doneToday}
              goal={stats.goal}
              streak={streak}
              onExit={() => changeView('today')}
            />
          ) : filtered.length === 0 ? (
            emptyState
          ) : view === 'study' ? (
            <StudyView
              cards={filtered}
              progress={progress}
              showCategory={!category}
              answersHidden={answersHidden}
              onToggleKnown={toggleKnown}
            />
          ) : (
            <BrowseView cards={filtered} progress={progress} showCategory={!category} onToggleKnown={toggleKnown} />
          )}
        </main>
      </div>
    </div>
  );
}

import { flashcards } from '../data/flashcards';
import { GROUPS } from '../data/groups';
import type { Category, Progress } from '../types';
import { currentStreak, dayKey, lastSevenDays, type Stats } from '../utils/stats';
import { Icon } from './Icons';

export function GoalRing({ value, goal, size = 148 }: { value: number; goal: number; size?: number }) {
  const stroke = size * 0.095;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = Math.min(value / goal, 1);

  return (
    <div
      className="relative flex-shrink-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${value} of ${goal} cards reviewed today`}
    >
      <svg className="-rotate-90" width={size} height={size} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={stroke} className="stroke-sunken" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - ratio)}
          className="stroke-accent transition-[stroke-dashoffset] duration-500"
        />
      </svg>
      <div className="tnum absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span className="font-bold text-ink" style={{ fontSize: size * 0.24 }}>{value}</span>
        <span className="mt-1 text-[13px] text-muted">of {goal}</span>
      </div>
    </div>
  );
}

const MONOGRAMS: Partial<Record<Category, string>> = {
  JavaScript: 'JS',
  TypeScript: 'TS',
  'Node.js': 'No',
  'Next.js': 'Nx',
  'Express.js': 'Ex',
};

function monogram(category: Category) {
  if (MONOGRAMS[category]) return MONOGRAMS[category];
  const words = category.replace(/[^A-Za-z ]/g, ' ').split(/\s+/).filter(Boolean);
  return words.length > 1 ? (words[0][0] + words[1][0]).toUpperCase() : category.slice(0, 2);
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  return hour < 18 ? 'Good afternoon' : 'Good evening';
}

interface Props {
  stats: Stats;
  progress: Progress;
  dueCount: number;
  newCount: number;
  sessionSize: number;
  onStart: () => void;
  onStartTopic: (category: Category) => void;
  onGoalChange: (goal: number) => void;
}

export function Today({ stats, progress, dueCount, newCount, sessionSize, onStart, onStartTopic, onGoalChange }: Props) {
  const done = stats.days[dayKey()] ?? 0;
  const left = Math.max(stats.goal - done, 0);
  const streak = currentStreak(stats.days);
  const week = lastSevenDays(stats.days);
  const weekMax = Math.max(...week.map((d) => d.count), 1);
  const knownTotal = flashcards.filter((c) => progress[c.id] === 'known').length;

  const headline =
    sessionSize === 0 ? 'You have reviewed everything'
    : left === 0 ? 'Goal reached. Want a few more?'
    : done > 0 ? `${left} more ${left === 1 ? 'card' : 'cards'} to hit your goal`
    : `${stats.goal} cards today keeps you sharp`;

  return (
    <div className="mx-auto w-full max-w-[1040px] px-4 py-6 sm:px-6 lg:px-8">
      <section className="flex flex-col items-center gap-6 rounded-3xl bg-raised p-6 text-center shadow-soft sm:flex-row sm:p-8 sm:text-left">
        <GoalRing value={done} goal={stats.goal} />
        <div className="min-w-0 flex-1">
          <p className="text-[14px] text-muted">{greeting()}</p>
          <h2 className="mt-1 text-[26px] font-bold leading-tight text-ink sm:text-[30px]">{headline}</h2>
          <p className="mt-2 text-body">
            {dueCount > 0 && `${dueCount} due for review. `}
            {newCount > 0 ? `${newCount} you have not tried yet.` : 'No new cards left.'}
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
            {sessionSize > 0 && (
              <button type="button" onClick={onStart} className="btn-primary">
                {left === 0 ? `Review ${sessionSize} more` : `Start review: ${sessionSize} cards`}
              </button>
            )}
            <label className="inline-flex items-center gap-2 text-[14px] text-muted">
              Daily goal
              <select
                value={stats.goal}
                onChange={(e) => onGoalChange(Number(e.target.value))}
                className="tnum h-9 cursor-pointer rounded-lg border bg-raised px-2 font-medium text-ink"
              >
                {[10, 20, 30, 50].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
          </div>
        </div>
      </section>

      <section className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.4fr)]">
        <div className="rounded-2xl bg-raised p-5 shadow-soft">
          <div className="flex items-center gap-2 text-[14px] text-muted">
            <Icon name="flame" className="h-5 w-5 text-streak" />
            Day streak
          </div>
          <p className="tnum mt-2 text-[34px] font-bold leading-none text-ink">{streak}</p>
          <p className="mt-2 text-[13px] text-muted">
            {done > 0 ? 'Safe for today' : streak > 0 ? 'Review one card to keep it' : 'Review one card to start'}
          </p>
        </div>

        <div className="rounded-2xl bg-raised p-5 shadow-soft">
          <div className="flex items-center gap-2 text-[14px] text-muted">
            <Icon name="check" className="h-5 w-5 text-known" />
            Cards known
          </div>
          <p className="tnum mt-2 text-[34px] font-bold leading-none text-ink">{knownTotal}</p>
          <p className="tnum mt-2 text-[13px] text-muted">of {flashcards.length} in the deck</p>
        </div>

        <div className="col-span-2 rounded-2xl bg-raised p-5 shadow-soft md:col-span-1">
          <p className="text-[14px] text-muted">Last 7 days</p>
          <div className="mt-3 flex h-[76px] items-end gap-2">
            {week.map((d) => (
              <div key={d.key} className="flex h-full flex-1 flex-col items-center justify-end gap-1" title={`${d.name}: ${d.count} cards`}>
                <div
                  className={`w-full max-w-7 rounded-t ${d.count > 0 ? 'bg-accent' : 'bg-sunken'}`}
                  style={{ height: d.count > 0 ? `${Math.max((d.count / weekMax) * 52, 6)}px` : '4px' }}
                />
                <span className={`text-[12px] leading-4 ${d.key === dayKey() ? 'font-semibold text-ink' : 'text-muted'}`}>{d.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <h2 className="mb-3 mt-8 text-[18px] font-bold text-ink">Practice a topic</h2>
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {GROUPS.flatMap((group) => group.categories.map((category) => {
          const cards = flashcards.filter((c) => c.category === category);
          const known = cards.filter((c) => progress[c.id] === 'known').length;
          const again = cards.filter((c) => progress[c.id] === 'again').length;
          return (
            <button
              key={category}
              type="button"
              onClick={() => onStartTopic(category)}
              className="flex items-center gap-3 rounded-2xl bg-raised p-3 text-left shadow-soft transition-transform duration-150 hover:-translate-y-0.5"
            >
              <span
                className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-[14px] font-bold text-white"
                style={{ backgroundColor: group.color }}
                aria-hidden="true"
              >
                {monogram(category)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-semibold text-ink">{category}</span>
                <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-sunken">
                  <span className="block h-full rounded-full bg-accent" style={{ width: `${(known / cards.length) * 100}%` }} />
                </span>
                <span className="tnum mt-1 block text-[12px] text-muted">
                  {known} of {cards.length} known{again > 0 && `, ${again} to review`}
                </span>
              </span>
            </button>
          );
        }))}
      </section>
    </div>
  );
}

import { useEffect, useRef } from 'react';
import type { Filters, ViewMode } from '../types';
import { LEVEL_LABELS } from './CardParts';
import { Icon } from './Icons';

export type FacetCounts = {
  [K in keyof Filters]: Record<Filters[K], number>;
};

interface Props {
  view: ViewMode;
  query: string;
  onQueryChange: (q: string) => void;
  filters: Filters;
  counts: FacetCounts;
  onFiltersChange: (f: Filters) => void;
  shuffled: boolean;
  onShuffle: () => void;
  onUnshuffle: () => void;
  answersHidden: boolean;
  onToggleAnswers: () => void;
}

function Select<T extends string>({
  label, value, options, onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string; count?: number }[];
  onChange: (v: T) => void;
}) {
  return (
    <label className="relative inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-md border bg-raised pl-2.5 text-[13px] text-muted focus-within:border-accent">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="tnum h-full cursor-pointer appearance-none rounded-md bg-transparent pr-7 text-[13px] font-medium text-ink focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.count === undefined ? o.label : `${o.label} (${o.count})`}
          </option>
        ))}
      </select>
      <Icon name="chevronDown" className="pointer-events-none absolute right-2 h-3.5 w-3.5" />
    </label>
  );
}

const quietButton =
  'inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 text-[13px] text-body transition-colors hover:bg-sunken hover:text-ink';

export function Toolbar({
  view, query, onQueryChange, filters, counts, onFiltersChange,
  shuffled, onShuffle, onUnshuffle, answersHidden, onToggleAnswers,
}: Props) {
  const searchRef = useRef<HTMLInputElement>(null);

  // "/" jumps to search, as it does in most developer tools
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (e.key !== '/' || target.tagName === 'INPUT' || target.tagName === 'SELECT') return;
      e.preventDefault();
      searchRef.current?.focus();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex flex-wrap items-center gap-2 px-4 pb-1 pt-4 sm:px-6 lg:px-8">
      <div className="relative w-full md:w-auto md:min-w-40 md:max-w-xs md:flex-1">
        <Icon name="search" className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted" />
        <input
          ref={searchRef}
          type="search"
          value={query}
          placeholder="Search cards"
          aria-label="Search questions and answers"
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              onQueryChange('');
              e.currentTarget.blur();
            }
          }}
          className="h-9 w-full rounded-md border bg-raised pl-8 pr-2.5 text-[14px] text-ink placeholder:text-muted focus:border-accent focus:outline-none"
        />
      </div>

      <Select
        label="Level"
        value={filters.level}
        onChange={(level) => onFiltersChange({ ...filters, level })}
        options={[
          { value: 'all', label: 'All' },
          { value: 'basics', label: LEVEL_LABELS.basics, count: counts.level.basics },
          { value: 'experience', label: LEVEL_LABELS.experience, count: counts.level.experience },
        ]}
      />
      <Select
        label="Difficulty"
        value={filters.difficulty}
        onChange={(difficulty) => onFiltersChange({ ...filters, difficulty })}
        options={[
          { value: 'all', label: 'All' },
          { value: 'easy', label: 'Easy', count: counts.difficulty.easy },
          { value: 'medium', label: 'Medium', count: counts.difficulty.medium },
          { value: 'hard', label: 'Hard', count: counts.difficulty.hard },
        ]}
      />
      <Select
        label="Progress"
        value={filters.status}
        onChange={(status) => onFiltersChange({ ...filters, status })}
        options={[
          { value: 'all', label: 'All' },
          { value: 'new', label: 'Not graded', count: counts.status.new },
          { value: 'again', label: 'Review again', count: counts.status.again },
          { value: 'known', label: 'Known', count: counts.status.known },
        ]}
      />

      <div className="ml-auto flex items-center">
        {view === 'study' && (
          <button type="button" className={quietButton} aria-pressed={answersHidden} onClick={onToggleAnswers}>
            {answersHidden ? 'Show answers' : 'Hide answers'}
          </button>
        )}
        {shuffled && (
          <button type="button" className={quietButton} onClick={onUnshuffle}>
            Original order
          </button>
        )}
        <button type="button" className={quietButton} onClick={onShuffle}>
          <Icon name="shuffle" />
          Shuffle
        </button>
      </div>
    </div>
  );
}

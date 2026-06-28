import { useState } from 'react';
import type { Category } from '../types';

interface Props {
  categories: Category[];
  selected: Category | null;
  counts: Record<string, number>;
  total: number;
  onSelect: (c: Category | null) => void;
  isOpen: boolean;
  onClose: () => void;
}

function NavContent({
  categories, selected, counts, total, onSelect, showClose, onClose,
}: Props & { showClose?: boolean }) {
  const [query, setQuery] = useState('');

  const filtered = query.trim()
    ? categories.filter(c => c.toLowerCase().includes(query.trim().toLowerCase()))
    : categories;

  return (
    <>
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-slate-800">
        <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-600 text-white font-bold font-mono text-sm flex-shrink-0">
          {'</>'}
        </span>
        <span className="font-bold text-sm text-slate-100 leading-tight">
          Dev<br />Flashcards
        </span>
        {showClose && (
          <button
            onClick={onClose}
            className="ml-auto text-slate-500 hover:text-slate-300 transition-colors p-1 rounded-md hover:bg-slate-800"
            aria-label="Close menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <ul className="p-2 flex-1">
        <li>
          <button
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              selected === null
                ? 'bg-indigo-500/15 text-indigo-300'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
            onClick={() => onSelect(null)}
          >
            <span>All Topics</span>
            <span className={`text-xs px-1.5 py-0.5 rounded-md ${selected === null ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-800 text-slate-500'}`}>
              {total}
            </span>
          </button>
        </li>

        <li className="mt-1 mb-1">
          <p className="px-3 py-1 text-xs font-semibold uppercase tracking-widest text-slate-600">
            Categories
          </p>
        </li>

        {/* Search input — below the CATEGORIES label */}
        <li className="px-1 pb-1">
          <div className="relative">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search categories…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-7 pr-7 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                aria-label="Clear search"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </li>

        {filtered.length === 0 && query && (
          <li className="px-3 py-3 text-xs text-slate-500 text-center">No categories found</li>
        )}

        {filtered.map((cat) => (
          <li key={cat}>
            <button
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                selected === cat
                  ? 'bg-indigo-500/15 text-indigo-300'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
              onClick={() => onSelect(cat)}
            >
              <span className="text-left leading-tight">{cat}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-md flex-shrink-0 ml-1 ${selected === cat ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-800 text-slate-500'}`}>
                {counts[cat] ?? 0}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}

export function Sidebar(props: Props) {
  const { isOpen, onClose } = props;

  return (
    <>
      {/* ── Desktop sidebar — always in the flex flow, never fixed ── */}
      <nav className="hidden lg:flex flex-col w-56 flex-shrink-0 h-screen sticky top-0 bg-slate-900 border-r border-slate-800 overflow-y-auto">
        <NavContent {...props} showClose={false} />
      </nav>

      {/* ── Mobile drawer — fixed overlay, hidden on desktop ── */}
      <div
        className={`fixed inset-0 bg-black/50 z-20 lg:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      <nav className={`
        fixed top-0 left-0 z-30 lg:hidden
        w-64 h-screen
        bg-slate-900 border-r border-slate-800
        flex flex-col overflow-y-auto
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <NavContent {...props} showClose={true} />
      </nav>
    </>
  );
}

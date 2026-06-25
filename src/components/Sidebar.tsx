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
  return (
    <>
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-slate-800">
        <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-600 text-white font-bold font-mono text-sm flex-shrink-0">
          {'</>'}
        </span>
        <span className="font-bold text-sm text-slate-100 leading-tight">
          Backend<br />Flashcards
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

        {categories.map((cat) => (
          <li key={cat}>
            <button
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                selected === cat
                  ? 'bg-indigo-500/15 text-indigo-300'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
              onClick={() => onSelect(cat)}
            >
              <span className="truncate">{cat}</span>
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

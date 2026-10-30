import { GROUPS } from '../data/groups';
import type { Category, Progress } from '../types';
import { Icon } from './Icons';

interface Props {
  categories: Category[];
  /** null is "All topics"; undefined highlights nothing, for screens that are not topic-scoped. */
  selected: Category | null | undefined;
  counts: Record<string, number>;
  knownCounts: Record<string, number>;
  total: number;
  progress: Progress;
  onSelect: (c: Category | null) => void;
  onHome: () => void;
  onResetProgress: () => void;
  isOpen: boolean;
  onClose: () => void;
}

function NavItem({
  label, count, known, active, onClick,
}: { label: string; count: number; known: number; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-current={active ? 'page' : undefined}
      onClick={onClick}
      className={`flex min-h-8 w-full items-center justify-between gap-3 rounded px-2 py-1 text-left text-[14px] leading-5 transition-colors [@media(pointer:coarse)]:min-h-10 ${
        active ? 'bg-accent/15 font-semibold text-ink' : 'text-body hover:bg-ink/[0.05] hover:text-ink'
      }`}
    >
      <span className="min-w-0">{label}</span>
      <span className="tnum flex-shrink-0 text-[12px] font-normal text-muted">
        {known > 0 ? `${known}/${count}` : count}
      </span>
    </button>
  );
}

function NavContent({
  categories, selected, counts, knownCounts, total, progress, onSelect, onHome, onResetProgress, showClose, onClose,
}: Props & { showClose?: boolean }) {
  const grouped = new Set(GROUPS.flatMap((g) => g.categories));
  const ungrouped = categories.filter((c) => !grouped.has(c));
  const groups = ungrouped.length > 0 ? [...GROUPS, { label: 'Other', color: '', categories: ungrouped }] : GROUPS;
  const knownTotal = Object.values(progress).filter((s) => s === 'known').length;

  return (
    <>
      <div className="flex h-14 flex-shrink-0 items-center justify-between px-4">
        <button type="button" onClick={onHome} className="rounded text-[15px] font-semibold text-ink hover:text-accent">
          Dev Flashcards
        </button>
        {showClose && (
          <button
            type="button"
            onClick={onClose}
            className="-mr-1 rounded p-2 text-muted hover:bg-ink/[0.05] hover:text-ink"
            aria-label="Close menu"
          >
            <Icon name="close" className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-4">
        <NavItem
          label="All topics"
          count={total}
          known={knownTotal}
          active={selected === null}
          onClick={() => onSelect(null)}
        />
        {groups.map((group) => (
          <section key={group.label} className="mt-4">
            <h2 className="px-2 pb-1 text-[12px] leading-5 text-muted">{group.label}</h2>
            {group.categories.map((cat) => (
              <NavItem
                key={cat}
                label={cat}
                count={counts[cat] ?? 0}
                known={knownCounts[cat] ?? 0}
                active={selected === cat}
                onClick={() => onSelect(cat)}
              />
            ))}
          </section>
        ))}
      </div>

      {Object.keys(progress).length > 0 && (
        <div className="flex-shrink-0 border-t px-3 py-2">
          <button
            type="button"
            onClick={onResetProgress}
            className="rounded px-1 py-1 text-[12px] text-muted hover:text-ink"
          >
            Reset progress
          </button>
        </div>
      )}
    </>
  );
}

export function Sidebar(props: Props) {
  const { isOpen, onClose } = props;

  return (
    <>
      {/* ── Desktop sidebar — always in the flex flow, never fixed ── */}
      <nav className="sticky top-0 hidden h-screen w-60 flex-shrink-0 flex-col border-r bg-side lg:flex" aria-label="Topics">
        <NavContent {...props} />
      </nav>

      {/* ── Mobile drawer — fixed overlay, hidden on desktop ── */}
      <div
        className={`fixed inset-0 z-20 bg-black/40 transition-opacity duration-200 lg:hidden ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />
      <nav
        aria-label="Topics"
        {...(isOpen ? {} : { inert: '' })}
        className={`fixed left-0 top-0 z-30 flex h-[100dvh] w-72 max-w-[85vw] flex-col border-r bg-side transition-transform duration-200 lg:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <NavContent {...props} showClose />
      </nav>
    </>
  );
}

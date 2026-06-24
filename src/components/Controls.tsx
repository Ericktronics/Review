interface Props {
  current: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  onShuffle: () => void;
}

export function Controls({ current, total, onPrev, onNext, onShuffle }: Props) {
  return (
    <div className="flex items-center gap-3 flex-wrap justify-center">
      <button
        className="px-4 py-2 rounded-lg border border-slate-700 bg-slate-900 text-slate-300 text-sm font-semibold hover:bg-slate-800 hover:border-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        onClick={onPrev}
        disabled={current === 0}
      >
        ← Prev
      </button>

      <span className="text-sm text-slate-400 font-medium min-w-[60px] text-center">
        {current + 1} / {total}
      </span>

      <button
        className="px-4 py-2 rounded-lg border border-slate-700 bg-slate-900 text-slate-300 text-sm font-semibold hover:bg-slate-800 hover:border-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        onClick={onNext}
        disabled={current === total - 1}
      >
        Next →
      </button>

      <button
        className="px-4 py-2 rounded-lg border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm font-semibold hover:bg-indigo-500/20 transition-colors"
        onClick={onShuffle}
      >
        ⇄ Shuffle
      </button>
    </div>
  );
}

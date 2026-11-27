import { MOOD_PRESETS } from '../data/catalog';

interface MoodBarProps {
  moodInput: string;
  loading: boolean;
  errorMsg: string | null;
  affirmation: string | null;
  hasResults: boolean;
  onChangeMood: (value: string) => void;
  onSubmitMood: (mood: string) => void;
  onClear: () => void;
}

export function MoodBar({
  moodInput,
  loading,
  errorMsg,
  affirmation,
  hasResults,
  onChangeMood,
  onSubmitMood,
  onClear,
}: MoodBarProps) {
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmitMood(moodInput);
  };

  const handlePresetClick = (preset: string) => {
    onChangeMood(preset);
    onSubmitMood(preset);
  };

  return (
    <div
      aria-label="Mood-based product recommendations"
      className="bg-surface-card/95 backdrop-blur-sm text-on-surface-card p-4 rounded-sm shadow-md border border-outline flex flex-col gap-2.5"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="font-headline text-headline-sm text-on-surface-card leading-snug">
            How are you feeling today?
          </h2>
          <p className="font-body text-body-sm text-on-surface-muted">
            Get a daily affirmation and matching product picks.
          </p>
        </div>
        {(hasResults || errorMsg || affirmation) && (
          <button
            type="button"
            onClick={onClear}
            className="font-label text-label-sm text-secondary hover:text-accent hover:underline shrink-0 cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex items-stretch gap-2">
        <label htmlFor="mood-prompt-input" className="sr-only">
          Your mood for the day
        </label>
        <input
          id="mood-prompt-input"
          type="text"
          maxLength={300}
          value={moodInput}
          onChange={(event) => onChangeMood(event.target.value)}
          placeholder="e.g., Tired, craving cozy coffee..."
          className="flex-1 min-w-0 border border-outline bg-surface-subtle text-on-surface-card placeholder:text-on-surface-muted rounded-sm px-2.5 py-1.5 font-body text-body-sm focus:outline-none focus:border-secondary focus:bg-surface-card"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-tertiary text-on-tertiary hover:bg-accent disabled:opacity-60 font-label text-label-sm px-3.5 py-1.5 rounded-full transition-colors duration-state-change whitespace-nowrap shrink-0 cursor-pointer"
        >
          {loading ? 'Finding...' : 'Match'}
        </button>
      </form>

      <div className="flex flex-wrap items-center gap-1.5">
        {MOOD_PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            disabled={loading}
            onClick={() => handlePresetClick(preset)}
            className="px-2 py-0.5 rounded-sm border border-outline bg-surface-subtle hover:border-secondary hover:bg-surface-card font-body text-label-sm text-on-surface-card transition-colors duration-state-change whitespace-nowrap cursor-pointer"
          >
            {preset}
          </button>
        ))}
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="border border-deal-red/40 bg-deal-red/5 text-deal-red px-2.5 py-1.5 rounded-sm flex items-center justify-between gap-2"
        >
          <span className="font-body text-label-sm line-clamp-2">
            {errorMsg}
          </span>
          <button
            type="button"
            onClick={() => onSubmitMood(moodInput)}
            className="font-label text-label-sm underline shrink-0 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {affirmation && !errorMsg && (
        <div className="bg-surface-subtle border border-outline rounded-sm px-2.5 py-2 flex items-start gap-2">
          <span
            className="material-symbols-outlined text-title-md text-secondary mt-0.5 shrink-0"
            aria-hidden="true"
          >
            wb_sunny
          </span>
          <p className="font-body text-body-sm text-on-surface-card line-clamp-2">
            &ldquo;{affirmation}&rdquo;
          </p>
        </div>
      )}
    </div>
  );
}

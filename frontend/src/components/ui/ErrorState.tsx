interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-sev-p1-soft)] text-[var(--color-sev-p1)]">
        !
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-[var(--color-text-primary)]">
          Couldn't reach the backend
        </p>
        <p className="max-w-sm text-sm text-[var(--color-text-muted)]">
          {message ?? "The request failed. Check that the OpsPilot API is running."}
        </p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-lg border border-[var(--color-border)] px-3.5 py-1.5 text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)]"
        >
          Retry
        </button>
      )}
    </div>
  );
}
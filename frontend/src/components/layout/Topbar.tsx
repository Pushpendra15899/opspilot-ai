import { HealthIndicator } from "@/components/layout/HealthIndicator";
import { useSystemStatus } from "@/hooks/useSystemHealth";
import { IconMenu } from "@/components/ui/icons";

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { data } = useSystemStatus();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-[var(--color-border)] bg-[var(--color-surface-0)]/80 px-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          onClick={onMenuClick}
          aria-label="Open navigation"
          className="rounded-md p-1.5 text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text-primary)] lg:hidden"
        >
          <IconMenu className="h-5 w-5" />
        </button>
        <p className="hidden truncate text-xs text-[var(--color-text-muted)] sm:block">
          {data ? (
            <>
              {data.application} · {data.environment} · Java {data.javaVersion}
            </>
          ) : (
            <>&nbsp;</>
          )}
        </p>
      </div>
      <HealthIndicator />
    </header>
  );
}
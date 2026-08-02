import { NavLink } from "react-router-dom";
import { cn } from "@/lib/cn";
import {
  IconActivity,
  IconAlertTriangle,
  IconBook,
  IconGrid,
  IconSparkles,
  IconX,
} from "@/components/ui/icons";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: IconGrid, end: true },
  { to: "/incidents", label: "Incidents", icon: IconAlertTriangle },
  { to: "/observability", label: "Observability", icon: IconActivity },
  { to: "/docs", label: "API Docs", icon: IconBook },
  { to: "/assistant", label: "AI Assistant", icon: IconSparkles },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface-1)]",
          "transition-transform duration-200 ease-out lg:static lg:z-auto lg:w-60 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between gap-2.5 px-5 py-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-accent)] text-sm font-bold text-[#04201c]">
              OP
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight text-[var(--color-text-primary)]">
                OpsPilot AI
              </p>
              <p className="text-[11px] leading-tight text-[var(--color-text-muted)]">
                Operations Console
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close navigation"
            className="rounded-md p-1.5 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text-primary)] lg:hidden"
          >
            <IconX className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "group flex items-center gap-2.5 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[var(--color-accent-soft)] text-[var(--color-accent-strong)]"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text-primary)]",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      "h-4 w-0.5 shrink-0 rounded-full transition-colors",
                      isActive ? "bg-[var(--color-accent)]" : "bg-transparent",
                    )}
                  />
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-[var(--color-border-subtle)] px-5 py-4">
          <p className="text-[11px] leading-relaxed text-[var(--color-text-muted)]">
            Incident management for
            <br />
            production operations.
          </p>
        </div>
      </aside>
    </>
  );
}
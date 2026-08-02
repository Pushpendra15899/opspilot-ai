import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  IconFileText,
  IconLayers,
  IconSend,
  IconSparkles,
  IconTarget,
  IconWand,
} from "@/components/ui/icons";

const CAPABILITIES = [
  {
    icon: IconWand,
    title: "Incident summarization",
    description: "Turn a noisy incident timeline into a concise, shareable summary in seconds.",
  },
  {
    icon: IconTarget,
    title: "Root cause suggestions",
    description: "Correlate incident metadata and system signals to surface likely root causes.",
  },
  {
    icon: IconLayers,
    title: "Runbook generation",
    description: "Draft a first-pass remediation runbook based on similar past incidents.",
  },
  {
    icon: IconFileText,
    title: "Postmortem drafting",
    description: "Auto-generate a postmortem skeleton — timeline, impact, and follow-ups.",
  },
];

const SUGGESTED_PROMPTS = [
  "Summarize all open P1 incidents",
  "Which service has had the most incidents this week?",
  "Draft a postmortem outline for the latest resolved incident",
  "What's our current incident backlog by severity?",
];

export function AiAssistantPage() {
  return (
    <>
      <PageHeader
        title="AI Assistant"
        description="An operations copilot for triaging, summarizing, and reasoning about incidents."
        action={
          <Badge color="var(--color-sev-p2)" background="var(--color-sev-p2-soft)" dot>
            Coming soon — not connected yet
          </Badge>
        }
      />

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Planned capabilities</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {CAPABILITIES.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-[var(--radius-md)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-2)]/40 p-4"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-accent-soft)] text-[var(--color-accent-strong)]">
                  <Icon className="h-4 w-4" />
                </div>
                <p className="mt-3 text-sm font-medium text-[var(--color-text-primary)]">{title}</p>
                <p className="mt-1 text-xs leading-relaxed text-[var(--color-text-muted)]">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      <Card className="flex h-[28rem] flex-col">
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent-strong)]">
            <IconSparkles className="h-6 w-6" />
          </div>
          <div className="max-w-md space-y-1.5">
            <p className="text-sm font-medium text-[var(--color-text-primary)]">
              The AI assistant isn't wired up yet
            </p>
            <p className="text-sm text-[var(--color-text-muted)]">
              This is the interface where OpsPilot's operations copilot will live — summarizing
              incidents, suggesting next actions, and answering questions about your production
              systems. Real model integration lands in a future phase.
            </p>
          </div>

          <div className="mt-2 flex flex-wrap justify-center gap-2">
            {SUGGESTED_PROMPTS.map((prompt) => (
              <span
                key={prompt}
                title="Not available yet"
                className="cursor-not-allowed rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-1.5 text-xs text-[var(--color-text-muted)]"
              >
                {prompt}
              </span>
            ))}
          </div>
        </div>

        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex items-center gap-2 border-t border-[var(--color-border-subtle)] p-4"
        >
          <input
            disabled
            placeholder="AI Assistant coming soon…"
            className="flex-1 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3.5 py-2.5 text-sm text-[var(--color-text-muted)] outline-none disabled:cursor-not-allowed"
          />
          <button
            disabled
            type="submit"
            aria-label="Send (not available yet)"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-surface-2)] text-[var(--color-text-muted)] disabled:cursor-not-allowed"
          >
            <IconSend className="h-4 w-4" />
          </button>
        </form>
      </Card>
    </>
  );
}

import { Construction } from 'lucide-react';
import { EmptyState } from './EmptyState';

export function ComingSoon({ title, milestone }) {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">{title}</h1>
        <p className="mt-1 text-sm text-ink-500">This screen is scoped for {milestone}.</p>
      </div>
      <EmptyState
        icon={Construction}
        title="Under construction"
        description="This page is wired into routing and navigation already — the full build lands in the next milestone."
        className="rounded-2xl border border-dashed border-border-strong bg-surface"
      />
    </div>
  );
}

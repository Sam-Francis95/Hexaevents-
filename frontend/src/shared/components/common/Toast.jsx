import { CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { cn } from '../../utils/cn';

const ICONS = {
  success: CheckCircle2,
  danger: TriangleAlert,
  info: Info,
};

const TONES = {
  success: 'border-success-500/30 [&_svg]:text-success-500',
  danger: 'border-danger-500/30 [&_svg]:text-danger-500',
  info: 'border-accent-500/30 [&_svg]:text-accent-500',
};

export function ToastHost() {
  const { toasts, dismiss } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-80">
      {toasts.map((t) => {
        const Icon = ICONS[t.variant] || Info;
        return (
          <div
            key={t.id}
            role="status"
            className={cn(
              'flex items-start gap-2.5 rounded-xl border bg-surface px-3.5 py-3 shadow-popover animate-toast-in',
              TONES[t.variant] || TONES.info
            )}
          >
            <Icon className="size-4 mt-0.5 shrink-0" />
            <p className="flex-1 text-sm text-ink-900">{t.message}</p>
            <button
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss"
              className="text-ink-300 hover:text-ink-700"
            >
              <X className="size-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

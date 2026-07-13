import { cn } from '../../utils/cn';

export function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 px-6 py-10 text-center', className)}>
      {Icon && (
        <span className="flex size-11 items-center justify-center rounded-full bg-ink-900/5 text-ink-500">
          <Icon className="size-5" />
        </span>
      )}
      <div className="space-y-1">
        <p className="text-sm font-medium text-ink-900">{title}</p>
        {description && <p className="text-sm text-ink-500 max-w-xs">{description}</p>}
      </div>
      {action}
    </div>
  );
}

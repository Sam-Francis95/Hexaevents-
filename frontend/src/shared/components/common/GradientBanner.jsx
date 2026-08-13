import { cn } from '../../utils/cn';

/**
 * Full-width gradient hero banner (e.g. dashboard welcome message).
 * Generic container — any module can reuse it with its own copy/icon.
 */
export function GradientBanner({ icon, title, subtitle, decoration, className }) {
  return (
    <div
      className={cn(
        'relative flex items-center justify-between gap-6 overflow-hidden rounded-2xl bg-banner-gradient px-6 py-6 text-white shadow-card sm:px-8',
        className
      )}
    >
      <div className="absolute -right-10 -top-16 size-52 rounded-full bg-white/10" />
      <div className="absolute -bottom-20 left-1/3 size-40 rounded-full bg-white/5" />

      <div className="relative">
        <h1 className="flex items-center gap-2 text-xl font-bold sm:text-2xl">
          {icon} {title}
        </h1>
        {subtitle && <p className="mt-1.5 text-sm text-white/85 sm:text-base">{subtitle}</p>}
      </div>

      {decoration && <div className="relative hidden shrink-0 sm:block">{decoration}</div>}
    </div>
  );
}

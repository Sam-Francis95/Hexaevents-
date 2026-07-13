import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';
import { BUTTON_VARIANTS, BUTTON_SIZES } from './buttonStyles';

export const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', isLoading = false, leftIcon, rightIcon, className, children, disabled, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center rounded-xl font-medium transition-colors duration-100',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        BUTTON_VARIANTS[variant],
        BUTTON_SIZES[size],
        className
      )}
      {...props}
    >
      {isLoading ? <Loader2 className="size-4 animate-spin" /> : leftIcon}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
});

import React from 'react';
import './Badge.css';
import { cn } from '../utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'subtle' | 'filled' | 'glass' | 'success' | 'error';
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'subtle', ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn('badge', `badge-${variant}`, className)}
        {...props}
      />
    );
  }
);
Badge.displayName = 'Badge';

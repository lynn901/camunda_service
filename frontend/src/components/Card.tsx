import React from 'react';
import './Card.css';
import { cn } from '../utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'content' | 'feature';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'content', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('card', `card-${variant}`, className)}
        {...props}
      />
    );
  }
);
Card.displayName = 'Card';

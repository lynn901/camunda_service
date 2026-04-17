import React from 'react';
import './Input.css';
import { cn } from '../utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn('input', className)}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

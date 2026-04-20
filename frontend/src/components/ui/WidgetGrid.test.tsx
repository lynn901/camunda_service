import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { WidgetGrid, WidgetCard } from './WidgetGrid';

describe('WidgetGrid Component (Refactor)', () => {
  it('should support dynamic column counts via props', () => {
    const { container } = render(
      <WidgetGrid className="lg:grid-cols-5">
        <div>1</div>
        <div>2</div>
        <div>3</div>
        <div>4</div>
        <div>5</div>
      </WidgetGrid>
    );
    
    expect(container.firstChild).toHaveClass('lg:grid-cols-5');
  });

  it('should have generous gap by default', () => {
    const { container } = render(
      <WidgetGrid>
        <div>1</div>
        <div>2</div>
      </WidgetGrid>
    );
    expect(container.firstChild).toHaveClass(/gap-(6|8|12)/);
  });
});

describe('WidgetCard Component (Refactor)', () => {
  it('should have the new design classes and support custom padding', () => {
    const { container } = render(
      <WidgetCard title="Test Title" className="p-8">
        <div>Content</div>
      </WidgetCard>
    );
    
    const card = container.firstChild as HTMLElement;
    // New design expectations
    expect(card).toHaveClass('bg-surface-container-lowest');
    expect(card).toHaveClass('ring-1');
    expect(card).toHaveClass('ring-outline-variant/10');
    expect(card).toHaveClass('p-8');
  });
});

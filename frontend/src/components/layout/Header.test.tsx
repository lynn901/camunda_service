import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Header } from './Header';
import { BrowserRouter } from 'react-router-dom';

describe('Header Component', () => {
  it('should render the header title', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    expect(screen.getByText('Camunda 运维')).toBeInTheDocument();
  });

  it('should NOT render removed links: Logs, Alerts, Support', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    expect(screen.queryByText('日志')).not.toBeInTheDocument();
    expect(screen.queryByText('警报')).not.toBeInTheDocument();
    expect(screen.queryByText('支持')).not.toBeInTheDocument();
  });

  it('should NOT render "管理控制" button', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    expect(screen.queryByText('管理控制')).not.toBeInTheDocument();
  });

  it('should render the "干预" button', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    expect(screen.getByText('干预')).toBeInTheDocument();
  });
});

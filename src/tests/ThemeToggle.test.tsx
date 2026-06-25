import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ThemeToggle from '../components/ThemeToggle';

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('ThemeToggle', () => {
  it('renders theme toggle button', () => {
    render(<ThemeToggle />);
    const btn = screen.getByRole('button');
    expect(btn).toBeInTheDocument();
  });

  it('cycles through themes on click', () => {
    render(<ThemeToggle />);
    const btn = screen.getByRole('button');
    // initial theme is dark (moon icon)
    expect(btn).toHaveAttribute('title', expect.stringContaining('Тёмная'));
    fireEvent.click(btn);
    // should switch to light (sun icon)
    expect(btn).toHaveAttribute('title', expect.stringContaining('Светлая'));
  });
});

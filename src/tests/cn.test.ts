import { describe, it, expect } from 'vitest';
import { cn } from '../utils/cn';

describe('cn utility', () => {
  it('merges simple class strings', () => {
    expect(cn('a', 'b')).toBe('a b');
  });

  it('handles conditional classes', () => {
    expect(cn('a', false && 'b', 'c')).toBe('a c');
  });

  it('merges tailwind conflicting classes', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });

  it('handles empty and undefined values', () => {
    expect(cn('a', undefined, null, '', 'b')).toBe('a b');
  });
});

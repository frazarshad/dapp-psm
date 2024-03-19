import { expect, it, describe } from 'vitest';

import { activeNotices } from '../../src/utils/networkConfig';

describe('activeNotices', () => {
  it('handles empty', () => {
    const notices = [];
    expect(activeNotices({ notices })).toEqual([]);
  });
  it('handles future', () => {
    const notices = [
      {
        start: '2030-01-01',
        end: '2040-01-01',
        message: 'hello from the future',
      },
    ];
    expect(activeNotices({ notices })).toEqual([]);
  });
  it('handles past', () => {
    const notices = [
      {
        start: '2000-01-01',
        end: '2000-01-01',
        message: 'hello from the past',
      },
    ];
    expect(activeNotices({ notices })).toEqual([]);
  });
  it('handles started', () => {
    const notices = [
      {
        start: '2020-01-01',
        end: '2040-01-01',
        message: 'hello now',
      },
    ];
    expect(activeNotices({ notices })).toEqual(['hello now']);
  });
});

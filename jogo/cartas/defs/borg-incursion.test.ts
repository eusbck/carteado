import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Borg Incursion', () => {
  it('cria duas fichas Borg', () => {
    const tg = setup({ battlefield: [[...Array(3).fill('Plains')], []], hand: [['Borg Incursion'], []] });
    tg.cast('Borg Incursion').resolve();
    tg.settle();
    expect(tg.all('Borg').length).toBe(2);
  });
});

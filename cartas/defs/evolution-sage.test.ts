import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Evolution Sage', () => {
  it('dispara jogando terreno: prolifera', () => {
    const tg = setup({ battlefield: [['Evolution Sage', { name: 'Wall of Omens', counters: { '+1/+1': 1 } }], []], hand: [['Forest'], []] });
    tg.choose('Proliferar', ['Wall of Omens']).play('Forest').resolve();
    expect(tg.pt(tg.bf('Wall of Omens'))).toEqual([2, 6]);
  });
});

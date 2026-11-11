import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Dark Ritual', () => {
  it('adiciona {B}{B}{B}', () => {
    const tg = setup({ battlefield: [['Swamp'], []], hand: [['Dark Ritual'], []] });
    tg.cast('Dark Ritual').resolve();
    expect(tg.state.players[0].manaPool.map((m) => m.type)).toEqual(['B', 'B', 'B']);
  });
});

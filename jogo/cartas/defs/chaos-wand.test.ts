import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Chaos Wand';

describe(N, () => {
  it('{4}, {T}: o oponente exila até uma instantânea ou feitiço, que você conjura de graça', () => {
    const tg = setup({ battlefield: [[N, ...Array(4).fill('Island')], []], library: [Array(6).fill('Island'), ['Swamp', 'Consider', 'Island']] });
    tg.choose('oponente alvo', ['Bruno']).yes('Chaos Wand', true);
    tg.activate(N, '{4}, {T}').resolveAll();
    expect(tg.names(1, 'graveyard')).toEqual(['Consider']);
    expect(tg.names(0, 'hand')).toHaveLength(1);
  });

  it('sem instantânea nem feitiço no grimório, todas as cartas exiladas voltam para ele', () => {
    const tg = setup({ battlefield: [[N, ...Array(4).fill('Island')], []], library: [Array(6).fill('Island'), ['Swamp', 'Sol Ring', 'Island']] });
    tg.choose('oponente alvo', ['Bruno']);
    tg.activate(N, '{4}, {T}').resolveAll();
    expect(tg.names(1, 'library').sort()).toEqual(['Island', 'Sol Ring', 'Swamp']);
    expect(tg.names(1, 'exile')).toEqual([]);
  });
});

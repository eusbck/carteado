import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Cephalid Coliseum';
const sete = Array(7).fill('Forest');

describe(N, () => {
  it('{T}: {U} e causa 1 de dano a você', () => {
    const tg = setup({ battlefield: [[N], []], hand: [['Opt'], []], library: [['Forest', 'Forest'], []] });
    tg.cast('Opt').resolve();
    expect(tg.life(0)).toBe(39);
  });
  it('limiar: o jogador alvo compra três e descarta três; só com sete ou mais cartas no seu cemitério', () => {
    const tg = setup({ battlefield: [[N, 'Island'], []], graveyard: [Array(6).fill('Forest'), []], library: [['Opt', 'Ponder', 'Swamp'], []] });
    expect(tg.actionIds().some((a) => a.startsWith('act:') && a.includes(String(tg.bf(N))))).toBe(false);
    const tg2 = setup({ battlefield: [[N, 'Island'], []], graveyard: [sete, []], library: [['Opt', 'Ponder', 'Swamp'], []] });
    tg2.choose('jogador alvo', ['Ana']).choose('Descarte', ['Opt', 'Ponder', 'Swamp']);
    tg2.activate(N, 'Limiar').resolve();
    expect(tg2.names(0, 'hand')).toEqual([]);
    expect(tg2.names(0, 'graveyard')).toHaveLength(7 + 1 + 3);
  });
});

import { describe, expect, it } from 'vitest';
import { destroy } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const C = 'Congregate';
const campo = () => [['Plains', 'Plains', 'Plains', 'Plains', 'Wall of Omens'], ['Indomitable Ancients', 'Elvish Mystic']];

describe(C, () => {
  it('o jogador alvo ganha 2 de vida por criatura no campo (de todos os jogadores)', () => {
    const tg = setup({ battlefield: campo(), hand: [[C], []] });
    tg.choose('jogador alvo', ['Bruno']).cast(C).resolve();
    expect(tg.life(1)).toBe(46);
    expect(tg.life(0)).toBe(40);
  });
  it('CR 608.2h: conta as criaturas na resolução', () => {
    const tg = setup({ battlefield: campo(), hand: [[C], []] });
    tg.choose('jogador alvo', ['Ana']).cast(C);
    tg.run(destroy(tg.g, [tg.bf('Elvish Mystic'), tg.bf('Wall of Omens')]));
    tg.resolve();
    expect(tg.life(0)).toBe(42);
  });
});

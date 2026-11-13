import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Hive Mind Coprocessor';

describe(N, () => {
  it('a criatura artefato que causa dano de combate a um jogador pode pagar 1 de vida para comprar uma carta', () => {
    const tg = setup({ battlefield: [[N, { name: 'Borg', token: true }], []] });
    const mao = tg.state.zones.hand[0].length;
    tg.yes('Pagar 1 de vida', true);
    tg.attack([['Borg', 1]]).passTo('main2');
    expect(tg.life(0)).toBe(39);
    expect(tg.life(1)).toBe(39);
    expect(tg.state.zones.hand[0].length).toBe(mao + 1);
  });

  it('pode recusar o pagamento', () => {
    const tg = setup({ battlefield: [[N, { name: 'Borg', token: true }], []] });
    const mao = tg.state.zones.hand[0].length;
    tg.yes('Pagar 1 de vida', false);
    tg.attack([['Borg', 1]]).passTo('main2');
    expect(tg.life(0)).toBe(40);
    expect(tg.state.zones.hand[0].length).toBe(mao);
  });
});

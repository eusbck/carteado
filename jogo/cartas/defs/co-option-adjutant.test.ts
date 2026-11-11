import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Co-Option Adjutant';

describe(N, () => {
  it('cada criatura artefato que causa dano de combate a um jogador compra uma carta', () => {
    const tg = setup({ battlefield: [[N, { name: 'Borg', token: true }, { name: 'Borg', token: true }], []] });
    const mao = tg.state.zones.hand[0].length;
    tg.attack(tg.all('Borg').map((id) => [id, 1])).passTo('main2');
    expect(tg.state.zones.hand[0].length).toBe(mao + 2);
  });
});

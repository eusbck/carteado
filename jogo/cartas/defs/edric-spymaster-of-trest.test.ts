import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Edric, Spymaster of Trest';

describe(N, () => {
  it('quando uma criatura sua causa dano de combate a um oponente, você pode comprar', () => {
    const tg = setup({ battlefield: [[N, 'Slither Blade', 'Triton Shorestalker'], []] });
    tg.yes('Edric', true).yes('Edric', true);
    tg.attack([['Slither Blade', 1], ['Triton Shorestalker', 1]]).passTo('main2', 0);
    // uma compra por criatura
    expect(tg.state.zones.hand[0]).toHaveLength(2);
  });

  it('a criatura de um oponente que causa dano a outro oponente faz o controlador dela poder comprar', () => {
    const tg = setup({ players: 3, active: 1, battlefield: [[N], ['Slither Blade'], []] });
    let quem = -1;
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('Edric') ? ((quem = d.player), { kind: 'select', ids: ['yes'] }) : null));
    tg.attack([['Slither Blade', 2]]).passTo('main2', 1);
    expect(quem).toBe(1);
    expect(tg.state.zones.hand[1]).toHaveLength(1);
    expect(tg.state.zones.hand[0]).toHaveLength(0);
  });

  it('dano a você não dispara', () => {
    const tg = setup({ active: 1, battlefield: [[N], ['Slither Blade']] });
    tg.attack([['Slither Blade', 0]]).passTo('main2', 1);
    expect(tg.state.zones.hand[1]).toHaveLength(0);
  });
});

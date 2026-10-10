import { describe, expect, it } from 'vitest';
import { removeCard, fixture as setup } from '../../testes/artefatos.ts';

const N = "Myr Battlesphere";
describe(N, () => {
  it("cria quatro fichas; ataque usa Myr com enjoo e soma bônus e dano", () => {

    const tg = setup({ battlefield: [[N, { name: 'Myr', token: true, ready: false }, { name: 'Myr', token: true, ready: false }], []] });
    tg.choose('Myr Battlesphere:', ['Myr', 'Myr']).attack([[N, 1]]).passTo('main2'); expect(tg.life(1)).toBe(32); expect(tg.pt(tg.bf(N))).toEqual([6, 7]);
    const etb = setup({ battlefield: [['Sol Ring', 'Sol Ring', 'Sol Ring', 'Island'], []], hand: [[N], []] }); etb.cast(N).resolveAll(); expect(etb.all('Myr')).toHaveLength(4);
  });

  it("depois de sair ainda pode virar Myr e causar dano ao defensor conhecido", () => {

    const tg = setup({ battlefield: [[N, { name: 'Myr', token: true }], []] }); tg.attack([[N, 1]]).passUntil(t => t.state.turn.step === 'declareAttackers' && t.state.zones.stack.length > 0);
    const source = tg.bf(N); removeCard(tg, source); tg.choose('Myr Battlesphere:', ['Myr']).resolveAll(); expect(tg.life(1)).toBe(39);
  });
});

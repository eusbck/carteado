import { describe, expect, it } from 'vitest';
import { addEffect } from '../../motor/api.ts';
import { removeCard, fixture as setup } from '../../testes/artefatos.ts';

const N = "Thopter Spy Network";
describe(N, () => {
  it('perder o último artefato antes da resolução impede a criação da ficha', () => {
    const tg = setup({ battlefield: [[N, 'Sol Ring'], []] });
    tg.passUntil((t) => t.state.turn.step === 'upkeep' && t.state.turn.active === 0 && t.state.zones.stack.length > 0);
    removeCard(tg, tg.bf('Sol Ring')); tg.resolveAll(); expect(tg.all('Thopter')).toHaveLength(0);
  });
  it('golpe duplo contra dois jogadores cria um gatilho para cada jogador em cada etapa de dano', () => {
    const tg = setup({ players: 4, battlefield: [[N, { name: 'Thopter', token: true }, { name: 'Thopter', token: true }], [], [], []] });
    const tokens = tg.all('Thopter');
    addEffect(tg.g, { source: tg.bf(N), sourceDef: N, controller: 0, duration: { kind: 'endOfTurn' }, affected: tokens, mods: [{ k: 'addKeyword', kw: 'double strike' }] }); tg.refresh();
    tg.attack([[tokens[0], 1], [tokens[1], 2]]).passTo('main2'); expect(tg.state.zones.hand[0]).toHaveLength(4);
  });
  it("manutenção exige artefato no disparo e na resolução", () => {

    const tg = setup({ battlefield: [[N, 'Sol Ring'], []] }); tg.passTo('upkeep', 0); expect(tg.all('Thopter')).toHaveLength(1);
    const absent = setup({ battlefield: [[N], []] }); absent.passTo('upkeep', 0); expect(absent.all('Thopter')).toHaveLength(0);
  });

  it("dano simultâneo de duas criaturas ao mesmo jogador compra só uma carta", () => {

    const tg = setup({ battlefield: [[N, { name: 'Thopter', token: true }, { name: 'Thopter', token: true }], []] }); tg.attack(tg.all('Thopter').map(id => [id, 1])).passTo('main2'); expect(tg.state.zones.hand[0]).toHaveLength(1);
  });
});

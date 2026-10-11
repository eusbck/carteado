import { describe, expect, it } from 'vitest';
import { isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const N = "Smuggler's Buggy";
const forests = Array(10).fill('Forest');

describe(N, () => {
  it('esconderijo 4 ao entrar; tripulado, causa dano de combate e conjura de graça a carta escondida, voltando para a mão', () => {
    const tg = setup({
      battlefield: [['Island', 'Island', 'Island', 'Island', 'Indomitable Ancients'], []], hand: [[N], []],
      library: [['Plains', 'Sol Ring', 'Swamp', 'Mountain', ...forests], forests],
    });
    tg.choose('Esconderijo', ['Sol Ring']).cast(N).resolveAll();
    const exilada = tg.state.zones.exile.map((id) => tg.state.objects[id]);
    expect(exilada).toHaveLength(1);
    expect(exilada[0].faceDown).toBe(true);
    expect(isCreature(tg.g, tg.bf(N))).toBe(false);
    // no turno seguinte: tripula com uma criatura de força 2, ataca e conecta
    tg.passTo('main1', 1);
    tg.passTo('main1', 0);
    tg.choose('Tripular:', ['Indomitable Ancients']).choose('Tripular:', ['done']).activate(N, 'Tripular').resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([5, 5]);
    tg.yes(N, true).attack([[N, 1]]).passTo('main2', 0);
    expect(tg.life(1)).toBe(35);
    expect(tg.find('Sol Ring')).not.toBeNull();
    expect(tg.names(0, 'hand')).toContain(N);
    expect(tg.find(N)).toBeNull();
  });

  it('sem conjurar a carta, o veículo fica no campo e a carta continua escondida', () => {
    const tg = setup({
      battlefield: [['Island', 'Island', 'Island', 'Island', 'Indomitable Ancients'], []], hand: [[N], []],
      library: [['Plains', 'Sol Ring', 'Swamp', 'Mountain', ...forests], forests],
    });
    tg.choose('Esconderijo', ['Sol Ring']).cast(N).resolveAll();
    tg.passTo('main1', 1);
    tg.passTo('main1', 0);
    tg.choose('Tripular:', ['Indomitable Ancients']).choose('Tripular:', ['done']).activate(N, 'Tripular').resolveAll();
    tg.yes(N, false).attack([[N, 1]]).passTo('main2', 0);
    expect(tg.find(N)).not.toBeNull();
    expect(tg.state.zones.exile).toHaveLength(1);
  });
});

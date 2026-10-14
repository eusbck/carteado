import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { dealDamage } from '../../motor/api.ts';

const NOME = "Gideon's Sacrifice";

describe(NOME, () => {
  it('o dano a você e às suas permanentes vai todo para a escolhida, mesmo além da resistência', () => {
    const tg = setup({ battlefield: [['Plains', 'Wall of Omens', 'Indomitable Ancients', "Elspeth, Sun's Champion"], ['Zetalpa, Primal Dawn']], hand: [[NOME], []] });
    tg.choose("Gideon's Sacrifice", ['Indomitable Ancients']).cast(NOME).resolve();
    const z = tg.bf('Zetalpa, Primal Dawn');
    const anc = tg.bf('Indomitable Ancients');
    dealDamage(tg.g, [
      { source: z, target: { kind: 'player', id: 0 }, amount: 3, combat: false },
      { source: z, target: { kind: 'obj', id: tg.bf('Wall of Omens') }, amount: 2, combat: false },
      { source: z, target: { kind: 'obj', id: tg.bf("Elspeth, Sun's Champion") }, amount: 4, combat: false },
    ]);
    expect(tg.life(0)).toBe(40);
    expect(tg.state.objects[tg.bf('Wall of Omens')].damage).toBe(0);
    expect(tg.state.objects[tg.bf("Elspeth, Sun's Champion")].counters.loyalty).toBe(4);
    expect(tg.state.objects[anc].damage).toBe(9);
  });

  it('sem criatura nem planeswalker, nada acontece', () => {
    const tg = setup({ battlefield: [['Plains'], ['Indomitable Ancients']], hand: [[NOME], []] });
    tg.cast(NOME).resolve();
    dealDamage(tg.g, [{ source: tg.bf('Indomitable Ancients'), target: { kind: 'player', id: 0 }, amount: 3, combat: false }]);
    expect(tg.life(0)).toBe(37);
  });
});

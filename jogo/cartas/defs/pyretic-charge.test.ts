import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Pyretic Charge';
const cartas = (n: number) => Array(n).fill('Plains');

describe(N, () => {
  it('descarta a mão, compra quatro e as suas criaturas ganham +1/+0 por carta descartada; as que chegam depois, não', () => {
    const tg = setup({
      battlefield: [['Mountain', 'Mountain', 'Mountain', 'Mountain', 'Indomitable Ancients', 'Plains', 'Plains'], ['Wall of Omens']],
      hand: [[N, 'Forest', 'Swamp', 'Wall of Omens'], []], library: [cartas(6), []],
    });
    tg.cast(N).resolveAll();
    expect(tg.names(0, 'graveyard').sort()).toEqual([N, 'Forest', 'Swamp', 'Wall of Omens'].sort());
    expect(tg.names(0, 'hand')).toHaveLength(4);
    expect(tg.pt(tg.bf('Indomitable Ancients'))).toEqual([5, 10]);
    // a criatura do oponente não ganha nada
    expect(tg.pt(tg.bf('Wall of Omens', 1))).toEqual([0, 4]);
  });

  it('planejada e conjurada no turno seguinte sem pagar o custo de mana', () => {
    const tg = setup({ battlefield: [['Mountain', 'Mountain', 'Mountain', 'Mountain'], []], hand: [[N], []], library: [cartas(10), cartas(10)] });
    tg.answer({ kind: 'priority', action: tg.actionIds().find((a) => a.startsWith('plot:'))! });
    tg.settle();
    expect(tg.names(0, 'exile')).toEqual([N]);
    expect(tg.state.zones.battlefield.every((id) => tg.state.objects[id].tapped)).toBe(true);
    tg.passTo('main1', 1);
    tg.passTo('main1', 0);
    for (const id of tg.state.zones.battlefield) tg.state.objects[id].tapped = true;
    tg.refresh();
    const mao = tg.names(0, 'hand').length;
    tg.cast(N, 'plot').resolveAll();
    expect(tg.names(0, 'hand')).toHaveLength(4);
    expect(tg.names(0, 'graveyard')).toHaveLength(mao + 1);
  });
});

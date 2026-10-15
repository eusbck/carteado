import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = "Tezzeret's Gambit";

describe(N, () => {
  it('compra duas e prolifera, escolhendo permanentes de qualquer jogador', () => {
    const tg = setup({
      battlefield: [['Island', 'Island', 'Island', 'Island', { name: 'Wall of Omens', counters: { '+1/+1': 1 } }], [{ name: 'Indomitable Ancients', counters: { '+1/+1': 2 } }]],
      hand: [[N], []], library: [['Plains', 'Swamp'], []],
    });
    tg.choose('Proliferar', ['Wall of Omens', 'Indomitable Ancients']).cast(N).resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Plains', 'Swamp']);
    expect(tg.state.objects[tg.bf('Wall of Omens')].counters['+1/+1']).toBe(2);
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].counters['+1/+1']).toBe(3);
  });

  it('paga {U/P} com 2 de vida', () => {
    const tg = setup({ battlefield: [['Mountain', 'Mountain', 'Mountain'], []], hand: [[N], []], library: [['Plains', 'Swamp'], []] });
    let vida = false;
    tg.script.push((d) => (d.kind === 'payment' && !vida ? ((vida = true), { kind: 'payment', life: 1 }) : null));
    tg.cast(N).resolveAll();
    expect(tg.life(0)).toBe(38);
    expect(tg.names(0, 'hand')).toHaveLength(2);
  });
});

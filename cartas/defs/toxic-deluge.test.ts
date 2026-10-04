import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { createTokens } from '../../motor/api.ts';

describe('Toxic Deluge', () => {
  it('paga X de vida e todas as criaturas recebem -X/-X', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp', 'Wall of Omens'], ['Indomitable Ancients']], hand: [['Toxic Deluge'], []] });
    tg.number('valor de X', 3).cast('Toxic Deluge');
    expect(tg.life(0)).toBe(37); // custo pago ao conjurar (CR 601.2h)
    tg.resolve();
    expect(tg.pt(tg.bf('Wall of Omens'))).toEqual([-3, 1]);
    expect(tg.pt(tg.bf('Indomitable Ancients'))).toEqual([-1, 7]);
  });
  it('CR 611.2c: criaturas que entram depois não são afetadas', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp'], []], hand: [['Toxic Deluge'], []] });
    tg.number('valor de X', 2).cast('Toxic Deluge').resolve();
    const [t] = tg.run(createTokens(tg.g, 1, 'Saproling', 1));
    expect(tg.pt(t)).toEqual([1, 1]);
  });
  it('CR 119.4: não pode pagar mais vida do que tem', () => {
    const tg = setup({ life: 5, battlefield: [['Swamp', 'Swamp', 'Swamp'], []], hand: [['Toxic Deluge'], []] });
    let max = -1;
    tg.script.push((d) => { if (d.kind === 'number') { max = d.max; return { kind: 'number', value: 0 }; } return null; });
    tg.cast('Toxic Deluge');
    expect(max).toBe(5);
  });
});

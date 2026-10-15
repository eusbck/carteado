import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Opt', () => {
  it('CR 701.22: vidência 1 (a carta vai para o fundo) e depois compra a seguinte', () => {
    const tg = setup({ battlefield: [['Island'], []], hand: [['Opt'], []], library: [['Plains', 'Swamp', 'Forest'], []] });
    tg.script.push((d) => (d.kind === 'arrange' ? { kind: 'arrange', placement: Object.fromEntries(d.items.map((i) => [i.id, 'bottom'])), order: d.items.map((i) => i.id) } : null));
    tg.cast('Opt').resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Swamp']);
    expect(tg.names(0, 'library')).toEqual(['Forest', 'Plains']);
  });

  it('é instantânea: conjura no turno do oponente', () => {
    const tg = setup({ active: 1, battlefield: [['Island'], []], hand: [['Opt'], []], library: [['Plains', 'Swamp'], []] });
    tg.pass();
    tg.cast('Opt').resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Plains']);
  });
});

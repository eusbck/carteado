import { describe, expect, it } from 'vitest';
import { dealDamage } from '../../motor/actions.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Eiganjo Castle';

describe(N, () => {
  it('{W}, {T}: previne os próximos 2 de dano à criatura lendária alvo neste turno', () => {
    const tg = setup({ battlefield: [[N, 'Plains', 'Trazyn the Infinite', 'Serra Angel'], ['Wall of Omens']] });
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('criatura lendária alvo')) return null;
      expect(d.items.map((i) => i.label)).toEqual(['Trazyn the Infinite']);
      return { kind: 'select', ids: [d.items[0].id] };
    });
    tg.activate(N, 'Previna').resolveAll();
    const trazyn = tg.bf('Trazyn the Infinite');
    const fonte = tg.bf('Wall of Omens');
    dealDamage(tg.g, [{ source: fonte, target: { kind: 'obj', id: trazyn }, amount: 1, combat: false }]);
    expect(tg.state.objects[trazyn].damage).toBe(0);
    dealDamage(tg.g, [{ source: fonte, target: { kind: 'obj', id: trazyn }, amount: 3, combat: false }]);
    expect(tg.state.objects[trazyn].damage).toBe(2);
    dealDamage(tg.g, [{ source: fonte, target: { kind: 'obj', id: trazyn }, amount: 1, combat: false }]);
    expect(tg.state.objects[trazyn].damage).toBe(3);
  });
});
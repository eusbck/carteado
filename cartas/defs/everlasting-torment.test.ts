import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { dealDamage, gainLife } from '../../motor/api.ts';

describe('Everlasting Torment', () => {
  it('o ganho de vida não acontece; dano de qualquer fonte vira marcadores; proteção não previne o dano', () => {
    const tg = setup({ battlefield: [['Everlasting Torment', 'Gau, Feral Youth'], ['Wall of Omens', { name: 'Elvish Mystic' }, { name: 'Spirit Mantle', attachTo: 'Elvish Mystic' }]] });
    gainLife(tg.g, 0, 5, null);
    expect(tg.life(0)).toBe(40);
    const gau = tg.bf('Gau, Feral Youth');
    dealDamage(tg.g, [
      { source: gau, target: { kind: 'obj', id: tg.bf('Wall of Omens') }, amount: 2, combat: false },
      { source: gau, target: { kind: 'obj', id: tg.bf('Elvish Mystic') }, amount: 2, combat: false },
    ]);
    tg.refresh();
    expect(tg.state.objects[tg.bf('Wall of Omens')].counters['-1/-1']).toBe(2);
    expect(tg.find('Elvish Mystic')).toBeNull(); // proteção contra criaturas não preveniu
  });
});

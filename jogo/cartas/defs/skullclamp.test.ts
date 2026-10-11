import { describe, expect, it } from 'vitest';
import { destroy } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const S = 'Skullclamp';

describe(S, () => {
  it('equipar {1}: +1/-1; criatura de resistência 1 morre e você compra duas cartas (CR 704.5f)', () => {
    const tg = setup({ battlefield: [['Mountain', 'Mountain', S, 'Elvish Mystic', 'Wall of Omens'], []], library: [['Island', 'Swamp', 'Plains'], []] });
    tg.choose('criatura alvo que você controla', ['Elvish Mystic']);
    tg.activate(S, 'Equipar').resolveAll();
    expect(tg.find('Elvish Mystic')).toBeNull();
    expect(tg.names(0, 'hand')).toEqual(['Island', 'Swamp']);
    expect(tg.state.objects[tg.bf(S)].attachedTo).toBeNull();
    tg.choose('criatura alvo que você controla', ['Wall of Omens']);
    tg.activate(S, 'Equipar').resolve();
    expect(tg.pt(tg.bf('Wall of Omens'))).toEqual([1, 3]);
  });
  it('criatura de outro jogador equipada morre: o controlador do Skullclamp compra', () => {
    const tg = setup({ battlefield: [[{ name: S, attachTo: 'Indomitable Ancients' }], ['Indomitable Ancients']], library: [['Island', 'Swamp'], ['Forest', 'Forest']] });
    tg.run(destroy(tg.g, [tg.bf('Indomitable Ancients')]));
    tg.resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Island', 'Swamp']);
    expect(tg.names(1, 'hand')).toEqual([]);
  });
  it('criatura que não está equipada morre: não dispara', () => {
    const tg = setup({ battlefield: [[S, 'Wall of Omens'], []], library: [['Island', 'Swamp'], []] });
    tg.run(destroy(tg.g, [tg.bf('Wall of Omens')]));
    tg.resolveAll();
    expect(tg.names(0, 'hand')).toEqual([]);
  });
});

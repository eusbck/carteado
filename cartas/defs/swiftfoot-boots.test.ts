import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { hasKw } from '../../motor/chars.ts';

describe('Swiftfoot Boots', () => {
  it('CR 702.6a: equipar {1} como feitiço dá resistência a magia e ímpeto', () => {
    const tg = setup({ battlefield: [['Swiftfoot Boots', 'Plains', { name: 'Indomitable Ancients', ready: false }], []] });
    tg.choose('criatura alvo que você controla', ['Indomitable Ancients']).activate('Swiftfoot Boots').resolve();
    const id = tg.bf('Indomitable Ancients');
    expect(hasKw(tg.g, id, 'hexproof')).toBe(true);
    expect(hasKw(tg.g, id, 'haste')).toBe(true);
  });
  it('CR 702.11b: oponente não pode mirar a criatura equipada', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp'], ['Indomitable Ancients', { name: 'Swiftfoot Boots', attachTo: 'Indomitable Ancients' }]], hand: [['Infernal Grasp'], []] });
    expect(tg.canCast('Infernal Grasp')).toBe(false);
  });
  it('perder o ímpeto antes de atacar impede o ataque', () => {
    const tg = setup({ step: 'beginCombat', battlefield: [[{ name: 'Indomitable Ancients', ready: false }], []] });
    tg.pass();
    expect(tg.state.combat?.attackers.length ?? 0).toBe(0);
  });
});

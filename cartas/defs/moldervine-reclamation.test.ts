import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Moldervine Reclamation', () => {
  it('criatura sua morre: ganha 1 e compra; criatura do oponente não conta', () => {
    const tg = setup({ battlefield: [['Moldervine Reclamation', 'Elvish Mystic', 'Swamp', 'Swamp', 'Swamp', 'Swamp'], ['Wall of Omens']], hand: [['Infernal Grasp', 'Infernal Grasp'], []], library: [['Island', 'Island'], []] });
    tg.choose('criatura alvo', ['Elvish Mystic']).cast('Infernal Grasp').resolve().resolve();
    expect(tg.life(0)).toBe(39);
    expect(tg.names(0, 'hand')).toEqual(['Infernal Grasp', 'Island']);
    tg.choose('criatura alvo', ['Wall of Omens']).cast('Infernal Grasp').resolve();
    expect(tg.state.zones.stack.length).toBe(0);
  });
  it('CR 603.10a: se sai do campo junto com as criaturas, dispara para cada uma', () => {
    const terrenos = ['Mountain', 'Mountain', 'Plains', 'Plains', 'Plains', 'Swamp', 'Swamp'];
    const tg = setup({ active: 1, battlefield: [['Moldervine Reclamation', 'Elvish Mystic', 'Wall of Omens'], terrenos], hand: [[], ['Ruinous Ultimatum']], library: [['Island', 'Island'], []] });
    tg.cast('Ruinous Ultimatum').resolve().resolveAll();
    expect(tg.life(0)).toBe(42);
    expect(tg.names(0, 'hand').length).toBe(2);
  });
});

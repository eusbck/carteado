import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Morbid Opportunist', () => {
  it('compra uma carta quando outras criaturas morrem, uma vez por turno', () => {
    const tg = setup({ battlefield: [['Morbid Opportunist', 'Swamp', 'Swamp', 'Swamp', 'Swamp'], ['Wall of Omens', 'Elvish Mystic']], hand: [['Infernal Grasp', 'Infernal Grasp'], []], library: [['Island', 'Island'], []] });
    tg.choose('criatura alvo', ['Wall of Omens']).cast('Infernal Grasp').resolve().resolve();
    expect(tg.names(0, 'hand')).toEqual(['Infernal Grasp', 'Island']);
    tg.choose('criatura alvo', ['Elvish Mystic']).cast('Infernal Grasp').resolve();
    expect(tg.state.zones.stack.length).toBe(0);
    expect(tg.names(0, 'hand')).toEqual(['Island']);
  });
  it('CR 603.10a: dispara mesmo morrendo junto com as outras', () => {
    const tg = setup({ battlefield: [['Morbid Opportunist', 'Elvish Mystic', 'Swamp', 'Swamp', 'Swamp'], []], hand: [['Toxic Deluge'], []], library: [['Island'], []] });
    tg.number('valor de X', 3).cast('Toxic Deluge').resolve().resolveAll();
    expect(tg.find('Morbid Opportunist')).toBeNull();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
  });
});

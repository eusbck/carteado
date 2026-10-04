import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Winds of Rath', () => {
  it('destrói as criaturas que não estão encantadas; uma criatura com Aura fica', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Plains', 'Plains', 'Plains', 'Wall of Omens', { name: 'Angelic Gift', attachTo: 'Wall of Omens' }], ['Indomitable Ancients']], hand: [['Winds of Rath'], []] });
    tg.cast('Winds of Rath').resolve();
    expect(tg.find('Wall of Omens')).not.toBeNull();
    expect(tg.find('Indomitable Ancients')).toBeNull();
  });
});

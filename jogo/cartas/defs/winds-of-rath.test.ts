import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Winds of Rath', () => {
  it('destrói as criaturas que não estão encantadas; uma criatura com Aura fica', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Plains', 'Plains', 'Plains', 'Wall of Omens', { name: 'Angelic Gift', attachTo: 'Wall of Omens' }], ['Indomitable Ancients']], hand: [['Winds of Rath'], []] });
    tg.cast('Winds of Rath').resolve();
    expect(tg.find('Wall of Omens')).not.toBeNull();
    expect(tg.find('Indomitable Ancients')).toBeNull();
  });

  it('CR 701.19c: elas não podem ser regeneradas', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Plains', 'Plains', 'Plains'], ['Skithiryx, the Blight Dragon', 'Swamp', 'Swamp']], hand: [['Winds of Rath'], []] });
    // Bruno regenera Skithiryx antes; o escudo não vale contra Winds of Rath
    tg.pass();
    tg.activate('Skithiryx, the Blight Dragon', 'Regenere').resolve();
    expect(tg.pending?.player).toBe(0);
    tg.cast('Winds of Rath').resolve();
    expect(tg.find('Skithiryx, the Blight Dragon')).toBeNull();
    expect(tg.names(1, 'graveyard')).toEqual(['Skithiryx, the Blight Dragon']);
  });
});

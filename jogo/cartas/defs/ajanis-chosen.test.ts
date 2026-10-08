import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe("Ajani's Chosen", () => {
  it('Aura que entra: cria um Cat e pode anexar a Aura a ele', () => {
    const tg = setup({ battlefield: [["Ajani's Chosen", 'Plains', 'Plains', 'Wall of Omens'], []], hand: [['Angelic Gift'], []], library: [['Island', 'Island'], []] });
    tg.yes('anexar a Aura', true).choose('criatura', ['Wall of Omens']).cast('Angelic Gift').resolve().resolveAll();
    const gato = tg.bf('Cat');
    expect(tg.state.objects[tg.bf('Angelic Gift')].attachedTo).toBe(gato);
  });
  it('só anexa se a Aura puder encantar a ficha; encantamento que não é Aura só cria o Cat', () => {
    const tg = setup({ battlefield: [["Ajani's Chosen", 'Swamp', 'Swamp', 'Swamp'], []], hand: [['Bastion of Remembrance'], []] });
    tg.cast('Bastion of Remembrance').resolve().resolveAll();
    expect(tg.all('Cat').length).toBe(1);
    expect(tg.all('Human Soldier').length).toBe(1);
  });
});

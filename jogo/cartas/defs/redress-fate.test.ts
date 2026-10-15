import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Redress Fate', () => {
  it('a Aura que volta escolhe o que encantar sem mirar, e a carta que não é artefato nem encantamento fica no cemitério', () => {
    const tg = setup({
      step: 'upkeep',
      battlefield: [['Plains', 'Plains', 'Plains', 'Plains', 'Wall of Omens'], []],
      graveyard: [['Sol Ring', 'Ghostly Prison', 'Timely Ward', 'Indomitable Ancients'], []],
      library: [['Redress Fate', 'Island'], ['Forest']],
    });
    tg.yes('Milagre: revelar', true).yes('Milagre: conjurar', true).choose('vai encantar', ['Wall of Omens']);
    tg.passUntil((t) => t.find('Redress Fate', 'stack') !== null);
    expect(tg.all('Plains').filter((x) => tg.state.objects[x].tapped)).toHaveLength(4);
    tg.resolve();
    expect(tg.find('Sol Ring')).not.toBeNull();
    expect(tg.find('Ghostly Prison')).not.toBeNull();
    expect(tg.state.objects[tg.bf('Timely Ward')].attachedTo).toBe(tg.bf('Wall of Omens'));
    expect(tg.names(0, 'graveyard')).toEqual(['Indomitable Ancients', 'Redress Fate']);
  });
});

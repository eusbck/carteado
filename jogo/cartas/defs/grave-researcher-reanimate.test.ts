import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Grave Researcher // Reanimate', () => {
  it('ao ficar preparado, cria a cópia de Reanimate no exílio; perde vida igual ao valor de mana da carta', () => {
    const tg = setup({
      step: 'end', active: 1,
      battlefield: [['Grave Researcher // Reanimate', 'Swamp'], []],
      graveyard: [['Wall of Omens', 'Elvish Mystic'], ['Archfiend of Depravity']],
      library: [['Gau, Feral Youth', 'Island'], ['Island']],
    });
    tg.script.push((d) => (d.kind === 'arrange' ? { kind: 'arrange', placement: Object.fromEntries(d.items.map((i) => [i.id, 'graveyard'])), order: d.items.map((i) => i.id) } : null));
    tg.passUntil((x) => x.state.turn.active === 0 && x.state.turn.step === 'upkeep').resolve();
    const gr = tg.bf('Grave Researcher // Reanimate');
    expect(tg.state.objects[gr].prepared).toBe(true);
    expect(tg.names(0, 'exile')).toEqual(['Reanimate']);
    tg.passTo('main1');
    tg.choose('carta de criatura alvo', ['Archfiend of Depravity']);
    tg.cast('Grave Researcher // Reanimate', 'prepared').resolve();
    expect(tg.find('Archfiend of Depravity')).not.toBeNull();
    expect(tg.life(0)).toBe(35);
    expect(tg.state.objects[gr].prepared).toBeFalsy();
  });
});

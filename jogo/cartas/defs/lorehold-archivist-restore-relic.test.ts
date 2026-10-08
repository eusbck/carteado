import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Lorehold Archivist // Restore Relic', () => {
  it('com três cartas de artefato e/ou criatura, prepara; Restore Relic exila e cria a cópia', () => {
    const tg = setup({
      step: 'end', active: 1, battlefield: [['Lorehold Archivist // Restore Relic', 'Mountain', 'Mountain', 'Plains', 'Plains'], []],
      graveyard: [['Sol Ring', 'Wall of Omens', 'Elvish Mystic'], []], library: [['Island', 'Island'], ['Island']],
    });
    tg.passUntil((x) => x.state.turn.active === 0 && x.state.turn.step === 'upkeep').resolve();
    const a = tg.bf('Lorehold Archivist');
    expect(tg.state.objects[a].prepared).toBe(true);
    tg.passTo('main1').choose('artefato ou criatura alvo', ['Wall of Omens']);
    tg.cast('Restore Relic', 'prepared').resolve().resolveAll();
    expect(tg.names(0, 'exile')).toContain('Wall of Omens');
    expect(tg.state.zones.battlefield.some((id) => tg.state.objects[id].isToken && tg.state.objects[id].def === 'Wall of Omens')).toBe(true);
  });
  it('sem três cartas de artefato e/ou criatura, não dispara', () => {
    const tg = setup({ step: 'end', active: 1, battlefield: [['Lorehold Archivist // Restore Relic'], []], graveyard: [['Sol Ring', 'Island', 'Island'], []], library: [['Island'], ['Island']] });
    tg.passUntil((x) => x.state.turn.active === 0 && x.state.turn.step === 'draw');
    expect(tg.state.objects[tg.bf('Lorehold Archivist')].prepared).toBeFalsy();
  });
});

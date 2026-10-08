import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { destroy } from '../../motor/api.ts';

describe('Serra Paragon', () => {
  it('conjura do cemitério uma vez por turno; ao morrer, a criatura é exilada e você ganha 2', () => {
    const tg = setup({ battlefield: [['Serra Paragon', 'Plains', 'Plains', 'Plains', 'Plains', 'Plains'], []], graveyard: [['Wall of Omens', 'Elvish Mystic', 'Plains'], []], library: [['Island', 'Island'], ['Island']] });
    expect(tg.canCast('Wall of Omens')).toBe(true);
    tg.cast('Wall of Omens', '*').resolve().resolveAll();
    const w = tg.bf('Wall of Omens');
    // já usou neste turno: nem a outra criatura nem o terreno
    expect(tg.canCast('Elvish Mystic')).toBe(false);
    expect(tg.actionIds().some((a) => a.includes('perm:paragon'))).toBe(false);
    tg.run(destroy(tg.g, [w]));
    tg.resolveAll();
    expect(tg.names(0, 'exile')).toEqual(['Wall of Omens']);
    expect(tg.life(0)).toBe(42);
  });
  it('joga um terreno do cemitério; ele também ganha a habilidade', () => {
    const tg = setup({ battlefield: [['Serra Paragon'], []], graveyard: [['Plains'], []], library: [['Island'], ['Island']] });
    const acao = tg.actionIds().find((a) => a.startsWith('play:'));
    expect(acao).toBeDefined();
    tg.answer({ kind: 'priority', action: acao! });
    tg.settle();
    const p = tg.bf('Plains');
    tg.run(destroy(tg.g, [p]));
    tg.resolveAll();
    expect(tg.names(0, 'exile')).toEqual(['Plains']);
    expect(tg.life(0)).toBe(42);
  });
  it('só no seu turno e só mágicas de permanente com valor 3 ou menos', () => {
    const tg = setup({ active: 1, battlefield: [['Serra Paragon', 'Plains', 'Plains', 'Plains', 'Plains', 'Plains'], []], graveyard: [['Wall of Omens'], []], library: [['Island'], ['Island']] });
    expect(tg.canCast('Wall of Omens')).toBe(false);
  });
});

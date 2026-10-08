import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Summon: Esper Valigarmanda', () => {
  it('I exila uma instantânea ou feitiço de cada cemitério; conjura a carta exilada durante a resolução com a mana vermelha; com o último capítulo resolvido, a Saga é sacrificada', () => {
    const tg = setup({
      battlefield: [['Mountain', 'Mountain', 'Mountain', 'Mountain'], []], hand: [['Summon: Esper Valigarmanda'], []],
      graveyard: [[], ["Night's Whisper", 'Island']], library: [Array(12).fill('Plains'), Array(12).fill('Island')],
    });
    const t0 = tg.state.turn.number;
    tg.cast('Summon: Esper Valigarmanda').resolve().resolveAll();
    expect(tg.names(1, 'exile')).toEqual(["Night's Whisper"]);
    // capítulo II: duas {R}; conjura Night's Whisper ({1}{B}) com mana de qualquer tipo
    tg.yes('Conjurar');
    tg.passUntil((x) => x.state.turn.active === 0 && x.state.turn.step === 'main1' && x.state.turn.number > t0).resolveAll();
    expect(tg.names(1, 'graveyard')).toEqual(['Island', "Night's Whisper"]);
    expect(tg.life(0)).toBe(38);
    // capítulos III e IV: sem cartas exiladas restantes; depois do IV, a Saga é sacrificada
    tg.passUntil((x) => x.state.turn.active === 0 && x.state.turn.step === 'main1' && x.state.turn.number > t0 + 2).resolveAll();
    expect(tg.find('Summon: Esper Valigarmanda')).not.toBeNull();
    tg.passUntil((x) => x.state.turn.active === 0 && x.state.turn.step === 'main1' && x.state.turn.number > t0 + 4).resolveAll();
    expect(tg.find('Summon: Esper Valigarmanda')).toBeNull();
    expect(tg.names(0, 'graveyard')).toEqual(['Summon: Esper Valigarmanda']);
  });
  it('o terceiro marcador dispara só o capítulo III', () => {
    const tg = setup({ battlefield: [[{ name: 'Summon: Esper Valigarmanda', counters: { lore: 2 } }], []], library: [Array(4).fill('Plains'), Array(4).fill('Island')] });
    const t0 = tg.state.turn.number;
    tg.passUntil((x) => x.state.turn.active === 0 && x.state.turn.step === 'main1' && x.state.turn.number > t0);
    expect(tg.state.objects[tg.bf('Summon: Esper Valigarmanda')].counters.lore).toBe(3);
    expect(tg.state.zones.stack.length).toBe(1);
  });
});

import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Thunderclap Drake', () => {
  it('copia a próxima instantânea ou feitiço uma vez por conjuração do comandante', () => {
    const tg = setup({
      battlefield: [['Thunderclap Drake', 'Island', 'Island', 'Island', 'Swamp', 'Swamp', 'Swamp', 'Swamp'], []], hand: [["Night's Whisper"], []],
      command: [[{ name: 'Gau, Feral Youth', commander: true }], []], library: [Array(8).fill('Plains'), []],
    });
    tg.state.players[0].commanderCasts[String(tg.state.objects[tg.state.zones.command[0]].card)] = 2;
    tg.refresh().activate('Thunderclap Drake').resolve();
    expect(tg.names(0, 'graveyard')).toEqual(['Thunderclap Drake']);
    // Night's Whisper ({1}{B}) já sem o desconto (o Drake saiu): duas Swamps
    tg.cast("Night's Whisper").resolveAll();
    expect(tg.names(0, 'hand').length).toBe(6); // original + 2 cópias
    expect(tg.life(0)).toBe(34);
  });
  it('a redução não paga mana colorida', () => {
    const tg = setup({ battlefield: [['Thunderclap Drake', 'Island'], []], hand: [["Night's Whisper"], []] });
    expect(tg.canCast("Night's Whisper")).toBe(false);
  });
});

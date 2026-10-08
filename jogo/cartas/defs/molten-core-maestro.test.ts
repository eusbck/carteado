import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Molten-Core Maestro', () => {
  it('a mana vem quando o gatilho resolve (usa a pilha)', () => {
    const tg = setup({
      battlefield: [['Molten-Core Maestro', 'Swamp', 'Swamp', 'Swamp', 'Swamp', 'Swamp', 'Swamp'], []], hand: [['Aberrant Return'], []], graveyard: [['Wall of Omens'], []],
      library: [['Plains'], []],
    });
    tg.choose('alvo', ['Wall of Omens']);
    tg.cast('Aberrant Return');
    expect(tg.state.zones.stack.length).toBe(2);
    tg.resolve();
    expect(tg.pt(tg.bf('Molten-Core Maestro'))).toEqual([3, 3]);
    expect(tg.state.players[0].manaPool.filter((m) => m.type === 'R').length).toBe(3);
  });
  it('com menos de cinco manas gastas, só o marcador', () => {
    const tg = setup({ battlefield: [['Molten-Core Maestro', 'Swamp', 'Swamp'], []], hand: [["Night's Whisper"], []], library: [['Plains', 'Plains'], []] });
    tg.cast("Night's Whisper").resolve();
    expect(tg.pt(tg.bf('Molten-Core Maestro'))).toEqual([3, 3]);
    expect(tg.state.players[0].manaPool.length).toBe(0);
  });
});

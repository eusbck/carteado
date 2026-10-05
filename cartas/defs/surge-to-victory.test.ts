import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Surge to Victory', () => {
  it('+X/+0 e, a cada criatura que causa dano de combate a um jogador, uma cópia conjurada durante a resolução do gatilho', () => {
    const tg = setup({
      battlefield: [[...Array(6).fill('Mountain'), { name: 'Elvish Mystic', ready: true }, { name: 'Gau, Feral Youth', ready: true }], []],
      hand: [['Surge to Victory'], []], graveyard: [["Night's Whisper"], []], library: [Array(8).fill('Island'), ['Island']],
    });
    tg.cast('Surge to Victory').resolve();
    expect(tg.names(0, 'exile')).toEqual(["Night's Whisper"]);
    expect(tg.pt(tg.bf('Elvish Mystic'))).toEqual([3, 1]);
    tg.yes('Surge to Victory: conjurar').yes('Surge to Victory: conjurar');
    tg.attack([['Elvish Mystic', 1], ['Gau, Feral Youth', 1]]).passTo('main2');
    // duas criaturas causaram dano: duas cópias de Night's Whisper (2 cartas cada)
    expect(tg.names(0, 'hand').length).toBe(4);
    expect(tg.life(0)).toBe(36);
    expect(tg.names(0, 'graveyard')).toEqual(['Surge to Victory']);
  });
});

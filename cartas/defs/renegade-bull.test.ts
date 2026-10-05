import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Renegade Bull', () => {
  it('conjura a cópia durante a resolução; a carta fica exilada', () => {
    const tg = setup({ battlefield: [[{ name: 'Renegade Bull', ready: true }], []], graveyard: [["Night's Whisper"], []], library: [['Island', 'Island', 'Island'], ['Island']] });
    tg.choose('instantânea ou feitiço alvo', ["Night's Whisper"]).yes('Conjurar a cópia');
    tg.attack([['Renegade Bull', 1]]).passTo('declareAttackers').resolveAll();
    expect(tg.names(0, 'hand').length).toBe(2);
    expect(tg.names(0, 'exile')).toEqual(["Night's Whisper"]);
    expect(tg.names(0, 'graveyard')).toEqual([]); // a cópia deixa de existir
    // a cópia conjurada também dispara o +X/+0
    expect(tg.pt(tg.bf('Renegade Bull'))).toEqual([2, 5]);
  });
});

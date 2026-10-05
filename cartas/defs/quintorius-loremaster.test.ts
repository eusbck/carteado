import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Quintorius, Loremaster', () => {
  it('só cartas exiladas pela habilidade ligada; a mágica vai para o fundo do grimório', () => {
    const tg = setup({
      step: 'main2', battlefield: [['Quintorius, Loremaster', 'Mountain', 'Plains', 'Plains'], []],
      graveyard: [["Night's Whisper", 'Wall of Omens'], []], exile: [['Abrade'], []], library: [['Island', 'Island', 'Island'], ['Island', 'Island']],
    });
    tg.choose('nem terreno', ["Night's Whisper"]);
    tg.passTo('end').resolve();
    expect(tg.names(0, 'exile').sort()).toEqual(['Abrade', "Night's Whisper"]);
    expect(tg.all('Spirit').length).toBe(1);
    tg.passUntil((x) => x.state.turn.active === 0 && x.state.turn.step === 'main1');
    let opcoes: string[] = [];
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('exilada com Quintorius') ? (opcoes = d.items.map((i) => i.label), { kind: 'select', ids: [d.items[0].id] }) : null));
    tg.activate('Quintorius, Loremaster', 'Sacrifique').resolve();
    expect(opcoes).toEqual(["Night's Whisper"]);
    tg.cast("Night's Whisper", '*').resolve();
    expect(tg.names(0, 'library').at(-1)).toBe("Night's Whisper");
    expect(tg.names(0, 'graveyard')).toEqual(['Wall of Omens']);
  });
});

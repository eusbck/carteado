import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { chars } from '../../motor/chars.ts';

describe('Espers to Magicite', () => {
  it('o alvo é escolhido depois de exilar; a ficha é só artefato', () => {
    const tg = setup({
      players: 3, battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp'], [], []], hand: [['Espers to Magicite'], [], []],
      graveyard: [['Elvish Mystic'], ['Wall of Omens', 'Island'], ['Glissa Sunslayer']], library: [['Island'], [], []],
    });
    let opcoes: string[] = [];
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('exilada assim') ? (opcoes = d.items.map((i) => i.label).sort(), { kind: 'select', ids: [d.items.find((i) => i.label === 'Wall of Omens')!.id] }) : null));
    tg.cast('Espers to Magicite').resolveAll();
    expect(opcoes).toEqual(['Glissa Sunslayer', 'Wall of Omens']); // a Mystic de Ana não foi exilada
    expect(tg.names(0, 'graveyard').sort()).toEqual(['Elvish Mystic', 'Espers to Magicite']);
    const f = tg.state.zones.battlefield.find((id) => tg.state.objects[id].isToken)!;
    expect(chars(tg.g, f).types).toEqual(['Artifact']);
    expect(chars(tg.g, f).name).toBe('Wall of Omens');
    expect(tg.names(0, 'hand')).toEqual(['Island']); // o "ao entrar" da cópia funciona
  });
});

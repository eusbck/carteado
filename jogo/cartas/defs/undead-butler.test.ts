import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { destroy, exile } from '../../motor/api.ts';

describe('Undead Butler', () => {
  it('ao entrar, moa três cartas', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp'], []], hand: [['Undead Butler'], []], library: [['Island', 'Plains', 'Forest', 'Mountain'], []] });
    tg.cast('Undead Butler').resolve().resolve();
    expect(tg.names(0, 'graveyard').sort()).toEqual(['Forest', 'Island', 'Plains']);
    expect(tg.names(0, 'library')).toEqual(['Mountain']);
  });
  it('CR 603.12: ao morrer, pode exilá-la; quando fizer isso, devolve a carta de criatura alvo (escolhida depois)', () => {
    const tg = setup({ battlefield: [['Undead Butler'], []], graveyard: [['Wall of Omens', 'Island'], []] });
    let opcoes: string[] = [];
    tg.yes('exilar esta carta', true);
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('carta de criatura alvo')) return null;
      opcoes = d.items.filter((i) => !i.disabled).map((i) => i.label);
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Wall of Omens')!.id] };
    });
    tg.run(destroy(tg.g, [tg.bf('Undead Butler')]));
    tg.resolveAll();
    // a própria Undead Butler já está no exílio quando o alvo é escolhido
    expect(opcoes).toEqual(['Wall of Omens']);
    expect(tg.names(0, 'exile')).toEqual(['Undead Butler']);
    expect(tg.names(0, 'hand')).toEqual(['Wall of Omens']);
    expect(tg.names(0, 'graveyard')).toEqual(['Island']);
  });
  it('sem exilar, nada volta', () => {
    const tg = setup({ battlefield: [['Undead Butler'], []], graveyard: [['Wall of Omens'], []] });
    tg.yes('exilar esta carta', false);
    tg.run(destroy(tg.g, [tg.bf('Undead Butler')]));
    tg.resolveAll();
    expect(tg.names(0, 'hand')).toEqual([]);
    expect(tg.names(0, 'graveyard').sort()).toEqual(['Undead Butler', 'Wall of Omens']);
  });
  it('se a carta já saiu do cemitério, não exila e nada volta', () => {
    const tg = setup({ battlefield: [['Undead Butler'], []], graveyard: [['Wall of Omens'], []] });
    tg.run(destroy(tg.g, [tg.bf('Undead Butler')]));
    tg.run(exile(tg.g, [tg.find('Undead Butler', 'graveyard')!]));
    tg.resolveAll();
    expect(tg.names(0, 'hand')).toEqual([]);
    expect(tg.names(0, 'graveyard')).toEqual(['Wall of Omens']);
  });
});

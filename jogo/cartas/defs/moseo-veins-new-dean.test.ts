import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { gainLife } from '../../motor/api.ts';

describe("Moseo, Vein's New Dean", () => {
  it('cria a Pest que ganha vida ao atacar; infusão devolve criatura de valor até a vida ganha', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp'], []], hand: [["Moseo, Vein's New Dean"], []], graveyard: [['Wall of Omens', 'Archfiend of Depravity'], []], library: [['Island'], ['Island']] });
    tg.cast("Moseo, Vein's New Dean").resolve().resolveAll();
    expect(tg.all('Pest').length).toBe(1);
    gainLife(tg.g, 0, 3, null);
    let opcoes: string[] = [];
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('até uma carta de criatura') ? (opcoes = d.items.map((i) => i.label), { kind: 'select', ids: [d.items.find((i) => i.label === 'Wall of Omens')!.id] }) : null));
    tg.refresh().passTo('end').resolve();
    expect(opcoes).toEqual(['Wall of Omens']);
    expect(tg.find('Wall of Omens')).not.toBeNull();
  });
  it('sem vida ganha, não dispara', () => {
    const tg = setup({ step: 'main2', battlefield: [["Moseo, Vein's New Dean"], []], graveyard: [['Elvish Mystic'], []], library: [['Island'], ['Island']] });
    tg.passTo('cleanup');
    expect(tg.find('Elvish Mystic')).toBeNull();
  });
});

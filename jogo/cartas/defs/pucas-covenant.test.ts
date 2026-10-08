import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { destroy } from '../../motor/api.ts';

describe("Puca's Covenant", () => {
  it('devolve outra carta de valor até o número de marcadores, só uma vez por turno', () => {
    const tg = setup({
      battlefield: [["Puca's Covenant", { name: 'Wall of Omens', counters: { '+1/+1': 1, oil: 1 } }, { name: 'Elvish Mystic', counters: { oil: 2 } }], []],
      graveyard: [['Ghostly Prison', 'Sol Ring', 'Gau, Feral Youth'], []], library: [['Island'], []],
    });
    let opcoes: string[] = [];
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('outra carta de permanente') ? (opcoes = d.items.map((i) => i.label).sort(), { kind: 'select', ids: [d.items.find((i) => i.label === 'Sol Ring')!.id] }) : null));
    tg.yes("Puca's Covenant");
    tg.run(destroy(tg.g, [tg.bf('Wall of Omens')]));
    tg.resolveAll();
    expect(opcoes).toEqual(['Gau, Feral Youth', 'Sol Ring']); // valor 2 ou menos; não a própria Wall
    expect(tg.names(0, 'hand')).toEqual(['Sol Ring']);
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('outra carta de permanente') ? { kind: 'select', ids: [d.items[0].id] } : null));
    tg.run(destroy(tg.g, [tg.bf('Elvish Mystic')]));
    tg.resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Sol Ring']);
  });
});

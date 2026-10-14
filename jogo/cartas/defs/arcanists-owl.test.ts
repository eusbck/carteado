import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = "Arcanist's Owl";

describe(N, () => {
  it('olha quatro e pega um artefato ou encantamento; o resto vai para o fundo', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Island', 'Island'], []], hand: [[N], []], library: [['Forest', 'Colossal Majesty', 'Sol Ring', 'Ripjaw Raptor', 'Island'], []] });
    let oferecidas: string[] = [];
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes("Arcanist's Owl") ? (oferecidas = d.items.filter((i) => !i.disabled).map((i) => i.label), { kind: 'select', ids: [d.items.find((i) => i.label === 'Sol Ring')!.id] }) : null));
    tg.cast(N).resolveAll();
    expect(oferecidas.sort()).toEqual(['Colossal Majesty', 'Sol Ring']);
    expect(tg.names(0, 'hand')).toEqual(['Sol Ring']);
    const lib = tg.names(0, 'library');
    expect(lib[0]).toBe('Island');
    expect(lib.slice(1).sort()).toEqual(['Colossal Majesty', 'Forest', 'Ripjaw Raptor']);
  });
});

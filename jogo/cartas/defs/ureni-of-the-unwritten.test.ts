import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { putOntoBattlefield } from '../../motor/api.ts';

const U = 'Ureni of the Unwritten';

describe(U, () => {
  it('ao entrar, olha as oito do topo e pode pôr no campo uma criatura Dragon; o resto vai para o fundo', () => {
    const lib = ['Island', 'Elvish Mystic', 'Dragonspeaker Shaman', 'Plains', 'Swamp', 'Forest', 'Mountain', 'Dragon Whelp', 'Twinflame Tyrant'];
    const tg = setup({ battlefield: [[], []], hand: [[U], []], library: [lib, []] });
    let oferecidas: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('criatura Dragon')) return null;
      oferecidas = d.items.map((i) => i.label);
      return { kind: 'select', ids: [d.items[0].id] };
    });
    tg.run(putOntoBattlefield(tg.g, [{ id: tg.find(U, 'hand', 0)!, controller: 0 }], 'effect'));
    tg.resolve();
    // a nona (Twinflame Tyrant) não foi vista; Dragonspeaker Shaman não é Dragon
    expect(oferecidas).toEqual(['Dragon Whelp']);
    expect(tg.find('Dragon Whelp', 'battlefield', 0)).not.toBeNull();
    expect(tg.names(0, 'library')[0]).toBe('Twinflame Tyrant');
    expect(tg.names(0, 'library').length).toBe(8);
  });
});

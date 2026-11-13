import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { putOntoBattlefield } from '../../motor/api.ts';

const T = 'Tiamat';
const TERRAS = ['Plains', 'Island', 'Swamp', 'Mountain', 'Forest', 'Forest', 'Forest'];
const GRIMORIO = ['Dragon Whelp', 'Dragon Whelp', 'Tiamat', 'Twinflame Tyrant', 'Island', 'Dragonspeaker Shaman'];

describe(T, () => {
  it('só cartas com o tipo Dragon, com nomes diferentes e sem Tiamat', () => {
    const tg = setup({ battlefield: [TERRAS, []], hand: [[T], []], library: [GRIMORIO, []] });
    let oferecidas: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('Tiamat: procure')) return null;
      oferecidas = d.items.filter((i) => !i.disabled).map((i) => i.label).sort();
      return { kind: 'select', ids: d.items.filter((i) => !i.disabled).map((i) => i.id) };
    });
    tg.cast(T).resolve().resolve();
    // Dragonspeaker Shaman tem "Dragon" no nome mas é Human Barbarian Shaman
    expect(oferecidas).toEqual(['Dragon Whelp', 'Dragon Whelp', 'Twinflame Tyrant']);
    expect(tg.names(0, 'hand').sort()).toEqual(['Dragon Whelp', 'Twinflame Tyrant']);
    expect(tg.names(0, 'library').filter((n) => n === 'Dragon Whelp').length).toBe(1);
  });
  it('conjurada da zona de comando também procura; posta no campo sem conjurar, não', () => {
    const tg = setup({ battlefield: [TERRAS, []], command: [[{ name: T, commander: true }], []], library: [GRIMORIO, []] });
    tg.cast(T, 'command').resolve();
    expect(tg.state.zones.stack.length).toBe(1);
    const tg2 = setup({ battlefield: [[], []], hand: [[T], []], library: [GRIMORIO, []] });
    tg2.run(putOntoBattlefield(tg2.g, [{ id: tg2.find(T, 'hand')!, controller: 0 }], 'effect'));
    expect(tg2.state.zones.stack.length).toBe(0);
  });
});

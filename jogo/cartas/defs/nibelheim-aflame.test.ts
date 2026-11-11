import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const C = 'Nibelheim Aflame';

describe(C, () => {
  it('a criatura causa dano igual à força dela a cada outra criatura', () => {
    const tg = setup({ battlefield: [[...Array(4).fill('Mountain'), "Archon of Sun's Grace", 'Elvish Mystic'], ['Wall of Omens', 'Indomitable Ancients']], hand: [[C], []] });
    tg.choose('criatura alvo', ["Archon of Sun's Grace"]).cast(C).resolve();
    expect(tg.find('Elvish Mystic')).toBeNull();
    expect(tg.state.objects[tg.bf('Wall of Omens')].damage).toBe(3);
    expect(tg.find('Indomitable Ancients')).not.toBeNull();
    expect(tg.find("Archon of Sun's Grace")).not.toBeNull();
  });
  it('por retrospectiva: descarta a mão e compra quatro', () => {
    const tg = setup({ battlefield: [[...Array(7).fill('Mountain'), 'Elvish Mystic'], []], hand: [['Opt'], []], graveyard: [[C], []], library: [['Opt', 'Opt', 'Opt', 'Opt', 'Opt'], []] });
    tg.choose('criatura alvo', ['Elvish Mystic']).cast(C, 'flashback').resolve();
    expect(tg.state.zones.hand[0].length).toBe(4);
    expect(tg.find(C, 'exile')).not.toBeNull();
  });
});

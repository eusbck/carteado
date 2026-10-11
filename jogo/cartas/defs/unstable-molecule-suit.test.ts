import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Unstable Molecule Suit';

describe(N, () => {
  it('equipar {4}: a criatura equipada recebe +2/+2 e tem indestrutível', () => {
    const tg = setup({ battlefield: [[N, 'Elvish Mystic', ...Array(4).fill('Plains')], []] });
    tg.choose('criatura alvo', ['Elvish Mystic']).activate(N, 'Equipar {4}').resolveAll();
    const elfo = tg.bf('Elvish Mystic');
    expect(tg.pt(elfo)).toEqual([3, 3]);
    expect(hasKw(tg.g, elfo, 'indestructible')).toBe(true);
  });

  it('equipar comandante {2} só aceita um comandante', () => {
    const tg = setup({ battlefield: [[N, 'Elvish Mystic', 'Silver Myr', 'Plains', 'Plains'], []] });
    const elfo = tg.bf('Elvish Mystic');
    tg.state.cards[tg.state.objects[elfo].card!].isCommander = true;
    tg.refresh();
    // a criatura que não é comandante não é alvo legal
    expect(() => tg.choose('comandante alvo', ['Silver Myr']).activate(N, 'Equipar comandante')).toThrow();
    const de = setup({ battlefield: [[N, 'Elvish Mystic', 'Silver Myr', 'Plains', 'Plains'], []] });
    const cmd = de.bf('Elvish Mystic');
    de.state.cards[de.state.objects[cmd].card!].isCommander = true;
    de.refresh();
    de.choose('comandante alvo', ['Elvish Mystic']).activate(N, 'Equipar comandante').resolveAll();
    expect(de.state.objects[de.bf(N)].attachedTo).toBe(cmd);
    expect(de.pt(cmd)).toEqual([3, 3]);
  });
});

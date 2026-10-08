import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { sacrifice } from '../../motor/api.ts';

describe('Mazirek, Kraul Death Priest', () => {
  it('cada sacrifício põe marcador em cada criatura sua', () => {
    const tg = setup({ battlefield: [['Mazirek, Kraul Death Priest', 'Wall of Omens'], [{ name: 'Treasure', token: true }]] });
    tg.run(sacrifice(tg.g, [tg.bf('Treasure')]));
    tg.resolveAll();
    expect(tg.pt(tg.bf('Wall of Omens'))).toEqual([1, 5]);
    expect(tg.pt(tg.bf('Mazirek, Kraul Death Priest'))).toEqual([3, 3]);
  });
  it('sacrificado junto com outro, ainda dispara pelo outro', () => {
    const tg = setup({ battlefield: [['Mazirek, Kraul Death Priest', 'Elvish Mystic', 'Wall of Omens'], []] });
    tg.run(sacrifice(tg.g, [tg.bf('Mazirek, Kraul Death Priest'), tg.bf('Elvish Mystic')]));
    tg.resolveAll();
    expect(tg.pt(tg.bf('Wall of Omens'))).toEqual([1, 5]);
  });
});

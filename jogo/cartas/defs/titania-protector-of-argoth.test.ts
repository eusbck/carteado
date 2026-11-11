import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Titania, Protector of Argoth";

describe(C, () => {
  it('terreno seu indo do campo ao cemitério cria Elemental 5/3', () => {
    const tg = setup({ battlefield: [[C, 'Zuran Orb', 'Forest'], []] });
    tg.activate('Zuran Orb').resolveAll();
    expect(tg.pt(tg.all('Elemental')[0])).toEqual([5, 3]);
  });
});

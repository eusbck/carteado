import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Strip Mine";

describe(C, () => {
  it('sacrifica para destruir um terreno', () => {
    const tg = setup({ battlefield: [[C], ['Island']] });
    tg.choose('terreno alvo', ['Island']).activate(C, 'Destrua').resolve();
    expect(tg.find('Island')).toBeNull();
  });
});

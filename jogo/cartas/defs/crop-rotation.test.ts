import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Crop Rotation";

describe(C, () => {
  it('sacrifica um terreno e busca qualquer terreno para o campo', () => {
    const tg = setup({ battlefield: [['Forest', 'Swamp'], []], hand: [[C], []], library: [['Opt', 'Strip Mine'], []] });
    tg.choose('um terreno', ['Swamp']).choose('terreno', ['Strip Mine']).cast(C).resolve();
    expect(tg.find('Strip Mine')).not.toBeNull();
    expect(tg.find('Swamp')).toBeNull();
  });
});

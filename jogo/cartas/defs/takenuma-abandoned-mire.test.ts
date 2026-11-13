import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Takenuma, Abandoned Mire";

describe(C, () => {
  it('canalizar: moe três e devolve uma criatura', () => {
    const tg = setup({ battlefield: [[...Array(4).fill('Swamp')], []], hand: [[C], []], library: [['Memnite', 'Opt', 'Opt'], []] });
    tg.choose('devolva', ['Memnite']).activate('Takenuma, Abandoned Mire').resolve();
    expect(tg.names(0, 'hand')).toContain('Memnite');
  });
});

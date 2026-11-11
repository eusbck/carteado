import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Malevolent Rumble";

describe(C, () => {
  it('cria um Eldrazi Spawn', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest'], []], hand: [[C], []], library: [['Opt', 'Memnite', 'Opt', 'Opt'], []] });
    tg.lenient = true;
    tg.cast(C).resolve();
    expect(tg.all('Eldrazi Spawn').length).toBe(1);
  });
});

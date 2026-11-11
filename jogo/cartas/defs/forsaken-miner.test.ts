import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Forsaken Miner";

describe(C, () => {
  it('ao cometer um crime, paga {B} e volta do cemitério', () => {
    const tg = setup({ battlefield: [['Thassa, Deep-Dwelling', ...Array(4).fill('Island'), 'Swamp'], ['Wall of Omens']], graveyard: [[C], []] });
    tg.lenient = true;
    tg.choose('outra criatura alvo', ['Wall of Omens']).activate('Thassa, Deep-Dwelling', 'Vire').resolveAll();
    expect(tg.find(C)).not.toBeNull();
  });
});

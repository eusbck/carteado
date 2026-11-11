import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Avenger of the Fallen";

describe(C, () => {
  it('mobiliza um Guerreiro por carta de criatura no cemitério', () => {
    const tg = setup({ battlefield: [[C], []], graveyard: [['Memnite', 'Wall of Omens'], []], library: [['Opt'], ['Opt']], step: 'main1' });
    tg.attack([[C, 1]]).passTo('declareBlockers');
    expect(tg.all('Warrior vermelho').length).toBe(2);
  });
});

import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { hasKw } from '../../motor/api.ts';

const DK = 'Dragonlord Kolaghan // Dragonlord Kolaghan';

describe('Dragonlord Kolaghan', () => {
  it('voar, ímpeto; as suas outras criaturas têm ímpeto', () => {
    const tg = setup({ battlefield: [[DK, 'Elvish Mystic'], ['Llanowar Elves']] });
    expect(hasKw(tg.g, tg.bf(DK), 'flying')).toBe(true);
    expect(hasKw(tg.g, tg.bf(DK), 'haste')).toBe(true);
    expect(hasKw(tg.g, tg.bf('Elvish Mystic'), 'haste')).toBe(true);
    expect(hasKw(tg.g, tg.bf('Llanowar Elves'), 'haste')).toBe(false);
  });

  it('o oponente que conjura criatura com o nome de uma carta do cemitério dele perde 10 de vida', () => {
    const tg = setup({ battlefield: [[DK], ['Forest', 'Forest']], hand: [[], ['Elvish Mystic', 'Llanowar Elves']], graveyard: [[], ['Elvish Mystic']], active: 1 });
    tg.cast('Elvish Mystic');
    tg.resolve();
    tg.resolve();
    expect(tg.life(1)).toBe(30);
    // outro nome: nada
    tg.cast('Llanowar Elves');
    tg.resolve();
    expect(tg.life(1)).toBe(30);
  });

  it('a sua própria mágica não dispara', () => {
    const tg = setup({ battlefield: [[DK, 'Forest'], []], hand: [['Elvish Mystic'], []], graveyard: [['Elvish Mystic'], []] });
    tg.cast('Elvish Mystic');
    expect(tg.state.zones.stack.length).toBe(1);
  });
});

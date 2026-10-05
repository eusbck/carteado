import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Ark of Hunger', () => {
  it('{T}: moa uma carta e pode jogá-la; ela saindo do cemitério dispara o dano e a vida', () => {
    const tg = setup({ players: 3, battlefield: [['Ark of Hunger'], [], []], library: [['Forest', 'Island'], [], []] });
    tg.activate('Ark of Hunger').resolve();
    expect(tg.names(0, 'graveyard')).toEqual(['Forest']);
    tg.play('Forest').resolveAll();
    expect(tg.find('Forest')).not.toBeNull();
    expect([tg.life(0), tg.life(1), tg.life(2)]).toEqual([41, 39, 39]);
  });
  it('várias cartas saindo juntas disparam uma vez', () => {
    const tg = setup({ battlefield: [['Ark of Hunger', 'Perpetual Timepiece', 'Plains', 'Plains'], []], graveyard: [['Island', 'Forest', 'Swamp'], []], library: [['Plains'], []] });
    tg.choose('cartas alvo do seu cemitério', ['Island', 'Forest', 'Swamp']).activate('Perpetual Timepiece', 'Embaralhe').resolve();
    expect(tg.state.zones.stack.length).toBe(1);
    tg.resolve();
    expect(tg.life(1)).toBe(39);
  });
});

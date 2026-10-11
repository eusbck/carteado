import { describe, expect, it } from 'vitest';
import { alternativasDeMana, setup } from '../../testes/padroes.ts';

const NOME = 'Desolate Lighthouse';

describe(NOME, () => {
  it('CR 605: mana que produz', () => expect(alternativasDeMana(NOME)).toEqual(['C']));
  it('{1}{U}{R}, {T}: compre uma carta, depois descarte uma carta', () => {
    const tg = setup({ battlefield: [[NOME, 'Island', 'Mountain', 'Plains'], []], hand: [['Forest'], []], library: [['Counterspell', 'Swamp'], []] });
    tg.choose('Descarte', ['Forest']).activate(NOME, 'Compre').resolve();
    expect(tg.names(0, 'hand')).toEqual(['Counterspell']);
    expect(tg.names(0, 'graveyard')).toEqual(['Forest']);
    expect(tg.state.objects[tg.bf(NOME)].tapped).toBe(true);
  });
});

import { describe, expect, it } from 'vitest';
import { putOntoBattlefield } from '../../motor/api.ts';
import { alternativasDeMana, entraVirado, setup } from '../../testes/padroes.ts';

const N = 'Blooming Marsh';

describe(N, () => {
  it('produz mana preta ou verde', () => expect(alternativasDeMana(N)).toEqual(['B', 'G']));
  it('entra desvirado como primeiro, segundo ou terceiro terreno; depois entra virado', () => {
    for (let n = 0; n <= 4; n++) expect(entraVirado(N, Array(n).fill('Forest'))).toBe(n >= 3);
  });
  it('ignora terrenos de oponentes e permanentes que não são terrenos', () => {
    expect(entraVirado(N, ['Forest', 'Sol Ring', 'Sol Ring'], [], true, ['Forest', 'Forest', 'Forest'])).toBe(false);
  });
  it('CR 614.12: ignora terrenos que entram ao mesmo tempo', () => {
    const tg = setup({ battlefield: [['Forest', 'Swamp'], []], hand: [[N, 'Mountain', 'Island'], []] });
    tg.run(putOntoBattlefield(tg.g, tg.state.zones.hand[0].map((id) => ({ id, controller: 0 })), 'effect'));
    expect(tg.state.objects[tg.bf(N)].tapped).toBe(false);
  });
});

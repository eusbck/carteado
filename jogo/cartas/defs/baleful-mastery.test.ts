import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Baleful Mastery';

describe(N, () => {
  it('pelo custo normal, exila a criatura alvo e ninguém compra', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp'], ['Baleful Strix']], hand: [[N], []] });
    tg.choose('criatura ou planeswalker alvo', ['Baleful Strix']).cast(N).resolveAll();
    expect(tg.find('Baleful Strix', 'exile')).not.toBeNull();
    expect(tg.state.zones.hand[1]).toHaveLength(0);
  });

  it('pelo custo de {1}{B}, você escolhe o oponente que compra uma carta', () => {
    const tg = setup({ players: 3, battlefield: [['Swamp', 'Swamp'], ['Baleful Strix'], []], hand: [[N], [], []] });
    tg.choose('criatura ou planeswalker alvo', ['Baleful Strix']).choose('qual oponente compra', ['Carla']);
    tg.cast(N, 'mastery').resolveAll();
    expect(tg.find('Baleful Strix', 'exile')).not.toBeNull();
    expect(tg.state.zones.hand[2]).toHaveLength(1);
    expect(tg.state.zones.hand[1]).toHaveLength(0);
  });
});

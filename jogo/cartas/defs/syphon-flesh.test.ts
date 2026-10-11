import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Syphon Flesh';

describe(N, () => {
  it('cada outro jogador sacrifica uma criatura, e você cria um Zombie 2/2 para cada uma', () => {
    const tg = setup({ players: 3, battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp', 'Swamp', 'Elvish Mystic'], ['Indomitable Ancients'], []], hand: [[N], [], []] });
    tg.cast(N).resolveAll();
    expect(tg.find('Indomitable Ancients')).toBeNull();
    expect(tg.find('Elvish Mystic')).not.toBeNull();
    const fichas = tg.all('Zombie');
    expect(fichas).toHaveLength(1);
    expect(tg.pt(fichas[0])).toEqual([2, 2]);
    expect(tg.state.objects[fichas[0]].controller).toBe(0);
  });
});
import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Death by Dragons';

describe(N, () => {
  it('cada jogador que não o alvo cria um Dragon 5/5 vermelho com voar', () => {
    const tg = setup({ players: 3, battlefield: [Array(6).fill('Mountain'), [], []], hand: [[N], [], []] });
    tg.choose('jogador alvo', ['Bruno']).cast(N).resolveAll();
    const fichas = tg.all('Dragon');
    expect(fichas.map((id) => tg.state.objects[id].controller).sort()).toEqual([0, 2]);
    for (const id of fichas) {
      expect(tg.pt(id)).toEqual([5, 5]);
      expect(hasKw(tg.g, id, 'flying')).toBe(true);
    }
  });
});
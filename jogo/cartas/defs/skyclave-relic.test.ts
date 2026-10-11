import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { enterCard, fixture as setup } from '../../testes/artefatos.ts';

const N = 'Skyclave Relic';
const ilhas = (n: number) => Array(n).fill('Island');

describe(N, () => {
  it('reforçado, cria duas fichas viradas que são cópias dele; as fichas não criam outras', () => {
    const tg = setup({ battlefield: [ilhas(6), []], hand: [[N], []] });
    tg.choose('custo adicional opcional', ['Pagar: kicker {3}']).cast(N).resolveAll();
    const todos = tg.all(N);
    expect(todos).toHaveLength(3);
    const fichas = todos.filter((id) => tg.state.objects[id].isToken);
    expect(fichas).toHaveLength(2);
    for (const id of fichas) {
      expect(tg.state.objects[id].tapped).toBe(true);
      expect(hasKw(tg.g, id, 'indestructible')).toBe(true);
    }
    expect(tg.state.zones.battlefield.filter((id) => tg.state.objects[id].def === 'Island' && tg.state.objects[id].tapped)).toHaveLength(6);
  });

  it('posto no campo sem ser conjurado, ou conjurado sem reforçar, não cria fichas', () => {
    const tg = setup({ battlefield: [ilhas(6), []], hand: [[N], []] });
    tg.choose('custo adicional opcional', ['Não pagar']).cast(N).resolveAll();
    expect(tg.all(N)).toHaveLength(1);
    expect(hasKw(tg.g, tg.bf(N), 'indestructible')).toBe(true);
    const posto = setup({ battlefield: [[], []] });
    enterCard(posto, N, 0);
    posto.resolveAll();
    expect(posto.all(N)).toHaveLength(1);
  });
});

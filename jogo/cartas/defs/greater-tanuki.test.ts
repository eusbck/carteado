import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Greater Tanuki';

describe(N, () => {
  it('canalizar descarta a carta como custo e busca um terreno básico virado', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest', 'Forest'], []], hand: [[N], []], library: [['Sol Ring', 'Plains', 'Sol Ring'], []] });
    tg.choose('Greater Tanuki', ['Plains']);
    tg.activate(N, 'Canalizar');
    // o descarte é custo: a carta já está no cemitério com a habilidade na pilha
    expect(tg.names(0, 'graveyard')).toEqual([N]);
    tg.resolveAll();
    expect(tg.state.objects[tg.bf('Plains')].tapped).toBe(true);
    expect(tg.names(0, 'library')).toHaveLength(2);
  });

  it('6/5 com atropelar', () => {
    const tg = setup({ battlefield: [[N], []] });
    expect(tg.pt(tg.bf(N))).toEqual([6, 5]);
    expect(hasKw(tg.g, tg.bf(N), 'trample')).toBe(true);
  });
});

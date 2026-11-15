import { describe, expect, it } from 'vitest';
import { destroy, exile, sacrifice } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Greedy Freebooter';

describe(N, () => {
  it('ao morrer usa vidência 1 e depois cria um Tesouro desvirado', () => {
    const tg = setup({ battlefield: [[N], []], library: [['Forest', 'Swamp'], []] });
    tg.script.push((d) => d.kind === 'arrange' ? {
      kind: 'arrange', order: d.items.map((i) => i.id), placement: Object.fromEntries(d.items.map((i) => [i.id, 'bottom'])),
    } : null);
    tg.run(destroy(tg.g, [tg.bf(N)]));
    expect(tg.all('Treasure')).toHaveLength(0);
    tg.resolveAll();
    expect(tg.names(0, 'library')).toEqual(['Swamp', 'Forest']);
    expect(tg.all('Treasure')).toHaveLength(1);
    expect(tg.state.objects[tg.bf('Treasure')].tapped).toBe(false);
  });
  it('sacrificar dispara mesmo com o grimório vazio', () => {
    const tg = setup({ battlefield: [[N], []] });
    tg.run(sacrifice(tg.g, [tg.bf(N)]));
    tg.resolveAll();
    expect(tg.all('Treasure')).toHaveLength(1);
  });
  it('exilar a criatura não dispara a habilidade', () => {
    const tg = setup({ battlefield: [[N], []] });
    tg.run(exile(tg.g, [tg.bf(N)]));
    tg.resolveAll();
    expect(tg.all('Treasure')).toHaveLength(0);
  });
});

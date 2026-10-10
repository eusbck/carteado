import { describe, expect, it } from 'vitest';
import { removeCard, fixture as setup } from '../../testes/artefatos.ts';

const N = "Mazemind Tome";
describe(N, () => {
  it("o quarto marcador exila e ganha vida antes da habilidade de comprar resolver", () => {

    const tg = setup({ battlefield: [[{ name: N, counters: { page: 3 } }, 'Island', 'Island'], []] }); tg.activate(N, 'compre'); expect(tg.state.zones.stack).toHaveLength(2);
    tg.resolve(); expect(tg.find(N, 'exile')).not.toBeNull(); expect(tg.life(0)).toBe(44); expect(tg.state.zones.hand[0]).toHaveLength(0);
    tg.resolveAll(); expect(tg.state.zones.hand[0]).toHaveLength(1);
  });

  it("gatilho de estado não duplica e não exila o objeto novo se o artefato saiu", () => {

    const tg = setup({ battlefield: [[{ name: N, counters: { page: 4 } }], []] }); expect(tg.state.zones.stack).toHaveLength(1); tg.refresh(); expect(tg.state.zones.stack).toHaveLength(1);
    removeCard(tg, tg.bf(N)); tg.resolveAll(); expect(tg.find(N, 'graveyard')).not.toBeNull(); expect(tg.life(0)).toBe(40);
  });

  it("vidência coloca um marcador como custo e permite pôr o topo no fundo", () => {

    const tg = setup({ battlefield: [[N], []], library: [['Island', 'Forest'], ['Forest']] }); tg.script.push(d => d.kind === 'arrange' ? { kind: 'arrange', placement: { [d.items[0].id]: 'bottom' }, order: d.items.map(i => i.id) } : null);
    tg.activate(N, 'vidência').resolveAll(); expect(tg.state.objects[tg.bf(N)].counters.page).toBe(1); expect(tg.names(0, 'library')).toEqual(['Forest', 'Island']);
  });
});

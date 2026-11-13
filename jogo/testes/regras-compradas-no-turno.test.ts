// "Cartas compradas neste turno" (Sylvan Library): o motor grava em turnStats[p].cardsDrawnIds o id que cada carta
// comprada recebe na mão. CR 121.1: comprar é pôr a carta do topo do grimório na mão; CR 121.5: mover do grimório
// para a mão sem a palavra "comprar" não é compra.
import { describe, expect, it } from 'vitest';
import { setup } from './harness.ts';
import { draw, moveObjects } from '../motor/api.ts';

describe('cartas compradas no turno (foods-b)', () => {
  it('CR 121.1: cada carta comprada fica registrada com o id da mão, também a da etapa de compra', () => {
    const tg = setup({ step: 'upkeep', library: [['Island', 'Swamp', 'Plains'], []] });
    tg.passTo('main1');
    tg.run(draw(tg.g, 0, 1));
    const ids = tg.state.turnStats[0].cardsDrawnIds ?? [];
    expect(ids.map((id) => tg.state.objects[id].zone)).toEqual(['hand', 'hand']);
    expect(ids.map((id) => tg.g.state.objects[id].def)).toEqual(['Island', 'Swamp']);
  });

  it('CR 121.5: pôr na mão sem comprar não conta', () => {
    const tg = setup({ library: [['Island'], []] });
    tg.run(moveObjects(tg.g, [{ id: tg.state.zones.library[0][0], to: 'hand' }], 'search'));
    expect(tg.state.turnStats[0].cardsDrawnIds ?? []).toEqual([]);
  });

  it('a lista recomeça no turno seguinte', () => {
    const tg = setup({ library: [['Island', 'Swamp', 'Plains'], ['Forest', 'Forest']] });
    tg.run(draw(tg.g, 0, 1));
    expect(tg.state.turnStats[0].cardsDrawnIds).toHaveLength(1);
    tg.passTo('main1', 1);
    expect(tg.state.turnStats[0].cardsDrawnIds ?? []).toEqual([]);
  });
});

import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { hasKw } from '../../motor/chars.ts';

const NOME = 'Binding the Old Gods';

describe(NOME, () => {
  it('entra com um marcador e o capítulo I destrói uma permanente de um oponente; na fase principal seguinte, o II busca uma Forest virada', () => {
    const tg = setup({ battlefield: [['Swamp', 'Forest', 'Swamp', 'Forest'], ['Sol Ring']], hand: [[NOME], []], library: [['Island', 'Forest', 'Island'], ['Island', 'Island']] });
    tg.choose('permanente não terreno alvo', ['Sol Ring']).cast(NOME).resolveAll();
    expect(tg.names(1, 'graveyard')).toEqual(['Sol Ring']);
    expect(tg.state.objects[tg.bf(NOME)].counters.lore).toBe(1);
    tg.choose('Forest', ['Forest']);
    tg.passTo('main1', 1);
    tg.passTo('main1', 0);
    tg.resolveAll();
    const florestas = tg.state.zones.battlefield.filter((id) => tg.state.objects[id].def === 'Forest' && tg.state.objects[id].controller === 0);
    expect(florestas.length).toBe(3);
    expect(florestas.some((id) => tg.state.objects[id].tapped)).toBe(true);
  });

  it('o III dá toque mortífero até o fim do turno e a Saga é sacrificada', () => {
    const tg = setup({ step: 'draw', battlefield: [[{ name: NOME, counters: { lore: 2 } }, 'Wall of Omens'], []], library: [['Island'], []] });
    tg.passTo('main1');
    tg.resolveAll();
    expect(hasKw(tg.g, tg.bf('Wall of Omens'), 'deathtouch')).toBe(true);
    expect(tg.find(NOME)).toBeNull();
  });
});

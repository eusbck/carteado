import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Tome of Legends';

describe(N, () => {
  it('entra com um marcador de página; o seu comandante entrando põe outro; {1}, {T} e um marcador: compra', () => {
    const tg = setup({ battlefield: [Array(5).fill('Forest'), []], hand: [[N, { name: 'Silver Myr', commander: true }], []], library: [['Island', 'Island'], ['Island']] });
    tg.cast(N).resolveAll();
    const tomo = tg.bf(N);
    expect(tg.state.objects[tomo].counters.page).toBe(1);
    tg.cast('Silver Myr').resolveAll();
    expect(tg.state.objects[tomo].counters.page).toBe(2);
    tg.activate(N).resolveAll();
    expect(tg.state.objects[tomo].counters.page).toBe(1);
    expect(tg.names(0, 'hand')).toEqual(['Island']);
  });

  it('o seu comandante atacando sob o controle de outro jogador ainda põe o marcador; o comandante de outro que você controla, não', () => {
    const tg = setup({ battlefield: [[{ name: N, counters: { page: 1 } }, 'Serra Angel'], [{ name: 'Indomitable Ancients', commander: true }]] });
    const tomo = tg.bf(N);
    // o comandante é do jogador 1 e está com ele: atacar não conta para o Tome do jogador 0
    tg.state.cards[tg.state.objects[tg.bf('Serra Angel')].card!].isCommander = true;
    tg.refresh();
    tg.attack([['Serra Angel', 1]]).passTo('main2', 0);
    expect(tg.state.objects[tomo].counters.page).toBe(2);
    tg.passTo('upkeep', 1).attack([['Indomitable Ancients', 0]]).passTo('main2', 1);
    expect(tg.state.objects[tomo].counters.page).toBe(2);
  });
});
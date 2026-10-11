import { describe, expect, it } from 'vitest';
import { draw } from '../../motor/actions.ts';
import { fixture as setup, removeCard, runEffect } from '../../testes/artefatos.ts';

const N = 'Shared Fate';
const ilhas = Array(8).fill('Island');
const acoesCom = (tg: ReturnType<typeof setup>, carta: number) => tg.actionIds().filter((a) => a.split(':').includes(String(carta)));

describe(N, () => {
  it('em vez de comprar, o jogador exila virada para baixo a carta do topo do grimório de um oponente', () => {
    const tg = setup({ battlefield: [[N], []], library: [ilhas, ['Sol Ring', ...ilhas]] });
    runEffect(tg, draw(tg.g, 0, 1));
    expect(tg.names(0, 'hand')).toEqual([]);
    expect(tg.names(0, 'library')).toHaveLength(8);
    const carta = tg.state.zones.exile[0];
    expect(tg.state.objects[carta].def).toBe('Sol Ring');
    expect(tg.state.objects[carta].faceDown).toBe(true);
    expect(tg.state.objects[carta].visibleTo).toEqual([0]);
    // não conta como compra
    expect(tg.state.turnStats[0].cardsDrawn).toBe(0);
    // vale para todos os jogadores, na etapa de compra também
    tg.passTo('main1', 1);
    expect(tg.names(1, 'hand')).toEqual([]);
    expect(tg.state.zones.exile).toHaveLength(2);
    expect(tg.state.objects[tg.state.zones.exile[1]].owner).toBe(0);
    expect(tg.state.objects[tg.state.zones.exile[1]].visibleTo).toEqual([1]);
  });

  it('a mágica exilada é conjurada pagando o custo, e o terreno exilado pode ser jogado', () => {
    const tg = setup({ battlefield: [[N, 'Island'], []], library: [ilhas, ['Sol Ring', 'Swamp', ...ilhas]] });
    runEffect(tg, draw(tg.g, 0, 2));
    const [anel, pantano] = tg.state.zones.exile;
    const conjurar = acoesCom(tg, anel).find((a) => a.startsWith('cast:'))!;
    expect(conjurar).toBeDefined();
    tg.answer({ kind: 'priority', action: conjurar });
    tg.resolveAll();
    expect(tg.state.objects[tg.bf('Sol Ring')].controller).toBe(0);
    expect(tg.state.objects[tg.bf('Island')].tapped).toBe(true);
    const jogar = acoesCom(tg, pantano).find((a) => a.startsWith('play:'))!;
    expect(jogar).toBeDefined();
    tg.answer({ kind: 'priority', action: jogar });
    tg.settle();
    expect(tg.state.objects[tg.bf('Swamp')].controller).toBe(0);
  });

  it('saindo Shared Fate do campo, as cartas exiladas com ela não podem mais ser jogadas', () => {
    const tg = setup({ battlefield: [[N, 'Island'], []], library: [ilhas, ['Sol Ring', ...ilhas]] });
    runEffect(tg, draw(tg.g, 0, 1));
    const carta = tg.state.zones.exile[0];
    expect(acoesCom(tg, carta)).not.toHaveLength(0);
    removeCard(tg, tg.bf(N));
    tg.refresh();
    expect(acoesCom(tg, carta)).toHaveLength(0);
    // sem Shared Fate, as compras voltam ao normal
    runEffect(tg, draw(tg.g, 0, 1));
    expect(tg.names(0, 'hand')).toEqual(['Island']);
  });

  it('com os grimórios dos oponentes vazios, o jogador não compra nem exila', () => {
    const tg = setup({ battlefield: [[N], []], library: [ilhas, []] });
    runEffect(tg, draw(tg.g, 0, 1));
    expect(tg.names(0, 'hand')).toEqual([]);
    expect(tg.names(0, 'library')).toHaveLength(8);
    expect(tg.state.zones.exile).toHaveLength(0);
    // não é comprar de grimório vazio: ninguém perde por isso
    tg.pass();
    expect(tg.state.players[0].lost).toBe(false);
  });

  it('com três jogadores, quem compraria escolhe o oponente', () => {
    const tg = setup({ players: 3, battlefield: [[N], [], []], library: [ilhas, ['Sol Ring', ...ilhas], ['Silver Myr', ...ilhas]] });
    tg.choose('exile a carta do topo do grimório de qual oponente', ['Carla']);
    runEffect(tg, draw(tg.g, 0, 1));
    expect(tg.state.objects[tg.state.zones.exile[0]].def).toBe('Silver Myr');
  });
});

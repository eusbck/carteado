import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Extract Power';

describe(N, () => {
  it('exila virada para baixo a carta do topo do grimório de cada jogador; você pode jogá-las sem pagar o custo', () => {
    const tg = setup({
      players: 3, battlefield: [[...Array(6).fill('Island')], [], []], hand: [[N], [], []],
      library: [['Sol Ring', 'Island'], ['Indomitable Ancients', 'Island'], ['Swamp', 'Island']],
    });
    tg.cast(N).resolveAll();
    expect(tg.state.zones.exile).toHaveLength(3);
    for (const id of tg.state.zones.exile) {
      expect(tg.state.objects[id].faceDown).toBe(true);
      expect(tg.state.objects[id].visibleTo).toEqual([0]);
    }
    // todas as ilhas viradas: só de graça dá para conjurar o Ancients do oponente
    const anciao = tg.state.zones.exile.find((x) => tg.state.objects[x].def === 'Indomitable Ancients')!;
    const acao = tg.actionIds().find((a) => a.startsWith('cast:') && a.split(':').includes(String(anciao)))!;
    expect(acao).toBeDefined();
    tg.answer({ kind: 'priority', action: acao });
    tg.resolveAll();
    const novo = tg.bf('Indomitable Ancients');
    expect(tg.state.objects[novo].controller).toBe(0);
    expect(tg.state.objects[novo].owner).toBe(1);
    // o terreno do outro jogador também pode ser jogado
    const pantano = tg.state.zones.exile.find((x) => tg.state.objects[x].def === 'Swamp')!;
    expect(tg.actionIds().some((a) => a.startsWith('play:') && a.split(':').includes(String(pantano)))).toBe(true);
  });
});
